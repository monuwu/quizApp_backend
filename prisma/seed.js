require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

// Create Prisma Client with adapter
const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // Clear all related data (order matters due to foreign keys)
  console.log('Clearing existing data...');
  await prisma.answer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();

  // Reset sequences to start from 1 (Postgres only)
  console.log('Resetting ID sequences...');
  await prisma.$executeRawUnsafe('ALTER SEQUENCE quizzes_id_seq RESTART WITH 1');
  await prisma.$executeRawUnsafe('ALTER SEQUENCE questions_id_seq RESTART WITH 1');
  await prisma.$executeRawUnsafe('ALTER SEQUENCE options_id_seq RESTART WITH 1');
  await prisma.$executeRawUnsafe('ALTER SEQUENCE quiz_attempts_id_seq RESTART WITH 1');
  await prisma.$executeRawUnsafe('ALTER SEQUENCE answers_id_seq RESTART WITH 1');
  console.log('✅ Existing data cleared and sequences reset\n');

  // Create Quiz 1: JavaScript Basics
  const quiz1 = await prisma.quiz.create({
    data: {
      title: 'JavaScript Basics',
      description: 'Test your knowledge of JavaScript fundamentals',
      level: 'beginner',
      durationMinutes: 5,
      passingScore: 70,
      isActive: true,
      questions: {
        create: [
          {
            questionText: 'What is the correct syntax to print a message in the console?',
            questionType: 'single',
            points: 1,
            orderNumber: 1,
            options: {
              create: [
                { optionText: 'console.log("Hello World")', isCorrect: true, orderNumber: 1 },
                { optionText: 'print("Hello World")', isCorrect: false, orderNumber: 2 },
                { optionText: 'echo("Hello World")', isCorrect: false, orderNumber: 3 },
                { optionText: 'System.out.println("Hello World")', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'Which of the following are JavaScript data types? (Select all that apply)',
            questionType: 'multiple',
            points: 2,
            orderNumber: 2,
            options: {
              create: [
                { optionText: 'String', isCorrect: true, orderNumber: 1 },
                { optionText: 'Number', isCorrect: true, orderNumber: 2 },
                { optionText: 'Boolean', isCorrect: true, orderNumber: 3 },
                { optionText: 'Character', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'What keyword is used to declare a constant variable?',
            questionType: 'single',
            points: 1,
            orderNumber: 3,
            options: {
              create: [
                { optionText: 'const', isCorrect: true, orderNumber: 1 },
                { optionText: 'let', isCorrect: false, orderNumber: 2 },
                { optionText: 'var', isCorrect: false, orderNumber: 3 },
                { optionText: 'constant', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'What will be the output of: typeof null?',
            questionType: 'single',
            points: 1,
            orderNumber: 4,
            options: {
              create: [
                { optionText: 'object', isCorrect: true, orderNumber: 1 },
                { optionText: 'null', isCorrect: false, orderNumber: 2 },
                { optionText: 'undefined', isCorrect: false, orderNumber: 3 },
                { optionText: 'number', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'Which array method removes the last element from an array?',
            questionType: 'single',
            points: 1,
            orderNumber: 5,
            options: {
              create: [
                { optionText: 'pop()', isCorrect: true, orderNumber: 1 },
                { optionText: 'push()', isCorrect: false, orderNumber: 2 },
                { optionText: 'shift()', isCorrect: false, orderNumber: 3 },
                { optionText: 'unshift()', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'How do you write a single-line comment in JavaScript?',
            questionType: 'single',
            points: 1,
            orderNumber: 6,
            options: {
              create: [
                { optionText: '// This is a comment', isCorrect: true, orderNumber: 1 },
                { optionText: '# This is a comment', isCorrect: false, orderNumber: 2 },
                { optionText: '<!-- This is a comment -->', isCorrect: false, orderNumber: 3 },
                { optionText: '/* This is a comment */', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'Which operator is used for strict equality comparison?',
            questionType: 'single',
            points: 1,
            orderNumber: 7,
            options: {
              create: [
                { optionText: '===', isCorrect: true, orderNumber: 1 },
                { optionText: '==', isCorrect: false, orderNumber: 2 },
                { optionText: '=', isCorrect: false, orderNumber: 3 },
                { optionText: '!=', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'What is the result of: 2 + "2"?',
            questionType: 'single',
            points: 1,
            orderNumber: 8,
            options: {
              create: [
                { optionText: '"22"', isCorrect: true, orderNumber: 1 },
                { optionText: '4', isCorrect: false, orderNumber: 2 },
                { optionText: '22', isCorrect: false, orderNumber: 3 },
                { optionText: 'NaN', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'Which method converts a JSON string to a JavaScript object?',
            questionType: 'single',
            points: 1,
            orderNumber: 9,
            options: {
              create: [
                { optionText: 'JSON.parse()', isCorrect: true, orderNumber: 1 },
                { optionText: 'JSON.stringify()', isCorrect: false, orderNumber: 2 },
                { optionText: 'JSON.convert()', isCorrect: false, orderNumber: 3 },
                { optionText: 'JSON.toObject()', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'What is the correct way to create a function in JavaScript?',
            questionType: 'single',
            points: 1,
            orderNumber: 10,
            options: {
              create: [
                { optionText: 'function myFunc() {}', isCorrect: true, orderNumber: 1 },
                { optionText: 'def myFunc() {}', isCorrect: false, orderNumber: 2 },
                { optionText: 'func myFunc() {}', isCorrect: false, orderNumber: 3 },
                { optionText: 'create function myFunc() {}', isCorrect: false, orderNumber: 4 }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('✅ Created Quiz 1: JavaScript Basics');

  // Create Quiz 2: Node.js Advanced
  const quiz2 = await prisma.quiz.create({
    data: {
      title: 'Node.js Advanced',
      description: 'Advanced Node.js concepts and patterns',
      level: 'advanced',
      durationMinutes: 5,
      passingScore: 75,
      isActive: true,
      questions: {
        create: [
          {
            questionText: 'What is the event loop in Node.js?',
            questionType: 'single',
            points: 2,
            orderNumber: 1,
            options: {
              create: [
                { optionText: 'A mechanism that handles asynchronous operations', isCorrect: true, orderNumber: 1 },
                { optionText: 'A loop that runs indefinitely', isCorrect: false, orderNumber: 2 },
                { optionText: 'A database connection pool', isCorrect: false, orderNumber: 3 },
                { optionText: 'A debugging tool', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'Which of the following are core Node.js modules? (Select all)',
            questionType: 'multiple',
            points: 3,
            orderNumber: 2,
            options: {
              create: [
                { optionText: 'fs', isCorrect: true, orderNumber: 1 },
                { optionText: 'http', isCorrect: true, orderNumber: 2 },
                { optionText: 'path', isCorrect: true, orderNumber: 3 },
                { optionText: 'express', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'What is the purpose of package.json?',
            questionType: 'single',
            points: 2,
            orderNumber: 3,
            options: {
              create: [
                { optionText: 'To manage project dependencies and metadata', isCorrect: true, orderNumber: 1 },
                { optionText: 'To store application data', isCorrect: false, orderNumber: 2 },
                { optionText: 'To configure the database', isCorrect: false, orderNumber: 3 },
                { optionText: 'To define API routes', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'What does process.nextTick() do?',
            questionType: 'single',
            points: 2,
            orderNumber: 4,
            options: {
              create: [
                { optionText: 'Executes callback after current operation completes', isCorrect: true, orderNumber: 1 },
                { optionText: 'Stops the current process', isCorrect: false, orderNumber: 2 },
                { optionText: 'Creates a new process', isCorrect: false, orderNumber: 3 },
                { optionText: 'Schedules a timeout', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'Which module is used for creating child processes in Node.js?',
            questionType: 'single',
            points: 2,
            orderNumber: 5,
            options: {
              create: [
                { optionText: 'child_process', isCorrect: true, orderNumber: 1 },
                { optionText: 'process', isCorrect: false, orderNumber: 2 },
                { optionText: 'cluster', isCorrect: false, orderNumber: 3 },
                { optionText: 'worker_threads', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'What is the purpose of the Buffer class in Node.js?',
            questionType: 'single',
            points: 2,
            orderNumber: 6,
            options: {
              create: [
                { optionText: 'To handle binary data', isCorrect: true, orderNumber: 1 },
                { optionText: 'To store temporary files', isCorrect: false, orderNumber: 2 },
                { optionText: 'To cache HTTP responses', isCorrect: false, orderNumber: 3 },
                { optionText: 'To manage memory allocation', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'What is the difference between setImmediate() and setTimeout()?',
            questionType: 'single',
            points: 2,
            orderNumber: 7,
            options: {
              create: [
                { optionText: 'setImmediate() executes after I/O events', isCorrect: true, orderNumber: 1 },
                { optionText: 'They are the same', isCorrect: false, orderNumber: 2 },
                { optionText: 'setTimeout() is faster', isCorrect: false, orderNumber: 3 },
                { optionText: 'setImmediate() takes a delay parameter', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'Which method is used to read environment variables in Node.js?',
            questionType: 'single',
            points: 2,
            orderNumber: 8,
            options: {
              create: [
                { optionText: 'process.env', isCorrect: true, orderNumber: 1 },
                { optionText: 'process.variables', isCorrect: false, orderNumber: 2 },
                { optionText: 'env.get()', isCorrect: false, orderNumber: 3 },
                { optionText: 'system.env', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'What is a stream in Node.js?',
            questionType: 'single',
            points: 2,
            orderNumber: 9,
            options: {
              create: [
                { optionText: 'An abstract interface for working with streaming data', isCorrect: true, orderNumber: 1 },
                { optionText: 'A type of database connection', isCorrect: false, orderNumber: 2 },
                { optionText: 'A real-time communication protocol', isCorrect: false, orderNumber: 3 },
                { optionText: 'A file system utility', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'Which of the following is true about Node.js?',
            questionType: 'single',
            points: 2,
            orderNumber: 10,
            options: {
              create: [
                { optionText: 'It uses the V8 JavaScript engine', isCorrect: true, orderNumber: 1 },
                { optionText: 'It is multi-threaded by default', isCorrect: false, orderNumber: 2 },
                { optionText: 'It only works on Linux', isCorrect: false, orderNumber: 3 },
                { optionText: 'It requires a web browser to run', isCorrect: false, orderNumber: 4 }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('✅ Created Quiz 2: Node.js Advanced');

  // Create Quiz 3: Express.js Intermediate
  const quiz3 = await prisma.quiz.create({
    data: {
      title: 'Express.js Intermediate',
      description: 'Express.js routing and middleware',
      level: 'intermediate',
      durationMinutes: 5,
      passingScore: 70,
      isActive: true,
      questions: {
        create: [
          {
            questionText: 'What is middleware in Express.js?',
            questionType: 'single',
            points: 2,
            orderNumber: 1,
            options: {
              create: [
                { optionText: 'Functions that have access to request and response objects', isCorrect: true, orderNumber: 1 },
                { optionText: 'A database layer', isCorrect: false, orderNumber: 2 },
                { optionText: 'A routing mechanism', isCorrect: false, orderNumber: 3 },
                { optionText: 'A template engine', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'Which HTTP methods are safe and idempotent? (Select all)',
            questionType: 'multiple',
            points: 2,
            orderNumber: 2,
            options: {
              create: [
                { optionText: 'GET', isCorrect: true, orderNumber: 1 },
                { optionText: 'POST', isCorrect: false, orderNumber: 2 },
                { optionText: 'PUT', isCorrect: false, orderNumber: 3 },
                { optionText: 'HEAD', isCorrect: true, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'How do you serve static files in Express.js?',
            questionType: 'single',
            points: 1,
            orderNumber: 3,
            options: {
              create: [
                { optionText: 'express.static()', isCorrect: true, orderNumber: 1 },
                { optionText: 'express.files()', isCorrect: false, orderNumber: 2 },
                { optionText: 'app.serve()', isCorrect: false, orderNumber: 3 },
                { optionText: 'app.static()', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'What does app.use() do in Express?',
            questionType: 'single',
            points: 1,
            orderNumber: 4,
            options: {
              create: [
                { optionText: 'Mounts middleware functions', isCorrect: true, orderNumber: 1 },
                { optionText: 'Starts the server', isCorrect: false, orderNumber: 2 },
                { optionText: 'Creates a route', isCorrect: false, orderNumber: 3 },
                { optionText: 'Connects to database', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'Which method is used to parse JSON request bodies?',
            questionType: 'single',
            points: 1,
            orderNumber: 5,
            options: {
              create: [
                { optionText: 'express.json()', isCorrect: true, orderNumber: 1 },
                { optionText: 'express.parse()', isCorrect: false, orderNumber: 2 },
                { optionText: 'bodyParser.json()', isCorrect: false, orderNumber: 3 },
                { optionText: 'app.json()', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'What is the purpose of next() in middleware?',
            questionType: 'single',
            points: 1,
            orderNumber: 6,
            options: {
              create: [
                { optionText: 'Passes control to the next middleware', isCorrect: true, orderNumber: 1 },
                { optionText: 'Ends the response', isCorrect: false, orderNumber: 2 },
                { optionText: 'Starts a new request', isCorrect: false, orderNumber: 3 },
                { optionText: 'Creates a new route', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'How do you handle 404 errors in Express?',
            questionType: 'single',
            points: 1,
            orderNumber: 7,
            options: {
              create: [
                { optionText: 'Add middleware at the end to catch unmatched routes', isCorrect: true, orderNumber: 1 },
                { optionText: 'Use app.error(404)', isCorrect: false, orderNumber: 2 },
                { optionText: 'Set app.notFound = true', isCorrect: false, orderNumber: 3 },
                { optionText: 'Use express.handleErrors()', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'What does res.send() do?',
            questionType: 'single',
            points: 1,
            orderNumber: 8,
            options: {
              create: [
                { optionText: 'Sends the HTTP response', isCorrect: true, orderNumber: 1 },
                { optionText: 'Sends an email', isCorrect: false, orderNumber: 2 },
                { optionText: 'Redirects to another URL', isCorrect: false, orderNumber: 3 },
                { optionText: 'Sends a file download', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'Which method is used to redirect to another URL?',
            questionType: 'single',
            points: 1,
            orderNumber: 9,
            options: {
              create: [
                { optionText: 'res.redirect()', isCorrect: true, orderNumber: 1 },
                { optionText: 'res.forward()', isCorrect: false, orderNumber: 2 },
                { optionText: 'res.goto()', isCorrect: false, orderNumber: 3 },
                { optionText: 'res.navigate()', isCorrect: false, orderNumber: 4 }
              ]
            }
          },
          {
            questionText: 'How do you access route parameters in Express?',
            questionType: 'single',
            points: 1,
            orderNumber: 10,
            options: {
              create: [
                { optionText: 'req.params', isCorrect: true, orderNumber: 1 },
                { optionText: 'req.parameters', isCorrect: false, orderNumber: 2 },
                { optionText: 'req.route', isCorrect: false, orderNumber: 3 },
                { optionText: 'req.variables', isCorrect: false, orderNumber: 4 }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('✅ Created Quiz 3: Express.js Intermediate\n');

  // Summary
  const quizCount = await prisma.quiz.count();
  const questionCount = await prisma.question.count();
  const optionCount = await prisma.option.count();

  console.log('📊 Seeding Summary:');
  console.log(`   - ${quizCount} Quizzes created`);
  console.log(`   - ${questionCount} Questions created`);
  console.log(`   - ${optionCount} Options created`);
  console.log('\n✅ Database seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
