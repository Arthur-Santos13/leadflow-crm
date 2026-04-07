import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import customersRoutes from './modules/customers/customers.routes';
import leadsRoutes from './modules/leads/leads.routes';
import dealsRoutes from './modules/deals/deals.routes';
import interactionsRoutes from './modules/interactions/interactions.routes';
import { errorHandler } from './middlewares/error.middleware';
import { env } from './config/env';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/interactions', interactionsRoutes);

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: env.NODE_ENV, timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;
