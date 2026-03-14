import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, FileText, CheckCircle, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-800" />
              <span className="text-xl font-bold text-blue-900 tracking-tight">Identity Locker</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/verify" className="text-gray-600 hover:text-blue-800 font-medium">Verify Document</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-blue-800 font-medium">Dashboard</Link>
                <button 
                  onClick={logout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-800 font-medium">Login</Link>
                <Link to="/signup" className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-4"
          >
            <Link to="/verify" className="block text-gray-600 font-medium">Verify Document</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="block text-gray-600 font-medium">Dashboard</Link>
                <button onClick={logout} className="block text-red-600 font-medium">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-600 font-medium">Login</Link>
                <Link to="/signup" className="block bg-blue-800 text-white px-4 py-2 rounded-lg text-center">Get Started</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: FileText, label: 'My Documents', path: '/dashboard/documents' },
    { icon: CheckCircle, label: 'Verification Logs', path: '/dashboard/logs' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)] hidden lg:block">
      <div className="p-6 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              location.pathname === item.path 
                ? 'bg-blue-50 text-blue-800 font-semibold' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
