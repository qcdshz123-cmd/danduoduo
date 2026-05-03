import { supabase } from './supabase';

export interface SignInParams {
  phone: string;
  password: string;
}

export interface SignUpParams {
  phone: string;
  password: string;
  displayName: string;
  storeName: string;
}

export const authService = {
  async signIn({ phone, password }: SignInParams) {
    // Use phone as email (Supabase auth requires email; phone login via SMS OTP is Phase 2)
    const email = `${phone}@sudinghuo.app`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signUp({ phone, password, displayName, storeName }: SignUpParams) {
    const email = `${phone}@sudinghuo.app`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName, store_name: storeName, phone },
      },
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, stores(*)')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return profile;
  },

  async resetPassword(phone: string) {
    const email = `${phone}@sudinghuo.app`;
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },
};
