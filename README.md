# Quiz Application - Backend API

A robust Node.js/Express backend for a quiz application with timer enforcement, evaluation, and results tracking.

## Features

- ✅ Complete quiz management system
- ✅ Timer enforcement with backend validation
- ✅ Answer submission and evaluation
- ✅ Quiz attempt tracking
- ✅ Detailed results and statistics
- ✅ Input validation
- ✅ Error handling
- ✅ RESTful API design

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Validation**: express-validator
- **Security**: Helmet, CORS

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.js           # Database connection
│   ├── controllers/
│   │   ├── quizController.js     # Quiz endpoints
│   │   ├── attemptController.js  # Attempt endpoints
│   │   └── answerController.js   # Answer submission
│   ├── services/
│   │   ├── quizService.js        # Quiz business logic
│   │   ├── attemptService.js     # Attempt business logic
│   │   └── answerService.js      # Answer evaluation logic
│   ├── routes/
│   │   ├── quizRoutes.js         # Quiz routes
│   │   └── attemptRoutes.js      # Attempt & answer routes
│   ├── middleware/
│   │   ├── errorHandler.js       # Global error handler
│   │   ├── asyncHandler.js       # Async wrapper
│   │   ├── validation.js         # Timer validation
│   │   └── validator.js          # Request validation
│   ├── utils/
│   │   ├── timeUtils.js          # Time helper functions
│   │   ├── responseHelpers.js    # Response formatters
│   │   └── logger.js             # Logging utility
│   └── migrations/
│       ├── 001_create_quizzes_table.js
│       ├── 002_create_questions_table.js
│       ├── 003_create_options_table.js
│       ├── 004_create_quiz_attempts_table.js
│       ├── 005_create_answers_table.js
│       └── migrate.js            # Migration runner
├── server.js                     # Application entry point
├── package.json
└── .env.example

```

## Setup Instructions

### 1. Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### 2. Installation

```bash
# Install dependencies
npm install
```

### 3. Environment Configuration

Create a `.env` file in the server directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=quiz_app
```

### 4. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE quiz_app;

# Run migrations
npm run migrate
```

### 5. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Quiz Endpoints

#### Get All Quizzes
```http
GET /api/quizzes?level=beginner
```

Response:
```json
{
  "success": true,
  "count": 2,
  "data": [...]
}
```

#### Get Quiz Details
```http
GET /api/quizzes/:id
```

Response includes questions and options (without correct answers).

### Attempt Endpoints

#### Start Quiz Attempt
```http
POST /api/attempts/start
Content-Type: application/json

{
  "quizId": 1,
  "userId": 123
}
```

Response:
```json
{
  "success": true,
  "data": {
    "attemptId": 1,
    "quizId": 1,
    "startTime": "2026-01-10T10:00:00Z",
    "expirationTime": "2026-01-10T10:30:00Z",
    "durationMinutes": 30,
    "status": "in_progress"
  }
}
```

#### Submit Answer
```http
POST /api/attempts/:attemptId/answers
Content-Type: application/json

{
  "questionId": 1,
  "selectedOptionIds": [2, 3]
}
```

#### Submit Multiple Answers
```http
POST /api/attempts/:attemptId/answers/bulk
Content-Type: application/json

{
  "answers": [
    {
      "questionId": 1,
      "selectedOptionIds": [2]
    },
    {
      "questionId": 2,
      "selectedOptionIds": [5, 6]
    }
  ]
}
```

#### Finalize Attempt
```http
POST /api/attempts/:id/finalize
```

#### Get Attempt Results
```http
GET /api/attempts/:id/results
```

Response includes detailed breakdown with correct answers.

#### Get User's Attempt History
```http
GET /api/attempts/user/:userId?quizId=1
```

#### Get Answer Statistics
```http
GET /api/attempts/:attemptId/statistics
```

## Key Features

### 1. Timer Enforcement

- Backend-controlled expiration
- Auto-expiration of timed-out attempts
- Rejection of submissions after timeout
- Middleware validation on each request

### 2. Answer Evaluation

- Real-time answer validation
- Support for single and multiple choice questions
- Automatic scoring calculation
- Points earned tracking

### 3. Security

- Input validation on all endpoints
- SQL injection prevention
- CORS configuration
- Helmet security headers
- Error handling without exposing sensitive data

### 4. Database Design

- Normalized schema
- Foreign key constraints
- Indexes for performance
- Transaction support for data integrity

## Database Schema

### quizzes
- id, title, description, level, duration_minutes, passing_score, is_active

### questions
- id, quiz_id, question_text, question_type, points, order_number

### options
- id, question_id, option_text, is_correct, order_number

### quiz_attempts
- id, quiz_id, user_id, start_time, end_time, expiration_time, status, score, total_points, percentage

### answers
- id, attempt_id, question_id, selected_option_ids (JSON), is_correct, points_earned

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

## Development

### Scripts

```bash
npm run dev      # Start with nodemon
npm start        # Start in production
npm run migrate  # Run database migrations
```

### Code Style

- Service layer for business logic
- Controller layer for request handling
- Middleware for cross-cutting concerns
- Utility functions for reusable code

## Future Enhancements

- [ ] JWT authentication
- [ ] User registration/login
- [ ] Quiz categories
- [ ] Leaderboards
- [ ] Quiz analytics dashboard
- [ ] Question randomization
- [ ] Time tracking per question
- [ ] File uploads for images in questions

## License

ISC

## Author

Quiz App Team
