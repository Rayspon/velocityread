import { UserAccount, UserStats, TextItem } from '../types';

const ACCOUNTS_STORAGE_KEY = 'velocity_accounts';
const CURRENT_USER_KEY = 'velocity_current_username';

export function getAllAccounts(): UserAccount[] {
  try {
    const data = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load accounts from storage', e);
    return [];
  }
}

export function saveAllAccounts(accounts: UserAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts to storage', e);
  }
}

export function getCurrentUsername(): string | null {
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function setCurrentUsername(username: string | null): void {
  if (username) {
    localStorage.setItem(CURRENT_USER_KEY, username);
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function getCurrentAccount(): UserAccount | null {
  const username = getCurrentUsername();
  if (!username) return null;
  const accounts = getAllAccounts();
  return accounts.find(a => a.username.toLowerCase() === username.toLowerCase()) || null;
}

export function registerAccount(
  usernameInput: string,
  passwordInput: string,
  displayNameInput?: string,
  initialLibrary?: TextItem[],
  initialStats?: UserStats
): { success: boolean; error?: string; account?: UserAccount } {
  const username = usernameInput.trim();
  const password = passwordInput.trim();
  const name = (displayNameInput || username).trim();

  if (!username || username.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters long.' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { success: false, error: 'Username can only contain letters, numbers, underscores, and hyphens.' };
  }

  if (!password || password.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters long.' };
  }

  const accounts = getAllAccounts();
  const exists = accounts.some(a => a.username.toLowerCase() === username.toLowerCase());

  if (exists) {
    return { success: false, error: 'An account with this username already exists.' };
  }

  const newAccount: UserAccount = {
    username,
    password,
    name: name || username,
    joinedAt: Date.now(),
    library: initialLibrary || [],
    stats: initialStats || {
      totalReadTimeMs: 0,
      averageWpm: 450,
      totalWordsRead: 0,
      sessions: 0
    }
  };

  accounts.push(newAccount);
  saveAllAccounts(accounts);
  setCurrentUsername(newAccount.username);

  return { success: true, account: newAccount };
}

export function loginAccount(
  usernameInput: string,
  passwordInput: string
): { success: boolean; error?: string; account?: UserAccount } {
  const username = usernameInput.trim();
  const password = passwordInput.trim();

  if (!username || !password) {
    return { success: false, error: 'Please enter both username and password.' };
  }

  const accounts = getAllAccounts();
  const account = accounts.find(
    a => a.username.toLowerCase() === username.toLowerCase() && a.password === password
  );

  if (!account) {
    return { success: false, error: 'Invalid username or password.' };
  }

  setCurrentUsername(account.username);
  return { success: true, account };
}

export function logoutAccount(): void {
  setCurrentUsername(null);
}

export function updateAccountDetails(
  username: string,
  updates: { name?: string; newPassword?: string; currentPassword?: string }
): { success: boolean; error?: string; account?: UserAccount } {
  const accounts = getAllAccounts();
  const index = accounts.findIndex(a => a.username.toLowerCase() === username.toLowerCase());

  if (index === -1) {
    return { success: false, error: 'Account not found.' };
  }

  const account = accounts[index];

  if (updates.newPassword) {
    if (!updates.currentPassword || updates.currentPassword !== account.password) {
      return { success: false, error: 'Current password does not match.' };
    }
    if (updates.newPassword.length < 4) {
      return { success: false, error: 'New password must be at least 4 characters long.' };
    }
    account.password = updates.newPassword;
  }

  if (updates.name !== undefined && updates.name.trim()) {
    account.name = updates.name.trim();
  }

  accounts[index] = account;
  saveAllAccounts(accounts);
  return { success: true, account };
}

export function syncAccountData(
  username: string,
  library: TextItem[],
  stats: UserStats
): void {
  const accounts = getAllAccounts();
  const index = accounts.findIndex(a => a.username.toLowerCase() === username.toLowerCase());

  if (index !== -1) {
    accounts[index] = {
      ...accounts[index],
      library,
      stats
    };
    saveAllAccounts(accounts);
  }
}
