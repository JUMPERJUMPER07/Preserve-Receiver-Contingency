// Local user registry — stored in localStorage as "prc_users"
// Each entry: { username, passwordHash, drt, role }

export interface AppUser {
  username: string;
  passwordHash: string; // SHA-256 hex (client-side, not security-critical)
  drt: string;
  role: 'admin' | 'tech';
  createdAt: string;
}

const STORAGE_KEY = 'prc_users';

// Simple SHA-256 via Web Crypto
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function loadUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppUser[];
  } catch { /* ignore */ }

  // Seed default admin user (password: "admin")
  const defaultAdmin: AppUser = {
    username: 'admin',
    // SHA-256 of "admin"
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    drt: 'ADMIN',
    role: 'admin',
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultAdmin]));
  return [defaultAdmin];
}

function saveUsers(users: AppUser[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export async function authenticateUser(
  username: string,
  password: string,
): Promise<AppUser | null> {
  const users = loadUsers();
  const hash = await hashPassword(password);
  const user = users.find(
    u => u.username.toLowerCase() === username.toLowerCase() && u.passwordHash === hash,
  );
  return user ?? null;
}

export async function registerUser(
  drt: string,
  password: string,
): Promise<AppUser> {
  const users = loadUsers();
  const username = drt.toLowerCase().replace(/\//g, '-');
  const hash = await hashPassword(password);
  const newUser: AppUser = {
    username,
    passwordHash: hash,
    drt: drt.toUpperCase(),
    role: 'tech',
    createdAt: new Date().toISOString(),
  };
  const filtered = users.filter(u => u.username !== username);
  saveUsers([...filtered, newUser]);
  return newUser;
}

export function userExists(drt: string): boolean {
  const users = loadUsers();
  const username = drt.toLowerCase().replace(/\//g, '-');
  return users.some(u => u.username === username);
}
