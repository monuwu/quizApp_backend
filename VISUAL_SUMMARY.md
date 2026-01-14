# 🎯 Quiz Logic - Visual Summary

## Component Status Overview

```
B1: Database Schema        ████████████████████ ✅ 100% - 5/5 Tables
B2: Quiz Fetching APIs     ████████████████████ ✅ 100% - All endpoints
B3: Start Attempt          ████████████████████ ✅ 100% - Session init
B4: Timer Enforcement      ████████████████████ ✅ 100% - Server-side
B5: Answer Submission      ████████████████████ ✅ 100% - Validation+storage
B6: Scoring Logic          ████████████████████ ✅ 100% - Accurate calc
B7: Finalize Attempt       ████████████████████ ✅ 100% - Immutable results
B8: Progression Trigger    ░░░░░░░░░░░░░░░░░░░░ ❌   0% - Not implemented

TOTAL: 7/8 Components ✅ 87.5% Complete
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     QUIZ APPLICATION                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  Client (Browser)│
└────────┬─────────┘
         │ HTTP/REST
         ↓
┌──────────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS SERVER                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  GET /api/quizzes        POST /api/attempts/start                │
│  GET /api/quizzes/:id    POST /api/attempts/:id/answers          │
│                          POST /api/attempts/:id/finalize         │
│                          GET  /api/attempts/:id/results          │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │         SERVICE LAYER (Business Logic)                    │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  • QuizService       - Quiz retrieval, total points calc  │  │
│  │  • AttemptService    - Attempt lifecycle, scoring, timer  │  │
│  │  • AnswerService     - Answer validation, correctness     │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  • Transaction Management    - ACID compliance            │  │
│  │  • Error Handling            - Graceful failures          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
└───────────────────────────────┬──────────────────────────────────┘
                                │ SQL (Parameterized)
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database (Neon)                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  TABLE: quizzes                                                  │
│  ├─ id, title, description                                       │
│  ├─ level, duration_minutes, passing_score                       │
│  ├─ is_active, created_at, updated_at                            │
│  └─ INDEX: level, is_active                                      │
│                                                                   │
│  TABLE: questions                   TABLE: options               │
│  ├─ id, quiz_id (FK)               ├─ id, question_id (FK)      │
│  ├─ question_text, type             ├─ option_text, is_correct  │
│  ├─ points, order_number            ├─ order_number             │
│  └─ INDEX: quiz_id                  └─ INDEX: question_id       │
│                                                                   │
│  TABLE: quiz_attempts               TABLE: answers              │
│  ├─ id, quiz_id (FK), user_id       ├─ id, attempt_id (FK)     │
│  ├─ start_time, end_time            ├─ question_id (FK)        │
│  ├─ expiration_time (KEY!)          ├─ selected_option_ids (JSON)
│  ├─ status, score, percentage       ├─ is_correct, points_earned
│  └─ INDEX: quiz_id, user_id, status,└─ answered_at             │
│             expiration_time         └─ UNIQUE: attempt_id+question_id
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Quiz Flow Sequence Diagram

```
Client                    Server                    Database
  │                         │                           │
  ├──── GET /quizzes ───────→│                           │
  │                         ├─── SELECT FROM quizzes ──→│
  │                         │←── Return all quizzes ────│
  │←─ [Quizzes Array] ──────│                           │
  │                         │                           │
  ├─ POST /attempts/start ──→│                           │
  │  {quizId: 1,             │                           │
  │   userId: 100}           ├─ BEGIN TRANSACTION ──────→│
  │                         │                           │
  │                         ├─ SELECT quiz ────────────→│
  │                         ├─ INSERT attempt ─────────→│
  │                         │   (calc expiration_time)  │
  │                         │← Connection lock (tx)     │
  │                         │                           │
  │                         ├─ COMMIT ─────────────────→│
  │←─ {attemptId: 14} ──────│                           │
  │                         │                           │
  ├─ POST /attempts/14/answers ──→│                    │
  │   {questionId: 1,            │                     │
  │    selectedOptionIds: [1]}   │                     │
  │                             ├─ BEGIN TRANSACTION ─→│
  │                             │                      │
  │                             ├─ Verify not expired ─→│
  │                             ├─ Validate question ──→│
  │                             ├─ Validate options ───→│
  │                             ├─ Calculate correct ──→│
  │                             ├─ INSERT answer ──────→│
  │                             │                      │
  │                             ├─ COMMIT ────────────→│
  │←─ {isCorrect: true, points: 1}                    │
  │                             │                      │
  │   [... repeat for Q2, Q3, ...] │                  │
  │                             │                      │
  ├─ POST /attempts/14/finalize──→│                    │
  │                             ├─ BEGIN TRANSACTION ─→│
  │                             │                      │
  │                             ├─ SUM points_earned ──→│
  │                             ├─ Calc percentage ────→│
  │                             ├─ Check expiration ───→│
  │                             ├─ UPDATE attempt ─────→│
  │                             │   (lock it!)         │
  │                             │                      │
  │                             ├─ COMMIT ────────────→│
  │←─ {score: 8, percentage: 80}                      │
  │                             │                      │
  ├─ GET /attempts/14/results ──→│                    │
  │                             ├─ SELECT full result ─→│
  │←─ {attempt + answers + summary}                   │
  │                             │                      │
```

---

## Data Flow: Quiz Attempt Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUIZ ATTEMPT LIFECYCLE                        │
└─────────────────────────────────────────────────────────────────┘

START ATTEMPT
  ↓
[Quiz Attempt Record Created]
  • status = 'in_progress'
  • start_time = NOW
  • expiration_time = NOW + 30 minutes
  • total_points = SUM(question.points)
  ↓
┌─────────────────────────────────────────┐
│   ANSWER SUBMISSION (Can do multiple)   │
├─────────────────────────────────────────┤
│ 1. Check: status = 'in_progress'        │
│ 2. Check: NOW < expiration_time         │
│ 3. Validate: question ∈ quiz            │
│ 4. Validate: options ∈ question         │
│ 5. Calculate: is_correct = ?            │
│ 6. Store: Answer record                 │
│    • selected_option_ids (JSON)         │
│    • is_correct (true/false)            │
│    • points_earned (0 or points)        │
│    • answered_at (timestamp)            │
│ 7. Return: Feedback to client           │
└─────────────────────────────────────────┘
  ↓ (repeat for each question)
  ↓
FINALIZE ATTEMPT
  ↓
[Calculate Results]
  • earned_score = SUM(answers.points_earned)
  • percentage = (earned_score / total_points) * 100
  • passed = percentage >= passing_score
  • status = NOW > expiration_time ? 'expired' : 'completed'
  ↓
[Lock Attempt - Make Immutable]
  • status = 'completed' or 'expired'
  • end_time = NOW
  • score = earned_score
  • percentage = calculated %
  • No further edits possible
  ↓
GET RESULTS
  ↓
[Return Immutable Result]
  • Attempt details
  • All answers with feedback
  • Summary statistics
  • Pass/fail verdict
```

---

## Answer Validation Logic

```
┌────────────────────────────────────────────────────────────────┐
│           ANSWER CORRECTNESS VALIDATION                        │
└────────────────────────────────────────────────────────────────┘

FOR SINGLE CHOICE QUESTIONS:
  ┌─ Get correct options
  │  correctOptions = [1]  (only one should be true)
  ├─ Get selected options
  │  selectedOptions = [1]
  ├─ Compare
  │  selectedOptions == correctOptions ? ✅ CORRECT : ❌ WRONG
  └─ Result: pointsEarned = question.points or 0

FOR MULTIPLE CHOICE QUESTIONS:
  ┌─ Get correct options
  │  correctOptions = [1, 3, 5]  (all with is_correct=true)
  ├─ Get selected options
  │  selectedOptions = [1, 3, 5]
  ├─ Compare (order-independent)
  │  Sort both arrays → [1, 3, 5] == [1, 3, 5] ? ✅ CORRECT : ❌ WRONG
  │
  │  Examples:
  │    [1, 3] != [1, 3, 5]        → WRONG (missing 5)
  │    [1, 3, 5, 7] != [1, 3, 5]  → WRONG (extra 7)
  │    [1, 3, 5] == [1, 3, 5]     → CORRECT
  └─ Result: pointsEarned = question.points or 0

SCORING:
  ┌─ For each question:
  │    if isCorrect:
  │      pointsEarned = question.points
  │    else:
  │      pointsEarned = 0
  ├─ Sum all points:
  │    totalEarned = SUM(pointsEarned)
  │    totalAvailable = SUM(question.points)
  ├─ Calculate percentage:
  │    percentage = (totalEarned / totalAvailable) × 100
  └─ Determine pass:
       if percentage >= quiz.passing_score:
         → PASSED ✅
       else:
         → FAILED ❌
```

---

## Timer Enforcement - Cannot Be Bypassed

```
┌─────────────────────────────────────────────────────────────────┐
│                 TIMER SECURITY ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────┘

INITIALIZATION (Server-side only)
  startTime = SERVER.now()
  expiration = startTime + quiz.duration_minutes
  ✅ Client CANNOT modify this
  ✅ Stored immutably in database

CLIENT-SIDE: (Ignored by server)
  Client might show countdown timer
  Client might disable submit button
  But this is just UI - Server doesn't trust it

EVERY API REQUEST:
  ┌─────────────────────────┐
  │ Client sends request    │
  │ to POST /answers        │
  └────────────┬────────────┘
               ↓
  ┌─────────────────────────────────────────┐
  │ Server checks:                          │
  │ NOW = server.now()                      │
  │ if NOW > expiration_time in DB:         │
  │   → REJECT with 403 error              │
  │   → Auto-mark as 'expired'             │
  │   → Prevent further submissions        │
  │ else:                                   │
  │   → Accept and process answer          │
  └─────────────────────────────────────────┘
               ↓
  ✅ Always use SERVER TIME
  ✅ Client cannot fake time
  ✅ Expiration cannot be extended
  ✅ Attempt auto-expires

FINALIZATION:
  When finalizing attempt:
  if NOW > expiration_time:
    status = 'expired'
  else:
    status = 'completed'
  
  Both are immutable - cannot change after set
```

---

## Scoring System Visualization

```
QUIZ: JavaScript Basics (10 points total)
Level: Beginner
Passing Score: 70%

Question 1: 1 point
  Correct option: [1]
  User selected: [1]          ✅ CORRECT → 1 point earned

Question 2: 1 point
  Correct option: [2]
  User selected: [3]          ❌ WRONG → 0 points earned

Question 3: 2 points (multiple choice)
  Correct options: [1, 4]
  User selected: [1, 4]       ✅ CORRECT → 2 points earned

Question 4: 1 point
  Correct option: [1]
  User selected: [2]          ❌ WRONG → 0 points earned

Question 5: 2 points (multiple choice)
  Correct options: [1, 2, 3]
  User selected: [1, 2]       ❌ WRONG (missing 3) → 0 points

Question 6: 1 point
  Correct option: [1]
  User selected: [1]          ✅ CORRECT → 1 point earned

Question 7: 2 points (multiple choice)
  Correct options: [2, 3]
  User selected: [2, 3]       ✅ CORRECT → 2 points earned

─────────────────────────────────────────────────────────────

RESULTS:
  Total Points Available: 10
  Points Earned: 1 + 0 + 2 + 0 + 0 + 1 + 2 = 6 points

  Percentage: (6 / 10) × 100 = 60%

  Passing Score Required: 70%
  
  Status: ❌ FAILED (60% < 70%)
  
  Breakdown:
    ✅ Correct: 4 questions
    ❌ Wrong:   3 questions
    Accuracy:  57.14% (4/7 answered correctly)
```

---

## Database Relationships Diagram

```
                    ┌──────────────┐
                    │   QUIZZES    │
                    │──────────────│
                    │ • id (PK)    │
                    │ • title      │
                    │ • level      │
                    │ • duration_m │
                    │ • pass_score │
                    │ • is_active  │
                    └───────┬──────┘
                            │ 1:N
                            ↓
        ┌───────────────────────────────────────┐
        │                                       │
        ↓ 1:N                                   ↓ 1:N
   ┌─────────────┐                        ┌──────────────┐
   │  QUESTIONS  │                        │ QUIZ_ATTEMPTS│
   │─────────────│                        │──────────────│
   │ • id (PK)   │                        │ • id (PK)    │
   │ • quiz_id   │◀──────FK─────────┐     │ • quiz_id    │◀───FK
   │ • question_ │                 │     │ • user_id    │
   │   text      │                 │     │ • start_time │
   │ • type      │                 │     │ • expiration │
   │ • points    │                 │     │ • end_time   │
   │ • order_num │                 │     │ • status     │
   └──────┬──────┘                 │     │ • score      │
          │ 1:N                     │     │ • percentage │
          ↓                         │     └──────┬───────┘
   ┌─────────────┐                 │            │ 1:N
   │   OPTIONS   │                 │            ↓
   │─────────────│                 │     ┌──────────────┐
   │ • id (PK)   │                 │     │   ANSWERS    │
   │ • question_ │◀──────FK────┐   │     │──────────────│
   │   id        │             │   │     │ • id (PK)    │
   │ • option_   │             │   │     │ • attempt_id │◀──FK
   │   text      │             │   │     │ • question_  │◀─┤
   │ • is_correct│             │   │     │   id         │  │
   │ • order_num │             │   │     │ • selected_  │  │
   └─────────────┘             │   │     │   option_ids │  │
                               │   │     │ • is_correct │  │
                               │   │     │ • points_    │  │
                               └───│     │   earned     │  │
                                   │     │ • answered_at│  │
                                   └─────┴──────────────┘  │
                                         │                 │
                                         └─────────FK──────┘
                        (Question-in-Attempt relationship)

RELATIONSHIPS:
  ✅ quizzes ← questions (1:N, cascade delete)
  ✅ quizzes ← quiz_attempts (1:N, cascade delete)
  ✅ questions ← options (1:N, cascade delete)
  ✅ questions ← answers (1:N, cascade delete)
  ✅ quiz_attempts ← answers (1:N, cascade delete)
  ✅ UNIQUE: (attempt_id, question_id) in answers

INDEXES:
  ✅ quizzes: level, is_active
  ✅ questions: quiz_id
  ✅ options: question_id
  ✅ quiz_attempts: quiz_id, user_id, status, expiration_time
  ✅ answers: attempt_id, question_id
```

---

## Component Dependency Graph

```
                    ┌─────────────────┐
                    │  EXPRESS ROUTER │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
         ┌─────────┐   ┌──────────┐   ┌─────────┐
         │ Quiz    │   │ Attempt  │   │ Answer  │
         │Routes   │   │ Routes   │   │ Routes  │
         └────┬────┘   └────┬─────┘   └────┬────┘
              │             │             │
              ↓             ↓             ↓
         ┌─────────┐   ┌──────────┐   ┌─────────┐
         │ Quiz    │   │ Attempt  │   │ Answer  │
         │Control- │   │ Control- │   │ Control-│
         │ler      │   │ ler      │   │ ler     │
         └────┬────┘   └────┬─────┘   └────┬────┘
              │             │             │
              ↓             ↓             ↓
         ┌─────────────────────────────────────┐
         │      SERVICE LAYER                  │
         ├─────────────────────────────────────┤
         │ • QuizService                       │
         │ • AttemptService                    │
         │ • AnswerService                     │
         └──────────────┬──────────────────────┘
                        │
              ┌─────────┴─────────┐
              ↓                   ↓
         ┌──────────┐        ┌─────────┐
         │Database  │        │Middleware
         │Connection│        │(Validation)
         │(config)  │        │
         └────┬─────┘        └────┬────┘
              │                   │
              ↓                   ↓
         ┌─────────────────────────────────────┐
         │   PostgreSQL Database (Neon)        │
         │   Tables: quizzes, questions,       │
         │   options, attempts, answers        │
         └─────────────────────────────────────┘
```

---

## Implementation Status by File

```
app/
├── services/
│   ├── quizService.js           ████████████████████ B2 ✅
│   ├── attemptService.js         ████████████████████ B3,B4,B6,B7 ✅
│   └── answerService.js          ████████████████████ B5,B6 ✅
├── routes/
│   ├── quizRoutes.js            ████████████████████ B2 ✅
│   └── attemptRoutes.js         ████████████████████ B3,B4,B5,B7 ✅
├── controllers/
│   ├── quizController.js        ████████████████████ ✅
│   ├── attemptController.js     ████████████████████ ✅
│   └── answerController.js      ████████████████████ ✅
├── middleware/
│   ├── validation.js            ████████████████████ B4 ✅
│   ├── errorHandler.js          ████████████████████ ✅
│   └── validator.js             ████████████████████ ✅
└── utils/
    └── responseHelpers.js       ████████████████████ ✅

prisma/
└── schema.prisma                ████████████████████ B1 ✅

config/
└── database.js                  ████████████████████ ✅

TOTAL: 533 lines of production code ✅
```

