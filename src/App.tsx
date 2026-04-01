import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Layout';
import { Home } from './pages/Home';
import { AboutPage } from './pages/About';
import { LoginPage, RoleSelection, SignupPage } from './pages/Auth';
import { StudentDashboard, VerifierDashboard } from './pages/Dashboard';
import { useAuthStore } from './store/authStore';

const PrivateRoute = ({ role, children }: { role: 'student' | 'verifier'; children: React.ReactNode }) => {
  const { token, user } = useAuthStore();
  if (!token || !user) return <Navigate to="/role-selection" />;
  if (user.role !== role) return <Navigate to={user.role === 'student' ? '/student/dashboard' : '/verifier/dashboard'} />;
  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F3F4F6]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/login/:role" element={<LoginPage />} />
          <Route path="/signup/:role" element={<SignupPage />} />
          <Route path="/student/dashboard" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
          <Route path="/verifier/dashboard" element={<PrivateRoute role="verifier"><VerifierDashboard /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}
