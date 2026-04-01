import { motion } from 'motion/react';
import { Building2, Lock, ShieldCheck, UserRoundCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Users', value: '12,500+' },
  { label: 'Documents', value: '98,000+' },
  { label: 'Verifications', value: '310,000+' },
];

export const Home = () => {
  return (
    <div className="bg-[#F3F4F6] text-slate-900">
      <section className="relative overflow-hidden px-4 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2">
          <div>
            <h1 className="text-5xl font-extrabold leading-tight text-[#1E3A8A]">Secure Digital Identity Locker & Verification System</h1>
            <p className="mt-6 text-lg text-slate-600">Store official documents once. Share only verification outcomes with privacy-first masking.</p>
            <div className="mt-8 flex gap-4">
              <Link to="/role-selection" className="rounded-xl bg-[#1E3A8A] px-6 py-3 font-semibold text-white">Login</Link>
              <Link to="/role-selection" className="rounded-xl border border-[#1E3A8A] px-6 py-3 font-semibold text-[#1E3A8A]">Signup</Link>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white p-8 shadow-xl">
            <p className="text-sm font-medium text-slate-500">Flow</p>
            <p className="mt-2 text-2xl font-bold text-[#1E3A8A]">Upload → Store → Verify → Result</p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <h2 className="mb-8 text-3xl font-bold text-[#1E3A8A]">Features</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[{i:Lock,t:'Secure document storage'},{i:ShieldCheck,t:'Privacy-first verification'},{i:UserRoundCheck,t:'Role-based system'}].map((f, idx) => (
            <motion.div whileHover={{ y: -8 }} key={idx} className="rounded-2xl bg-white p-6 shadow-sm">
              <f.i className="h-8 w-8 text-[#14B8A6]" />
              <p className="mt-4 font-semibold">{f.t}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-8 md:grid-cols-3">
          {stats.map((item) => (
            <motion.div key={item.label} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="rounded-2xl border p-6 text-center">
              <p className="text-3xl font-bold text-[#1E3A8A]">{item.value}</p>
              <p className="mt-2 text-slate-500">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <h3 className="text-2xl font-bold">Security</h3>
          <p className="mt-3 text-slate-200">Encryption at rest, privacy filtering, and data masking for Aadhaar and sensitive fields.</p>
        </div>
      </section>

      <footer className="bg-slate-950 py-8 text-center text-sm text-slate-300">© 2026 Secure Digital Identity Locker.</footer>
    </div>
  );
};
