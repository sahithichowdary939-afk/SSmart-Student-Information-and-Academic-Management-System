import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import agentRoutes from './routes/agents.js';
import workflowRoutes from './routes/workflows.js';
import academicRoutes from './routes/academic.js';
import { BackgroundScheduler } from './services/scheduler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON Parsing
app.use(cors());
app.use(express.json({ limit: '8mb' }));

// Serve static generated documents (official certificates, timetables)
app.use('/generated_docs', express.static(path.join(__dirname, '../public/generated_docs')));

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/academic', academicRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    system: 'Agentic AI Smart Student Information & Academic Management System',
    agentsLoaded: 12
  });
});

// Start Background Autonomous Scheduler
BackgroundScheduler.start(30000); // 30-second polling cycle

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🚀 Smart Student Information & Academic Management System`);
  console.log(`🤖 Agentic AI Orchestration Server listening on http://localhost:${PORT}`);
  console.log(`================================================================`);
});
