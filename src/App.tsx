import { useEffect, useState } from 'react';
import { GraduationCap, X, LogIn } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EnrollmentProvider } from './context/EnrollmentContext';
import LandingPage from './components/LandingPage';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import TerminalChat from './components/TerminalChat';

const SECRET_TRIGGER = 'void_pointer_42';
// Opens the same shared room in the alternate, single-column terminal display.
const TERMINAL_TRIGGER = 'terminal_access_77';

// 🛑 ADD YOUR 2 AUTHORIZED USER EMAILS HERE:
const AUTHORIZED_EMAILS = [
  'mirrormirroronthewall@gmail.com',
  'whoisthefairestofthemall@gmail.com',
];

function Portal() {
  const { session, loading, signOut } = useAuth();
  const [query, setQuery] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [chatMode, setChatMode] = useState<'standard' | 'terminal' | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleQueryChange = (q: string) => {
    setQuery(q);
    const trimmedQuery = q.trim();
    if (trimmedQuery === SECRET_TRIGGER || trimmedQuery === TERMINAL_TRIGGER) {
      const requestedMode = trimmedQuery === TERMINAL_TRIGGER ? 'terminal' : 'standard';
      const userEmail = session?.user.email ?? '';

      // Check if session exists AND email is one of the 2 authorized accounts
      if (session && AUTHORIZED_EMAILS.includes(userEmail)) {
        setChatMode(requestedMode);
        setQuery('');
      } else if (!session) {
        // Signed-out visitors: silently treat the phrase as a normal search.
        // Clearing the query leaves the empty-search state ("No courses match").
        setQuery('');
      } else {
        // Signed in but not on the allowlist.
        setShowLoginPrompt(true);
        setLoginOpen(true);
        setQuery('');
      }
    }
  };

  useEffect(() => {
    if (chatMode) {
      setQuery('');
    }
  }, [chatMode]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <GraduationCap size={18} className="animate-pulse" />
          Loading CodeForge Academy…
        </div>
      </div>
    );
  }

  if (chatMode && session) {
    return (
      <TerminalChat
        userId={session.user.id}
        displayMode={chatMode}
        onBack={() => setChatMode(null)}
      />
    );
  }

  const handleLoginSuccess = () => {
    setLoginOpen(false);
    setShowLoginPrompt(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <LandingPage
        query={query}
        onQueryChange={handleQueryChange}
        sessionEmail={session?.user.email ?? null}
        onSignOut={signOut}
        onSignupClick={() => setSignupOpen(true)}
        onSigninClick={() => setLoginOpen(true)}
      />

      <LoginModal
        open={loginOpen}
        onClose={() => {
          setLoginOpen(false);
          setShowLoginPrompt(false);
        }}
        onSuccess={handleLoginSuccess}
      />
      <SignupModal open={signupOpen} onClose={() => setSignupOpen(false)} />

      {showLoginPrompt && (
        <div className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-xl border border-slate-700 bg-slate-900 p-4 text-white shadow-2xl">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800">
            <LogIn size={17} className="text-[#33ff99]" />
          </span>
          <div className="flex-1 text-sm">
            <div className="font-semibold">Access restricted</div>
            <p className="mt-0.5 text-slate-300">
              That secret channel requires authorization from one of the designated accounts.
            </p>
          </div>
          <button
            onClick={() => setShowLoginPrompt(false)}
            className="rounded p-1 text-slate-400 transition-colors hover:text-white"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <EnrollmentProvider>
        <Portal />
      </EnrollmentProvider>
    </AuthProvider>
  );
}