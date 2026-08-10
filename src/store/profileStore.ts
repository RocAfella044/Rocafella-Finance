import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type Profile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  accountNumber: string;
  emailVerified: boolean;
  passwordChangedAt: string | null;
  createdAt: string;
  lastSignInAt: string | null;
};

export type ProfileCounts = {
  transactions: number;
  orders: number;
  clients: number;
};

type ProfileState = {
  profile: Profile | null;
  counts: ProfileCounts | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateFullName: (fullName: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  changePassword: (password: string) => Promise<void>;
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  counts: null,
  loading: false,
  saving: false,
  error: null,

  fetchProfile: async () => {
    if (!isSupabaseConfigured) {
      set({ error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.' });
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, role, account_number, email_verified, password_changed_at, created_at')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const emailVerified = Boolean(user.email_confirmed_at ?? data.email_verified);

      if (data.email_verified !== emailVerified) {
        void supabase
          .from('profiles')
          .update({ email_verified: emailVerified })
          .eq('id', user.id);
      }

      const [txRes, orderRes, clientRes] = await Promise.all([
        supabase.from('transactions').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('clients').select('id', { count: 'exact', head: true }),
      ]);

      set({
        profile: {
          id: data.id,
          fullName: data.full_name ?? '',
          email: data.email,
          phone: data.phone ?? '',
          role: data.role,
          accountNumber: data.account_number ?? '',
          emailVerified,
          passwordChangedAt: data.password_changed_at ?? null,
          createdAt: data.created_at,
          lastSignInAt: user.last_sign_in_at ?? null,
        },
        counts: {
          transactions: txRes.count ?? 0,
          orders: orderRes.count ?? 0,
          clients: clientRes.count ?? 0,
        },
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load profile.',
      });
    }
  },

  updateFullName: async (fullName) => {
    const profile = get().profile;
    if (!profile) return;
    set({ saving: true, error: null });
    try {
      const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', profile.id);
      if (error) throw error;
      await supabase.auth.updateUser({ data: { full_name: fullName } });
      set({ profile: { ...get().profile!, fullName }, saving: false });
    } catch (error) {
      set({ saving: false, error: error instanceof Error ? error.message : 'Failed to update profile.' });
      throw error;
    }
  },

  resendVerification: async () => {
    const profile = get().profile;
    if (!profile) return;
    set({ saving: true, error: null });
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: profile.email,
      });
      if (error) throw error;
      set({ saving: false });
    } catch (error) {
      set({ saving: false, error: error instanceof Error ? error.message : 'Failed to resend verification email.' });
      throw error;
    }
  },

  changePassword: async (password) => {
    set({ saving: true, error: null });
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase
        .from('profiles')
        .update({ password_changed_at: new Date().toISOString() })
        .eq('id', get().profile?.id);
      set({ saving: false, profile: { ...get().profile!, passwordChangedAt: new Date().toISOString() } });
    } catch (error) {
      set({ saving: false, error: error instanceof Error ? error.message : 'Failed to change password.' });
      throw error;
    }
  },
}));
