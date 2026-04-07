import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import AppLayout from '../components/layout/AppLayout';
import DashboardPage from '../pages/DashboardPage';
import CustomersPage from '../pages/CustomersPage';
import LeadsPage from '../pages/LeadsPage';
import PipelinePage from '../pages/PipelinePage';
import UsersPage from '../pages/UsersPage';

export const router = createBrowserRouter([
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    { path: '/forgot-password', element: <ForgotPasswordPage /> },
    {
        path: '/',
        element: <AppLayout />,
        children: [
            { index: true, element: <Navigate to="/dashboard" replace /> },
            { path: 'dashboard', element: <DashboardPage /> },
            { path: 'customers', element: <CustomersPage /> },
            { path: 'leads', element: <LeadsPage /> },
            { path: 'pipeline', element: <PipelinePage /> },
            { path: 'users', element: <UsersPage /> },
        ],
    },
]);
