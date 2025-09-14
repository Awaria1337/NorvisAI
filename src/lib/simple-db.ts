import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'users.json');

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(DB_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Get all users
export function getUsers(): User[] {
  ensureDataDir();
  
  if (!fs.existsSync(DB_FILE)) {
    // Create initial users file with test accounts
    const initialUsers: User[] = [
      { id: '1', email: 'test@norvis.ai', password: 'password123', name: 'Test User', createdAt: new Date().toISOString() },
      { id: '2', email: 'demo@norvis.ai', password: 'password123', name: 'Demo User', createdAt: new Date().toISOString() },
      { id: '3', email: 'zilelimert38@gmail.com', password: 'password123', name: 'Zileli Mert', createdAt: new Date().toISOString() },
    ];
    fs.writeFileSync(DB_FILE, JSON.stringify(initialUsers, null, 2));
    return initialUsers;
  }
  
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

// Save users
export function saveUsers(users: User[]): void {
  ensureDataDir();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users file:', error);
  }
}

// Add new user
export function addUser(user: User): void {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

// Find user by email
export function findUserByEmail(email: string): User | undefined {
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

// Find user by ID
export function findUserById(id: string): User | undefined {
  const users = getUsers();
  return users.find(u => u.id === id);
}