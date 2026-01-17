# Quiz App API Endpoints

Base URL: `http://localhost:5000`

## 📋 Table of Contents
- [Health Check](#health-check)
- [Quiz Endpoints](#quiz-endpoints)
- [Attempt Endpoints](#attempt-endpoints)
- [Answer Endpoints](#answer-endpoints)
- [How the Logic Works](#how-the-logic-works)

---

## Health Check

### GET /health
Check if the API is running.

**Response:**
```json
{
  "status": "OK",
  "message": "Quiz API is running",
  "timestamp": "2026-01-12T10:30:00.000Z"
}
```

---

## Quiz Endpoints

### 1. GET /api/quizzes
Get all active quizzes, optionally filtered by level.

**Query Parameters:**
- `level` (optional): `beginner`, `intermediate`, or `advanced`

**Example Requests:**
```bash
# Get all quizzes
curl http://localhost:5000/api/quizzes

# Get beginner level quizzes
curl http://localhost:5000/api/quizzes?level=beginner
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "JavaScript Basics",
      "description": "Test your knowledge of JavaScript fundamentals",
      "level": "beginner",
      "duration_minutes": 30,
      "passing_score": 70,
      "created_at": "2026-01-10T10:00:00.000Z"
    }
  ]
}
```

### 2. GET /api/quizzes/:id
Get detailed quiz information with questions and options (correct answers are hidden).

**URL Parameters:**
- `id`: Quiz ID (integer)

**Example Request:**
```bash
curl http://localhost:5000/api/quizzes/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "JavaScript Basics",
    "description": "Test your knowledge",
    "level": "beginner",
    "duration_minutes": 30,
    "passing_score": 70,
    "questions": [
      {
        "id": 1,
        "question_text": "What is JavaScript?",
        "question_type": "single",
        "points": 1,
        "order_number": 1,
        "options": [
          {
            "id": 1,
            "option_text": "A programming language",
            "order_number": 1
          },
          {
            "id": 2,
            "option_text": "A coffee type",
            "order_number": 2
          }
        ]
      }
    ]
  }
}
```

---

## Attempt Endpoints

### 3. POST /api/attempts/start
Start a new quiz attempt. Creates a timer based on quiz duration.

**Request Body:**
```json
{
  "quizId": 1,
  "userId": 123
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/attempts/start \
  -H "Content-Type: application/json" \
  -d '{"quizId": 1, "userId": 123}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": 1,
    "quizId": 1,
    "startTime": "2026-01-12T10:00:00.000Z",
    "expirationTime": "2026-01-12T10:30:00.000Z",
    "timeRemaining": 1800,
    "status": "in_progress",
    "message": "Quiz started successfully"
  }
}
```

### 4. GET /api/attempts/:id
Get current attempt status and details.

**URL Parameters:**
- `id`: Attempt ID (integer)

**Example Request:**
```bash
curl http://localhost:5000/api/attempts/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "quizId": 1,
    "userId": 123,
    "startTime": "2026-01-12T10:00:00.000Z",
    "expirationTime": "2026-01-12T10:30:00.000Z",
    "status": "in_progress",
    "score": 0,
    "totalPoints": 0,
    "percentage": "0.00",
    "timeRemaining": 1500,
    "isExpired": false
  }
}
```

### 5. POST /api/attempts/:id/finalize
Finalize and evaluate the quiz attempt. Calculates score and marks as completed.

**URL Parameters:**
- `id`: Attempt ID (integer)

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/attempts/1/finalize \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": 1,
    "status": "completed",
    "score": 8,
    "totalPoints": 10,
    "percentage": "80.00",
    "passed": true,
    "passingScore": 70,
    "answeredQuestions": 10,
    "totalQuestions": 10,
    "endTime": "2026-01-12T10:25:00.000Z"
  }
}
```

### 6. GET /api/attempts/:id/results
Get detailed results of a completed attempt with correct/incorrect answers.

**URL Parameters:**
- `id`: Attempt ID (integer)

**Example Request:**
```bash
curl http://localhost:5000/api/attempts/1/results
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attempt": {
      "id": 1,
      "status": "completed",
      "score": 8,
      "totalPoints": 10,
      "percentage": "80.00",
      "passed": true,
      "startTime": "2026-01-12T10:00:00.000Z",
      "endTime": "2026-01-12T10:25:00.000Z"
    },
    "quiz": {
      "title": "JavaScript Basics",
      "level": "beginner",
      "passingScore": 70
    },
    "answers": [
      {
        "questionId": 1,
        "questionText": "What is JavaScript?",
        "selectedOptions": [1],
        "correctOptions": [1],
        "isCorrect": true,
        "pointsEarned": 1,
        "maxPoints": 1
      }
    ],
    "summary": {
      "totalQuestions": 10,
      "correctAnswers": 8,
      "incorrectAnswers": 2,
      "accuracy": "80.00"
    }
  }
}
```

### 7. GET /api/attempts/:id/remaining-time
Get remaining time for an active quiz attempt.

**URL Parameters:**
- `id`: Attempt ID (integer)

**Example Request:**
```bash
curl http://localhost:5000/api/attempts/1/remaining-time
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": 1,
    "expirationTime": "2026-01-12T10:30:00.000Z",
    "timeRemaining": 1200,
    "isExpired": false,
    "status": "in_progress"
  }
}
```

---

## Answer Endpoints

### 8. POST /api/attempts/:attemptId/answers
Submit an answer for a question in the current attempt.

**URL Parameters:**
- `attemptId`: Attempt ID (integer)

**Request Body:**
```json
{
  "questionId": 1,
  "selectedOptionIds": [1]
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/attempts/1/answers \
  -H "Content-Type: application/json" \
  -d '{"questionId": 1, "selectedOptionIds": [1]}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answerId": 1,
    "questionId": 1,
    "isCorrect": true,
    "pointsEarned": 1,
    "answeredAt": "2026-01-12T10:05:00.000Z",
    "message": "Answer submitted successfully"
  }
}
```

### 9. GET /api/attempts/:attemptId/answers
Get all submitted answers for a quiz attempt.

**URL Parameters:**
- `attemptId`: Attempt ID (integer)

**Example Request:**
```bash
curl http://localhost:5000/api/attempts/1/answers
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": 1,
    "answers": [
      {
        "id": 1,
        "questionId": 1,
        "selectedOptionIds": [1],
        "isCorrect": true,
        "pointsEarned": 1,
        "answeredAt": "2026-01-12T10:05:00.000Z"
      }
    ],
    "answeredCount": 1,
    "totalQuestions": 10
  }
}
```

---

## How the Logic Works

### 🔄 Quiz Flow

```
1. User browses quizzes → GET /api/quizzes
2. User views quiz details → GET /api/quizzes/:id
3. User starts quiz → POST /api/attempts/start
   ↓
   Timer starts (based on quiz duration)
   Attempt record created with expiration time
   ↓
4. User answers questions → POST /api/attempts/:attemptId/answers
   ↓
   Each answer is validated and scored
   Points are calculated immediately
   ↓
5. User checks remaining time → GET /api/attempts/:id/remaining-time
   ↓
6. User finishes or time expires → POST /api/attempts/:id/finalize
   ↓
   All answers are evaluated
   Final score is calculated
   Status changes to 'completed' or 'expired'
   ↓
7. User views results → GET /api/attempts/:id/results
```

### 🎯 Scoring Logic

1. **Start Attempt**: Creates quiz_attempt with expiration_time = start_time + duration_minutes
2. **Submit Answer**: 
   - Validates selected options against correct options
   - For single choice: 1 selected option must match the correct one
   - For multiple choice: All selected options must match all correct options
   - Awards points if correct
3. **Finalize**: 
   - Sums up all points_earned
   - Calculates percentage = (score / total_points) * 100
   - Determines pass/fail based on passing_score

### ⏱️ Timer Logic

- **Buffer Time**: 5 seconds buffer added to prevent edge cases
- **Expiration Check**: Every endpoint validates if attempt is expired
- **Auto-Expire**: Attempts automatically marked as 'expired' if submitted after expiration_time
- **Time Remaining**: Calculated as expiration_time - current_time

### 🔒 Validation Layers

1. **Route Validation**: Express-validator checks request format
2. **Middleware Validation**: Custom validators check business rules
3. **Service Validation**: Database constraints and logic validation
4. **Error Handling**: Global error handler catches all errors

### 📊 Database Schema

```
quizzes
  └── questions
       └── options
       
quiz_attempts
  └── answers (references questions)
```

### 🧪 Testing Endpoints

**Use Thunder Client, Postman, or cURL:**

```bash
# 1. Start the server
npm run dev

# 2. Test health check
curl http://localhost:5000/health

# 3. Get quizzes
curl http://localhost:5000/api/quizzes

# 4. Start a quiz attempt
curl -X POST http://localhost:5000/api/attempts/start \
  -H "Content-Type: application/json" \
  -d '{"quizId": 1}'

# 5. Submit an answer (use attemptId from step 4)
curl -X POST http://localhost:5000/api/attempts/1/answers \
  -H "Content-Type: application/json" \
  -d '{"questionId": 1, "selectedOptionIds": [1]}'

# 6. Finalize the attempt
curl -X POST http://localhost:5000/api/attempts/1/finalize

# 7. Get results
curl http://localhost:5000/api/attempts/1/results
```

---

## 🛠️ Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // validation errors if any
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (e.g., answer already submitted)
- `410` - Gone (e.g., attempt expired)
- `500` - Internal Server Error
