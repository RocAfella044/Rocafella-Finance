import { create } from 'zustand';
import { supabase, isSupabaseConfigured, SUPABASE_CONFIG_ERROR } from '../lib/supabase';
import { isValidEmail, isValidPhone } from '../lib/validation';

export type User = { id: string; email: string; name?: string };

type AuthUser = { id: string; email?: string; user_metadata?: Record<string, unknown> };

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  initialized: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
  resendVerificationEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

const mapUser = (u: AuthUser): User => ({
  id: u.id,
  email: u.email ?? '',
  name: (u.user_metadata?.full_name as string | undefined) ?? undefined,
});

const isEmailVerified = (user: { email_confirmed_at?: string | null } | undefined | null) =>
  Boolean(user?.email_confirmed_at);

const requireSupabase = () => {
  if (!isSupabaseConfigured) throw new Error(SUPABASE_CONFIG_ERROR);
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  initialized: false,

  login: async (identifier, password) => {
    requireSupabase();

    const value = identifier.trim();
    let email = value;

    if (isValidPhone(value)) {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .or(`phone.eq.+977${value},phone.eq.${value},phone.eq.977${value}`)
        .single();
      if (error || !data?.email) {
        throw new Error('No account found for that phone number.');
      }
      email = data.email;
    } else if (!isValidEmail(value)) {
      throw new Error('Enter a valid email address or phone number.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('Sign in failed. Please try again.');

    if (!isEmailVerified(data.user)) {
      await supabase.auth.signOut();
      throw new Error('Please verify your email before signing in. Check your inbox for the confirmation link.');
    }

    set({ user: mapUser(data.user), isAuthenticated: true });
  },

  register: async (name, email, password, phone) => {
    requireSupabase();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, phone } },
    });
    if (error) throw error;
    if (!data.user) throw new Error('Account creation failed. Please try again.');

    if (data.session) {
      set({ user: mapUser(data.user), isAuthenticated: true });
      return false;
    }

    return true;
  },

  resendVerificationEmail: async (email) => {
    requireSupabase();

    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
}));

if (isSupabaseConfigured) {
  supabase.auth.getSession().then(async ({ data }) => {
    const user = data.session?.user;
    if (user && isEmailVerified(user)) {
      useAuthStore.setState({ user: mapUser(user), isAuthenticated: true });
    } else if (user) {
      await supabase.auth.signOut();
    }
    useAuthStore.setState({ initialized: true });
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    const verifiedUser = session?.user && isEmailVerified(session.user) ? session.user : null;
    useAuthStore.setState({
      user: verifiedUser ? mapUser(verifiedUser) : null,
      isAuthenticated: Boolean(verifiedUser),
      initialized: true,
    });
  });
} else {
  useAuthStore.setState({ initialized: true });
}