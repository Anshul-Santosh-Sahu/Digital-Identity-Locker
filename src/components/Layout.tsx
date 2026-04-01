import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Shield, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = React.useState(false);

  const authLinks = user
    ? [
        { to: user.role === 'student' ? '/student/dashboard' : '/verifier/dashboard', label: 'Dashboard' },
      ]
    : [
        { to: '/role-selection', label: 'Login' },
        { to: '/role-selection', label: 'Signup' },
      ];

  const navItems = [{ to: '/about', label: 'About Us' }, ...authLinks];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-slate-900">
          <Shield className="h-6 w-6 text-blue-900" />
          <span className="font-bold">Secure Identity Locker</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link key={item.label} to={item.to} className="text-sm font-medium text-slate-600 hover:text-blue-900">
              {item.label}
            </Link>
          ))}
          {user && (
            <button onClick={logout} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700">
              Logout
            </button>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="space-y-2 border-t border-slate-100 bg-white p-4 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm ${location.pathname === item.to ? 'bg-slate-100' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};
