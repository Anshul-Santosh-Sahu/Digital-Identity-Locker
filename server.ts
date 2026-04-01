import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secure-locker-secret';

app.use(express.json());

const db = new Database('identity_locker.db');
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  organization TEXT
);
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  doc_type TEXT NOT NULL,
  doc_number TEXT NOT NULL,
  hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  verifier_id INTEGER NOT NULL,
  aadhaar TEXT NOT NULL,
  aadhaar_masked TEXT NOT NULL,
  input_name TEXT NOT NULL,
  status TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

const maskAadhaar = (aadhaar: string) => `XXXX XXXX ${aadhaar.slice(-4)}`;
const sha = (v: string) => crypto.createHash('sha256').update(v).digest('hex');

const auth = (role?: 'student' | 'verifier') => (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (role && payload.role !== role) return res.status(403).json({ error: 'Forbidden role' });
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/api/auth/:role/signup', async (req, res) => {
  const role = req.params.role;
  if (!['student', 'verifier'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  const { name, email, password, organization } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const r = db.prepare('INSERT INTO users (name, email, password, role, organization) VALUES (?, ?, ?, ?, ?)').run(name, email, hash, role, organization || null);
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/auth/:role/login', async (req, res) => {
  const role = req.params.role;
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get(email, role) as any;
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, organization: user.organization } });
});

app.get('/api/student/documents', auth('student'), (req: any, res) => {
  const docs = db.prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY id DESC').all(req.user.id) as any[];
  res.json(docs.map((d) => ({ id: d.id, docType: d.doc_type, masked: d.doc_number.length === 12 ? maskAadhaar(d.doc_number) : `XXXX${d.doc_number.slice(-4)}`, hash: d.hash })));
});

app.post('/api/student/documents', auth('student'), (req: any, res) => {
  const { docType, docNumber } = req.body;
  const hash = sha(`${req.user.id}|${docType}|${docNumber}|${Date.now()}`);
  const r = db.prepare('INSERT INTO documents (user_id, doc_type, doc_number, hash) VALUES (?, ?, ?, ?)').run(req.user.id, docType, docNumber, hash);
  res.status(201).json({ id: r.lastInsertRowid, hash });
});

app.post('/api/verifier/verify', auth('verifier'), (req: any, res) => {
  const { aadhaar, name } = req.body;
  const row = db.prepare(`SELECT d.doc_number, u.name FROM documents d JOIN users u ON u.id=d.user_id WHERE d.doc_type='Aadhaar' AND d.doc_number=?`).get(aadhaar) as any;
  const status = row && row.name.toLowerCase() === String(name).toLowerCase() ? 'VERIFIED' : 'NOT MATCHED';
  db.prepare('INSERT INTO verifications (verifier_id, aadhaar, aadhaar_masked, input_name, status) VALUES (?, ?, ?, ?, ?)').run(req.user.id, aadhaar, maskAadhaar(aadhaar), name, status);
  if (status === 'VERIFIED') {
    return res.json({ status, aadhaar: maskAadhaar(aadhaar), name: row.name });
  }
  return res.json({ status: 'NOT MATCHED' });
});

app.get('/api/verifier/history', auth('verifier'), (req: any, res) => {
  const rows = db.prepare('SELECT id, aadhaar_masked as aadhaarMasked, status, timestamp FROM verifications WHERE verifier_id = ? ORDER BY id DESC').all(req.user.id);
  res.json(rows);
});

async function start() {
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
  app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
}

start();
