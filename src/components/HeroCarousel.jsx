import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';
import { getApiBaseUrl } from '../services/apiConfig';

const baseUrl = getApiBaseUrl();

const DEFAULT_SLIDES = [
  {
    id: 'default-1',
    imageUrl: 'https://res.cloudinary.com/pkotqxwo/image/upload/v1787664835/kkone6rhjs3plav4vlfp.png',
    eyebrowText: 'BELL / DUBAI • OFFICIAL STORE',
    headingLine1: 'Premium Technology',
    headingLine2: 'Simply BELL.',
    description: 'Discover the latest flagship smartphones and luxury accessories, delivered express across Dubai.',
    badgeTextLine1: 'AED 200 Cashback',
    badgeTextLine2: '+ Extra AED 100 Off Today',
    couponCode: 'BACKTOSCHOOL',
    primaryButtonText: 'Shop Now',
    primaryButtonLink: '/shop',
    secondaryButtonText: 'Explore Deals',
    secondaryButtonLink: '/category/deals',
    order: 1,
    isActive: true,
  },
  {
    id: 'default-2',
    imageUrl: 'https://res.cloudinary.com/pkotqxwo/image/upload/v1787664835/kkone6rhjs3plav4vlfp.png',
    eyebrowText: 'DUBAI EXCLUSIVE • NEW ARRIVALS',
    headingLine1: 'Next-Gen Flagships',
    headingLine2: 'Titanium Series',
    description: 'Experience ultra-fast performance, cinema-grade cameras, and exclusive trade-in benefits.',
    badgeTextLine1: 'Instant 15% Off',
    badgeTextLine2: 'Official 1-Year UAE Warranty',
    couponCode: 'BELLFLAGSHIP',
    primaryButtonText: 'View Phones',
    primaryButtonLink: '/shop',
    secondaryButtonText: 'Trade-In',
    secondaryButtonLink: '/contact',
    order: 2,
    isActive: true,
  },
  {
    id: 'default-3',
    imageUrl: 'https://res.cloudinary.com/pkotqxwo/image/upload/v1787664835/kkone6rhjs3plav4vlfp.png',
    eyebrowText: 'LIMITED CAMPAIGN • ACCESSORIES',
    headingLine1: 'Luxury Audio & Gear',
    headingLine2: 'Special Bundles',
    description: 'Compliment your setup with premium high-fidelity audio, ultra-fast wireless chargers, and cases.',
    badgeTextLine1: 'Bundle & Save',
    badgeTextLine2: 'Buy Phone, Get 30% Off Audio',
    couponCode: 'BELLBUNDLE',
    primaryButtonText: 'Shop Accessories',
    primaryButtonLink: '/category/accessories',
    secondaryButtonText: 'All Deals',
    secondaryButtonLink: '/category/deals',
    order: 3,
    isActive: true,
  },
];

export default function HeroCarousel() {
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  
  const timerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/hero-slides`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data);
        } else {
          setSlides(DEFAULT_SLIDES);
        }
      } else {
        setSlides(DEFAULT_SLIDES);
      }
    } catch (err) {
      console.error('Error fetching hero slides, using defaults:', err);
      setSlides(DEFAULT_SLIDES);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
  }, [slides.length, isPaused]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    startTimer();
  }, [slides.length, startTimer]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    startTimer();
  }, [slides.length, startTimer]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    startTimer();
  };

  const handleCopyCoupon = (code, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!code) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (loading) {
    return (
      <section className="hero-split-carousel loading-skeleton" aria-hidden="true">
        <div className="hero-split-placeholder" />
      </section>
    );
  }

  const isMultiple = slides.length > 1;

  return (
    <section
      className="hero-split-carousel"
      aria-label="Promotions and Featured Offers Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="hero-split-track">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const targetLink = (slide.primaryButtonLink || slide.link || '/shop').trim();
          const isExternal = /^https?:\/\//i.test(targetLink);

          const mainHeading = slide.headingLine1 || slide.title || 'Premium Technology';
          const highlightBadge = slide.headingLine2 || '';
          const eyebrow = slide.eyebrowText || 'BELL / DUBAI';
          const desc = slide.description || 'Discover the latest smartphones and premium accessories with official warranty and express delivery.';
          
          const offerLine1 = slide.badgeTextLine1 || (slide.badgeText ? 'BELL EXCLUSIVE' : 'AED 200 Cashback');
          const offerLine2 = slide.badgeTextLine2 || (slide.badgeText ? slide.badgeText : '+ Extra AED 100 Off!');
          const coupon = slide.couponCode || 'BELLPROMO';
          const buttonText = slide.primaryButtonText || 'Shop Now';
          const secondaryText = slide.secondaryButtonText || 'Explore Deals';
          const secondaryLink = slide.secondaryButtonLink || '/category/deals';

          const isCopied = copiedCode === coupon;

          return (
            <div
              key={slide.id || idx}
              className={`hero-split-slide ${isActive ? 'active' : ''}`}
              aria-hidden={!isActive}
            >
              {/* Layer 1: Ambient Background Lighting & Atmospheric Glow */}
              <div className="hero-split-bg-glow" />

              {/* Layer 2: 3-Column Structured Layout */}
              <div className="hero-split-container">
                {/* 1. Left Side: Clean, Structured Typography & CTAs (Zero Overlap) */}
                <div className="hero-split-left">
                  {eyebrow && (
                    <div className="hero-split-eyebrow-wrap">
                      <span className="hero-split-eyebrow-dot" />
                      <span className="hero-split-eyebrow-text">{eyebrow}</span>
                    </div>
                  )}

                  <h1 className="hero-split-title">
                    {mainHeading}
                    {highlightBadge && (
                      <span className="hero-split-highlight">
                        {' '}{highlightBadge}
                      </span>
                    )}
                  </h1>

                  {desc && (
                    <p className="hero-split-desc">
                      {desc}
                    </p>
                  )}

                  <div className="hero-split-actions">
                    {buttonText && (
                      isExternal ? (
                        <a
                          href={targetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="button button-gold hero-split-btn-primary"
                        >
                          {buttonText} <span className="btn-arrow">→</span>
                        </a>
                      ) : (
                        <Link
                          to={targetLink}
                          className="button button-gold hero-split-btn-primary"
                        >
                          {buttonText} <span className="btn-arrow">→</span>
                        </Link>
                      )
                    )}

                    {secondaryText && (
                      <Link
                        to={secondaryLink}
                        className="hero-split-btn-sec"
                      >
                        {secondaryText}
                      </Link>
                    )}
                  </div>
                </div>

                {/* 2. Center: Dedicated Image Showcase with Smooth Seamless Edge Blending */}
                <div className="hero-split-center">
                  {slide.imageUrl && (
                    <div className="hero-split-image-frame">
                      {/* Ambient glow halo directly behind the phones */}
                      <div className="hero-split-phone-halo" />
                      
                      {/* Edge blend gradient scrims for seamless transition */}
                      <div className="hero-split-blend-overlay blend-left" />
                      <div className="hero-split-blend-overlay blend-right" />
                      <div className="hero-split-blend-overlay blend-top" />
                      <div className="hero-split-blend-overlay blend-bottom" />

                      <img
                        src={optimizeCloudinaryUrl(slide.imageUrl, { width: 900 })}
                        alt={mainHeading || 'Promotion Banner'}
                        className="hero-split-img"
                        loading={idx === 0 ? 'eager' : 'lazy'}
                        fetchPriority={idx === 0 ? 'high' : 'auto'}
                      />
                    </div>
                  )}
                </div>

                {/* 3. Right Side: Luxury Balanced Promotional Card */}
                <div className="hero-split-right">
                  <div className="hero-split-offer-card">
                    {/* Top Tag */}
                    <div className="hero-split-card-header">
                      <span className="hero-split-live-badge">
                        <span className="live-pulse" />
                        BELL EXCLUSIVE
                      </span>
                    </div>

                    {/* Headline & Subtitle */}
                    {offerLine1 && (
                      <h2 className="hero-split-offer-title">{offerLine1}</h2>
                    )}
                    {offerLine2 && (
                      <p className="hero-split-offer-subtitle">{offerLine2}</p>
                    )}

                    {/* Interactive Coupon Box */}
                    {coupon && (
                      <button
                        type="button"
                        className="hero-split-coupon-box"
                        onClick={(e) => handleCopyCoupon(coupon, e)}
                        title="Click to copy promo code"
                      >
                        <div className="coupon-content">
                          <span className="coupon-tag">CODE:</span>
                          <span className="coupon-val">{coupon}</span>
                        </div>
                        <span className="coupon-action">
                          {isCopied ? 'COPIED!' : 'COPY'}
                        </span>
                      </button>
                    )}

                    {/* Trust Perks Row */}
                    <div className="hero-split-trust-perks">
                      <div className="perk-item">
                        <span className="perk-icon">✓</span>
                        <span>UAE Official Warranty</span>
                      </div>
                      <div className="perk-item">
                        <span className="perk-icon">⚡</span>
                        <span>2-Hour Dubai Delivery</span>
                      </div>
                    </div>

                    {/* Card CTA Button */}
                    {buttonText && (
                      isExternal ? (
                        <a
                          href={targetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hero-split-card-cta"
                        >
                          {buttonText} <span>→</span>
                        </a>
                      ) : (
                        <Link
                          to={targetLink}
                          className="hero-split-card-cta"
                        >
                          {buttonText} <span>→</span>
                        </Link>
                      )
                    )}

                    <span className="hero-split-card-terms">Limited time • T&Cs apply</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls Overlay: Previous / Next Arrows */}
      {isMultiple && (
        <>
          <button
            type="button"
            className="hero-split-nav-btn prev-btn"
            onClick={handlePrev}
            aria-label="Previous Slide"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className="hero-split-nav-btn next-btn"
            onClick={handleNext}
            aria-label="Next Slide"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Navigation Controls Overlay: Pagination Dots */}
          <div className="hero-split-pagination" role="tablist" aria-label="Hero Carousel Slides">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={idx === currentIndex}
                className={`hero-split-dot ${idx === currentIndex ? 'active' : ''}`}
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
