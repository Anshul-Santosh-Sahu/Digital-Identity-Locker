import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar, Sidebar } from './components/Layout';
import { Home } from './pages/Home';
import { LoginPage, SignupPage } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { VerificationPage } from './pages/Verification';
import { useAuthStore } from './store/authStore';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore(state => state.token);
  return token ? <>{children}</> : <Navigate to="/login" />;
};

export default function App() {
  const user = useAuthStore(state => state.user);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          {user && <Sidebar />}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/verify" element={<VerificationPage />} />
              <Route 
                path="/dashboard/*" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
