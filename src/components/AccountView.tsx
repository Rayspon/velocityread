import { useState, FormEvent } from 'react';
import { 
  User, 
  Lock, 
  LogOut, 
  Clock, 
  Zap, 
  BookOpen, 
  ArrowLeft, 
  CheckCircle2, 
  Sun, 
  Moon, 
  ShieldCheck, 
  KeyRound 
} from 'lucide-react';
import { ViewState, UserStats, UserAccount } from '../types';
import { 
  registerAccount, 
  loginAccount, 
  logoutAccount, 
  updateAccountDetails,
  getAllAccounts
} from '../lib/accountStore';

interface AccountViewProps {
  setView: (view: ViewState) => void;
  currentAccount: UserAccount | null;
  onAccountChange: (account: UserAccount | null) => void;
  currentStats: UserStats;
  theme?: 'parchment' | 'dark-leather';
  onToggleTheme?: () => void;
}

export function AccountView({ 
  setView, 
  currentAccount, 
  onAccountChange, 
  currentStats,
  theme = 'dark-leather',
  onToggleTheme
}: AccountViewProps) {
  // Auth Form State (Sign In / Register)
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authDisplayName, setAuthDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Profile Edit State (When Logged In)
  const [editName, setEditName] = useState(currentAccount?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showEditPasswords, setShowEditPasswords] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const existingAccounts = getAllAccounts();

  const handleSignIn = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const res = loginAccount(authUsername, authPassword);
    if (res.success && res.account) {
      onAccountChange(res.account);
      setAuthSuccess(`Welcome back, ${res.account.name}!`);
      setAuthPassword('');
    } else {
      setAuthError(res.error || 'Failed to sign in.');
    }
  };

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const res = registerAccount(authUsername, authPassword, authDisplayName);
    if (res.success && res.account) {
      onAccountChange(res.account);
      setAuthSuccess(`Account created! Welcome, ${res.account.name}.`);
      setAuthPassword('');
    } else {
      setAuthError(res.error || 'Failed to create account.');
    }
  };

  const handleQuickDemo = () => {
    const demoUser = 'reader_' + Math.floor(Math.random() * 899 + 100);
    const demoPass = 'speedread123';
    const res = registerAccount(demoUser, demoPass, 'Speed Reader');
    if (res.success && res.account) {
      onAccountChange(res.account);
      setAuthSuccess(`Signed in as @${demoUser}!`);
    } else {
      const logRes = loginAccount(demoUser, demoPass);
      if (logRes.success && logRes.account) {
        onAccountChange(logRes.account);
      }
    }
  };

  const handleLogout = () => {
    logoutAccount();
    onAccountChange(null);
    setAuthUsername('');
    setAuthPassword('');
    setAuthSuccess('Signed out successfully.');
    setTimeout(() => setAuthSuccess(null), 3000);
  };

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    if (!currentAccount) return;
    setProfileMsg(null);

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setProfileMsg({ type: 'error', text: 'New passwords do not match.' });
        return;
      }
      if (!currentPassword) {
        setProfileMsg({ type: 'error', text: 'Current password is required to change password.' });
        return;
      }
    }

    const res = updateAccountDetails(currentAccount.username, {
      name: editName,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined
    });

    if (res.success && res.account) {
      onAccountChange(res.account);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
      setTimeout(() => setProfileMsg(null), 3000);
    } else {
      setProfileMsg({ type: 'error', text: res.error || 'Failed to update account.' });
    }
  };

  const formatTime = (ms: number) => {
    if (!ms || ms <= 0) return '0m';
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const joinDate = currentAccount
    ? new Date(currentAccount.joinedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-[900px] pb-32 pt-20 md:pt-28 min-h-screen font-serif">
      {/* Return to Library */}
      <button 
        onClick={() => setView('library')}
        className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-6 w-fit font-['Cinzel'] text-xs font-bold uppercase tracking-wider py-1.5 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Library</span>
      </button>

      {/* Header */}
      <div className="mb-8 md:mb-10">
        <div className="inline-flex items-center gap-2 text-secondary text-xs uppercase tracking-[0.25em] font-['Cinzel'] mb-2">
          <span>❦</span>
          <span>User Profile</span>
          <span>❧</span>
        </div>
        <h1 className="font-['Cinzel_Decorative'] text-3xl sm:text-4xl font-bold text-on-surface tracking-tight mb-2">
          Account & Settings
        </h1>
        <p className="font-['EB_Garamond'] italic text-base sm:text-lg text-on-surface-variant leading-relaxed">
          Manage your account profile, reading statistics, and theme preferences.
        </p>
      </div>

      {authSuccess && (
        <div className="p-4 mb-6 bg-tertiary-container/60 text-on-tertiary-container rounded-lg border border-tertiary/40 flex items-center gap-2 text-sm font-['Cinzel']">
          <CheckCircle2 className="w-4 h-4" />
          <span>{authSuccess}</span>
        </div>
      )}

      {currentAccount ? (
        /* LOGGED IN VIEW */
        <div className="flex flex-col gap-6 md:gap-8">
          {/* User Card */}
          <div className="bg-surface-container/60 rounded-xl p-6 sm:p-8 border border-outline-variant/70 antique-border relative overflow-hidden shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-outline-variant/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary text-on-primary border-2 border-secondary/60 flex items-center justify-center font-['Cinzel_Decorative'] text-2xl font-bold shadow-md shrink-0">
                  {currentAccount.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-['Cinzel'] text-xl font-bold text-on-surface">
                    {currentAccount.name}
                  </h2>
                  <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                    @{currentAccount.username} · Joined {joinDate}
                  </p>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-outline-variant/70 text-on-surface-variant hover:text-primary hover:border-primary transition-colors font-['Cinzel'] text-xs font-bold uppercase tracking-wider min-h-[40px]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Reading Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6">
              <div className="p-3.5 bg-surface rounded-lg border border-outline-variant/40">
                <span className="font-['Cinzel'] text-[10px] text-on-surface-variant uppercase tracking-wider block mb-1">
                  Time Read
                </span>
                <span className="font-['Cinzel'] text-lg font-bold text-on-surface">
                  {formatTime(currentStats.totalReadTimeMs)}
                </span>
              </div>

              <div className="p-3.5 bg-surface rounded-lg border border-outline-variant/40">
                <span className="font-['Cinzel'] text-[10px] text-on-surface-variant uppercase tracking-wider block mb-1">
                  Average Speed
                </span>
                <span className="font-['Cinzel'] text-lg font-bold text-on-surface">
                  {Math.round(currentStats.averageWpm)} <span className="text-xs font-normal">WPM</span>
                </span>
              </div>

              <div className="p-3.5 bg-surface rounded-lg border border-outline-variant/40">
                <span className="font-['Cinzel'] text-[10px] text-on-surface-variant uppercase tracking-wider block mb-1">
                  Saved Texts
                </span>
                <span className="font-['Cinzel'] text-lg font-bold text-on-surface">
                  {currentAccount.library?.length || 0}
                </span>
              </div>

              <div className="p-3.5 bg-surface rounded-lg border border-outline-variant/40">
                <span className="font-['Cinzel'] text-[10px] text-on-surface-variant uppercase tracking-wider block mb-1">
                  Sessions
                </span>
                <span className="font-['Cinzel'] text-lg font-bold text-on-surface">
                  {currentStats.sessions}
                </span>
              </div>
            </div>
          </div>

          {/* Theme Preference */}
          {onToggleTheme && (
            <div className="bg-surface-container/60 rounded-xl p-5 sm:p-6 border border-outline-variant/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-['Cinzel'] text-sm font-bold text-on-surface uppercase tracking-wider mb-1">
                  Theme Appearance
                </h3>
                <p className="font-['EB_Garamond'] text-xs text-on-surface-variant italic">
                  Currently active: {theme === 'dark-leather' ? "Dark Theme (Default)" : "Light Parchment Theme"}
                </p>
              </div>

              <button
                onClick={onToggleTheme}
                className="px-4 py-2.5 rounded-lg border border-outline-variant bg-surface hover:bg-surface-container-high transition-colors font-['Cinzel'] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 min-h-[44px]"
              >
                {theme === 'dark-leather' ? (
                  <>
                    <Sun className="w-4 h-4 text-secondary" />
                    <span>Switch to Light Theme</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-on-surface-variant" />
                    <span>Switch to Dark Theme</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Profile Edit Form */}
          <div className="bg-surface-container/60 rounded-xl p-6 sm:p-8 border border-outline-variant/70">
            <h3 className="font-['Cinzel'] text-base font-bold text-on-surface uppercase tracking-wider mb-5 pb-2.5 border-b border-outline-variant/40">
              Edit Profile
            </h3>

            {profileMsg && (
              <div className={`p-3.5 rounded-lg border text-xs font-['Cinzel'] mb-4 ${
                profileMsg.type === 'error'
                  ? 'bg-primary-container text-on-primary-container border-primary/40'
                  : 'bg-tertiary-container text-on-tertiary-container border-tertiary/40'
              }`}>
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
              <div>
                <label className="font-['Cinzel'] text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                  Display Name
                </label>
                <input 
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-surface text-on-surface text-base px-4 py-3 rounded-lg border border-outline-variant/60 focus:border-secondary focus:outline-none font-['EB_Garamond'] min-h-[44px]"
                  required
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowEditPasswords(!showEditPasswords)}
                  className="font-['Cinzel'] text-xs text-primary font-bold uppercase tracking-wider hover:underline py-1 inline-flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{showEditPasswords ? '- Hide Password Change' : '+ Change Password'}</span>
                </button>
              </div>

              {showEditPasswords && (
                <div className="flex flex-col gap-4 p-5 bg-surface rounded-xl border border-outline-variant/40">
                  <div>
                    <label className="font-['Cinzel'] text-xs text-on-surface-variant uppercase tracking-wider block mb-1.5">
                      Current Password
                    </label>
                    <input 
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-surface-container text-on-surface text-base px-4 py-2.5 rounded-lg border border-outline-variant/60 focus:border-secondary focus:outline-none font-mono text-sm min-h-[44px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-['Cinzel'] text-xs text-on-surface-variant uppercase tracking-wider block mb-1.5">
                        New Password
                      </label>
                      <input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-surface-container text-on-surface text-base px-4 py-2.5 rounded-lg border border-outline-variant/60 focus:border-secondary focus:outline-none font-mono text-sm min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="font-['Cinzel'] text-xs text-on-surface-variant uppercase tracking-wider block mb-1.5">
                        Confirm New Password
                      </label>
                      <input 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-surface-container text-on-surface text-base px-4 py-2.5 rounded-lg border border-outline-variant/60 focus:border-secondary focus:outline-none font-mono text-sm min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="self-end px-7 py-3 rounded-lg bg-primary text-on-primary font-['Cinzel'] text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-98 transition-all shadow-sm min-h-[44px]"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* GUEST / AUTHENTICATION VIEW */
        <div className="flex flex-col gap-6">
          <div className="bg-surface-container/60 rounded-xl p-6 sm:p-8 border border-outline-variant/70 antique-border max-w-lg mx-auto w-full shadow-xs">
            {/* Auth tab toggle */}
            <div className="flex border-b border-outline-variant/60 pb-3 mb-6 gap-6">
              <button
                onClick={() => { setAuthMode('signin'); setAuthError(null); }}
                className={`font-['Cinzel'] text-sm uppercase tracking-wider font-bold pb-2 transition-all ${
                  authMode === 'signin'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode('register'); setAuthError(null); }}
                className={`font-['Cinzel'] text-sm uppercase tracking-wider font-bold pb-2 transition-all ${
                  authMode === 'register'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Create Account
              </button>
            </div>

            {authError && (
              <div className="p-3.5 mb-5 bg-primary-container text-on-primary-container rounded-lg border border-primary/30 text-xs font-['Cinzel']">
                {authError}
              </div>
            )}

            <form onSubmit={authMode === 'signin' ? handleSignIn : handleRegister} className="flex flex-col gap-5">
              {authMode === 'register' && (
                <div>
                  <label className="font-['Cinzel'] text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                    Your Name
                  </label>
                  <input 
                    type="text"
                    value={authDisplayName}
                    onChange={(e) => setAuthDisplayName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-surface text-on-surface text-base px-4 py-3 rounded-lg border border-outline-variant/60 focus:border-secondary focus:outline-none font-['EB_Garamond'] min-h-[44px]"
                  />
                </div>
              )}

              <div>
                <label className="font-['Cinzel'] text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                  Username
                </label>
                <input 
                  type="text"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="e.g. reader123"
                  className="w-full bg-surface text-on-surface text-base px-4 py-3 rounded-lg border border-outline-variant/60 focus:border-secondary focus:outline-none font-['EB_Garamond'] min-h-[44px]"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-['Cinzel'] text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-on-surface-variant hover:text-on-surface font-['Cinzel']"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface text-on-surface text-base px-4 py-3 rounded-lg border border-outline-variant/60 focus:border-secondary focus:outline-none font-mono text-sm min-h-[44px]"
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-2 py-3.5 rounded-lg bg-primary text-on-primary font-['Cinzel'] text-xs font-bold uppercase tracking-widest hover:opacity-90 active:scale-98 transition-all shadow-md min-h-[48px]"
              >
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-8 pt-5 border-t border-outline-variant/50 text-center">
              <span className="font-sans text-xs text-on-surface-variant block mb-2">
                Want to test the app right away?
              </span>
              <button
                type="button"
                onClick={handleQuickDemo}
                className="text-xs font-['Cinzel'] font-bold text-secondary uppercase tracking-wider hover:underline py-1"
              >
                + Create Quick Demo Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
