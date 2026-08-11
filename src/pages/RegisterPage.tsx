import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { AuthShell } from '../Components/Auth/AuthShell';
import { FloatingField, IconSwap, StrengthBar, SubmitError, SubmitButton, SocialButtons } from '../Components/Auth/fields';
import { FadeIn } from '../lib/FadeIn';
import { Divider } from '../lib/Divider';

type FormErrors = Partial<Record<'name' | 'email' | 'phone' | 'password' | 'confirmPassword', string>>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(phone.trim())) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await register(name.trim(), email, password, `+977${phone.trim()}`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "We couldn't create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Sign up to get started"
      headline={
        <>
          You affect your
          <br />
          World
          <br />
          by what you choose.
        </>
      }
      blurb="platform that empowers users to take control of their future. With our innovative tools and resources, manage your finances with ease."
    >
      <SubmitError message={submitError} />

      <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
        <FadeIn>
          <FloatingField
            id="name"
            type="text"
            label="Full name"
            value={name}
            onChange={setName}
            icon={<User className="w-4.5 h-4.5" />}
            error={errors.name}
            autoComplete="name"
          />
        </FadeIn>

        <FadeIn delay={0.04}>
          <FloatingField
            id="phone"
            type="tel"
            label="Mobile number"
            value={phone}
            onChange={setPhone}
            icon={<Phone className="w-4.5 h-4.5" />}
            error={errors.phone}
            autoComplete="tel"
          />
        </FadeIn>

        <FadeIn delay={0.08}>
          <FloatingField
            id="email"
            type="email"
            label="Email address"
            value={email}
            onChange={setEmail}
            icon={<Mail className="w-4.5 h-4.5" />}
            error={errors.email}
            autoComplete="email"
          />
        </FadeIn>

        <FadeIn delay={0.08}>
          <FloatingField
            id="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            value={password}
            onChange={setPassword}
            icon={<Lock className="w-4.5 h-4.5" />}
            error={errors.password}
            autoComplete="new-password"
            trailing={<IconSwap show={showPassword} onToggle={() => setShowPassword((s) => !s)} />}
          />
          <StrengthBar password={password} error={errors.password} />
        </FadeIn>

        <FadeIn delay={0.12}>
          <FloatingField
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            icon={<Lock className="w-4.5 h-4.5" />}
            error={errors.confirmPassword}
            autoComplete="new-password"
            trailing={<IconSwap show={showConfirm} onToggle={() => setShowConfirm((s) => !s)} />}
          />
        </FadeIn>

        <FadeIn delay={0.16}>
          <SubmitButton loading={loading} label="Create account" loadingLabel="Creating account" />
        </FadeIn>
      </form>

      <Divider label="or continue with" delay={0.2} className="mt-8" />
      <SocialButtons delay={0.24} />

      <FadeIn delay={0.28} className="mt-8 text-center text-sm text-ink/50">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-ink hover:text-clay transition-colors">
          Sign in
        </Link>
      </FadeIn>
    </AuthShell>
  );
}
