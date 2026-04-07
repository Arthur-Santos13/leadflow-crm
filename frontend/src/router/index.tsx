import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import CustomersPage from '../pages/CustomersPage';
import LeadsPage from '../pages/LeadsPage';
import PipelinePage from '../pages/PipelinePage';

export const router = createBrowserRouter([
    { path: '/login', element: <LoginPage /> },
    { path: '/', element: <Navigate to="/dashboard" replace /> },
    { path: '/dashboard', element: <DashboardPage /> },
    { path: '/customers', element: <CustomersPage /> },
    { path: '/leads', element: <LeadsPage /> },
    { path: '/pipeline', element: <PipelinePage /> },
]);
