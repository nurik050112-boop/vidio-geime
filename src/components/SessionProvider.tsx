import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { browserStorage } from '../lib/browserStorage';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type Session = { user: User | null; guest: boolean; ready: boolean; enterGuest: () => void };
const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [guest, setGuest] = useState(() => browserStorage.getItem('dragon-game-guest-mode') === 'yes');
  const [ready, setReady] = useState(!isSupabaseConfigured || guest);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && (event === 'SIGNED_IN' || !guest)) {
        setGuest(false);
        browserStorage.removeItem('dragon-game-guest-mode');
      }
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, [guest]);
  const enterGuest = () => {
    browserStorage.setItem('dragon-game-guest-mode', 'yes');
    setGuest(true);
    setReady(true);
  };
  return <SessionContext.Provider value={{ user, guest, ready, enterGuest }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error('SessionProvider is missing');
  return session;
}
