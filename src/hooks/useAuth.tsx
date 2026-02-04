import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type RoleStatus = 'loading' | 'admin' | 'not-admin' | 'error';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  roleStatus: RoleStatus;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roleStatus, setRoleStatus] = useState<RoleStatus>('loading');
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminRole = async (userId: string): Promise<RoleStatus> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error checking admin role:', error);
        return 'error';
      }
      
      if (data && data.length > 0) {
        const roles = data.map(r => r.role);
        return (roles.includes('admin') || roles.includes('manager')) ? 'admin' : 'not-admin';
      }
      return 'not-admin';
    } catch (err) {
      console.error('Error checking admin role:', err);
      return 'error';
    }
  };

  useEffect(() => {
    let currentUserId: string | null = null;

    // IMPORTANT: onAuthStateChange callback must stay synchronous to avoid deadlocks.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Only re-check role if user changed (not on token refresh)
          if (currentUserId !== session.user.id) {
            currentUserId = session.user.id;
            setRoleStatus('loading');
            setTimeout(() => {
              checkAdminRole(session.user.id).then((status) => {
                setRoleStatus(status);
                setIsLoading(false);
              });
            }, 0);
          }
        } else {
          currentUserId = null;
          setRoleStatus('not-admin');
          setIsLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        currentUserId = session.user.id;
        setRoleStatus('loading');
        checkAdminRole(session.user.id).then((status) => {
          setRoleStatus(status);
          setIsLoading(false);
        });
      } else {
        setRoleStatus('not-admin');
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRoleStatus('not-admin');
  };

  const isAdmin = roleStatus === 'admin';

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isLoading, roleStatus, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
