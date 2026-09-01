import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

/* ==========================================================================
   CINEMATIC STEP DEFINITIONS
   ========================================================================== */
const IPHONE_CINEMATIC_STEPS = [
  {
    stepNumber: '01',
    stepLabel: 'DISPLAY & ARMOR',
    title: 'Ceramic Shield Front Cover',
    subtitle: 'Nanoscale Ceramic Crystals • Super Retina XDR OLED',
    description: 'Tougher than any smartphone glass with dual-ion exchange scratch protection, 2,000 nits peak outdoor brightness, and ProMotion 120Hz.',
    metric: '2,000 Nits • 4x Drop Resistance',
    tag: 'DISPLAY COVER',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    renderTransform: 'perspective(1400px) rotateX(16deg) rotateY(-18deg) translateZ(40px) scale(1.04)',
    spotlightX: 68,
    spotlightY: 22,
    layerHighlight: 'glass',
  },
  {
    stepNumber: '02',
    stepLabel: 'OPTICAL SYSTEM',
    title: '48MP Main Camera Sensor Stack',
    subtitle: 'Custom Quad-Pixel • 2nd-Gen Sensor-Shift OIS',
    description: 'Massive 1/1.28" sensor with 2.44µm quad pixels, f/1.78 aperture, 100% Focus Pixels, and next-generation Photonic Engine color mapping.',
    metric: '48 Megapixels • 2.44µm Quad Pixel',
    tag: 'PRO CAMERA MODULE',
    glowColor: 'rgba(14, 165, 233, 0.45)',
    renderTransform: 'perspective(1400px) rotateX(20deg) rotateY(-24deg) translate3d(-20px, -15px, 60px) scale(1.08)',
    spotlightX: 24,
    spotlightY: 48,
    layerHighlight: 'camera',
  },
  {
    stepNumber: '03',
    stepLabel: 'SILICON & AI CORE',
    title: 'A17 Pro Bionic Architecture',
    subtitle: 'Industry-First 3nm Node • 6-Core Pro GPU',
    description: 'Breakthrough 3-nanometer architecture featuring 19 billion transistors, hardware-accelerated ray tracing, and a 16-core Neural Engine.',
    metric: '35 Trillion Operations / Sec',
    tag: 'CUSTOM SILICON',
    glowColor: 'rgba(234, 179, 8, 0.45)',
    renderTransform: 'perspective(1400px) rotateX(18deg) rotateY(-14deg) translate3d(10px, 0px, 50px) scale(1.06)',
    spotlightX: 48,
    spotlightY: 38,
    layerHighlight: 'silicon',
  },
  {
    stepNumber: '04',
    stepLabel: 'CHASSIS & POWER',
    title: 'Aerospace Grade 5 Titanium',
    subtitle: 'Solid-State Diffusion • MagSafe Wireless Array',
    description: 'Precision-machined Grade 5 Titanium enclosure fused to 100% recycled aluminum substructure, housing a custom L-shaped 4,422mAh power cell.',
    metric: 'Ti-6Al-4V Alloy • 29h Video Playback',
    tag: 'STRUCTURAL ENCLOSURE',
    glowColor: 'rgba(190, 154, 93, 0.45)',
    renderTransform: 'perspective(1400px) rotateX(14deg) rotateY(-10deg) translate3d(0px, 10px, 20px) scale(1.03)',
    spotlightX: 74,
    spotlightY: 74,
    layerHighlight: 'chassis',
  },
];

const GALAXY_CINEMATIC_STEPS = [
  {
    stepNumber: '01',
    stepLabel: 'DISPLAY & ARMOR',
    title: 'Corning Gorilla Glass Armor',
    subtitle: '75% Glare Reduction • Dynamic AMOLED 2X 120Hz',
    description: 'Proprietary DX optical coating drastically minimizes reflections in direct sunlight while delivering 4x scratch resistance on a 2,600-nit flat QHD+ screen.',
    metric: '2,600 Nits • 75% Reflection Cut',
    tag: 'GLASS ARMOR',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    renderTransform: 'perspective(1400px) rotateX(16deg) rotateY(-18deg) translateZ(40px) scale(1.04)',
    spotlightX: 78,
    spotlightY: 65,
    layerHighlight: 'glass',
  },
  {
    stepNumber: '02',
    stepLabel: 'OPTICAL SYSTEM',
    title: '200MP ISOCELL Sensor Stack',
    subtitle: '16-in-1 Adaptive Pixel • 2x Wider OIS',
    description: 'Ultra-high resolution 1/1.3" sensor with 200 million pixels, optical periscope telephoto lenses, ProVisual AI engine, and 100x Space Zoom telemetry.',
    metric: '200 Megapixels • Quad Telephoto',
    tag: 'ISOCELL OPTICS',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    renderTransform: 'perspective(1400px) rotateX(20deg) rotateY(-24deg) translate3d(-20px, -15px, 60px) scale(1.08)',
    spotlightX: 44,
    spotlightY: 28,
    layerHighlight: 'camera',
  },
  {
    stepNumber: '03',
    stepLabel: 'SILICON & AI ENGINE',
    title: 'Snapdragon 8 Gen 3 for Galaxy',
    subtitle: 'Overclocked 3.39GHz Core • On-Device Galaxy AI',
    description: 'Custom-tuned prime CPU core paired with Adreno 750 Ray Tracing GPU and dedicated Hexagon NPU for real-time generative photo editing and live translations.',
    metric: '3.39 GHz Peak Clock • NPU AI',
    tag: 'GALAXY AI PROCESSOR',
    glowColor: 'rgba(217, 119, 6, 0.45)',
    renderTransform: 'perspective(1400px) rotateX(18deg) rotateY(-14deg) translate3d(10px, 0px, 50px) scale(1.06)',
    spotlightX: 30,
    spotlightY: 62,
    layerHighlight: 'silicon',
  },
  {
    stepNumber: '04',
    stepLabel: 'THERMAL & CHASSIS',
    title: '1.9x Vapor Chamber & Titanium',
    subtitle: '+92% Larger Liquid Cooling • S-Pen Stylus System',
    description: 'Enlarged copper capillary cooling chamber prevents thermal throttling, supported by an integrated 4,096-level S-Pen digitizer and 5,000mAh intelligent battery.',
    metric: '+92% Vapor Area • 5,000mAh Battery',
    tag: 'THERMAL & TITANIUM',
    glowColor: 'rgba(180, 83, 9, 0.45)',
    renderTransform: 'perspective(1400px) rotateX(14deg) rotateY(-10deg) translate3d(0px, 10px, 20px) scale(1.03)',
    spotlightX: 52,
    spotlightY: 42,
    layerHighlight: 'chassis',
  },
];

/* ==========================================================================
   CINEMATIC CARD COMPONENT (SINGLE-CLICK STEP-BY-STEP NARRATIVE)
   ========================================================================== */
function CinematicPhoneCard({
  brand,
  title,
  subtitle,
  categoryRoute,
  themeClass,
  assembledImg,
  explodedImg,
  steps,
  ambientGlow,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });
  const timerRef = useRef(null);
  const cardRef = useRef(null);

  const totalSteps = steps.length;
  const currentStep = steps[currentStepIdx];

  // Automated Sequential Timer (Advances step by step)
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= totalSteps - 1) {
            return 0; // Loops smoothly or can stop
          }
          return prev + 1;
        });
      }, 3800); // 3.8s per step
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, totalSteps]);

  // Click on Card / Phone triggers the Single-Click Cinematic Sequence
  const handleCardClick = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      setCurrentStepIdx(0);
    } else {
      // If already playing, advance to next step
      setCurrentStepIdx((prev) => (prev + 1) % totalSteps);
    }
  };

  const handleCloseCinematic = (e) => {
    e.stopPropagation();
    setIsPlaying(false);
    setCurrentStepIdx(0);
  };

  // Subtle Mouse Parallax
  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseParallax({ x: nx * 10, y: ny * -10 });
  }, []);

  const handleMouseLeave = () => {
    setMouseParallax({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      className={`cinematic-phone-card ${themeClass} ${isPlaying ? 'is-cinematic-active' : 'is-clean-idle'}`}
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Atmosphere & Ambient Lighting */}
      <div
        className="cinematic-ambient-glow"
        style={{
          background: isPlaying ? currentStep.glowColor : ambientGlow,
        }}
      />
      <div className="cinematic-grid-mesh" />

      {/* Top Header Information */}
      <div className="cinematic-header">
        <div className="header-brand-line">
          <span className="brand-badge">{brand}</span>
          {isPlaying && (
            <span className="step-counter-pill">
              STEP {currentStep.stepNumber} / 0{totalSteps} : {currentStep.stepLabel}
            </span>
          )}
        </div>

        <h2 className="cinematic-title">
          {title}
          <br />
          <em>{subtitle}</em>
        </h2>

        {/* Clean State Hint vs Active State Controls */}
        {!isPlaying ? (
          <div className="clean-trigger-hint">
            <span className="pulse-sparkle">✦</span>
            <span>Click Phone to Experience 3D Tear-Down</span>
          </div>
        ) : (
          <div className="cinematic-playback-bar">
            {/* Step Progress Dots */}
            <div className="step-progress-dots">
              {steps.map((s, idx) => (
                <button
                  key={s.stepNumber}
                  type="button"
                  className={`step-dot ${idx === currentStepIdx ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentStepIdx(idx);
                  }}
                  title={s.title}
                />
              ))}
            </div>

            <button
              type="button"
              className="cinematic-close-btn"
              onClick={handleCloseCinematic}
              title="Return to clean assembled view"
            >
              ✕ Close
            </button>
          </div>
        )}
      </div>

      {/* Central 3D Stage with Photorealistic Phone Models */}
      <div className="cinematic-3d-stage">
        <div
          className="stage-3d-viewport"
          style={{
            transform: isPlaying
              ? `${currentStep.renderTransform} rotateX(${mouseParallax.y * 0.4}deg) rotateY(${mouseParallax.x * 0.4}deg)`
              : `perspective(1400px) rotateX(${14 + mouseParallax.y * 0.5}deg) rotateY(${-18 + mouseParallax.x * 0.6}deg) scale(1)`,
          }}
        >
          {/* Assembled Photorealistic Phone (Visible when clean) */}
          <div className={`model-layer assembled-layer ${!isPlaying ? 'show-layer' : 'hide-layer'}`}>
            <img
              src={assembledImg}
              alt={`${brand} ${title} Flagship Model`}
              className="photorealistic-render"
            />
          </div>

          {/* Exploded Photorealistic Phone (Visible when cinematic sequence is active) */}
          <div className={`model-layer exploded-layer ${isPlaying ? 'show-layer' : 'hide-layer'}`}>
            <img
              src={explodedImg}
              alt={`${brand} ${title} 3D Internal Architecture`}
              className="photorealistic-render"
            />

            {/* Precision Spotlight Target Marker (Points ONLY to active step component) */}
            {isPlaying && (
              <div
                className="step-spotlight-target"
                style={{
                  top: `${currentStep.spotlightY}%`,
                  left: `${currentStep.spotlightX}%`,
                }}
              >
                <span className="target-pulse-ring" />
                <span className="target-center-dot" />
                {/* Laser Line connecting target to Callout */}
                <div className="target-laser-line" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step-by-Step Focus Spec Card (Appears ONLY during playback) */}
      {isPlaying ? (
        <div className="cinematic-focus-card" key={currentStep.stepNumber}>
          <div className="focus-card-tag-row">
            <span className="focus-tag">{currentStep.tag}</span>
            <span className="focus-metric-pill">{currentStep.metric}</span>
          </div>

          <h3 className="focus-title">{currentStep.title}</h3>
          <p className="focus-subtitle">{currentStep.subtitle}</p>
          <p className="focus-desc">{currentStep.description}</p>
        </div>
      ) : (
        /* Bottom Clean Explore Button Row */
        <div className="clean-bottom-row">
          <Link
            to={categoryRoute}
            className="explore-pill-btn"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="btn-text">Explore {brand} →</span>
            <span className="sonar-ring sonar-1" />
            <span className="sonar-ring sonar-2" />
            <span className="sonar-ring sonar-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   MAIN SMARTPHONE COLLECTIONS BANNER COMPONENT
   ========================================================================== */
export default function Interactive3DCollections() {
  return (
    <section className="collection-banner-3d">
      <div className="shell">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">SMARTPHONE COLLECTIONS</p>
            <h2 className="section-main-title">
              Engineering exposed in <em>3D perspective.</em>
            </h2>
          </div>
          <p className="section-desc">
            Click either phone to launch an automated, layer-by-layer architectural tear-down with authentic component telemetry.
          </p>
        </div>

        <div className="collection-3d-grid">
          {/* ================================================================
              LEFT: APPLE IPHONE 15 PRO MAX (TITANIUM DARK)
             ================================================================ */}
          <CinematicPhoneCard
            brand="APPLE"
            title="iPhone"
            subtitle="collection."
            categoryRoute="/category/iphone"
            themeClass="theme-iphone"
            assembledImg="/images/3d/iphone-15-pro-assembled.jpg"
            explodedImg="/images/3d/iphone-15-pro-exploded.jpg"
            steps={IPHONE_CINEMATIC_STEPS}
            ambientGlow="radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, rgba(30, 58, 138, 0.08) 60%, transparent 100%)"
          />

          {/* ================================================================
              RIGHT: SAMSUNG GALAXY S24 ULTRA (TITANIUM BRONZE)
             ================================================================ */}
          <CinematicPhoneCard
            brand="SAMSUNG"
            title="Galaxy"
            subtitle="collection."
            categoryRoute="/category/samsung"
            themeClass="theme-galaxy"
            assembledImg="/images/3d/galaxy-s24-ultra-assembled.jpg"
            explodedImg="/images/3d/galaxy-s24-ultra-exploded.jpg"
            steps={GALAXY_CINEMATIC_STEPS}
            ambientGlow="radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(120, 53, 15, 0.08) 60%, transparent 100%)"
          />
        </div>
      </div>
    </section>
  );
}
