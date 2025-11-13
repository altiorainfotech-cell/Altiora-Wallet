import { useEffect, useState } from 'react';
import { getMe } from '@/lib/api';
import { getItem, setItem } from '@/lib/storage';

export interface User {
  id: string;
  email: string;
  displayName?: string | null;
  profilePicture?: string | null;
  provider: 'email' | 'google';
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    console.log('useUser: Fetching user data...');
    try {
      setLoading(true);
      setError(null);
      const data = await getMe();
      console.log('useUser: User data received:', JSON.stringify(data, null, 2));
      setUser(data.user);
      try {
        if (data?.user?.displayName) {
          await setItem('lastUserName', data.user.displayName);
        }
      } catch {}
    } catch (err: any) {
      console.error('useUser: Failed to fetch user - Full error:', err);
      console.error('useUser: Error message:', err.message);
      console.error('useUser: Error stack:', err.stack);
      // Fallback: use cached display name or default temporary name
      try {
        const cached = await getItem('lastUserName');
        const fallbackName = cached || process.env.EXPO_PUBLIC_FALLBACK_USER_NAME || 'Altiora Infotech';
        if (fallbackName) {
          setUser({ id: 'local', email: '', displayName: fallbackName, profilePicture: null, provider: 'google' });
          setError(null);
        } else {
          setError(err.message || 'Failed to fetch user');
          setUser(null);
        }
      } catch {
        setError(err.message || 'Failed to fetch user');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
}
