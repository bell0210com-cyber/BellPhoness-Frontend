import { useState } from 'react';
import { getAuth, signOut, deleteUser } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import PageHero from '../components/PageHero';
import Seo from '../components/Seo';

export default function PrivacyCenterPage() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    try {
      await deleteUser(auth.currentUser);
      navigate('/');
    } catch (err) {
      setError(
        err.code === 'auth/requires-recent-login'
          ? 'Please sign in again before deleting your account.'
          : err.message
      );
    }
  };

  return (
    <>
      <Seo title="Privacy Center | BELL" description="Manage your BELL account privacy and data." />
      <PageHero eyebrow="BELL / ACCOUNT" title={<>Privacy <em>center.</em></>} />

      <section className="shell legal-page">
        <p className="eyebrow">YOUR DATA</p>
        <h2>Manage your information</h2>
        <p>
          BELL stores your account details (name, email, phone, addresses) and order history to
          provide our services. You can request a copy of your data or delete your account below.
        </p>

        <h3>Download your data</h3>
        <p>
          To request an export of your personal data, contact our support team via the Contact page
          and we will provide it within a reasonable time.
        </p>

        <h3>Notification preferences</h3>
        <label className="check-label">
          <input type="checkbox" defaultChecked /> Order updates via email
        </label>
        <label className="check-label">
          <input type="checkbox" defaultChecked /> Promotional offers and newsletters
        </label>

        <h3>Delete your account</h3>
        <p>
          Deleting your account permanently removes your profile and login access. Your past orders
          are retained for legal and accounting purposes.
        </p>

        {error && <div className="form-state error">{error}</div>}

        {!confirming ? (
          <button className="button button-dark" onClick={() => setConfirming(true)}>
            Delete my account
          </button>
        ) : (
          <div className="form-state error">
            Are you sure? This cannot be undone.
            <div style={{ marginTop: 12 }}>
              <button className="button button-dark" onClick={handleDelete} style={{ marginRight: 10 }}>
                Yes, delete permanently
              </button>
              <button className="text-button" onClick={() => setConfirming(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}