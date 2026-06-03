import DashboardBancoNexus from '@/components/DashboardBancoNexus';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Register from '@/components/register';
import Login from '@/components/login';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Routes>
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardBancoNexus />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<PublicRoute><Register onGoToLogin={() => navigate('/login')} /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login onGoToRegister={() => navigate('/')} /></PublicRoute>} />
      </Routes>
    </div>
  );
}
