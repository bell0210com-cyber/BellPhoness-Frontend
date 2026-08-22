import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
const baseUrl = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://api.bellphoness.com');

const DEFAULT_SLIDE = {
  id: 'default',
  eyebrowText: 'BELL / DUBAI',
  headingLine1: 'Premium Technology.',
  headingLine2: 'Simply BELL.',
  description: 'Discover the latest smartphones and premium accessories, delivered across Dubai.',
  primaryButtonText: 'Shop Now',
  primaryButtonLink: '/shop',
  secondaryButtonText: 'Explore Deals',
  secondaryButtonLink: '/category/deals',
  badgeTextLine1: 'THE EDIT',
  badgeTextLine2: '2026',
  imageUrl: 'https://res.cloudinary.com/pkotqxwo/image/upload/v1787350499/aewfzyvxrgfgbjzdggfk.jpg',
};

export default function HeroCarousel() {
  const [slides, setSlides] = useState([DEFAULT_SLIDE]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/hero-slides`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setSlides(data);
        }
      }
    } catch (err) {
      console.error('Error fetching hero slides:', err);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    startTimer();
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    startTimer();
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    startTimer();
  };

  if (loading) {
    return <section className="home-hero" style={{ minHeight: '600px', background: '#000' }}></section>;
  }

  const slide = slides[currentIndex] || DEFAULT_SLIDE;
  const isMultiple = slides.length > 1;

  return (
    <section className="home-hero hero-carousel">
      {slides.map((s, idx) => (
        <div
          key={s.id}
          className={`hero-carousel-slide ${idx === currentIndex ? 'active' : ''}`}
        >
          <div className="shell home-hero-inner">
            <div className="hero-carousel-content">
              {s.eyebrowText && <p className="eyebrow">{s.eyebrowText}</p>}
              <h1>
                {s.headingLine1}
                <br />
                <em>{s.headingLine2}</em>
              </h1>
              <p>{s.description}</p>
              <div className="hero-actions">
                {s.primaryButtonText && (
                  <Link className="button button-gold" to={s.primaryButtonLink || '#'}>
                    {s.primaryButtonText} <b>→</b>
                  </Link>
                )}
                {s.secondaryButtonText && (
                  <Link className="button button-outline" to={s.secondaryButtonLink || '#'}>
                    {s.secondaryButtonText}
                  </Link>
                )}
              </div>
            </div>

            <div className="hero-device">
              {s.imageUrl && <img src={s.imageUrl} alt="Premium smartphone" />}
              {(s.badgeTextLine1 || s.badgeTextLine2) && (
                <span>
                  {s.badgeTextLine1}
                  {s.badgeTextLine1 && s.badgeTextLine2 && <br />}
                  {s.badgeTextLine2 && <b>{s.badgeTextLine2}</b>}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

      {isMultiple && (
        <>
          <button className="carousel-arrow prev-arrow" onClick={handlePrev}>
            ❮
          </button>
          <button className="carousel-arrow next-arrow" onClick={handleNext}>
            ❯
          </button>
          <div className="carousel-dots">
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
