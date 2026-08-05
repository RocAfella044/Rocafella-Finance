import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

type FormErrors = Partial<Record<'email' | 'password', string>>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "We couldn't sign you in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-canvas">
      <div className="hidden lg:flex lg:w-[44%] relative bg-ink overflow-hidden">
        <StitchLine />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-clay" />
            <span className="font-mono text-xs tracking-[0.3em] uppercase text-canvas/70">Rocafella Finance</span>
          </div>

          <div>
            <h1 className="font-serif text-4xl xl:text-5xl leading-[1.1] text-canvas">
              Trust and
              <br />
              Technology
              <br />
              at the same time.
            </h1>
            <p className="mt-5 text-canvas/60 text-sm max-w-xs leading-relaxed">
              Sign in to track, revisit, and pick up where you left it.
            </p>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-canvas/40">
            <span className="w-8 h-px bg-canvas/20" />
            <span>Est. 2026</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:hidden flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-clay" />
            <span className="font-mono text-xs tracking-[0.3em] uppercase text-ink/50">Welcome to Rocafella Finance</span>
          </div>

          <div>
            <h2 className="font-serif text-3xl text-ink">Welcome back</h2>
            <p className="mt-2 text-sm text-ink/50">Sign in to your account</p>
          </div>

          {submitError && (
            <div className="flex items-start gap-2 rounded-lg bg-clay/10 border border-clay/30 px-3.5 py-3 text-sm text-clay mt-5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
            <FloatingField
              id="email"
              type="email"
              label="Email address"
              value={email}
              onChange={setEmail}
              icon={<Mail className="w-4.5 h-4.5" />}
              error={errors.email}
              autoComplete="email"
              focused={focused === 'email'}
              onFocusChange={(f) => setFocused(f ? 'email' : null)}
            />

            <FloatingField
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={password}
              onChange={setPassword}
              icon={<Lock className="w-4.5 h-4.5" />}
              error={errors.password}
              autoComplete="current-password"
              focused={focused === 'password'}
              onFocusChange={(f) => setFocused(f ? 'password' : null)}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-ink/35 hover:text-ink/70 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              }
            />

            <div className="flex items-center justify-between pt-1">
              <Checkbox checked={rememberMe} onChange={setRememberMe} label="Remember me" />
              <a href="#" className="text-sm text-ink/50 hover:text-clay transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-ink text-canvas text-sm font-medium tracking-wide transition-colors hover:bg-ink/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-canvas text-xs uppercase tracking-widest text-ink/35">or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <SocialButton label="Google" icon={<GoogleMark />} />
            <SocialButton label="GitHub" icon={<GithubMark />} />
          </div>

          <p className="mt-8 text-center text-sm text-ink/50">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-ink hover:text-clay transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Subcomponents ---------- */

function StitchLine() {
  return (
    <svg
      className="absolute right-0 top-0 h-full w-24 opacity-40"
      viewBox="0 0 100 800"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M 50 0 L 50 800"
        stroke="currentColor"
        className="text-canvas"
        strokeWidth="1.5"
        strokeDasharray="10 8"
        fill="none"
      />
    </svg>
  );
}

function FloatingField({
  id,
  type,
  label,
  value,
  onChange,
  icon,
  trailing,
  error,
  autoComplete,
  focused,
  onFocusChange,
}: {
  id: string;
  type: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  trailing?: React.ReactNode;
  error?: string;
  autoComplete?: string;
  focused: boolean;
  onFocusChange: (focused: boolean) => void;
}) {
  const floated = focused || value.length > 0;
  return (
    <div>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35">{icon}</span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => onFocusChange(true)}
          onBlur={() => onFocusChange(false)}
          autoComplete={autoComplete}
          className={`peer w-full pl-11 pr-11 pt-4 pb-2 rounded-lg border bg-sand/30 text-sm text-ink outline-none transition-colors
            ${error ? 'border-clay' : focused ? 'border-ink' : 'border-line'}`}
        />
        <label
          htmlFor={id}
          className={`absolute left-11 transition-all duration-200 pointer-events-none text-ink/40
            ${floated ? 'top-2 text-[11px]' : 'top-1/2 -translate-y-1/2 text-sm'}`}
        >
          {label}
        </label>
        {trailing && <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{trailing}</span>}
      </div>
      {error && <p className="mt-1.5 text-xs text-clay">{error}</p>}
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
      <span
        onClick={() => onChange(!checked)}
        className={`relative w-4 h-4 rounded shrink-0 border flex items-center justify-center transition-colors
          ${checked ? 'bg-ink border-ink' : 'border-line bg-transparent group-hover:border-ink/40'}`}
      >
        <svg viewBox="0 0 16 16" className={`w-3 h-3 text-canvas transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`}>
          <path
            d="M3.5 8.2 6.3 11 12.5 4.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className="text-sm text-ink/60">{label}</span>
    </label>
  );
}

function SocialButton({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-line bg-canvas text-sm text-ink/70 hover:border-ink/30 hover:-translate-y-0.5 active:scale-[0.97] transition-all"
    >
      {icon}
      {label}
    </button>
  );
}

function GoogleMark() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GithubMark() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
