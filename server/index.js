require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const projectsRouter = require('./routes/projects');
const tasksRouter = require('./routes/tasks');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3010;

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'https://npb.rvmsol.com',
  methods: ['GET', 'PATCH', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { error: 'Too many requests' },
}));
app.use(express.json());

app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`NERO ProjectBoard proxy running on 127.0.0.1:${PORT}`);
});
