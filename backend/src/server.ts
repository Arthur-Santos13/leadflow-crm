import 'dotenv/config';
import { env } from './config/env';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import customersRoutes from './modules/customers/customers.routes';
import leadsRoutes from './modules/leads/leads.routes';
import dealsRoutes from './modules/deals/deals.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

// Middlewares de segurança e parsing
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/deals', dealsRoutes);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: env.NODE_ENV, timestamp: new Date().toISOString() });
});

// Global error handler (must be last)
app.use(errorHandler);

app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
});

export default app;

