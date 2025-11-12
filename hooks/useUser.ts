import { useEffect, useState } from 'react';
import { getMe } from '@/lib/api';

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
    } catch (err: any) {
      console.error('useUser: Failed to fetch user - Full error:', err);
      console.error('useUser: Error message:', err.message);
      console.error('useUser: Error stack:', err.stack);
      // If error is 401 or auth-related, user is not logged in
      if (err.message?.includes('401') || err.message?.includes('auth')) {
        console.log('useUser: Not authenticated');
        setUser(null);
      }
      setError(err.message || 'Failed to fetch user');
      setUser(null);
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
