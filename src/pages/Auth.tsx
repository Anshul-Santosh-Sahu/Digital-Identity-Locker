import React from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuthStore, type Role } from '../store/authStore';

export const LoginPage = () => {
  const { role = 'student' } = useParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await axios.post(`/api/auth/${role}/login`, { email, password });
    setAuth(res.data.user, res.data.token);
    navigate(role === 'student' ? '/student/dashboard' : '/verifier/dashboard');
  };

  return (
    <form onSubmit={submit} className="mx-auto mt-16 max-w-md space-y-4 rounded-2xl bg-white p-8 shadow">
      <h1 className="text-2xl font-bold">Login as {role}</h1>
      <input className="w-full rounded border p-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded border p-3" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="w-full rounded bg-slate-900 py-3 font-semibold text-white">Login</button>
      <Link to={`/signup/${role}`} className="block text-sm text-blue-700">Need an account? Signup</Link>
    </form>
  );
};

export const SignupPage = () => {
  const { role = 'student' } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = React.useState({ name: '', email: '', password: '', organization: '' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post(`/api/auth/${role}/signup`, form);
    navigate(`/login/${role}`);
  };

  return (
    <form onSubmit={submit} className="mx-auto mt-16 max-w-md space-y-4 rounded-2xl bg-white p-8 shadow">
      <h1 className="text-2xl font-bold">Signup as {role}</h1>
      <input className="w-full rounded border p-3" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className="w-full rounded border p-3" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      {role === 'verifier' && <input className="w-full rounded border p-3" placeholder="Organization" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />}
      <input className="w-full rounded border p-3" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button className="w-full rounded bg-[#1E3A8A] py-3 font-semibold text-white">Signup</button>
    </form>
  );
};

export const RoleSelection = () => (
  <div className="mx-auto mt-20 max-w-xl rounded-2xl bg-white p-8 text-center shadow">
    <h1 className="text-3xl font-bold text-slate-900">Choose Role</h1>
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <Link to="/login/student" className="rounded-xl bg-[#1E3A8A] px-4 py-6 font-semibold text-white">Login as Student</Link>
      <Link to="/login/verifier" className="rounded-xl bg-slate-900 px-4 py-6 font-semibold text-white">Login as Verifier</Link>
    </div>
  </div>
);
