import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MailCheck, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { AuthShell } from '../Components/Auth/AuthShell';
import { FadeIn } from '../lib/FadeIn';

export default function VerifyEmailPage() {
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? '';
  const resendVerificationEmail = useAuthStore((s) => s.resendVerificationEmail);

  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');

  const handleResend = async () => {
    if (!email || resending) return;
    setResending(true);
    setResendStatus('idle');
    setResendMessage('');
    try {
      await resendVerificationEmail(email);
      setResendStatus('success');
      setResendMessage(`A new confirmation link was sent to ${email}.`);
    } catch (err) {
      setResendStatus('error');
      setResendMessage(err instanceof Error ? err.message : 'Could not resend the confirmation email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      title="Verify your email"
      subtitle="One last step before you're in"
      headline={
        <>
          Confirm
          <br />
          your
          <br />
          identity.
        </>
      }
      blurb="We sent you a confirmation link to activate your account and keep your finances secure."
    >
      <FadeIn className="mt-7">
        <div className="rounded-xl border border-line bg-canvas p-6 text-center">
          <div className="mx-auto w-10 h-10 rounded-full bg-moss/10 flex items-center justify-center">
            <MailCheck className="w-5 h-5 text-moss" />
          </div>
          <p className="mt-4 text-sm text-ink/60 leading-relaxed">
            We sent a confirmation link to
            <br />
            <span className="font-medium text-ink">{email || 'your email address'}</span>.
            <br />
            Click the link to activate your account, then sign in.
          </p>
          <p className="mt-3 text-xs text-ink/40">Didn't get the email? Check your spam folder or resend it below.</p>

          <button
            onClick={() => void handleResend()}
            disabled={resending || !email}
            className="mt-5 flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-lg bg-ink text-canvas text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-ink/90"
          >
            {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MailCheck className="w-4 h-4" />}
            {resending ? 'Resending…' : 'Resend confirmation email'}
          </button>

          {resendStatus === 'success' && <p className="mt-3 text-xs text-moss">{resendMessage}</p>}
          {resendStatus === 'error' && <p className="mt-3 text-xs text-clay">{resendMessage}</p>}
        </div>
      </FadeIn>

      <FadeIn delay={0.1} className="mt-6 text-center text-sm text-ink/50">
        Already verified?{' '}
        <Link
          to="/login"
          className="inline-flex items-center gap-1 font-medium text-ink hover:text-clay transition-colors"
        >
          Go to sign in
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </FadeIn>
    </AuthShell>
  );
}
