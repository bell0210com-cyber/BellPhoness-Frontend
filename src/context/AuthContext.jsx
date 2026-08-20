import { createContext, useContext, useEffect, useState } from 'react';
import { subscribeToAuth, subscribeToProfile } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = subscribeToAuth((authUser) => {
      setUser(authUser);
      if (!authUser) {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (user?.uid) {
      const unsubscribeProfile = subscribeToProfile(user.uid, (data) => {
        setProfile(data);
        setLoading(false);
      });
      return unsubscribeProfile;
    }
  }, [user]);

  // Only show name when fully resolved — never flash email as the name
  const firstName = loading
    ? null  // null = still loading
    : profile?.name
      ? profile.name.trim().split(' ')[0]
      : user?.displayName
        ? user.displayName.trim().split(' ')[0]
        : 'Account';

  return (
    <AuthContext.Provider value={{ user, profile, loading, firstName }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
