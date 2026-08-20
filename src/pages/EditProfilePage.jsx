import { useEffect, useState } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import Seo from '../components/Seo';
import { db } from '../services/firebaseClient';

export default function EditProfilePage() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [values, setValues] = useState({ name: '', phone: '' });
  const [state, setState] = useState({ kind: '', message: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'customers', user.uid)).then((snap) => {
      const data = snap.exists() ? snap.data() : {};
      setValues({
        name: data.name || user.displayName || '',
        phone: data.phone || '',
      });
      setLoading(false);
    });
  }, [user]);

  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const save = async (event) => {
    event.preventDefault();
    setState({ kind: 'loading', message: '' });

    try {
      await updateProfile(user, { displayName: values.name.trim() });

      await setDoc(
        doc(db, 'customers', user.uid),
        {
          uid: user.uid,
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: user.email,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      setState({ kind: 'success', message: 'Profile updated successfully.' });
    } catch (error) {
      setState({ kind: 'error', message: error.message });
    }
  };

  if (!user) {
    return (
      <div className="empty-state">
        <span>✦</span>
        <h2>Please sign in</h2>
        <p>Sign in to edit your profile.</p>
        <Link className="button button-gold" to="/login">
          Sign In <span>→</span>
        </Link>
      </div>
    );
  }

  if (loading) return null;

  return (
    <>
      <Seo title="Edit Profile | BELL" description="Update your BELL account details." />
      <PageHero title={<>Edit <em>profile.</em></>} />

      <section className="shell" style={{ maxWidth: 560, padding: '70px 0 110px' }}>
        <form className="address-form" onSubmit={save}>
          <h2>Profile information</h2>

          {state.message && (
            <div className={`form-state ${state.kind === 'success' ? 'success' : state.kind === 'loading' ? 'loading' : 'error'}`}>
              {state.message}
            </div>
          )}

          <label>
            Full Name
            <input value={values.name} onChange={(e) => update('name', e.target.value)} required />
          </label>

          <label>
            Phone
            <input value={values.phone} onChange={(e) => update('phone', e.target.value)} />
          </label>

          <label>
            Email
            <input value={user.email || ''} disabled />
          </label>

          <button className="button button-gold" disabled={state.kind === 'loading'}>
            {state.kind === 'loading' ? 'Saving…' : 'Save changes'} →
          </button>
        </form>
      </section>
    </>
  );
}