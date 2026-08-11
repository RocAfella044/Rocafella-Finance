import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type User = { id: string; email: string; name?: string };

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  initialized: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
};

const mapUser = (u: { id: string; email?: string; user_metadata?: Record<string, unknown> }): User => ({
  id: u.id,
  email: u.email ?? '',
  name: (u.user_metadata?.full_name as string | undefined) ?? undefined,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      initialized: false,

      login: async (identifier, password) => {
        if (!isSupabaseConfigured) {
          throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
        }

        const value = identifier.trim();
        let email = value;

        if (/^\+977[0-9]{10}$/.test(value)) {
          const { data, error } = await supabase.from('profiles').select('email').eq('phone', value).single();
          if (error || !data?.email) {
            throw new Error('No account found for that phone number.');
          }
          email = data.email;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          throw new Error('Enter a valid email address or phone number.');
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.user) throw new Error('Sign in failed. Please try again.');
        set({ user: mapUser(data.user), isAuthenticated: true });
      },

      register: async (name, email, password, phone) => {
        if (!isSupabaseConfigured) {
          throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, phone } },
        });
        if (error) throw error;
        if (!data.session || !data.user) {
          throw new Error('Account created. Check your email to confirm your signup, then sign in.');
        }

        const profileUpdate = await supabase.from('profiles').update({ phone }).eq('id', data.user.id);
        if (profileUpdate.error) {
          throw profileUpdate.error;
        }

        set({ user: mapUser(data.user), isAuthenticated: true });
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'rocafella_user',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);

if (isSupabaseConfigured) {
  supabase.auth.getSession().then(({ data }) => {
    if (data.session?.user) {
      useAuthStore.setState({ user: mapUser(data.session.user), isAuthenticated: true });
    }
    useAuthStore.setState({ initialized: true });
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({
      user: session?.user ? mapUser(session.user) : null,
      isAuthenticated: Boolean(session?.user),
      initialized: true,
    });
  });
} else {
  useAuthStore.setState({ initialized: true });
}
