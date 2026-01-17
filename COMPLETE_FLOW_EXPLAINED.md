# Complete Quiz App Flow - From Start to Finish

## 🎯 **Overview: POST /api/attempts/start Flow**

When you send this request:
```bash
POST http://localhost:5000/api/attempts/start
Body: { "quizId": 1, "userId": 124 }
```

Here's exactly what happens at every layer:

---

## 📋 **Layer 1: Express Server (server.js)**

**File:** `server.js`

```javascript
// Incoming request hits server
app.use('/api/attempts', attemptRoutes);
// Routes it to attemptRoutes.js
```

**What happens:**
1. Express receives the POST request
2. Routes it to `/api/attempts/start`
3. Checks middleware (validation, CORS, etc.)
4. Passes to attemptController

---

## 🔐 **Layer 2: Route Handler (attemptRoutes.js)**

**File:** `app/routes/attemptRoutes.js`

```javascript
router.post(
  '/start',  // POST /api/attempts/start
  [
    body('quizId')
      .notEmpty().withMessage('Quiz ID is required')
      .isInt().withMessage('Quiz ID must be a valid integer'),
    body('userId')
      .optional()
      .isInt().withMessage('User ID must be a valid integer'),
    validate  // Validates request body
  ],
  attemptController.startQuizAttempt  // Calls controller
);
```

**What happens:**
1. Request body is validated: `{ "quizId": 1, "userId": 124 }`
2. Both fields pass validation
3. Passes to controller

---

## 🎮 **Layer 3: Controller (attemptController.js)**

**File:** `app/controllers/attemptController.js`

```javascript
const startQuizAttempt = asyncHandler(async (req, res) => {
  // Extract from request body
  const { quizId, userId } = req.body;  // { 1, 124 }

  if (!quizId) {
    return res.status(400).json({
      success: false,
      message: 'Quiz ID is required'
    });
  }

  // Call service layer
  const attempt = await attemptService.startAttempt(quizId, userId);

  // Send response
  res.status(201).json({
    success: true,
    message: 'Quiz attempt started successfully',
    data: attempt
  });
});
```

**What happens:**
1. Extracts `quizId` (1) and `userId` (124) from request
2. Calls service: `attemptService.startAttempt(1, 124)`
3. Gets response from service
4. Returns JSON response to client

---

## ⚙️ **Layer 4: Service Logic (attemptService.js)**

**File:** `app/services/attemptService.js`

This is where the actual business logic happens:

```javascript
async startAttempt(quizId, userId = null) {
  // Step 1: Get database connection
  const connection = await pool.getConnection();
  
  try {
    // Step 2: Start transaction (all-or-nothing)
    await connection.beginTransaction();

    // Step 3: Validate quiz exists
    const [quizzes] = await connection.execute(
      'SELECT id, duration_minutes, is_active FROM quizzes WHERE id = $1',
      [quizId]  // Params: [1]
    );

    if (quizzes.length === 0) {
      throw new AppError('Quiz not found', 404);
    }

    const quiz = quizzes[0];
    // Result: {
    //   id: 1,
    //   duration_minutes: 30,
    //   is_active: true
    // }

    // Step 4: Check if quiz is active
    if (!quiz.is_active) {
      throw new AppError('Quiz is not active', 400);
    }

    // Step 5: Check for existing active attempts (if userId provided)
    if (userId) {
      const [existingAttempts] = await connection.execute(
        'SELECT id FROM quiz_attempts WHERE quiz_id = $1 AND user_id = $2 AND status = $3',
        [quizId, userId, 'in_progress']  // [1, 124, 'in_progress']
      );

      if (existingAttempts.length > 0) {
        throw new AppError('You already have an active attempt for this quiz', 409);
      }
      // This prevents same user from taking same quiz twice simultaneously
    }

    // Step 6: Calculate times
    const startTime = new Date();
    // Result: 2026-01-13T05:18:12.249Z
    
    const expirationTime = new Date(
      startTime.getTime() + quiz.duration_minutes * 60000
    );
    // Adds 30 minutes to start time
    // Result: 2026-01-13T05:48:12.249Z

    // Step 7: Calculate total points for this quiz
    const totalPoints = await quizService.calculateTotalPoints(quizId);
    // Queries all questions for quiz 1 and sums their points
    // Result: 112 points (if quiz 1 has 10 questions worth 10-20 points each)

    // Step 8: Insert quiz attempt into database
    const [result] = await connection.execute(
      `INSERT INTO quiz_attempts 
      (quiz_id, user_id, start_time, expiration_time, status, total_points) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id`,
      [
        quizId,           // 1
        userId,           // 124
        startTime,        // 2026-01-13T05:18:12.249Z
        expirationTime,   // 2026-01-13T05:48:12.249Z
        'in_progress',    // status
        totalPoints       // 112
      ]
    );

    // Database SQL INSERT:
    // INSERT INTO quiz_attempts 
    // (quiz_id, user_id, start_time, expiration_time, status, total_points) 
    // VALUES (1, 124, '2026-01-13 05:18:12.249', '2026-01-13 05:48:12.249', 'in_progress', 112)
    // RETURNING id;
    // 
    // Result from database:
    // [{ id: 10 }]

    const attemptId = result[0].id;  // 10

    // Step 9: Commit transaction (save to database)
    await connection.commit();

    // Step 10: Return attempt details
    return {
      attemptId: 10,
      quizId: 1,
      startTime: '2026-01-13T05:18:12.249Z',
      expirationTime: '2026-01-13T05:48:12.249Z',
      durationMinutes: 30,
      status: 'in_progress'
    };

  } catch (error) {
    // If ANY error occurs, rollback (undo) the transaction
    await connection.rollback();
    throw error;
  } finally {
    // Release connection back to pool
    connection.release();
  }
}
```

---

## 📊 **Database Operations (What's saved)**

### **Before Request:**
```
quizzes table:
┌─────┬────────────────────┬──────────────┬────────┬─────────────────┐
│ id  │ title              │ level        │ duration │ passing_score   │
├─────┼────────────────────┼──────────────┼────────┼─────────────────┤
│ 1   │ JavaScript Basics  │ beginner     │ 30     │ 70              │
└─────┴────────────────────┴──────────────┴────────┴─────────────────┘

quiz_attempts table: (EMPTY)
```

### **During Request:**
```
Transaction begins...

Query 1: SELECT quiz info
Query 2: SELECT existing attempts for this user
Query 3: SELECT total points for quiz
Query 4: INSERT new attempt
  INSERT INTO quiz_attempts 
  (quiz_id, user_id, start_time, expiration_time, status, total_points)
  VALUES (1, 124, ..., ..., 'in_progress', 112)

Transaction commits...
```

### **After Request:**
```
quiz_attempts table:
┌────┬──────────┬─────────┬─────────────────────────┬─────────────────────────┬──────────┬───────────────┐
│ id │ quiz_id  │ user_id │ start_time              │ expiration_time         │ status   │ total_points  │
├────┼──────────┼─────────┼─────────────────────────┼─────────────────────────┼──────────┼───────────────┤
│ 10 │ 1        │ 124     │ 2026-01-13 05:18:12.249 │ 2026-01-13 05:48:12.249 │ in_progress  │ 112      │
└────┴──────────┴─────────┴─────────────────────────┴─────────────────────────┴──────────┴───────────────┘
```

---

## 📤 **Response to Client**

The controller sends this JSON back to Postman:

```json
{
  "success": true,
  "message": "Quiz attempt started successfully",
  "data": {
    "attemptId": 10,
    "quizId": 1,
    "startTime": "2026-01-13T05:18:12.249Z",
    "expirationTime": "2026-01-13T05:48:12.249Z",
    "durationMinutes": 30,
    "status": "in_progress"
  }
}
```

**HTTP Status:** 201 Created

---

## 🔄 **Complete Request-Response Cycle**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CLIENT (Postman/Browser)                                                    │
│ ┌───────────────────────────────────────────────────────────────────────┐   │
│ │ POST /api/attempts/start                                              │   │
│ │ Body: { "quizId": 1, "userId": 124 }                                  │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │ HTTP Request
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ EXPRESS SERVER (server.js)                                                  │
│ - Receives request                                                          │
│ - Applies middleware (CORS, body-parser, etc.)                              │
│ - Routes to /api/attempts                                                   │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ ROUTER (attemptRoutes.js)                                                   │
│ - Matches POST /start                                                       │
│ - Validates body: express-validator                                         │
│ - Checks quizId is integer: ✅                                              │
│ - Checks userId is integer: ✅                                              │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ CONTROLLER (attemptController.js)                                           │
│ - Extracts: quizId = 1, userId = 124                                        │
│ - Calls: attemptService.startAttempt(1, 124)                                │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ SERVICE (attemptService.js)                                                 │
│ ┌───────────────────────────────────────────────────────────────────────┐   │
│ │ 1. Get DB connection from pool                                        │   │
│ │ 2. Begin transaction                                                  │   │
│ │ 3. SELECT quiz WHERE id = 1                                           │   │
│ │    Result: { id: 1, duration_minutes: 30, is_active: true }          │   │
│ │ 4. Check if quiz is active: ✅                                        │   │
│ │ 5. SELECT attempts WHERE quiz_id=1 AND user_id=124 AND status=...    │   │
│ │    Result: [] (no existing attempt)                                   │   │
│ │ 6. Calculate times:                                                   │   │
│ │    startTime = 2026-01-13T05:18:12.249Z                              │   │
│ │    expirationTime = startTime + 30 min                               │   │
│ │ 7. Calculate totalPoints from all questions: 112                      │   │
│ │ 8. INSERT INTO quiz_attempts (...) RETURNING id                       │   │
│ │    Returns: attemptId = 10                                            │   │
│ │ 9. COMMIT transaction                                                 │   │
│ │ 10. RELEASE connection                                                │   │
│ │ 11. Return attempt object                                             │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ DATABASE (PostgreSQL at Neon)                                               │
│ ┌───────────────────────────────────────────────────────────────────────┐   │
│ │ QUIZ_ATTEMPTS table (INSERT):                                         │   │
│ │ id: 10                                                                │   │
│ │ quiz_id: 1                                                            │   │
│ │ user_id: 124                                                          │   │
│ │ start_time: 2026-01-13 05:18:12.249                                   │   │
│ │ expiration_time: 2026-01-13 05:48:12.249                              │   │
│ │ status: 'in_progress'                                                 │   │
│ │ total_points: 112                                                     │   │
│ │ score: 0 (default)                                                    │   │
│ │ percentage: 0.00 (default)                                            │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ CONTROLLER (attemptController.js)                                           │
│ - Receives attempt object from service                                      │
│ - Formats response: {success, message, data}                                │
│ - Sets HTTP Status: 201 Created                                             │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │ HTTP Response + JSON
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ CLIENT (Postman)                                                            │
│ ┌───────────────────────────────────────────────────────────────────────┐   │
│ │ Status: 201 Created                                                   │   │
│ │ {                                                                     │   │
│ │   "success": true,                                                    │   │
│ │   "message": "Quiz attempt started successfully",                     │   │
│ │   "data": {                                                           │   │
│ │     "attemptId": 10,                                                  │   │
│ │     "quizId": 1,                                                      │   │
│ │     "startTime": "2026-01-13T05:18:12.249Z",                          │   │
│ │     "expirationTime": "2026-01-13T05:48:12.249Z",                     │   │
│ │     "durationMinutes": 30,                                            │   │
│ │     "status": "in_progress"                                           │   │
│ │   }                                                                   │   │
│ │ }                                                                     │   │
│ └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ NOW: User has 30 minutes (until 05:48:12.249Z) to answer questions!        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ **Complete Architecture Diagram**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Frontend/Postman)                           │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS SERVER (server.js)                             │
│                         Runs on port 5000                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Middleware Stack:                                                      │  │
│  │ 1. Helmet (security)                                                   │  │
│  │ 2. CORS (cross-origin)                                                 │  │
│  │ 3. Body Parser (JSON)                                                  │  │
│  │ 4. Custom errorHandler (global error handling)                         │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Routes:                                                                │  │
│  │ /api/quizzes    → quizRoutes.js                                        │  │
│  │ /api/attempts   → attemptRoutes.js                                     │  │
│  │ /health         → Simple status check                                  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
         ┌─────────────┐ ┌──────────────┐ ┌──────────────┐
         │    Routes   │ │ Middleware   │ │ Controllers  │
         ├─────────────┤ ├──────────────┤ ├──────────────┤
         │ quizRoutes  │ │ validator    │ │ quiz         │
         │ attemptRoutes
│ │ asyncHandler │ │ attempt      │
         │ answerRoutes│ │ errorHandler │ │ answer       │
         │             │ │ validation   │ │              │
         └─────────────┘ └──────────────┘ └──────────────┘
                │              │              │
                └──────────────┼──────────────┘
                               │
                               ▼
         ┌─────────────────────────────────────────────────────┐
         │            SERVICE LAYER (Business Logic)           │
         ├─────────────────────────────────────────────────────┤
         │ quizService.js       → Quiz operations              │
         │ attemptService.js    → Attempt operations           │
         │ answerService.js     → Answer operations            │
         └──────────────────────┬──────────────────────────────┘
                                │
                                ▼
         ┌─────────────────────────────────────────────────────┐
         │         DATABASE LAYER (Data Access)                │
         ├─────────────────────────────────────────────────────┤
         │ config/database.js                                  │
         │  └─ PostgreSQL Pool Connection                      │
         │     (manages connection pool)                       │
         └──────────────────────────────────────────────────────┘
                                │
                                ▼
         ┌─────────────────────────────────────────────────────┐
         │     PostgreSQL Database (Neon Cloud)                │
         ├─────────────────────────────────────────────────────┤
         │ Tables:                                             │
         │ ├─ quizzes                                          │
         │ ├─ questions                                        │
         │ ├─ options                                          │
         │ ├─ quiz_attempts          ← INSERT happens here    │
         │ └─ answers                                          │
         └─────────────────────────────────────────────────────┘
```

---

## 🔑 **Key Points**

### **Why Transactions?**
```javascript
// Without transaction - dangerous:
INSERT quiz_attempt ...  ✓
SELECT total_points ...  ✗ FAIL!
// Attempt created but no total_points

// With transaction - safe:
BEGIN
  INSERT quiz_attempt ...
  SELECT total_points ...
COMMIT (all succeed) OR ROLLBACK (all fail)
```

### **Why Connection Pool?**
```
Without pool:
- New connection per request → Slow (handshake overhead)
- Connection limits exceeded → Crashes

With pool:
- Reuse existing connections → Fast
- Max 10 connections (set in config)
- Connections queue when all busy → Graceful
```

### **Data Flow Summary**
```
Request Body: { quizId: 1, userId: 124 }
           ↓
     Validation ✓
           ↓
    Controller gets it
           ↓
    Service validates + calculates
           ↓
    Database INSERT
           ↓
    Service returns { attemptId: 10, ... }
           ↓
    Controller formats response
           ↓
    HTTP 201 with JSON
           ↓
    Client receives { attemptId: 10, ... }
```

---

## 📝 **What's Stored in Database Now**

```sql
SELECT * FROM quiz_attempts WHERE id = 10;

Output:
id              │ 10
quiz_id         │ 1
user_id         │ 124
start_time      │ 2026-01-13 05:18:12.249
expiration_time │ 2026-01-13 05:48:12.249  (30 min later)
end_time        │ NULL (not finished yet)
status          │ 'in_progress'
score           │ 0 (no answers yet)
total_points    │ 112 (from all questions)
percentage      │ 0.00 (0/112)
created_at      │ 2026-01-13 05:18:12.247
updated_at      │ 2026-01-13 05:18:12.247
```

This attempt record now exists and is ready for:
1. User to submit answers
2. System to track time remaining
3. Automatic expiration after 30 minutes

Perfect! 🚀
