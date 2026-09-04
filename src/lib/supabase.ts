import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnvUrl = (): string => {
  return (
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.SUPABASE_URL ||
    (typeof window !== 'undefined' ? localStorage.getItem('reveg_supabase_url') || '' : '')
  );
};

const getEnvKey = (): string => {
  return (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.SUPABASE_ANON_KEY ||
    (typeof window !== 'undefined' ? localStorage.getItem('reveg_supabase_anon_key') || '' : '')
  );
};

export const isSupabaseConfigured = (): boolean => {
  const url = getEnvUrl();
  const key = getEnvKey();
  return Boolean(url && key && url.startsWith('http'));
};

export const getSupabaseConfig = (): { url: string; hasKey: boolean } => {
  const url = getEnvUrl();
  const key = getEnvKey();
  return {
    url,
    hasKey: Boolean(key && key.length > 20),
  };
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const url = getEnvUrl();
  const key = getEnvKey();
  if (!clientInstance) {
    clientInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return clientInstance;
};

export const configureSupabaseCredentials = (url: string, anonKey: string): boolean => {
  if (typeof window === 'undefined') return false;
  if (!url || !anonKey || !url.startsWith('http')) {
    return false;
  }
  localStorage.setItem('reveg_supabase_url', url.trim());
  localStorage.setItem('reveg_supabase_anon_key', anonKey.trim());
  if (clientInstance) {
    try {
      clientInstance.removeAllChannels();
    } catch {
      // Ignored
    }
    clientInstance = null;
  }
  // Instantiate new client
  return Boolean(getSupabaseClient());
};

export const clearCustomSupabaseCredentials = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('reveg_supabase_url');
  localStorage.removeItem('reveg_supabase_anon_key');
  if (clientInstance) {
    try {
      clientInstance.removeAllChannels();
    } catch {
      // Ignored
    }
    clientInstance = null;
  }
};

export const bootstrapSupabaseFromBackend = async (): Promise<boolean> => {
  if (isSupabaseConfigured()) return true;
  try {
    const res = await fetch('/api/config/supabase-public');
    if (res.ok) {
      const data = await res.json();
      if (data.configured && data.supabaseUrl && data.supabaseAnonKey) {
        return configureSupabaseCredentials(data.supabaseUrl, data.supabaseAnonKey);
      }
    }
  } catch {
    // Ignored
  }
  return false;
};

export const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;
