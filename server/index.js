import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db.js';
import projectsRouter from './routes/projects.js';
import chatRouter from './routes/chat.js';
import blueprintRouter from './routes/blueprint.js';

const app = express();
const PORT = process.env.PORT || 10000;

// Validate required environment variables
const requiredEnvVars = ['GEMINI_API_KEY'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please set them before starting the server.');
  console.error('Example: export GEMINI_API_KEY=your_api_key_here');
  process.exit(1);
}

// Initialize database
initializeDatabase();

// Middleware
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// API Routes
app.use('/api/projects', projectsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/blueprint', blueprintRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';

  res.status(statusCode).json({
    error: err.message || 'An unexpected error occurred',
    code: errorCode
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Distill server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

export default app;

// Made with Bob
