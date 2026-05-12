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

app.set('trust proxy', 1);

app.use(helmet());
if (env.CORS_ORIGIN) {
    const origin = env.CORS_ORIGIN.split(',')
        .map((o) => o.trim())
        .filter(Boolean);
    app.use(cors({ origin, credentials: true }));
} else {
    app.use(cors());
}
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/interactions', interactionsRoutes);

function healthHandler(_req: express.Request, res: express.Response) {
    res.json({ status: 'ok', env: env.NODE_ENV, timestamp: new Date().toISOString() });
}

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

app.use(errorHandler);

export default app;
