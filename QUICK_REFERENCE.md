# ⚡ Quick Reference Card - Quiz Logic

## ✅ What's Implemented (7/8 Components)

| Component | Status | Key Feature | File |
|-----------|--------|-------------|------|
| **B1** Database | ✅ Done | 5 tables, proper FK, indexes | schema.prisma |
| **B2** Quiz APIs | ✅ Done | GET quizzes, GET details | quizService.js |
| **B3** Start Attempt | ✅ Done | Create session, calc timer | attemptService.js |
| **B4** Timer | ✅ Done | Server-side, unhackable | attemptService.js |
| **B5** Answers | ✅ Done | Validation + storage | answerService.js |
| **B6** Scoring | ✅ Done | Points + percentage | attemptService.js |
| **B7** Finalize | ✅ Done | Lock results immutably | attemptService.js |
| **B8** Progression | ❌ Missing | Agent points/level system | - |

---

## 🚀 API Endpoints

### Quiz Endpoints
```bash
GET /api/quizzes                    # Get all quizzes
GET /api/quizzes/:id                # Get quiz with questions
```

### Attempt Endpoints
```bash
POST /api/attempts/start             # Start new attempt → returns attemptId
GET /api/attempts/:id                # Get attempt status
POST /api/attempts/:id/finalize      # Calculate score & lock
GET /api/attempts/:id/results        # Get results breakdown
```

### Answer Endpoints
```bash
POST /api/attempts/:attemptId/answers        # Submit single answer
POST /api/attempts/:attemptId/answers/bulk   # Submit multiple
GET /api/attempts/:attemptId/answers         # Get all answers
```

---

## 📊 Database Schema Quick View

### Quizzes
```sql
id, title, description, level (beginner/intermediate/advanced)
duration_minutes (e.g., 30), passing_score (e.g., 70)
is_active (true/false), created_at, updated_at
```

### Questions
```sql
id, quiz_id (FK), question_text, question_type (single/multiple)
points (e.g., 1 or 2), order_number, created_at, updated_at
```

### Options
```sql
id, question_id (FK), option_text, is_correct (true/false)
order_number, created_at
```

### Quiz Attempts
```sql
id, quiz_id (FK), user_id, start_time, end_time, expiration_time
status (in_progress/completed/expired), score, total_points
percentage (decimal 5,2), created_at, updated_at
```

### Answers
```sql
id, attempt_id (FK), question_id (FK), selected_option_ids (JSON)
is_correct (true/false), points_earned, answered_at
UNIQUE: (attempt_id, question_id)
```

---

## ⏱️ Timer Logic (Unhackable)

**How it works:**
1. User calls `POST /api/attempts/start` with quizId
2. Server calculates: `expirationTime = now() + quiz.duration_minutes`
3. Server stores in database (immutable)
4. Client shows countdown (just for UI - server doesn't trust it)
5. **Every request** server checks: `if now() > expiration_time → reject`
6. After timeout, attempt auto-marks as 'expired'
7. **Cannot be bypassed** - all checks server-side only

---

## 🎯 Scoring Logic (Accurate)

**Per Answer:**
- ✅ Correct = award question.points
- ❌ Wrong = 0 points

**Final Score:**
```
totalEarned = SUM(points_earned for all answers)
totalAvailable = SUM(question.points)
percentage = (totalEarned / totalAvailable) × 100
passed = percentage >= quiz.passing_score
```

**Example:**
- 3 questions: 1pt + 2pts + 2pts = 5 total
- User got: 1pt + 0pts + 2pts = 3 earned
- Percentage: 3/5 × 100 = 60%
- Passing score: 70%
- Result: **FAILED** ❌

---

## 💾 Transaction Safety

**When things go wrong, everything rolls back:**

```
BEGIN TRANSACTION
  ├─ INSERT quiz_attempt
  ├─ Validate quiz
  ├─ Calculate total_points
  ├─ [Something fails!]
  └─ ROLLBACK (undo everything)

Result: Nothing was saved, database clean
```

---

## 🔒 Security Features

✅ **SQL Injection Protection:** All queries use parameterized placeholders  
✅ **Timer Hijacking:** Impossible - stored server-side only  
✅ **Correct Answers:** Hidden from API responses  
✅ **Result Tampering:** Locked after finalization  
✅ **Duplicate Answers:** Prevented by unique constraint  
✅ **Race Conditions:** Protected by transactions  

---

## ❌ What's Missing (B8)

**Progression System Not Implemented:**
- No agent profile table
- No point accumulation
- No level progression
- No rewards system

**To add it:**
1. Create `agents` table (id, points, level)
2. After finalize: add points to agent
3. Check if level-up (points >= threshold)
4. Update agent level

**Effort:** ~3 hours, ~300 lines of code

---

## 🧪 Quick Test (Copy & Paste)

```bash
# 1. Start attempt
curl -X POST http://localhost:5000/api/attempts/start \
  -H "Content-Type: application/json" \
  -d '{"quizId": 1, "userId": 100}'

# Copy the attemptId from response

# 2. Submit answer (replace ATTEMPT_ID)
curl -X POST http://localhost:5000/api/attempts/ATTEMPT_ID/answers \
  -H "Content-Type: application/json" \
  -d '{"questionId": 1, "selectedOptionIds": [1]}'

# 3. Finalize
curl -X POST http://localhost:5000/api/attempts/ATTEMPT_ID/finalize \
  -H "Content-Type: application/json"

# 4. Get results
curl http://localhost:5000/api/attempts/ATTEMPT_ID/results
```

---

## 📁 Key Files

| File | Purpose | Key Methods |
|------|---------|-------------|
| quizService.js | Quiz logic | getQuizzesByLevel(), getQuizDetails(), calculateTotalPoints() |
| attemptService.js | Attempt lifecycle | startAttempt(), finalizeAttempt(), expireAttempt() |
| answerService.js | Answer handling | submitAnswer(), getAttemptAnswers() |
| schema.prisma | Database model | 5 tables with proper relationships |
| validation.js | Timer enforcement | validateAttemptNotExpired() middleware |

---

## 🎓 Example Quiz Flow

```
1. User starts quiz
   ↓ Creates attempt with 30-min timer
   ↓
2. User answers 10 questions
   ✅ Q1: Correct → 1 point
   ❌ Q2: Wrong → 0 points
   ✅ Q3: Correct → 2 points
   (continue...)
   ↓
3. User finalizes (or timeout)
   ↓ Calculate: 8 points / 10 total = 80%
   ↓ Compare: 80% >= 70% passing → PASSED ✅
   ↓
4. Lock results
   ↓ No further edits possible
   ↓
5. Show results to user
   ✅ Passed: 80%
   📊 8 correct, 2 wrong
```

---

## 🐛 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Attempt not found" | ID doesn't exist in DB | Create new with `/api/attempts/start` |
| "Quiz attempt has expired" | Time exceeded | Create new attempt |
| "Question not found" | Wrong quiz_id | Get quiz details first |
| "Cannot submit answer. Already completed" | Already finalized | Create new attempt |
| "Invalid option selection" | Bad option IDs | Verify options belong to question |

---

## ✨ Verification Checklist

- [x] All 5 database tables created
- [x] All relationships with cascade delete
- [x] Indexes on FK and query columns
- [x] Quiz retrieval working
- [x] Attempt creation with timer
- [x] Timer enforced server-side
- [x] Answer validation comprehensive
- [x] Scoring calculation accurate
- [x] Results locked after finalization
- [x] Transaction safety in place
- [x] SQL injection protection
- [x] Error handling complete
- [x] All tests passing

---

## 📈 Performance

- ✅ Quick query indexes on all FK columns
- ✅ JSON storage for flexible answer data
- ✅ Connection pooling for database
- ✅ Parameterized queries prevent full table scans
- ✅ Transactions atomic - no inconsistent states

---

## 🎯 Overall Assessment

**Status: 87.5% Complete** ✅

- 7 of 8 components fully implemented
- Production-ready quiz engine
- Secure, accurate, reliable
- Only missing: progression/level-up system

**Recommendation:** Deploy now, add B8 later as independent feature

