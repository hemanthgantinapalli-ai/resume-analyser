import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const MONGODB_URI = process.env.MONGODB_URI || "";
const IS_MOCK_DB = !MONGODB_URI;

// Cached connection variable
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB or logs the mock database activation
 */
export async function connectDB() {
  if (IS_MOCK_DB) {
    initLocalDB();
    return { isMock: true };
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("Connected to MongoDB Atlas successfully.");
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("MongoDB Atlas connection failed. Falling back to Local File DB.", e);
    initLocalDB();
    return { isMock: true, error: e.message };
  }
  
  return cached.conn;
}

// ============================================================================
// MONGOOSE SCHEMAS (For Live MongoDB Atlas Mode)
// ============================================================================

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ResumeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  rawText: { type: String, default: "" },
  structuredData: { type: Object, default: {} },
  templateId: { type: String, default: "modern" },
  atsScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const HistorySchema = new mongoose.Schema({
  resumeId: { type: String, required: true },
  version: { type: Number, required: true },
  changesDescription: { type: String, default: "Initial Version" },
  content: { type: String, default: "" },
  score: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

// Prevention of OverwriteModelError in Next.js Hot Reloading
export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Resume = mongoose.models.Resume || mongoose.model("Resume", ResumeSchema);
export const History = mongoose.models.History || mongoose.model("History", HistorySchema);

// ============================================================================
// FILE SYSTEM DB ENGINE (For Offline / Local Fallback Mode)
// ============================================================================

const LOCAL_DB_PATH = path.join(process.cwd(), "src", "lib", "local_db.json");

function initLocalDB() {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    const defaultData = {
      users: [],
      resumes: [],
      history: []
    };
    fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true });
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(defaultData, null, 2), "utf8");
    console.log("Local File DB initialized at:", LOCAL_DB_PATH);
  }
}

function readLocalDB() {
  initLocalDB();
  try {
    const data = fs.readFileSync(LOCAL_DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (e) {
    return { users: [], resumes: [], history: [] };
  }
}

function writeLocalDB(data) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("Failed to write to Local File DB:", e);
  }
}

// ============================================================================
// UNIFIED DATA SERVICES (Shields controllers from MONGODB vs FILE DB details)
// ============================================================================

export async function dbRegisterUser(name, email, password) {
  await connectDB();
  
  if (IS_MOCK_DB) {
    const db = readLocalDB();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) throw new Error("Email already registered");
    
    const newUser = {
      _id: "u_" + Math.random().toString(36).substr(2, 9),
      name,
      email: email.toLowerCase(),
      password, // Plain for local debug mock, typically hashed
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    writeLocalDB(db);
    return { id: newUser._id, name: newUser.name, email: newUser.email };
  } else {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new Error("Email already registered");
    const newUser = new User({ name, email: email.toLowerCase(), password });
    await newUser.save();
    return { id: newUser._id.toString(), name: newUser.name, email: newUser.email };
  }
}

export async function dbLoginUser(email, password) {
  await connectDB();
  
  if (IS_MOCK_DB) {
    const db = readLocalDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) throw new Error("Invalid email or password");
    return { id: user._id, name: user.name, email: user.email };
  } else {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.password !== password) throw new Error("Invalid email or password");
    return { id: user._id.toString(), name: user.name, email: user.email };
  }
}

export async function dbSaveResume({ userId, title, rawText, structuredData, templateId, atsScore }) {
  await connectDB();
  
  if (IS_MOCK_DB) {
    const db = readLocalDB();
    const newResume = {
      _id: "res_" + Math.random().toString(36).substr(2, 9),
      userId,
      title,
      rawText,
      structuredData,
      templateId: templateId || "modern",
      atsScore: atsScore || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.resumes.push(newResume);
    writeLocalDB(db);
    
    // Auto save to history
    await dbSaveHistory({
      resumeId: newResume._id,
      changesDescription: "Initial Version Created",
      content: rawText,
      score: atsScore
    });
    
    return newResume;
  } else {
    const newResume = new Resume({
      userId,
      title,
      rawText,
      structuredData,
      templateId: templateId || "modern",
      atsScore: atsScore || 0
    });
    await newResume.save();
    
    // Auto save to history
    await dbSaveHistory({
      resumeId: newResume._id.toString(),
      changesDescription: "Initial Version Created",
      content: rawText,
      score: atsScore
    });
    
    return {
      _id: newResume._id.toString(),
      userId: newResume.userId,
      title: newResume.title,
      rawText: newResume.rawText,
      structuredData: newResume.structuredData,
      templateId: newResume.templateId,
      atsScore: newResume.atsScore,
      createdAt: newResume.createdAt
    };
  }
}

export async function dbGetUserResumes(userId) {
  await connectDB();
  
  if (IS_MOCK_DB) {
    const db = readLocalDB();
    return db.resumes.filter(r => r.userId === userId).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  } else {
    const list = await Resume.find({ userId }).sort({ updatedAt: -1 });
    return list.map(r => ({
      _id: r._id.toString(),
      userId: r.userId,
      title: r.title,
      rawText: r.rawText,
      structuredData: r.structuredData,
      templateId: r.templateId,
      atsScore: r.atsScore,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));
  }
}

export async function dbGetResumeById(resumeId) {
  await connectDB();
  
  if (IS_MOCK_DB) {
    const db = readLocalDB();
    const r = db.resumes.find(res => res._id === resumeId);
    if (!r) throw new Error("Resume not found");
    return r;
  } else {
    const r = await Resume.findById(resumeId);
    if (!r) throw new Error("Resume not found");
    return {
      _id: r._id.toString(),
      userId: r.userId,
      title: r.title,
      rawText: r.rawText,
      structuredData: r.structuredData,
      templateId: r.templateId,
      atsScore: r.atsScore,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    };
  }
}

export async function dbSaveHistory({ resumeId, changesDescription, content, score }) {
  await connectDB();
  
  if (IS_MOCK_DB) {
    const db = readLocalDB();
    // Calculate new version number
    const resumeHistory = db.history.filter(h => h.resumeId === resumeId);
    const version = resumeHistory.length + 1;
    
    const newHistory = {
      _id: "hist_" + Math.random().toString(36).substr(2, 9),
      resumeId,
      version,
      changesDescription,
      content,
      score,
      updatedAt: new Date().toISOString()
    };
    db.history.push(newHistory);
    
    // Update resume score and updatedAt timestamp
    const resumeIdx = db.resumes.findIndex(r => r._id === resumeId);
    if (resumeIdx !== -1) {
      db.resumes[resumeIdx].atsScore = score;
      if (content) db.resumes[resumeIdx].rawText = content;
      db.resumes[resumeIdx].updatedAt = new Date().toISOString();
    }
    
    writeLocalDB(db);
    return newHistory;
  } else {
    const historyList = await History.find({ resumeId });
    const version = historyList.length + 1;
    
    const newHistory = new History({
      resumeId,
      version,
      changesDescription,
      content,
      score
    });
    await newHistory.save();
    
    // Update parent resume
    const updateObj = { atsScore: score, updatedAt: Date.now() };
    if (content) updateObj.rawText = content;
    await Resume.findByIdAndUpdate(resumeId, updateObj);
    
    return {
      _id: newHistory._id.toString(),
      resumeId: newHistory.resumeId,
      version: newHistory.version,
      changesDescription: newHistory.changesDescription,
      content: newHistory.content,
      score: newHistory.score,
      updatedAt: newHistory.updatedAt
    };
  }
}

export async function dbGetResumeHistory(resumeId) {
  await connectDB();
  
  if (IS_MOCK_DB) {
    const db = readLocalDB();
    return db.history.filter(h => h.resumeId === resumeId).sort((a, b) => b.version - a.version);
  } else {
    const list = await History.find({ resumeId }).sort({ version: -1 });
    return list.map(h => ({
      _id: h._id.toString(),
      resumeId: h.resumeId,
      version: h.version,
      changesDescription: h.changesDescription,
      content: h.content,
      score: h.score,
      updatedAt: h.updatedAt
    }));
  }
}
