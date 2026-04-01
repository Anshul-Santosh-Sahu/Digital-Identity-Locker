import React from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const docTypes = ['Aadhaar', 'PAN', 'College ID', 'Driving License', 'Marksheet', 'Vehicle', 'Certificate', 'Other'];

export const StudentDashboard = () => {
  const { token } = useAuthStore();
  const [docs, setDocs] = React.useState<any[]>([]);
  const [form, setForm] = React.useState({ docType: 'Aadhaar', docNumber: '' });

  const load = async () => {
    const res = await axios.get('/api/student/documents', { headers: { Authorization: `Bearer ${token}` } });
    setDocs(res.data);
  };

  React.useEffect(() => {
    load();
  }, []);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('/api/student/documents', form, { headers: { Authorization: `Bearer ${token}` } });
    setForm({ docType: 'Aadhaar', docNumber: '' });
    load();
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-3xl font-bold text-[#1E3A8A]">Student Dashboard</h1>
      <p className="mt-1 text-slate-600">My Documents • Upload Document • Document Vault • Privacy Settings</p>
      <form onSubmit={upload} className="mt-6 grid gap-3 rounded-2xl bg-white p-6 shadow md:grid-cols-3">
        <select className="rounded border p-3" value={form.docType} onChange={(e) => setForm({ ...form, docType: e.target.value })}>{docTypes.map((d) => <option key={d}>{d}</option>)}</select>
        <input className="rounded border p-3" placeholder="Document number" value={form.docNumber} onChange={(e) => setForm({ ...form, docNumber: e.target.value })} />
        <button className="rounded bg-[#14B8A6] px-4 py-3 font-semibold text-white">Upload Document</button>
      </form>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {docs.map((d) => (
          <div key={d.id} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="font-semibold">{d.docType}</p>
            <p className="mt-1 font-mono text-sm text-slate-600">{d.masked}</p>
            <p className="mt-1 text-xs text-slate-500">Hash: {d.hash.slice(0, 14)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const VerifierDashboard = () => {
  const { token } = useAuthStore();
  const [form, setForm] = React.useState({ aadhaar: '', name: '' });
  const [result, setResult] = React.useState<any>(null);
  const [history, setHistory] = React.useState<any[]>([]);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await axios.post('/api/verifier/verify', form, { headers: { Authorization: `Bearer ${token}` } });
    setResult(res.data);
    const h = await axios.get('/api/verifier/history', { headers: { Authorization: `Bearer ${token}` } });
    setHistory(h.data);
  };

  return (
    <div className="mx-auto max-w-6xl bg-[#F9FAFB] p-6">
      <h1 className="text-3xl font-bold text-[#0F172A]">Verifier Dashboard</h1>
      <p className="mt-1 text-slate-600">Start Verification • Verification Result • Verification History</p>
      <form onSubmit={verify} className="mt-6 grid gap-3 rounded-2xl border bg-white p-6 md:grid-cols-3">
        <input className="rounded border p-3" placeholder="Aadhaar Number" value={form.aadhaar} onChange={(e) => setForm({ ...form, aadhaar: e.target.value })} />
        <input className="rounded border p-3" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <button className="rounded bg-[#2563EB] px-4 py-3 font-semibold text-white">Verify</button>
      </form>
      {result && (
        <div className="mt-6 rounded-xl bg-white p-5 shadow">
          <p>Aadhaar: {result.aadhaar ?? 'N/A'}</p>
          <p>Name: {result.name ?? 'N/A'}</p>
          <p className={`font-bold ${result.status === 'VERIFIED' ? 'text-green-600' : 'text-red-600'}`}>Status: {result.status}</p>
        </div>
      )}

      <div className="mt-6 rounded-xl bg-white p-5">
        <h3 className="mb-3 font-semibold">Verification History</h3>
        {history.map((h) => <p key={h.id} className="text-sm text-slate-600">{new Date(h.timestamp).toLocaleString()} - {h.status} - {h.aadhaarMasked}</p>)}
      </div>
    </div>
  );
};
