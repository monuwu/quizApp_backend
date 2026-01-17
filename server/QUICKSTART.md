# Quick Start Guide

Get your quiz backend up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js installed (v14+)
- [ ] MySQL installed and running
- [ ] Terminal/Command Prompt access

## Step 1: Install Dependencies

```bash
cd server
npm install
```

## Step 2: Configure Environment

Copy the example environment file:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Edit `.env` and update these values:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=quiz_app
```

## Step 3: Create Database

Open MySQL command line:

```bash
mysql -u root -p
```

Create the database:

```sql
CREATE DATABASE quiz_app;
EXIT;
```

## Step 4: Run Migrations

```bash
npm run migrate
```

You should see:
```
✅ Migration: 001_create_quizzes_table - SUCCESS
✅ Migration: 002_create_questions_table - SUCCESS
✅ Migration: 003_create_options_table - SUCCESS
✅ Migration: 004_create_quiz_attempts_table - SUCCESS
✅ Migration: 005_create_answers_table - SUCCESS
```

## Step 5: Seed Sample Data (Optional)

```bash
npm run seed
```

This will add:
- 3 sample quizzes
- 8 questions
- 25+ options

## Step 6: Start the Server

```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server running on port 5000
📍 Environment: development
```

## Step 7: Test the API

Open a new terminal and test:

```bash
# Test health endpoint
curl http://localhost:5000/health

# Get all quizzes
curl http://localhost:5000/api/quizzes

# Get quiz details
curl http://localhost:5000/api/quizzes/1
```

## Common Issues & Solutions

### Issue: "Database connection failed"

**Solution:**
- Check if MySQL is running
- Verify credentials in `.env`
- Ensure database exists

```bash
# Check MySQL status
# Windows
sc query MySQL80

# Mac
brew services list | grep mysql

# Linux
systemctl status mysql
```

### Issue: "Port 5000 already in use"

**Solution:**
Change port in `.env`:

```env
PORT=5001
```

### Issue: "Migration failed"

**Solution:**
- Drop and recreate database
- Check MySQL user permissions

```sql
DROP DATABASE quiz_app;
CREATE DATABASE quiz_app;
```

## Testing the Complete Flow

### 1. Start a Quiz Attempt

```bash
curl -X POST http://localhost:5000/api/attempts/start \
  -H "Content-Type: application/json" \
  -d '{"quizId": 1, "userId": 1}'
```

Note the `attemptId` from response (e.g., `1`)

### 2. Submit an Answer

```bash
curl -X POST http://localhost:5000/api/attempts/1/answers \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": 1,
    "selectedOptionIds": [1]
  }'
```

### 3. Finalize the Attempt

```bash
curl -X POST http://localhost:5000/api/attempts/1/finalize
```

### 4. Get Results

```bash
curl http://localhost:5000/api/attempts/1/results
```

## Next Steps

1. **Read API Documentation**: See `API_DOCUMENTATION.md` for all endpoints
2. **Customize Quizzes**: Add your own quizzes through the database
3. **Build Frontend**: Connect your React/Vue/Angular frontend
4. **Add Authentication**: Implement JWT for user management

## Development Tips

### Watch Mode

The server runs with `nodemon` in development, so it auto-restarts on file changes.

### Viewing Logs

All logs appear in the terminal where you ran `npm run dev`.

### Database Tools

Use a GUI tool for easier database management:
- **MySQL Workbench** (Official)
- **DBeaver** (Free, cross-platform)
- **TablePlus** (Mac/Windows)

### Testing with Postman

1. Import the API endpoints
2. Create environment variables
3. Test each endpoint systematically

## Production Deployment

### Build Checklist

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use strong database password
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Configure logging
- [ ] Set up monitoring
- [ ] Create database backups

### Run in Production

```bash
npm start
```

Consider using a process manager:

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server.js --name quiz-api

# View logs
pm2 logs quiz-api

# Monitor
pm2 monit
```

## Support

- Check `README.md` for detailed documentation
- See `API_DOCUMENTATION.md` for endpoint details
- Review code comments for implementation details

## File Structure Reference

```
server/
├── server.js              # Entry point - START HERE
├── package.json           # Dependencies
├── .env                   # Your config (create from .env.example)
├── src/
│   ├── config/           # Database connection
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── routes/           # API routes
│   ├── middleware/       # Middleware functions
│   ├── utils/            # Helper functions
│   ├── migrations/       # Database schema
│   └── scripts/          # Utility scripts
└── README.md             # Full documentation
```

---

**You're all set! 🎉**

Your quiz backend is now running and ready to handle quiz attempts with timer enforcement and automatic evaluation.
