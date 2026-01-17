# Quiz App Database Schema & Flow Explanation

## 📊 Database Tables & Relationships

### **Table Structure:**

```
┌─────────────┐
│   QUIZZES   │ (Parent table - stores quiz metadata)
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌─────────────┐    ┌──────────────┐
│  QUESTIONS  │    │QUIZ_ATTEMPTS │ (User's attempt at a quiz)
└──────┬──────┘    └──────┬───────┘
       │                  │
       ├──────┐           │
       │      │           │
       ▼      ▼           ▼
┌─────────┐  ┌────────────┐
│ OPTIONS │  │  ANSWERS   │ (Links attempt + question + selected options)
└─────────┘  └────────────┘
```

---

## 🗂️ **Table Details & Relationships**

### **1. QUIZZES Table**
**Purpose:** Store quiz metadata and configuration

**Key Fields:**
- `id` - Unique quiz identifier
- `title` - Quiz name (e.g., "JavaScript Basics")
- `description` - What the quiz is about
- `level` - beginner/intermediate/advanced
- `duration_minutes` - How long user has to complete (e.g., 30 minutes)
- `passing_score` - Minimum percentage to pass (e.g., 70%)
- `is_active` - Whether quiz is available to take

**Relationships:**
- **One-to-Many** with QUESTIONS (one quiz has many questions)
- **One-to-Many** with QUIZ_ATTEMPTS (one quiz can be attempted many times)

**Example:**
```
Quiz ID: 1
Title: "JavaScript Basics"
Duration: 30 minutes
Passing Score: 70%
```

---

### **2. QUESTIONS Table**
**Purpose:** Store individual questions for each quiz

**Key Fields:**
- `id` - Unique question identifier
- `quiz_id` - Which quiz this belongs to (FOREIGN KEY → quizzes.id)
- `question_text` - The actual question
- `question_type` - "single" (one answer) or "multiple" (multiple answers)
- `points` - How many points this question is worth
- `order_number` - Display order (1, 2, 3...)

**Relationships:**
- **Many-to-One** with QUIZZES (many questions belong to one quiz)
- **One-to-Many** with OPTIONS (one question has many answer options)
- **One-to-Many** with ANSWERS (one question can be answered multiple times by different users)

**Example:**
```
Question ID: 1
Quiz ID: 1
Text: "What is JavaScript?"
Type: single
Points: 1
Order: 1
```

---

### **3. OPTIONS Table**
**Purpose:** Store answer choices for each question

**Key Fields:**
- `id` - Unique option identifier
- `question_id` - Which question this belongs to (FOREIGN KEY → questions.id)
- `option_text` - The answer choice text
- `is_correct` - TRUE if this is a correct answer
- `order_number` - Display order (A, B, C, D)

**Relationships:**
- **Many-to-One** with QUESTIONS (many options belong to one question)

**Example:**
```
Option ID: 1
Question ID: 1
Text: "A programming language"
Is Correct: TRUE

Option ID: 2
Question ID: 1
Text: "A coffee drink"
Is Correct: FALSE
```

**Note:** For single-choice questions, only ONE option has `is_correct=true`. For multiple-choice, MULTIPLE options can be correct.

---

### **4. QUIZ_ATTEMPTS Table**
**Purpose:** Track each time a user attempts a quiz (the session)

**Key Fields:**
- `id` - Unique attempt identifier
- `quiz_id` - Which quiz is being attempted (FOREIGN KEY → quizzes.id)
- `user_id` - Who is taking the quiz (optional)
- `start_time` - When quiz was started
- `end_time` - When quiz was completed
- `expiration_time` - Deadline = start_time + duration_minutes
- `status` - "in_progress", "completed", "expired", "abandoned"
- `score` - Points earned
- `total_points` - Maximum possible points
- `percentage` - (score / total_points) * 100

**Relationships:**
- **Many-to-One** with QUIZZES (many attempts for one quiz)
- **One-to-Many** with ANSWERS (one attempt has many answers)

**Example:**
```
Attempt ID: 1
Quiz ID: 1
User ID: 123
Start Time: 2026-01-12 10:00:00
Expiration Time: 2026-01-12 10:30:00 (30 min later)
Status: "in_progress"
Score: 0 (updated as user answers)
```

---

### **5. ANSWERS Table**
**Purpose:** Store user's answer for each question in an attempt

**Key Fields:**
- `id` - Unique answer identifier
- `attempt_id` - Which quiz attempt this answer belongs to (FOREIGN KEY → quiz_attempts.id)
- `question_id` - Which question is being answered (FOREIGN KEY → questions.id)
- `selected_option_ids` - Array of option IDs user selected [1] or [1,3,4]
- `is_correct` - Whether the answer is correct
- `points_earned` - Points awarded (0 or question.points)
- `answered_at` - Timestamp when answered

**Relationships:**
- **Many-to-One** with QUIZ_ATTEMPTS (many answers belong to one attempt)
- **Many-to-One** with QUESTIONS (many answers can reference one question)

**Unique Constraint:** (attempt_id, question_id) - Can only answer each question ONCE per attempt

**Example:**
```
Answer ID: 1
Attempt ID: 1
Question ID: 1
Selected Options: [1]
Is Correct: TRUE
Points Earned: 1
```

---

## 🎮 **Complete Quiz Flow**

### **PHASE 1: SETUP (Admin/Seed)**

```sql
1. Create QUIZ
   INSERT INTO quizzes (title, level, duration_minutes, passing_score)
   VALUES ('JavaScript Basics', 'beginner', 30, 70)
   → quiz_id = 1

2. Create QUESTIONS for that quiz
   INSERT INTO questions (quiz_id, question_text, question_type, points, order_number)
   VALUES (1, 'What is JavaScript?', 'single', 1, 1)
   → question_id = 1

3. Create OPTIONS for each question
   INSERT INTO options (question_id, option_text, is_correct, order_number)
   VALUES 
     (1, 'A programming language', TRUE, 1),
     (1, 'A coffee drink', FALSE, 2)
```

---

### **PHASE 2: USER BROWSING**

**Step 1: Browse Available Quizzes**
```
GET /api/quizzes
```
**What happens:**
```sql
SELECT * FROM quizzes WHERE is_active = true
```
**Returns:** List of available quizzes

---

**Step 2: View Quiz Details**
```
GET /api/quizzes/1
```
**What happens:**
```sql
-- Get quiz info
SELECT * FROM quizzes WHERE id = 1

-- Get all questions for this quiz
SELECT * FROM questions WHERE quiz_id = 1 ORDER BY order_number

-- For each question, get options (WITHOUT showing is_correct)
SELECT id, option_text, order_number 
FROM options 
WHERE question_id = ? 
ORDER BY order_number
```
**Returns:** Quiz with questions and options (correct answers hidden)

---

### **PHASE 3: TAKING THE QUIZ**

**Step 3: Start Quiz Attempt**
```
POST /api/attempts/start
Body: { "quizId": 1, "userId": 123 }
```

**What happens:**
```sql
-- 1. Get quiz duration
SELECT duration_minutes FROM quizzes WHERE id = 1
→ duration = 30 minutes

-- 2. Calculate expiration time
start_time = NOW()
expiration_time = start_time + 30 minutes + 5 seconds (buffer)

-- 3. Create attempt record
INSERT INTO quiz_attempts (
  quiz_id, 
  user_id, 
  start_time, 
  expiration_time, 
  status
) VALUES (
  1, 
  123, 
  '2026-01-12 10:00:00',
  '2026-01-12 10:30:05',
  'in_progress'
)
→ attempt_id = 1
```

**Returns:** 
```json
{
  "attemptId": 1,
  "startTime": "2026-01-12T10:00:00Z",
  "expirationTime": "2026-01-12T10:30:05Z",
  "timeRemaining": 1805 (seconds)
}
```

**Timer starts NOW! User has 30 minutes to complete.**

---

**Step 4: Submit Answer for Question**
```
POST /api/attempts/1/answers
Body: { "questionId": 1, "selectedOptionIds": [1] }
```

**What happens:**
```sql
-- 1. Validate attempt is not expired
SELECT expiration_time, status FROM quiz_attempts WHERE id = 1
IF (NOW() > expiration_time) → Error: "Quiz expired"
IF (status != 'in_progress') → Error: "Quiz already completed"

-- 2. Get question details
SELECT id, question_type, points FROM questions WHERE id = 1
→ type = 'single', points = 1

-- 3. Get correct options for this question
SELECT id FROM options WHERE question_id = 1 AND is_correct = TRUE
→ correct_options = [1]

-- 4. Validate answer
selected_options = [1] (from user)
correct_options = [1] (from database)

IF (selected_options == correct_options):
  is_correct = TRUE
  points_earned = 1
ELSE:
  is_correct = FALSE
  points_earned = 0

-- 5. Store answer
INSERT INTO answers (
  attempt_id,
  question_id,
  selected_option_ids,
  is_correct,
  points_earned
) VALUES (
  1,
  1,
  '[1]', -- JSON array
  TRUE,
  1
)
```

**Returns:**
```json
{
  "answerId": 1,
  "isCorrect": true,
  "pointsEarned": 1
}
```

**User repeats Step 4 for each question in the quiz.**

---

**Step 5: Check Progress (Optional)**
```
GET /api/attempts/1
```

**What happens:**
```sql
SELECT * FROM quiz_attempts WHERE id = 1
```

**Returns:** Current status, score, time remaining

---

**Step 6: Finalize Quiz**
```
POST /api/attempts/1/finalize
```

**What happens:**
```sql
-- 1. Get all answers for this attempt
SELECT points_earned FROM answers WHERE attempt_id = 1
→ Sum = 8 points

-- 2. Get total possible points
SELECT SUM(points) FROM questions WHERE quiz_id = 1
→ Total = 10 points

-- 3. Calculate percentage
percentage = (8 / 10) * 100 = 80%

-- 4. Get passing score
SELECT passing_score FROM quizzes WHERE id = 1
→ passing_score = 70%

-- 5. Determine pass/fail
IF (percentage >= passing_score):
  passed = TRUE
ELSE:
  passed = FALSE

-- 6. Update attempt
UPDATE quiz_attempts 
SET 
  status = 'completed',
  score = 8,
  total_points = 10,
  percentage = 80.00,
  end_time = NOW()
WHERE id = 1
```

**Returns:**
```json
{
  "attemptId": 1,
  "status": "completed",
  "score": 8,
  "totalPoints": 10,
  "percentage": 80.00,
  "passed": true,
  "passingScore": 70
}
```

---

**Step 7: View Results**
```
GET /api/attempts/1/results
```

**What happens:**
```sql
-- 1. Get attempt details
SELECT * FROM quiz_attempts WHERE id = 1

-- 2. Get quiz info
SELECT title, level, passing_score FROM quizzes WHERE id = quiz_attempts.quiz_id

-- 3. Get all answers with details
SELECT 
  a.question_id,
  a.selected_option_ids,
  a.is_correct,
  a.points_earned,
  q.question_text,
  q.points as max_points
FROM answers a
JOIN questions q ON a.question_id = q.id
WHERE a.attempt_id = 1

-- 4. For each answer, get correct options
SELECT id, option_text, is_correct 
FROM options 
WHERE question_id = ?
```

**Returns:** Complete breakdown with:
- What user selected
- What was correct
- Points earned per question
- Detailed summary

---

## ⚙️ **Key Business Logic**

### **Answer Validation Logic:**

**Single Choice Questions:**
```javascript
selected = [1]
correct = [1]
is_correct = (selected == correct) // Must match exactly
```

**Multiple Choice Questions:**
```javascript
selected = [1, 3, 4]
correct = [1, 3, 4]
is_correct = (selected.sort() == correct.sort()) // All must match
```

---

### **Timer/Expiration Logic:**

```javascript
start_time = NOW()
expiration_time = start_time + duration_minutes + 5 seconds buffer

// On every request:
IF (NOW() > expiration_time AND status == 'in_progress'):
  UPDATE quiz_attempts SET status = 'expired'
  REJECT request with "Quiz expired" error
```

---

### **Scoring Logic:**

```javascript
// Per question:
IF answer is correct:
  points_earned = question.points
ELSE:
  points_earned = 0

// Final score:
total_score = SUM(all answers.points_earned)
total_possible = SUM(all questions.points)
percentage = (total_score / total_possible) * 100

// Pass/Fail:
IF percentage >= quiz.passing_score:
  passed = TRUE
ELSE:
  passed = FALSE
```

---

## 🔐 **Data Integrity Rules**

### **Cascade Deletions:**
```
DELETE Quiz 
  → Deletes all Questions
  → Deletes all Options
  → Deletes all Quiz_Attempts
  → Deletes all Answers

DELETE Question
  → Deletes all Options
  → Deletes all Answers referencing it

DELETE Quiz_Attempt
  → Deletes all Answers for that attempt
```

### **Unique Constraints:**
- One answer per (attempt_id, question_id) pair
- User cannot answer same question twice in one attempt

### **Indexes for Performance:**
- `quizzes.level` - Fast filtering by difficulty
- `quiz_attempts.status` - Fast filtering by attempt status
- `quiz_attempts.expiration_time` - Fast expiration checks
- Foreign keys - Fast joins

---

## 📝 **Data Flow Summary**

```
┌─────────┐
│ Browse  │ → GET /api/quizzes
│ Quizzes │    Shows available quizzes
└────┬────┘
     │
     ▼
┌──────────┐
│ View     │ → GET /api/quizzes/:id
│ Details  │    Shows questions & options (no answers)
└────┬─────┘
     │
     ▼
┌──────────┐
│ Start    │ → POST /api/attempts/start
│ Attempt  │    Creates quiz_attempt record
└────┬─────┘    Starts timer
     │
     ▼
┌──────────┐
│ Answer   │ → POST /api/attempts/:id/answers (repeat)
│Questions │    Creates answer records
└────┬─────┘    Validates & scores each answer
     │
     ▼
┌──────────┐
│Finalize  │ → POST /api/attempts/:id/finalize
│ Quiz     │    Calculates final score
└────┬─────┘    Updates attempt status
     │
     ▼
┌──────────┐
│ View     │ → GET /api/attempts/:id/results
│ Results  │    Shows detailed breakdown
└──────────┘
```

---

## 🎯 **Real Example: Complete Flow**

```sql
-- SETUP (done once)
Quiz: "JavaScript Basics" (ID=1, 30min, 70% pass)
  └─ Question 1: "What is JS?" (points=1)
       ├─ Option 1: "Programming language" ✓ CORRECT
       └─ Option 2: "Coffee drink" ✗
  └─ Question 2: "JS runs where?" (points=2, multiple choice)
       ├─ Option 3: "Browser" ✓ CORRECT
       ├─ Option 4: "Server" ✓ CORRECT
       └─ Option 5: "Database" ✗

-- USER TAKES QUIZ
1. User 123 starts quiz 1 at 10:00 AM
   → quiz_attempts.id = 1
   → expiration = 10:30 AM

2. User answers Q1: selects [1]
   → Correct! points_earned = 1
   → answers.id = 1

3. User answers Q2: selects [3, 4]
   → Correct! points_earned = 2
   → answers.id = 2

4. User finalizes at 10:15 AM
   → score = 3
   → total = 3
   → percentage = 100%
   → status = "completed"
   → PASSED!

5. User views results
   → Shows all questions, what they selected, correct answers
```

---

This is how your entire quiz system works from database schema to user flow! 🚀
