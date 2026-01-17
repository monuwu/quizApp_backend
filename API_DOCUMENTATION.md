# API Documentation

Base URL: `http://localhost:5000/api`

## Table of Contents
1. [Quiz Endpoints](#quiz-endpoints)
2. [Attempt Endpoints](#attempt-endpoints)
3. [Answer Endpoints](#answer-endpoints)

---

## Quiz Endpoints

### 1. Get All Quizzes

Get a list of all active quizzes, optionally filtered by difficulty level.

**Endpoint:** `GET /quizzes`

**Query Parameters:**
- `level` (optional): Filter by difficulty level
  - Values: `beginner`, `intermediate`, `advanced`

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/quizzes?level=beginner"
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
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

---

### 2. Get Quiz Details

Get detailed information about a specific quiz including questions and options (without correct answers).

**Endpoint:** `GET /quizzes/:id`

**Path Parameters:**
- `id` (required): Quiz ID (integer)

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/quizzes/1"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "JavaScript Basics",
    "description": "Test your knowledge of JavaScript fundamentals",
    "level": "beginner",
    "duration_minutes": 30,
    "passing_score": 70,
    "questions": [
      {
        "id": 1,
        "question_text": "What is the correct syntax to print a message?",
        "question_type": "single",
        "points": 1,
        "order_number": 1,
        "options": [
          {
            "id": 1,
            "option_text": "console.log('Hello')",
            "order_number": 1
          },
          {
            "id": 2,
            "option_text": "print('Hello')",
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

### 3. Start Quiz Attempt

Start a new quiz attempt. This creates a session with a timer.

**Endpoint:** `POST /attempts/start`

**Request Body:**
```json
{
  "quizId": 1,
  "userId": 123
}
```

**Field Descriptions:**
- `quizId` (required, integer): ID of the quiz to attempt
- `userId` (optional, integer): ID of the user taking the quiz

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/attempts/start" \
  -H "Content-Type: application/json" \
  -d '{
    "quizId": 1,
    "userId": 123
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Quiz attempt started successfully",
  "data": {
    "attemptId": 1,
    "quizId": 1,
    "startTime": "2026-01-10T10:00:00.000Z",
    "expirationTime": "2026-01-10T10:30:00.000Z",
    "durationMinutes": 30,
    "status": "in_progress"
  }
}
```

**Error Responses:**
- `404`: Quiz not found
- `400`: Quiz is not active
- `409`: User already has an active attempt for this quiz

---

### 4. Get Attempt Details

Retrieve information about a specific quiz attempt.

**Endpoint:** `GET /attempts/:id`

**Path Parameters:**
- `id` (required): Attempt ID (integer)

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/attempts/1"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "quiz_id": 1,
    "user_id": 123,
    "quiz_title": "JavaScript Basics",
    "start_time": "2026-01-10T10:00:00.000Z",
    "end_time": null,
    "expiration_time": "2026-01-10T10:30:00.000Z",
    "status": "in_progress",
    "score": 0,
    "total_points": 10,
    "percentage": 0.00,
    "duration_minutes": 30
  }
}
```

---

### 5. Finalize Quiz Attempt

Complete a quiz attempt and calculate the final score.

**Endpoint:** `POST /attempts/:id/finalize`

**Path Parameters:**
- `id` (required): Attempt ID (integer)

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/attempts/1/finalize"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Quiz attempt finalized successfully",
  "data": {
    "attemptId": 1,
    "status": "completed",
    "score": 8,
    "totalPoints": 10,
    "percentage": 80.00
  }
}
```

**Error Responses:**
- `404`: Attempt not found
- `400`: Attempt is already finalized

---

### 6. Get Attempt Results

Get detailed results including correct answers (only available after finalization).

**Endpoint:** `GET /attempts/:id/results`

**Path Parameters:**
- `id` (required): Attempt ID (integer)

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/attempts/1/results"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "attempt": {
      "id": 1,
      "quizTitle": "JavaScript Basics",
      "status": "completed",
      "score": 8,
      "totalPoints": 10,
      "percentage": 80.00,
      "startTime": "2026-01-10T10:00:00.000Z",
      "endTime": "2026-01-10T10:25:00.000Z"
    },
    "answers": [
      {
        "id": 1,
        "question_id": 1,
        "question_text": "What is the correct syntax?",
        "selected_option_ids": [1],
        "is_correct": true,
        "points_earned": 1,
        "max_points": 1,
        "options": [
          {
            "id": 1,
            "option_text": "console.log('Hello')",
            "is_correct": true
          },
          {
            "id": 2,
            "option_text": "print('Hello')",
            "is_correct": false
          }
        ]
      }
    ]
  }
}
```

---

### 7. Get User Attempts

Get all quiz attempts for a specific user.

**Endpoint:** `GET /attempts/user/:userId`

**Path Parameters:**
- `userId` (required): User ID (integer)

**Query Parameters:**
- `quizId` (optional): Filter by specific quiz

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/attempts/user/123?quizId=1"
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "quiz_id": 1,
      "quiz_title": "JavaScript Basics",
      "level": "beginner",
      "start_time": "2026-01-10T10:00:00.000Z",
      "end_time": "2026-01-10T10:25:00.000Z",
      "status": "completed",
      "score": 8,
      "total_points": 10,
      "percentage": 80.00
    }
  ]
}
```

---

## Answer Endpoints

### 8. Submit Answer

Submit an answer for a single question during an active quiz attempt.

**Endpoint:** `POST /attempts/:attemptId/answers`

**Path Parameters:**
- `attemptId` (required): Attempt ID (integer)

**Request Body:**
```json
{
  "questionId": 1,
  "selectedOptionIds": [1]
}
```

**Field Descriptions:**
- `questionId` (required, integer): ID of the question being answered
- `selectedOptionIds` (required, array of integers): Selected option IDs
  - Single choice: Array with one element `[1]`
  - Multiple choice: Array with multiple elements `[1, 3, 5]`

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/attempts/1/answers" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": 1,
    "selectedOptionIds": [1]
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Answer submitted successfully",
  "data": {
    "questionId": 1,
    "isCorrect": true,
    "pointsEarned": 1,
    "maxPoints": 1
  }
}
```

**Error Responses:**
- `404`: Quiz attempt or question not found
- `403`: Attempt has expired or is not in progress
- `400`: Invalid option selection

---

### 9. Submit Multiple Answers

Submit answers for multiple questions at once (bulk submission).

**Endpoint:** `POST /attempts/:attemptId/answers/bulk`

**Path Parameters:**
- `attemptId` (required): Attempt ID (integer)

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": 1,
      "selectedOptionIds": [1]
    },
    {
      "questionId": 2,
      "selectedOptionIds": [2, 4, 5]
    }
  ]
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/attempts/1/answers/bulk" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"questionId": 1, "selectedOptionIds": [1]},
      {"questionId": 2, "selectedOptionIds": [2, 4, 5]}
    ]
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Answers submitted successfully",
  "data": [
    {
      "questionId": 1,
      "isCorrect": true,
      "pointsEarned": 1,
      "maxPoints": 1
    },
    {
      "questionId": 2,
      "isCorrect": false,
      "pointsEarned": 0,
      "maxPoints": 2
    }
  ]
}
```

---

### 10. Get Attempt Answers

Get all submitted answers for a quiz attempt.

**Endpoint:** `GET /attempts/:attemptId/answers`

**Path Parameters:**
- `attemptId` (required): Attempt ID (integer)

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/attempts/1/answers"
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "question_id": 1,
      "question_text": "What is the correct syntax?",
      "selected_option_ids": [1],
      "is_correct": true,
      "points_earned": 1,
      "max_points": 1,
      "answered_at": "2026-01-10T10:05:00.000Z"
    }
  ]
}
```

---

### 11. Get Answer Statistics

Get statistical summary of answers for an attempt.

**Endpoint:** `GET /attempts/:attemptId/statistics`

**Path Parameters:**
- `attemptId` (required): Attempt ID (integer)

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/attempts/1/statistics"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total_questions": 10,
    "total_answered": 8,
    "unanswered": 2,
    "correct_answers": 6,
    "incorrect_answers": 2,
    "total_points_earned": 7
  }
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

For validation errors:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "quizId",
      "message": "Quiz ID must be a valid integer"
    }
  ]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `403` - Forbidden (e.g., expired quiz attempt)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate active attempt)
- `500` - Internal Server Error

## Timer Enforcement

The backend automatically enforces quiz timers:

1. When an attempt is started, an expiration time is calculated
2. Every answer submission checks if the attempt has expired
3. If expired, the attempt is automatically marked as "expired" and submissions are rejected
4. The `/finalize` endpoint marks expired attempts accordingly

## Question Types

- `single`: Single correct answer (radio button)
- `multiple`: Multiple correct answers (checkboxes)

For correct evaluation:
- **Single choice**: Must select exactly the one correct option
- **Multiple choice**: Must select ALL correct options (no more, no less)
