import { useState, FormEvent } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LogOut, 
  UserPlus, 
  LogIn, 
  Timer, 
  Zap, 
  Trophy, 
  ArrowLeft, 
  Save, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Users
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
}

export function AccountView({ 
  setView, 
  currentAccount, 
  onAccountChange, 
  currentStats 
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
      setAuthSuccess(`Account created successfully! Welcome, ${res.account.name}.`);
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
      setAuthSuccess(`Created & signed in as @${demoUser}!`);
    } else {
      // If error, try logging in
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
      setProfileMsg({ type: 'success', text: 'Account details updated successfully.' });
      setTimeout(() => setProfileMsg(null), 3000);
    } else {
      setProfileMsg({ type: 'error', text: res.error || 'Failed to update account.' });
    }
  };

  const formatTime = (ms: number) => {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const joinDate = currentAccount
    ? new Date(currentAccount.joinedAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })
    : '';

  return (
    <div className="flex flex-col w-full px-4 lg:px-6 mx-auto max-w-[800px] pb-32 pt-24 min-h-screen">
      <button 
        onClick={() => setView('library')}
        className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-8 w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Library</span>
      </button>

      {/* NOT LOGGED IN STATE */}
      {!currentAccount ? (
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-surface-container border border-outline-variant/30 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-semibold text-on-surface tracking-tight mb-2">
              {authMode === 'signin' ? 'Sign In to Account' : 'Create an Account'}
            </h1>
            <p className="text-sm text-on-surface-variant">
              Manage your speed reading library, custom texts, and progress statistics with your username and password.
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex rounded-xl bg-surface-container-low p-1 mb-6 border border-outline-variant/20">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                authMode === 'signin'
                  ? 'bg-surface text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                authMode === 'register'
                  ? 'bg-surface text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Create Account
            </button>
          </div>

          {authError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{authSuccess}</span>
            </div>
          )}

          {/* Form */}
          <form 
            onSubmit={authMode === 'signin' ? handleSignIn : handleRegister}
            className="bg-surface-container rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-4"
          >
            {authMode === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Display Name (Optional)
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type="text"
                    value={authDisplayName}
                    onChange={(e) => setAuthDisplayName(e.target.value)}
                    placeholder="e.g. Alex Hunter"
                    className="w-full bg-surface-container-low text-on-surface text-sm pl-11 pr-4 py-3 rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Username
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full bg-surface-container-low text-on-surface text-sm pl-11 pr-4 py-3 rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-surface-container-low text-on-surface text-sm pl-11 pr-11 py-3 rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full bg-primary text-on-primary py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
            >
              {authMode === 'signin' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Quick Demo & Existing Accounts list */}
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2.5 px-4 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface font-medium hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-tertiary-fixed-dim" />
              Quick Start with One-Click Account
            </button>

            {existingAccounts.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/10">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                  <Users className="w-3.5 h-3.5" />
                  Accounts on this device ({existingAccounts.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {existingAccounts.map((acc) => (
                    <button
                      key={acc.username}
                      onClick={() => {
                        setAuthMode('signin');
                        setAuthUsername(acc.username);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-surface text-xs text-on-surface hover:border-primary border border-outline-variant/30 transition-colors flex items-center gap-1.5"
                    >
                      <User className="w-3 h-3 text-primary" />
                      <span>@{acc.username}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* LOGGED IN PROFILE & SETTINGS STATE */
        <div className="flex flex-col gap-8">
          {/* Header Profile Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-2xl bg-surface-container border border-outline-variant/20 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-md">
                <span className="text-3xl font-bold text-on-primary">
                  {currentAccount.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                    {currentAccount.name}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    @{currentAccount.username}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant mt-1">
                  Member since {joinDate}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-green-400 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticated Session</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-red-500/10 hover:text-red-400 text-on-surface-variant border border-outline-variant/30 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-tertiary-container/30 flex items-center justify-center shrink-0">
                <Timer className="w-6 h-6 text-on-tertiary-container" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-on-surface-variant font-medium">Read Time</span>
                <p className="text-xl font-bold text-on-surface">{formatTime(currentStats.totalReadTimeMs)}</p>
              </div>
            </div>

            <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-tertiary-container/30 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-on-tertiary-container" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-on-surface-variant font-medium">Average Speed</span>
                <p className="text-xl font-bold text-on-surface">{Math.round(currentStats.averageWpm)} WPM</p>
              </div>
            </div>

            <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-tertiary-container/30 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 text-on-tertiary-container" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-on-surface-variant font-medium">Sessions</span>
                <p className="text-xl font-bold text-on-surface">{currentStats.sessions}</p>
              </div>
            </div>
          </div>

          {/* Edit Account & Password Security */}
          <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
            <h2 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Account & Password Settings
            </h2>

            {profileMsg && (
              <div
                className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-3 ${
                  profileMsg.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}
              >
                {profileMsg.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0" />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Username
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentAccount.username}
                    className="w-full bg-surface-container-low/50 text-on-surface-variant text-sm px-4 py-3 rounded-xl border border-outline-variant/20 cursor-not-allowed"
                  />
                  <span className="text-[11px] text-on-surface-variant">Username cannot be changed.</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter display name"
                    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="border-t border-outline-variant/20 pt-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-on-surface">Change Password</span>
                  <button
                    type="button"
                    onClick={() => setShowEditPasswords(!showEditPasswords)}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    {showEditPasswords ? 'Hide password fields' : 'Update password'}
                  </button>
                </div>

                {showEditPasswords && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-on-surface-variant">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current password"
                        className="bg-surface text-on-surface text-xs px-3 py-2.5 rounded-lg border border-outline-variant/30 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-on-surface-variant">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password"
                        className="bg-surface text-on-surface text-xs px-3 py-2.5 rounded-lg border border-outline-variant/30 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-on-surface-variant">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="bg-surface text-on-surface text-xs px-3 py-2.5 rounded-lg border border-outline-variant/30 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Switch to another account if more than 1 exists */}
          {existingAccounts.length > 1 && (
            <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/20">
              <h3 className="text-sm font-semibold text-on-surface mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Switch Account
              </h3>
              <div className="flex flex-wrap gap-2">
                {existingAccounts.map((acc) => {
                  const isCurrent = acc.username.toLowerCase() === currentAccount.username.toLowerCase();
                  return (
                    <button
                      key={acc.username}
                      disabled={isCurrent}
                      onClick={() => {
                        onAccountChange(acc);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs flex items-center gap-2 transition-all ${
                        isCurrent
                          ? 'bg-primary text-on-primary font-semibold'
                          : 'bg-surface text-on-surface border border-outline-variant/30 hover:border-primary'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>@{acc.username}</span>
                      {isCurrent && <span className="text-[10px] opacity-80">(Active)</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
