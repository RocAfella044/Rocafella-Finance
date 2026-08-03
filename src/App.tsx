import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { useAuthStore } from './store/authStore';
import './index.css';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>} />
        <Route path="/register" element={<RedirectIfAuthenticated><RegisterPage /></RedirectIfAuthenticated>} />
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
