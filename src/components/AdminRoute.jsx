import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged, getIdTokenResult } from 'firebase/auth';

export default function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null); // null = checking, true = authorized, false = unauthorized
  const location = useLocation();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const tokenResult = await getIdTokenResult(user, true);
        setIsAdmin(tokenResult.claims?.admin === true);
      } catch (err) {
        console.error('Error verifying admin permissions:', err);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isAdmin === null) {
    return (
      <div className="shell empty-state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span className="live-pulse" style={{ display: 'inline-block', width: 28, height: 28, margin: '0 auto 16px' }} />
        <h2>Verifying Administrator Access…</h2>
        <p>Please wait while we confirm your security credentials.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
