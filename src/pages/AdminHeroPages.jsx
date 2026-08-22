import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import { adminApi } from '../services/adminApi';
import { uploadImageToCloudinary } from '../services/cloudinary';
import { AdminShell } from './AdminPages'; // Export AdminShell from AdminPages

export function AdminHeroSlidesPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const data = await adminApi('/api/admin/hero-slides');
      setSlides(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load slides');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await adminApi(`/api/admin/hero-slides/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchSlides();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const deleteSlide = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;
    try {
      await adminApi(`/api/admin/hero-slides/${id}`, {
        method: 'DELETE',
      });
      fetchSlides();
    } catch (err) {
      alert('Failed to delete slide');
    }
  };

  return (
    <AdminShell>
      <Seo title="Admin | Hero Slides" />
      <div className="admin-header">
        <h1>Hero Slides</h1>
        <Link className="button button-gold" to="/admin/hero/add">
          + Add Slide
        </Link>
      </div>

      {loading ? (
        <p>Loading slides...</p>
      ) : slides.length === 0 ? (
        <p>No slides found. The homepage will display the static fallback.</p>
      ) : (
        <div className="admin-list">
          {slides.map((slide) => (
            <div key={slide.id} className="admin-list-item" style={{ alignItems: 'center' }}>
              <div style={{ width: '80px', height: '50px', background: '#222', flexShrink: 0, marginRight: '20px' }}>
                {slide.imageUrl && (
                  <img src={slide.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div className="admin-list-info">
                <h3>{slide.headingLine1} {slide.headingLine2}</h3>
                <p>Order: {slide.order} | {slide.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="admin-list-actions">
                <button
                  className={`button ${slide.isActive ? 'button-outline' : 'button-gold'}`}
                  onClick={() => toggleActive(slide.id, slide.isActive)}
                  style={{ marginRight: '10px' }}
                >
                  {slide.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <Link className="button button-outline" to={`/admin/hero/edit/${slide.id}`}>
                  Edit
                </Link>
                <button
                  className="button button-outline"
                  style={{ color: '#fc6554', borderColor: '#fc6554', marginLeft: '10px' }}
                  onClick={() => deleteSlide(slide.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}

export function AdminHeroSlideForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [slide, setSlide] = useState({
    imageUrl: '',
    eyebrowText: '',
    headingLine1: '',
    headingLine2: '',
    description: '',
    primaryButtonText: '',
    primaryButtonLink: '',
    secondaryButtonText: '',
    secondaryButtonLink: '',
    badgeTextLine1: '',
    badgeTextLine2: '',
    order: 0,
    isActive: true,
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      adminApi(`/api/admin/hero-slides/${id}`)
        .then((data) => {
          setSlide(data);
          setLoading(false);
        })
        .catch(() => {
          alert('Failed to load slide');
          navigate('/admin/hero');
        });
    }
  }, [id, isEditing, navigate]);

  const update = (key, value) => setSlide({ ...slide, [key]: value });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      update('imageUrl', url);
    } catch (err) {
      alert('Failed to upload image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const save = async () => {
    if (!slide.imageUrl) {
      return alert('Image URL is required.');
    }
    setSaving(true);
    try {
      if (isEditing) {
        await adminApi(`/api/admin/hero-slides/${id}`, {
          method: 'PUT',
          body: JSON.stringify(slide),
        });
      } else {
        await adminApi('/api/admin/hero-slides', {
          method: 'POST',
          body: JSON.stringify(slide),
        });
      }
      navigate('/admin/hero');
    } catch (err) {
      alert(err.message || 'Failed to save slide');
      setSaving(false);
    }
  };

  if (loading) return <AdminShell><p>Loading...</p></AdminShell>;

  return (
    <AdminShell>
      <Seo title={`Admin | ${isEditing ? 'Edit' : 'Add'} Slide`} />
      <div className="admin-header">
        <h1>{isEditing ? 'Edit' : 'Add'} Hero Slide</h1>
        <button className="button button-gold" onClick={save} disabled={saving || imageUploading}>
          {saving ? 'Saving...' : 'Save Slide'}
        </button>
      </div>

      <div className="admin-form">
        <div className="admin-basic">
          <label className="full-field">
            Image URL (Upload or Paste)
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                value={slide.imageUrl}
                onChange={(e) => update('imageUrl', e.target.value)}
                placeholder="https://..."
                style={{ flex: 1 }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={imageUploading}
                style={{ width: '120px' }}
              />
            </div>
            {imageUploading && <span style={{ fontSize: '12px', color: '#888' }}>Uploading...</span>}
          </label>

          {slide.imageUrl && (
            <div className="full-field" style={{ marginTop: '10px' }}>
              <img src={slide.imageUrl} alt="Preview" style={{ maxWidth: '300px', borderRadius: '8px' }} />
            </div>
          )}
          
          <label>
            Order (Lowest shows first)
            <input type="number" value={slide.order} onChange={(e) => update('order', Number(e.target.value))} />
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
            <input type="checkbox" checked={slide.isActive} onChange={(e) => update('isActive', e.target.checked)} style={{ width: 'auto' }} />
            Is Active
          </label>

          <div className="full-field" style={{ marginTop: '30px' }}>
            <h2>Text Content</h2>
          </div>

          <label className="full-field">
            Eyebrow Text (e.g. BELL / DUBAI)
            <input value={slide.eyebrowText} onChange={(e) => update('eyebrowText', e.target.value)} />
          </label>

          <label>
            Heading Line 1 (Normal text)
            <input value={slide.headingLine1} onChange={(e) => update('headingLine1', e.target.value)} placeholder="Premium Technology." />
          </label>
          <label>
            Heading Line 2 (Italic text)
            <input value={slide.headingLine2} onChange={(e) => update('headingLine2', e.target.value)} placeholder="Simply BELL." />
          </label>

          <label className="full-field">
            Description
            <textarea value={slide.description} onChange={(e) => update('description', e.target.value)} />
          </label>

          <div className="full-field" style={{ marginTop: '30px' }}>
            <h2>Buttons & Badges</h2>
          </div>

          <label>
            Primary Button Text
            <input value={slide.primaryButtonText} onChange={(e) => update('primaryButtonText', e.target.value)} placeholder="Shop Now" />
          </label>
          <label>
            Primary Button Link
            <input value={slide.primaryButtonLink} onChange={(e) => update('primaryButtonLink', e.target.value)} placeholder="/shop" />
          </label>

          <label>
            Secondary Button Text
            <input value={slide.secondaryButtonText} onChange={(e) => update('secondaryButtonText', e.target.value)} placeholder="Explore Deals" />
          </label>
          <label>
            Secondary Button Link
            <input value={slide.secondaryButtonLink} onChange={(e) => update('secondaryButtonLink', e.target.value)} placeholder="/category/deals" />
          </label>

          <label>
            Badge Text Line 1 (e.g. THE EDIT)
            <input value={slide.badgeTextLine1} onChange={(e) => update('badgeTextLine1', e.target.value)} />
          </label>
          <label>
            Badge Text Line 2 (e.g. 2026)
            <input value={slide.badgeTextLine2} onChange={(e) => update('badgeTextLine2', e.target.value)} />
          </label>
        </div>
      </div>
    </AdminShell>
  );
}
