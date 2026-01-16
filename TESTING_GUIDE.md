# Complete Quiz Flow Testing Guide

## Step-by-Step Testing (Copy & Paste Ready)

---

## 📢 API Endpoint: Get Quiz Questions with Options

To display the quiz questions with their options (but without correct answers), use:

```bash
curl http://localhost:5000/api/quizzes/{quizId}
```
Replace `{quizId}` with the actual quiz ID (e.g., 1).

**Example:**
```bash
curl http://localhost:5000/api/quizzes/1
```

**Response:**  
Returns the quiz details, including all questions and their options.

---

### 1️⃣ GET ALL QUIZZES
```bash
curl http://localhost:5000/api/quizzes
```
**Expected Response:** Array of 3 active quizzes (JavaScript Basics, React Patterns, Node.js Advanced)

---

### 2️⃣ GET QUIZ DETAILS (Quiz ID 1)
```bash
curl http://localhost:5000/api/quizzes/1
```
**Expected Response:** Quiz with 3+ questions, options (correct answers hidden)

---

### 3️⃣ START NEW QUIZ ATTEMPT ⭐
```bash
curl -X POST http://localhost:5000/api/attempts/start \
  -H "Content-Type: application/json" \
  -d '{"quizId": 1, "userId": 100}'
```
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": YOUR_ATTEMPT_ID,
    "quizId": 1,
    "startTime": "2026-01-13T...",
    "expirationTime": "2026-01-13T... (30 mins later)",
    "status": "in_progress"
  }
}
```
**⚠️ SAVE THIS ATTEMPT ID - USE IT IN NEXT STEPS**

---

### 4️⃣ SUBMIT ANSWER FOR QUESTION 1
```bash
curl -X POST http://localhost:5000/api/attempts/YOUR_ATTEMPT_ID/answers \
  -H "Content-Type: application/json" \
  -d '{"questionId": 1, "selectedOptionIds": [1]}'
```
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "questionId": 1,
    "isCorrect": true,
    "pointsEarned": 1,
    "maxPoints": 1
  }
}
```

---

### 5️⃣ SUBMIT ANSWER FOR QUESTION 2
```bash
curl -X POST http://localhost:5000/api/attempts/YOUR_ATTEMPT_ID/answers \
  -H "Content-Type: application/json" \
  -d '{"questionId": 2, "selectedOptionIds": [5]}'
```
*Replace `[5]` with a valid option ID from quiz question 2*

---

### 6️⃣ SUBMIT ANSWER FOR QUESTION 3 (and more)
```bash
curl -X POST http://localhost:5000/api/attempts/YOUR_ATTEMPT_ID/answers \
  -H "Content-Type: application/json" \
  -d '{"questionId": 3, "selectedOptionIds": [10]}'
```

---

### 7️⃣ CHECK ATTEMPT STATUS (BEFORE FINALIZE)
```bash
curl http://localhost:5000/api/attempts/YOUR_ATTEMPT_ID
```
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": YOUR_ATTEMPT_ID,
    "quizId": 1,
    "userId": 100,
    "status": "in_progress",
    "score": 0,
    "totalPoints": 10,
    "percentage": "0.00",
    "timeRemaining": 1200,
    "isExpired": false
  }
}
```

---

### 8️⃣ FINALIZE ATTEMPT ⭐⭐ (THIS WAS FAILING)
```bash
curl -X POST http://localhost:5000/api/attempts/YOUR_ATTEMPT_ID/finalize \
  -H "Content-Type: application/json"
```
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": YOUR_ATTEMPT_ID,
    "status": "completed",
    "score": 2,
    "totalPoints": 10,
    "percentage": 20.00
  }
}
```

---

### 9️⃣ GET FINAL RESULTS
```bash
curl http://localhost:5000/api/attempts/YOUR_ATTEMPT_ID/results
```
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "attempt": {
      "id": YOUR_ATTEMPT_ID,
      "status": "completed",
      "score": 2,
      "totalPoints": 10,
      "percentage": "20.00",
      "passed": false,
      "startTime": "...",
      "endTime": "..."
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
      "totalQuestions": 3,
      "correctAnswers": 1,
      "incorrectAnswers": 2,
      "accuracy": "33.33"
    }
  }
}
```

---

### 🔟 GET USER'S ATTEMPT HISTORY
```bash
curl http://localhost:5000/api/attempts/user/100
```
**Expected Response:** Array of all attempts for userId 100

---

## Rapid Test Script (All in One)

Copy this and run in your terminal:

```bash
#!/bin/bash

echo "1. Starting quiz attempt..."
RESULT=$(curl -s -X POST http://localhost:5000/api/attempts/start \
  -H "Content-Type: application/json" \
  -d '{"quizId": 1, "userId": 200}')

ATTEMPT_ID=$(echo $RESULT | grep -o '"attemptId":[0-9]*' | cut -d':' -f2)
echo "Attempt ID: $ATTEMPT_ID"

echo "2. Submitting answer 1..."
curl -s -X POST http://localhost:5000/api/attempts/$ATTEMPT_ID/answers \
  -H "Content-Type: application/json" \
  -d '{"questionId": 1, "selectedOptionIds": [1]}' | jq

echo "3. Submitting answer 2..."
curl -s -X POST http://localhost:5000/api/attempts/$ATTEMPT_ID/answers \
  -H "Content-Type: application/json" \
  -d '{"questionId": 2, "selectedOptionIds": [5]}' | jq

echo "4. Finalizing attempt..."
curl -s -X POST http://localhost:5000/api/attempts/$ATTEMPT_ID/finalize \
  -H "Content-Type: application/json" | jq

echo "5. Getting results..."
curl -s http://localhost:5000/api/attempts/$ATTEMPT_ID/results | jq
```

---

## Common Errors & Solutions

### ❌ Error: "Attempt not found"
**Cause:** Attempt ID doesn't exist in database
**Solution:** Create new attempt using `/api/attempts/start` first

### ❌ Error: "Quiz attempt has expired"
**Cause:** Current time > expiration_time
**Solution:** Start new attempt, submit answers quickly

### ❌ Error: "Cannot submit answer. Attempt is completed"
**Cause:** Already finalized the attempt
**Solution:** Create new attempt with `/api/attempts/start`

### ❌ Error: "Question not found in this quiz"
**Cause:** Question ID doesn't belong to that quiz
**Solution:** Get quiz details first to see valid question IDs

### ❌ Error: "Invalid option selection"
**Cause:** Option doesn't belong to that question or doesn't exist
**Solution:** Verify option IDs match question

---

## Quiz Scoring Examples

### Example 1: Perfect Score (100%)
- Total Questions: 10
- Correct Answers: 10
- Points Earned: 10
- Percentage: 100%
- Passed: ✅ YES (required 70%)

### Example 2: Passing Score (72%)
- Total Questions: 25
- Correct Answers: 18
- Points Earned: 18
- Percentage: 72%
- Passed: ✅ YES

### Example 3: Failing Score (60%)
- Total Questions: 10
- Correct Answers: 6
- Points Earned: 6
- Percentage: 60%
- Passed: ❌ NO (required 70%)

---

## API Response Structure

All successful responses follow:
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

All error responses follow:
```json
{
  "success": false,
  "message": "Error description",
  "stack": "..." // Only in development
}
```

---

## Key Files for Reference

- **Database Schema:** [prisma/schema.prisma](prisma/schema.prisma)
- **Quiz Service:** [app/services/quizService.js](app/services/quizService.js)
- **Attempt Service:** [app/services/attemptService.js](app/services/attemptService.js)
- **Answer Service:** [app/services/answerService.js](app/services/answerService.js)
- **Routes:** [app/routes/attemptRoutes.js](app/routes/attemptRoutes.js)
- **Full API Docs:** [API_ENDPOINTS.md](API_ENDPOINTS.md)

