import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './db.js';
import projectsRouter from './routes/projects.js';
import chatRouter from './routes/chat.js';
import blueprintRouter from './routes/blueprint.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Static file serving for single-service deployment (docs/06 §6.1)
// Serve React build from ../dist
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// SPA fallback: serve index.html for non-API routes (React Router)
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: 'Endpoint not found',
      code: 'NOT_FOUND'
    });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      // dist/ doesn't exist (dev mode) — return 404 JSON
      res.status(404).json({
        error: 'Frontend build not found. Run "npm run build" first.',
        code: 'NOT_FOUND'
      });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Distill server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

export default app;

// Made with Bob
