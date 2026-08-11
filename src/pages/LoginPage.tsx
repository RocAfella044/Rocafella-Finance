import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { AuthShell } from '../Components/Auth/AuthShell';
import { FloatingField, IconSwap, SubmitError, SubmitButton, SocialButtons } from '../Components/Auth/fields';
import { FadeIn } from '../lib/FadeIn';
import { Divider } from '../lib/Divider';

type FormErrors = Partial<Record<'email' | 'password', string>>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const value = identifier.trim();
    if (!value) {
      newErrors.email = 'Email or phone number is required';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) &&
      !/^[0-9]{10}$/.test(value)
    ) {
      newErrors.email = 'Enter a valid email address or phone number';
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
      await login(identifier.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "We couldn't sign you in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your account"
      headline={
        <>
          Trust and
          <br />
          Technology
          <br />
          at the same time.
        </>
      }
      blurb="Sign in to track, revisit, and pick up where you left it."
    >
      <SubmitError message={submitError} />

      <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
        <FadeIn>
          <FloatingField
            id="identifier"
            type="text"
            label="Email or mobile number"
            value={identifier}
            onChange={setIdentifier}
            icon={<Mail className="w-4.5 h-4.5" />}
            error={errors.email}
            autoComplete="username"
          />
        </FadeIn>

        <FadeIn delay={0.05}>
          <FloatingField
            id="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            value={password}
            onChange={setPassword}
            icon={<Lock className="w-4.5 h-4.5" />}
            error={errors.password}
            autoComplete="current-password"
            trailing={<IconSwap show={showPassword} onToggle={() => setShowPassword((s) => !s)} />}
          />
        </FadeIn>

        <FadeIn delay={0.1} className="flex items-center justify-between pt-1">
          <Checkbox checked={rememberMe} onChange={setRememberMe} label="Remember me" />
          <a href="#" className="text-sm text-ink/50 hover:text-clay transition-colors">
            Forgot password?
          </a>
        </FadeIn>

        <FadeIn delay={0.15}>
          <SubmitButton loading={loading} label="Sign in" loadingLabel="Signing in" />
        </FadeIn>
      </form>

      <Divider label="or continue with" delay={0.2} className="mt-8" />
      <SocialButtons delay={0.25} />

      <FadeIn delay={0.3} className="mt-8 text-center text-sm text-ink/50">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-ink hover:text-clay transition-colors">
          Create one
        </Link>
      </FadeIn>
    </AuthShell>
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
        <svg viewBox="0 0 16 16" className="w-3 h-3 text-canvas">
          <motion.path
            d="M3.5 8.2 6.3 11 12.5 4.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
            transition={{ duration: 0.2 }}
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
