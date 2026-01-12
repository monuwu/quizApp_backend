# Quiz Application - Workflow & Architecture
Your Available Endpoints:

GET /api/quizzes - Get all quizzes
GET /api/quizzes/:id - Get quiz details
POST /api/attempts/start - Start quiz attempt
GET /api/attempts/:id - Get attempt details
POST /api/attempts/:id/finalize - Finalize attempt
GET /api/attempts/:id/results - Get results
GET /api/attempts/user/:userId - Get user attempts
POST /api/attempts/:attemptId/answers - Submit answer
POST /api/attempts/:attemptId/answers/bulk - Submit multiple answers
GET /api/attempts/:attemptId/answers - Get attempt answers
GET /api/attempts/:attemptId/statistics - Get statistics
## System Overview

This backend implements a complete quiz system with timer enforcement, real-time answer evaluation, and comprehensive result tracking.

## Core Workflows

### 1. Quiz Discovery Flow

```
Client Request
    ↓
GET /api/quizzes?level=beginner
    ↓
Quiz Service → Database
    ↓
Returns: List of available quizzes
    ↓
Client displays quiz options
```

**Purpose**: Allow users to browse and select quizzes based on difficulty.

---

### 2. Quiz Attempt Flow

```
1. Client: GET /api/quizzes/:id
   ↓
   Returns: Questions + Options (NO correct answers)

2. Client: POST /api/attempts/start
   Body: { quizId, userId }
   ↓
   Creates attempt record
   Calculates expiration time
   Checks for duplicate active attempts
   ↓
   Returns: { attemptId, startTime, expirationTime }

3. Client starts timer based on expirationTime

4. Client: POST /api/attempts/:attemptId/answers
   Body: { questionId, selectedOptionIds }
   ↓
   Validates timer hasn't expired
   Evaluates answer correctness
   Stores answer + points earned
   ↓
   Returns: { isCorrect, pointsEarned }
   
5. Repeat step 4 for each question

6. Client: POST /api/attempts/:attemptId/finalize
   ↓
   Calculates final score
   Updates attempt status
   ↓
   Returns: { score, totalPoints, percentage }

7. Client: GET /api/attempts/:attemptId/results
   ↓
   Returns: Detailed breakdown with correct answers
```

---

### 3. Timer Enforcement Workflow

```
Backend Timer Checks (on every request):
    ↓
1. Client submits answer
    ↓
2. Middleware: validateAttemptNotExpired
    ↓
3. Query: SELECT expiration_time, status FROM quiz_attempts
    ↓
4. Compare: current_time vs expiration_time
    ↓
5a. IF expired:
    - Update status to 'expired'
    - Reject submission with 403
    - Return error message
    ↓
5b. IF not expired:
    - Allow submission
    - Process answer
    - Return result
```

**Key Feature**: Timer is enforced server-side, preventing client-side manipulation.

---

## Architecture Components

### Layer Structure

```
┌─────────────────────────────────────────┐
│         Routes (HTTP Endpoints)          │
│  - Define API endpoints                  │
│  - Input validation                      │
│  - Route to controllers                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Controllers (Handlers)           │
│  - Receive HTTP requests                 │
│  - Extract parameters                    │
│  - Call service methods                  │
│  - Format responses                      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       Services (Business Logic)          │
│  - Quiz logic                            │
│  - Attempt management                    │
│  - Answer evaluation                     │
│  - Score calculation                     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Database (MySQL)                 │
│  - Store quiz data                       │
│  - Track attempts                        │
│  - Record answers                        │
└─────────────────────────────────────────┘
```

### Middleware Flow

```
HTTP Request
    ↓
1. CORS Middleware
   └─> Allow cross-origin requests
    ↓
2. Helmet Middleware
   └─> Add security headers
    ↓
3. Body Parser
   └─> Parse JSON body
    ↓
4. Express Validator
   └─> Validate input parameters
    ↓
5. Custom Validation (Timer Check)
   └─> Check expiration time
    ↓
6. Controller
   └─> Handle request
    ↓
7. Error Handler
   └─> Catch and format errors
    ↓
HTTP Response
```

---

## Database Schema Relationships

```
┌─────────────┐
│   quizzes   │
│  - id (PK)  │
│  - title    │
│  - level    │
│  - duration │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────┴──────────┐
│   questions     │
│  - id (PK)      │
│  - quiz_id (FK) │
│  - points       │
└──────┬──────────┘
       │ 1
       │
       │ N
┌──────┴──────────┐
│    options      │
│  - id (PK)      │
│  - question_id  │
│  - is_correct   │
└─────────────────┘

┌─────────────────┐
│ quiz_attempts   │
│  - id (PK)      │
│  - quiz_id (FK) │
│  - user_id      │
│  - status       │
│  - score        │
└──────┬──────────┘
       │ 1
       │
       │ N
┌──────┴──────────┐
│    answers      │
│  - id (PK)      │
│  - attempt_id   │
│  - question_id  │
│  - is_correct   │
│  - points_earned│
└─────────────────┘
```

---

## Answer Evaluation Logic

### Single Choice Questions

```javascript
correctOptionIds = [2]  // Only option 2 is correct
selectedOptionIds = [2] // User selected option 2

Evaluation:
  if (selectedOptionIds === correctOptionIds)
    → isCorrect = true
    → pointsEarned = question.points
  else
    → isCorrect = false
    → pointsEarned = 0
```

### Multiple Choice Questions

```javascript
correctOptionIds = [1, 3, 5]  // Options 1, 3, 5 are correct
selectedOptionIds = [1, 3, 5] // User selected all correct

Evaluation:
  Sort both arrays
  Compare arrays
  if (exactly matching)
    → isCorrect = true
    → pointsEarned = question.points
  else
    → isCorrect = false
    → pointsEarned = 0
```

**Important**: Partial credit is NOT given. Users must select ALL correct options and ONLY correct options.

---

## Status Flow Diagram

```
Quiz Attempt Status Lifecycle:

    START
      ↓
 in_progress ──────┐
      ↓            │
      │         (timeout)
      │            │
      ↓            ↓
  finalize ──> expired
      ↓
  completed
      ↓
    [END]
```

**Status Meanings:**
- `in_progress`: Quiz is active, can submit answers
- `completed`: User finished within time limit
- `expired`: Time ran out before completion
- `abandoned`: Reserved for future use

---

## Security Features

### 1. Timer Cannot Be Bypassed
- Expiration time stored in database
- Every request validates against server time
- Auto-expiration on timeout

### 2. Correct Answers Hidden
- Quiz details endpoint excludes `is_correct` field
- Only shown after attempt finalization
- Available in results endpoint

### 3. SQL Injection Prevention
- Parameterized queries
- MySQL2 prepared statements
- Input validation

### 4. Input Validation
- express-validator on all endpoints
- Type checking (integers, arrays)
- Range validation
- Required field checks

### 5. CORS Protection
- Configured allowed origins
- Credentials handling
- Preflight requests

---

## Performance Optimizations

### 1. Database Indexing
```sql
-- Indexes for fast queries
INDEX idx_level (level)
INDEX idx_quiz_id (quiz_id)
INDEX idx_attempt_id (attempt_id)
INDEX idx_status (status)
INDEX idx_expiration (expiration_time)
```

### 2. Connection Pooling
- MySQL2 connection pool
- Configurable pool size
- Automatic connection management

### 3. Transaction Management
- ACID compliance for attempts
- Rollback on errors
- Isolated answer submissions

---

## API Response Patterns

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### Validation Error Response
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "fieldName",
      "message": "Error message"
    }
  ]
}
```

---

## Environment Configuration

### Development
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
```

### Production
```env
NODE_ENV=production
PORT=80
DB_HOST=production-db-host
```

**Changes in Production:**
- Error stack traces hidden
- Detailed logging reduced
- Connection pool size adjusted

---

## Testing Strategy

### 1. Happy Path Testing
```bash
# Test complete quiz flow
1. Get quizzes
2. Start attempt
3. Submit answers
4. Finalize
5. Get results
```

### 2. Error Testing
```bash
# Test timer expiration
1. Start attempt
2. Wait for expiration
3. Try to submit → Should fail

# Test duplicate attempts
1. Start attempt
2. Try to start again → Should fail
```

### 3. Edge Cases
- Empty option selection
- Invalid quiz/question IDs
- Non-existent attempts
- Already finalized attempts

---

## Monitoring & Logging

### Key Metrics to Track
- Active quiz attempts
- Average completion time
- Success rates per quiz
- Timeout/expiration rates
- API response times

### Log Events
- ✅ Database connections
- ✅ API requests
- ❌ Errors and exceptions
- ⚠️ Timer expirations
- 📊 Score calculations

---

## Future Enhancements

### Phase 2 Features
- [ ] JWT Authentication
- [ ] User roles (admin, user)
- [ ] Quiz creation API
- [ ] Question randomization
- [ ] Answer explanation field

### Phase 3 Features
- [ ] Leaderboards
- [ ] Quiz analytics
- [ ] Retry logic
- [ ] Partial credit
- [ ] Time tracking per question

---

## Integration Guide for Frontend

### Required Frontend Features

1. **Timer Display**
   ```javascript
   const timeRemaining = expirationTime - currentTime;
   // Display countdown
   ```

2. **Auto-finalize on Timeout**
   ```javascript
   if (timeRemaining <= 0) {
     await finalizeAttempt();
   }
   ```

3. **Answer Submission**
   ```javascript
   // Real-time or batch submission
   await submitAnswer(questionId, selectedOptions);
   ```

4. **State Management**
   - Store attemptId
   - Track answered questions
   - Monitor timer
   - Handle errors

### Recommended Frontend Structure
```
components/
├── QuizList.jsx           # Browse quizzes
├── QuizDetails.jsx        # View questions
├── QuizAttempt.jsx        # Take quiz
├── Timer.jsx              # Countdown timer
├── Question.jsx           # Single question
├── Results.jsx            # Show results
└── Statistics.jsx         # Stats dashboard
```

---

This architecture provides a robust, scalable, and secure foundation for your quiz application!
