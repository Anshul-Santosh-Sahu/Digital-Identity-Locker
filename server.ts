import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-identity-locker-key";
const PORT = 3000;

// Initialize Database
const db = new Database("identity_locker.db");

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    did TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    type TEXT NOT NULL,
    number TEXT,
    fileName TEXT NOT NULL,
    filePath TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    hash TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    verifierName TEXT,
    documentId INTEGER,
    status TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS blockchain_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    data TEXT NOT NULL,
    prevHash TEXT,
    currentHash TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Helper: Generate Hash
const generateHash = (data: string) => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

// Helper: Add to Ledger
const addToLedger = (action: string, data: any) => {
  const lastEntry = db.prepare("SELECT currentHash FROM blockchain_ledger ORDER BY id DESC LIMIT 1").get() as { currentHash: string } | undefined;
  const prevHash = lastEntry ? lastEntry.currentHash : "0".repeat(64);
  const dataStr = JSON.stringify(data);
  const currentHash = generateHash(prevHash + action + dataStr);
  
  db.prepare("INSERT INTO blockchain_ledger (action, data, prevHash, currentHash) VALUES (?, ?, ?, ?)").run(
    action, dataStr, prevHash, currentHash
  );
};

// Mock Data Seed (if empty)
const userCount = db.prepare("SELECT count(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  const hashedPassword = bcrypt.hashSync("password123", 10);
  const adminDid = `did:key:z6Mkh${generateHash("admin").substring(0, 32)}`;
  const rahulDid = `did:key:z6Mkh${generateHash("rahul").substring(0, 32)}`;

  db.prepare("INSERT INTO users (name, email, password, role, did) VALUES (?, ?, ?, ?, ?)").run(
    "Admin User", "admin@locker.com", hashedPassword, "admin", adminDid
  );
  db.prepare("INSERT INTO users (name, email, password, role, did) VALUES (?, ?, ?, ?, ?)").run(
    "Rahul Sharma", "rahul@example.com", hashedPassword, "user", rahulDid
  );
  
  // Add mock documents for Rahul
  const doc1Hash = generateHash("mock_aadhaar_content");
  const doc2Hash = generateHash("mock_pan_content");

  db.prepare("INSERT INTO documents (userId, type, number, fileName, filePath, status, hash) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    2, "Aadhaar Card", "123456789123", "aadhaar.pdf", "/uploads/mock_aadhaar.pdf", "Verified", doc1Hash
  );
  db.prepare("INSERT INTO documents (userId, type, number, fileName, filePath, status, hash) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    2, "PAN Card", "ABCDE1234F", "pan.pdf", "/uploads/mock_pan.pdf", "Verified", doc2Hash
  );

  addToLedger("INITIAL_SEED", { users: 2, docs: 2 });
}

const app = express();
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Middleware: Auth
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// --- API Routes ---

// Auth
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const did = `did:key:z6Mkh${generateHash(email + Date.now()).substring(0, 32)}`;
    const result = db.prepare("INSERT INTO users (name, email, phone, password, did) VALUES (?, ?, ?, ?, ?)").run(
      name, email, phone, hashedPassword, did
    );
    addToLedger("USER_SIGNUP", { email, did });
    res.status(201).json({ id: result.lastInsertRowid, did });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// Documents
app.get("/api/documents", authenticateToken, (req: any, res) => {
  const docs = db.prepare("SELECT * FROM documents WHERE userId = ?").all(req.user.id);
  res.json(docs);
});

app.post("/api/documents/upload", authenticateToken, upload.single("file"), (req: any, res) => {
  const { type, number } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  // Generate Document Hash (Web5/Blockchain Integrity)
  const fileBuffer = fs.readFileSync(file.path);
  const hash = generateHash(fileBuffer.toString());

  const result = db.prepare("INSERT INTO documents (userId, type, number, fileName, filePath, hash) VALUES (?, ?, ?, ?, ?, ?)").run(
    req.user.id, type, number, file.filename, file.path, hash
  );

  addToLedger("DOCUMENT_UPLOAD", { userId: req.user.id, type, hash });

  res.status(201).json({ id: result.lastInsertRowid, hash });
});

app.delete("/api/documents/:id", authenticateToken, (req: any, res) => {
  db.prepare("DELETE FROM documents WHERE id = ? AND userId = ?").run(req.params.id, req.user.id);
  res.json({ success: true });
});

// Verification (Third Party)
app.post("/api/verify", (req, res) => {
  const { name, number, type } = req.body;
  
  // Search for a document matching the type and number
  // In a real app, we'd match the user's name too, but for simplicity:
  const doc = db.prepare(`
    SELECT d.*, u.name as userName 
    FROM documents d 
    JOIN users u ON d.userId = u.id 
    WHERE d.number = ? AND d.type = ?
  `).get(number, type) as any;

  if (doc) {
    // Privacy Masking
    const maskedNumber = number.replace(/.(?=.{4})/g, "X");
    
    // Log verification
    db.prepare("INSERT INTO verifications (verifierName, documentId, status) VALUES (?, ?, ?)").run(
      "Third Party Org", doc.id, "VERIFIED"
    );

    addToLedger("DOCUMENT_VERIFIED", { docId: doc.id, type: doc.type, hash: doc.hash });

    res.json({
      status: "VERIFIED",
      data: {
        name: doc.userName,
        number: maskedNumber,
        type: doc.type,
        verifiedAt: new Date().toISOString(),
        blockchainProof: doc.hash // Returning the hash as proof of integrity
      }
    });
  } else {
    res.json({ status: "NOT MATCHED" });
  }
});

// Ledger (Blockchain Explorer)
app.get("/api/blockchain/ledger", (req, res) => {
  const ledger = db.prepare("SELECT * FROM blockchain_ledger ORDER BY id DESC").all();
  res.json(ledger);
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
