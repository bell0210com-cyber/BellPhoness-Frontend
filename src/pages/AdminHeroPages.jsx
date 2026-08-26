import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import { adminApi } from '../services/adminApi';
import { uploadImageToCloudinary } from '../services/cloudinary';
import { AdminShell } from './AdminPages';

export function AdminHeroSlidesPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const data = await adminApi.heroSlides();
      setSlides(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert('Failed to load slides');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await adminApi.updateHeroSlide(id, { isActive: !currentStatus });
      fetchSlides();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const deleteSlide = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hero slide?')) return;
    try {
      await adminApi.deleteHeroSlide(id);
      fetchSlides();
    } catch (err) {
      alert('Failed to delete slide');
    }
  };

  const isMaxReached = slides.length >= 5;

  return (
    <AdminShell>
      <Seo title="Admin | Hero Carousel Slides" />
      <div className="admin-header">
        <div>
          <h1>Hero Carousel Slides</h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '4px 0 0' }}>
            Manage homepage hero banners, typography, campaign highlights, and promotional callouts.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '0.05em',
              background: isMaxReached ? 'rgba(252, 101, 84, 0.15)' : 'rgba(190, 154, 93, 0.15)',
              color: isMaxReached ? '#fc6554' : 'var(--gold)',
              border: `1px solid ${isMaxReached ? 'rgba(252, 101, 84, 0.4)' : 'rgba(190, 154, 93, 0.3)'}`,
            }}
          >
            {slides.length} / 5 SLIDES {isMaxReached ? '(MAX REACHED)' : ''}
          </span>

          {isMaxReached ? (
            <button
              type="button"
              className="button button-outline"
              disabled
              style={{
                opacity: 0.45,
                cursor: 'not-allowed',
                fontSize: '12px',
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
              title="Maximum limit of 5 hero slides reached"
            >
              + Add New Slide (Max Reached)
            </button>
          ) : (
            <Link className="button button-gold" to="/admin/hero/add">
              + Add New Slide
            </Link>
          )}
        </div>
      </div>

      {isMaxReached && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(190, 154, 93, 0.12) 0%, rgba(20, 18, 16, 0.6) 100%)',
            border: '1px solid rgba(190, 154, 93, 0.3)',
            padding: '12px 18px',
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#eae6df',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <span>
            📌 <strong>5-Slide Maximum Limit Reached:</strong> To add a new slide, please edit or delete an existing one.
          </span>
          <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: '800', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
            5 OF 5 SLOTS IN USE
          </span>
        </div>
      )}

      {loading ? (
        <p>Loading slides...</p>
      ) : slides.length === 0 ? (
        <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center', background: '#181818', borderRadius: '8px' }}>
          <p style={{ color: 'var(--muted)', marginBottom: '15px' }}>No hero slides found in database (using default fallback banners on storefront).</p>
          <Link className="button button-gold" to="/admin/hero/add">
            + Create First Slide
          </Link>
        </div>
      ) : (
        <div className="admin-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {slides.map((slide) => {
            const heading = slide.headingLine1 || slide.title || 'Untitled Slide';
            const badge = slide.headingLine2 || '';
            const offer = slide.badgeTextLine1 ? `${slide.badgeTextLine1} ${slide.badgeTextLine2 || ''}` : '';
            const targetLink = slide.primaryButtonLink || slide.link || '';

            return (
              <div
                key={slide.id}
                className="admin-list-item"
                style={{
                  alignItems: 'center',
                  background: '#181818',
                  padding: '16px 20px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: '130px',
                    height: '75px',
                    background: '#0e0e0e',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    marginRight: '20px',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  {slide.imageUrl ? (
                    <img
                      src={slide.imageUrl}
                      alt={heading}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#141414' }}
                    />
                  ) : (
                    <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#555', fontSize: '11px' }}>
                      No Image
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="admin-list-info" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        background: slide.isActive ? 'rgba(71, 115, 76, 0.2)' : 'rgba(160, 68, 50, 0.2)',
                        color: slide.isActive ? '#62c270' : '#fc6554',
                        border: `1px solid ${slide.isActive ? '#47734c' : '#a04432'}`
                      }}
                    >
                      {slide.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      Order: <b>{slide.order ?? 0}</b>
                    </span>
                    {badge && (
                      <span style={{ fontSize: '11px', padding: '2px 6px', background: 'var(--gold)', color: '#111', fontWeight: 'bold', borderRadius: '3px' }}>
                        {badge}
                      </span>
                    )}
                  </div>

                  <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: '#fff' }}>
                    {heading}
                  </h3>

                  {offer && (
                    <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'var(--gold)' }}>
                      🏷️ Offer: {offer} {slide.couponCode ? `(Code: ${slide.couponCode})` : ''}
                    </p>
                  )}

                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
                    Button: <b>{slide.primaryButtonText || 'SHOP NOW'}</b> → <code>{targetLink || '/shop'}</code>
                  </p>
                </div>

                {/* Actions */}
                <div className="admin-list-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    className={`button ${slide.isActive ? 'button-outline' : 'button-gold'}`}
                    onClick={() => toggleActive(slide.id, slide.isActive)}
                    style={{ fontSize: '12px', padding: '8px 14px' }}
                  >
                    {slide.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <Link
                    className="button button-outline"
                    to={`/admin/hero/edit/${slide.id}`}
                    style={{ fontSize: '12px', padding: '8px 14px' }}
                  >
                    Edit
                  </Link>
                  <button
                    className="button button-outline"
                    style={{ color: '#fc6554', borderColor: '#a04432', fontSize: '12px', padding: '8px 14px' }}
                    onClick={() => deleteSlide(slide.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
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
    eyebrowText: 'BELL / DUBAI',
    headingLine1: '',
    headingLine2: 'SALE',
    description: '',
    badgeTextLine1: '',
    badgeTextLine2: '',
    couponCode: '',
    primaryButtonText: 'SHOP NOW',
    primaryButtonLink: '/shop',
    secondaryButtonText: '',
    secondaryButtonLink: '',
    order: 0,
    isActive: true,
  });

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      adminApi.heroSlide(id)
        .then((data) => {
          setSlide({
            imageUrl: data.imageUrl || '',
            eyebrowText: data.eyebrowText || 'BELL / DUBAI',
            headingLine1: data.headingLine1 || data.title || '',
            headingLine2: data.headingLine2 || '',
            description: data.description || '',
            badgeTextLine1: data.badgeTextLine1 || '',
            badgeTextLine2: data.badgeTextLine2 || '',
            couponCode: data.couponCode || data.badgeText || '',
            primaryButtonText: data.primaryButtonText || 'SHOP NOW',
            primaryButtonLink: data.primaryButtonLink || data.link || '/shop',
            secondaryButtonText: data.secondaryButtonText || '',
            secondaryButtonLink: data.secondaryButtonLink || '',
            order: data.order ?? 0,
            isActive: data.isActive !== false,
          });
          setLoading(false);
        })
        .catch(() => {
          alert('Failed to load slide');
          navigate('/admin/hero');
        });
    } else {
      // Enforce 5-slide limit when attempting to create a new slide
      adminApi.heroSlides()
        .then((slides) => {
          if (Array.isArray(slides) && slides.length >= 5) {
            alert('Maximum limit of 5 hero slides has already been reached. Please edit or delete an existing slide.');
            navigate('/admin/hero');
          }
        })
        .catch((err) => console.error('Error checking slide count:', err));
    }
  }, [id, isEditing, navigate]);

  const update = (key, value) => setSlide((prev) => ({ ...prev, [key]: value }));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      update('imageUrl', url);
    } catch (err) {
      alert('Failed to upload image. Please check format and try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const save = async () => {
    if (!slide.imageUrl.trim()) {
      return alert('Product / Banner image is required.');
    }

    setSaving(true);
    try {
      const payload = {
        ...slide,
        imageUrl: slide.imageUrl.trim(),
        headingLine1: slide.headingLine1.trim(),
        headingLine2: slide.headingLine2.trim(),
        eyebrowText: slide.eyebrowText.trim(),
        description: slide.description.trim(),
        badgeTextLine1: slide.badgeTextLine1.trim(),
        badgeTextLine2: slide.badgeTextLine2.trim(),
        couponCode: slide.couponCode.trim(),
        primaryButtonText: slide.primaryButtonText.trim() || 'SHOP NOW',
        primaryButtonLink: slide.primaryButtonLink.trim() || '/shop',
        link: slide.primaryButtonLink.trim() || '/shop',
        order: Number(slide.order) || 0,
        isActive: Boolean(slide.isActive),
      };

      if (isEditing) {
        await adminApi.updateHeroSlide(id, payload);
      } else {
        await adminApi.createHeroSlide(payload);
      }
      navigate('/admin/hero');
    } catch (err) {
      alert(err.message || 'Failed to save slide');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminShell>
        <p>Loading slide details...</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <Seo title={`Admin | ${isEditing ? 'Edit' : 'Add'} Hero Slide`} />
      <div className="admin-header">
        <div>
          <h1>{isEditing ? 'Edit' : 'Add'} Hero Slide</h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '4px 0 0' }}>
            Customize the campaign typography, device showcase image, and right-side offer callout.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            className="button button-outline"
            onClick={() => navigate('/admin/hero')}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="button button-gold"
            onClick={save}
            disabled={saving || imageUploading}
          >
            {saving ? 'Saving...' : 'Save Slide'}
          </button>
        </div>
      </div>

      <div className="admin-form" style={{ maxWidth: '900px' }}>
        <div className="admin-basic" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Section 1: Product Showcase Image */}
          <div style={{ background: '#1c1c1c', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ fontSize: '15px', color: 'var(--gold)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              1. Product Showcase Image
            </h2>
            
            <div className="full-field">
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '13px' }}>
                Showcase Image (Cloudinary URL or File Upload) <span style={{ color: '#fc6554' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={slide.imageUrl}
                  onChange={(e) => update('imageUrl', e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  style={{ flex: 1 }}
                />
                <label
                  className="button button-outline"
                  style={{
                    cursor: imageUploading ? 'not-allowed' : 'pointer',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    padding: '10px 16px',
                    fontSize: '12px'
                  }}
                >
                  {imageUploading ? 'Uploading...' : '📁 Upload File'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={imageUploading}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>

            {slide.imageUrl && (
              <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '120px', height: '90px', background: '#111', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={slide.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Image ready and loaded</span>
              </div>
            )}
          </div>

          {/* Section 2: Left Side Campaign Typography */}
          <div style={{ background: '#1c1c1c', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ fontSize: '15px', color: 'var(--gold)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              2. Left Campaign Typography
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  Eyebrow Tag
                </label>
                <input
                  type="text"
                  value={slide.eyebrowText}
                  onChange={(e) => update('eyebrowText', e.target.value)}
                  placeholder="e.g. BELL / DUBAI"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  Highlight Badge (e.g. SALE)
                </label>
                <input
                  type="text"
                  value={slide.headingLine2}
                  onChange={(e) => update('headingLine2', e.target.value)}
                  placeholder="e.g. SALE or THE EDIT"
                />
              </div>
            </div>

            <div className="full-field" style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                Main Headline (Big Bold Title)
              </label>
              <input
                type="text"
                value={slide.headingLine1}
                onChange={(e) => update('headingLine1', e.target.value)}
                placeholder="e.g. BACK TO SCHOOL or PREMIUM TECHNOLOGY"
              />
            </div>

            <div className="full-field" style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                Description Subtext
              </label>
              <textarea
                value={slide.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="e.g. Renewed tech for up to 70% less vs new!"
                rows="2"
              />
            </div>
          </div>

          {/* Section 3: Right Side Offer Callout & Coupon */}
          <div style={{ background: '#1c1c1c', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ fontSize: '15px', color: 'var(--gold)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              3. Right Promotional Offer Card
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  Offer Headline (Line 1)
                </label>
                <input
                  type="text"
                  value={slide.badgeTextLine1}
                  onChange={(e) => update('badgeTextLine1', e.target.value)}
                  placeholder="e.g. AED 200 cashback"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  Offer Subline (Line 2)
                </label>
                <input
                  type="text"
                  value={slide.badgeTextLine2}
                  onChange={(e) => update('badgeTextLine2', e.target.value)}
                  placeholder="e.g. + extra AED 100 off!"
                />
              </div>
            </div>

            <div className="full-field" style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                Coupon / Promo Code (Displayed in code box)
              </label>
              <input
                type="text"
                value={slide.couponCode}
                onChange={(e) => update('couponCode', e.target.value)}
                placeholder="e.g. BACKTOSCHOOL or BELLDUBAI"
              />
            </div>
          </div>

          {/* Section 4: Action Button & Destination Link */}
          <div style={{ background: '#1c1c1c', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ fontSize: '15px', color: 'var(--gold)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              4. Action Button & Navigation
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={slide.primaryButtonText}
                  onChange={(e) => update('primaryButtonText', e.target.value)}
                  placeholder="SHOP NOW"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  Destination Link
                </label>
                <input
                  type="text"
                  value={slide.primaryButtonLink}
                  onChange={(e) => update('primaryButtonLink', e.target.value)}
                  placeholder="/shop or /category/iphone"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Order & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                Display Order
              </label>
              <input
                type="number"
                value={slide.order}
                onChange={(e) => update('order', Number(e.target.value))}
                min="0"
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={slide.isActive}
                  onChange={(e) => update('isActive', e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div>
                  <span style={{ fontSize: '14px', fontWeight: '600', display: 'block' }}>Published / Active</span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Show in homepage hero carousel</span>
                </div>
              </label>
            </div>
          </div>

        </div>
      </div>
    </AdminShell>
  );
}
