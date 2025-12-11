import { User } from "../types";

const USERS_KEY = "prompt_architect_users";
const SESSION_KEY = "prompt_architect_session";

export const register = (username: string, password: string): User => {
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];

  if (users.find(u => u.username === username)) {
    throw new Error("Username already exists");
  }

  const newUser: User = {
    id: `u-${Date.now()}`,
    username,
    password, // Note: In a real app, never store passwords plainly
    createdAt: Date.now()
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Auto login
  localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
  return newUser;
};

export const login = (username: string, password: string): User => {
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];

  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    throw new Error("Invalid credentials");
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
};

export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const sessionStr = localStorage.getItem(SESSION_KEY);
  return sessionStr ? JSON.parse(sessionStr) : null;
};

export const updateUserApiKey = (apiKey: string) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];
  
  // Update in users list
  const updatedUsers = users.map(u => {
    if (u.id === currentUser.id) {
      return { ...u, apiKey };
    }
    return u;
  });
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

  // Update in session
  const updatedUser = { ...currentUser, apiKey };
  localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
  
  return updatedUser;
};
