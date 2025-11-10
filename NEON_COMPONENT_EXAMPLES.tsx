/**
 * NEON REDESIGN - Copy-Paste Component Examples
 * "Blade Runner meets Barbie on Roller Skates"
 *
 * This file contains ready-to-use component examples.
 * Copy these directly into your React components.
 */

// ============================================
// EXAMPLE 1: HERO PANEL WITH GLOWING ORB
// ============================================

export function NeonHeroPanel({ score, label, message }: {
  score: number;
  label: string;
  message: string;
}) {
  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, rgba(255, 94, 205, 0.08) 0%, rgba(163, 75, 255, 0.08) 50%, rgba(0, 234, 255, 0.08) 100%)',
      backdropFilter: 'blur(16px)',
      border: '3px solid',
      borderImage: 'linear-gradient(135deg, rgba(255, 156, 255, 0.4) 0%, rgba(0, 229, 255, 0.4) 100%) 1',
      borderRadius: '32px',
      padding: '48px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    }}>
      {/* HUGE glowing orb */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '500px',
        background: 'linear-gradient(135deg, #ff5ecd 0%, #a34bff 50%, #00eaff 100%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        opacity: 0.25,
        animation: 'orb-pulse 4s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Holographic title */}
        <h2 className="text-holographic" style={{
          fontSize: '24px',
          fontFamily: 'Rajdhani, sans-serif',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          marginBottom: '32px'
        }}>
          NEUROLOGICAL STATUS
        </h2>

        {/* Giant glowing score */}
        <div style={{
          fontSize: '120px',
          fontFamily: 'Rajdhani, sans-serif',
          fontWeight: 900,
          color: '#ff5ecd',
          textShadow: '0 0 30px rgba(255, 94, 205, 0.8), 0 0 60px rgba(255, 94, 205, 0.5), 0 0 100px rgba(255, 94, 205, 0.3)',
          lineHeight: 1,
          marginBottom: '16px'
        }}>
          {score.toFixed(1)}<span style={{ fontSize: '48px' }}>%</span>
        </div>

        {/* Status label */}
        <div style={{
          fontSize: '32px',
          fontFamily: 'Rajdhani, sans-serif',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: '#ff5ecd',
          textShadow: '0 0 20px rgba(255, 94, 205, 0.6)',
          marginBottom: '24px'
        }}>
          {label}
        </div>

        {/* Glass message card */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '2px solid rgba(255, 156, 255, 0.3)',
          borderRadius: '24px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Chrome reflection */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%)',
            pointerEvents: 'none'
          }} />
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '15px',
            color: '#c4b5fd',
            lineHeight: 1.6,
            position: 'relative',
            zIndex: 1
          }}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 2: FAT NEON PILL BUTTON
// ============================================

export function NeonPillButton({
  children,
  onClick,
  variant = 'primary'
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'cyan' | 'pink' | 'green';
}) {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #ff5ecd 0%, #a34bff 60%, #00eaff 100%)',
      color: '#ffffff',
      shadow: '0 0 24px rgba(255, 90, 255, 0.4), 0 0 48px rgba(255, 90, 255, 0.4)',
      hoverShadow: '0 0 30px rgba(255, 90, 255, 0.6), 0 0 60px rgba(255, 90, 255, 0.4), 0 8px 24px rgba(0, 0, 0, 0.4)'
    },
    cyan: {
      background: 'rgba(0, 234, 255, 0.15)',
      color: '#00eaff',
      border: '3px solid #00eaff',
      shadow: '0 0 20px rgba(0, 234, 255, 0.4), 0 0 40px rgba(0, 234, 255, 0.4)',
      hoverShadow: '0 0 30px rgba(0, 234, 255, 0.6), 0 0 60px rgba(0, 234, 255, 0.4)'
    },
    pink: {
      background: 'rgba(255, 94, 205, 0.15)',
      color: '#ff5ecd',
      border: '3px solid #ff5ecd',
      shadow: '0 0 20px rgba(255, 94, 205, 0.4), 0 0 40px rgba(255, 94, 205, 0.4)',
      hoverShadow: '0 0 30px rgba(255, 94, 205, 0.6), 0 0 60px rgba(255, 94, 205, 0.4)'
    },
    green: {
      background: 'rgba(0, 255, 136, 0.15)',
      color: '#00ff88',
      border: '3px solid #00ff88',
      shadow: '0 0 20px rgba(0, 255, 136, 0.4), 0 0 40px rgba(0, 255, 136, 0.4)',
      hoverShadow: '0 0 30px rgba(0, 255, 136, 0.6), 0 0 60px rgba(0, 255, 136, 0.4)'
    }
  };

  const style = variants[variant];

  return (
    <button
      onClick={onClick}
      style={{
        padding: '20px 48px',
        borderRadius: '48px',
        border: style.border || 'none',
        background: style.background,
        color: style.color,
        fontFamily: 'Rajdhani, sans-serif',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        fontSize: '16px',
        boxShadow: style.shadow,
        cursor: 'pointer',
        transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
        e.currentTarget.style.boxShadow = style.hoverShadow;
        if (variant !== 'primary') {
          e.currentTarget.style.background = style.background.replace('0.15', '0.25');
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = style.shadow;
        e.currentTarget.style.background = style.background;
      }}
    >
      <span style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </span>
      {/* Animated light sweep (only on primary) */}
      {variant === 'primary' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-150%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
          animation: 'light-sweep 3s ease-in-out infinite'
        }} />
      )}
    </button>
  );
}

// ============================================
// EXAMPLE 3: GLASS LOZENGE CARD
// ============================================

export function GlassLozengeCard({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 94, 205, 0.08) 0%, rgba(163, 75, 255, 0.08) 50%, rgba(0, 234, 255, 0.08) 100%)',
        backdropFilter: 'blur(16px)',
        border: '2px solid',
        borderImage: 'linear-gradient(135deg, rgba(255, 156, 255, 0.4) 0%, rgba(0, 229, 255, 0.4) 100%) 1',
        borderRadius: '32px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 0, 0, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.15)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Chrome reflection at top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '40%',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 100%)',
        pointerEvents: 'none',
        opacity: 0.3
      }} />

      {/* Neon ribbon at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(135deg, #ff5ecd 0%, #a34bff 50%, #00eaff 100%)',
        opacity: 0.6
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 4: NEON PROGRESS BAR
// ============================================

export function NeonProgressBar({
  percentage,
  showLabel = true
}: {
  percentage: number;
  showLabel?: boolean;
}) {
  return (
    <div style={{
      height: '40px',
      background: 'rgba(0, 0, 0, 0.6)',
      border: '3px solid #00eaff',
      borderRadius: '48px',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 234, 255, 0.4)'
    }}>
      {/* Progress fill */}
      <div style={{
        height: '100%',
        width: `${Math.min(100, Math.max(0, percentage))}%`,
        background: 'linear-gradient(135deg, #ff5ecd 0%, #a34bff 50%, #00eaff 100%)',
        borderRadius: '48px',
        boxShadow: '0 0 20px rgba(255, 94, 205, 0.4), inset 0 0 12px rgba(255, 255, 255, 0.3)',
        position: 'relative',
        transition: 'width 500ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* Chrome highlight on top */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)',
          borderRadius: '48px'
        }} />
      </div>

      {/* Percentage label */}
      {showLabel && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '18px',
            fontWeight: 800,
            color: percentage > 50 ? '#070314' : '#ffffff',
            textShadow: percentage > 50 ? 'none' : '0 0 8px rgba(255, 255, 255, 0.8)'
          }}>
            {percentage.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 5: HOLOGRAPHIC HEADER TEXT
// ============================================

export function HolographicHeader({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <h2 className="text-holographic" style={{
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '24px',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
      marginBottom: '16px'
    }}>
      {children}
    </h2>
  );
}

// ============================================
// EXAMPLE 6: CHROME BADGE
// ============================================

export function ChromeBadge({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'inline-block',
      padding: '8px 16px',
      background: 'linear-gradient(135deg, #f0f0ff 0%, #c8c8ff 50%, #f0f0ff 100%)',
      color: '#070314',
      borderRadius: '48px',
      fontFamily: 'Rajdhani, sans-serif',
      fontWeight: 800,
      textTransform: 'uppercase',
      fontSize: '11px',
      letterSpacing: '0.1em',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.4), inset 0 -2px 0 rgba(0, 0, 0, 0.2)'
    }}>
      {children}
    </div>
  );
}

// ============================================
// EXAMPLE 7: NEON INPUT FIELD
// ============================================

export function NeonInput({
  placeholder,
  value,
  onChange,
  type = 'text'
}: {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        width: '100%',
        padding: '16px 24px',
        borderRadius: '24px',
        border: '3px solid rgba(255, 156, 255, 0.3)',
        background: '#070314',
        color: '#ffffff',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '15px',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        outline: 'none'
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#00eaff';
        e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 234, 255, 0.4)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 156, 255, 0.3)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}

// ============================================
// EXAMPLE 8: DASHBOARD HUD HEADER
// ============================================

export function DashboardHeader({
  title,
  statusBadge,
  onStartSession
}: {
  title: string;
  statusBadge?: string;
  onStartSession?: () => void;
}) {
  return (
    <header style={{
      height: '80px',
      background: 'linear-gradient(135deg, rgba(255, 94, 205, 0.08) 0%, rgba(163, 75, 255, 0.08) 50%, rgba(0, 234, 255, 0.08) 100%)',
      backdropFilter: 'blur(20px)',
      borderBottom: '2px solid rgba(255, 156, 255, 0.3)',
      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.2)',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Logo with holographic effect */}
      <h1 className="text-holographic" style={{
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '24px',
        fontWeight: 800,
        letterSpacing: '0.15em'
      }}>
        {title}
      </h1>

      {/* Right side controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        {statusBadge && (
          <ChromeBadge>{statusBadge}</ChromeBadge>
        )}

        {onStartSession && (
          <NeonPillButton onClick={onStartSession} variant="primary">
            START SESSION
          </NeonPillButton>
        )}
      </div>
    </header>
  );
}

// ============================================
// EXAMPLE 9: NEON RIBBON DIVIDER
// ============================================

export function NeonRibbon() {
  return (
    <div style={{
      height: '8px',
      background: 'linear-gradient(135deg, #ff5ecd 0%, #a34bff 50%, #00eaff 100%)',
      borderRadius: '48px',
      boxShadow: '0 0 24px rgba(255, 90, 255, 0.4), 0 0 48px rgba(255, 90, 255, 0.4)',
      position: 'relative',
      overflow: 'visible',
      margin: '24px 0'
    }}>
      {/* Pink dot on left */}
      <div style={{
        position: 'absolute',
        left: '-10px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: '#ff5ecd',
        boxShadow: '0 0 16px rgba(255, 94, 205, 0.6)'
      }} />

      {/* Cyan dot on right */}
      <div style={{
        position: 'absolute',
        right: '-10px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: '#00eaff',
        boxShadow: '0 0 16px rgba(0, 234, 255, 0.6)'
      }} />
    </div>
  );
}

// ============================================
// EXAMPLE 10: FLOATING ACCENT SHAPES
// ============================================

export function FloatingAccentShapes() {
  return (
    <>
      {/* Top right purple blob */}
      <div style={{
        position: 'fixed',
        top: '-20%',
        right: '-10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(163, 75, 255, 0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0,
        animation: 'float-blob 12s ease-in-out infinite',
        filter: 'blur(40px)'
      }} />

      {/* Bottom left pink blob */}
      <div style={{
        position: 'fixed',
        bottom: '-30%',
        left: '-15%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(255, 94, 205, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0,
        animation: 'float-blob 15s ease-in-out infinite reverse',
        filter: 'blur(40px)'
      }} />
    </>
  );
}

// ============================================
// USAGE EXAMPLES IN YOUR COMPONENTS
// ============================================

/*

// In Dashboard.tsx:
<div className="bg-neon-grid min-h-screen">
  <FloatingAccentShapes />

  <DashboardHeader
    title="MOSTLYMYELINATED"
    statusBadge="HYPERREFLEXIC • 97%"
    onStartSession={() => navigate('/study')}
  />

  <div className="max-w-7xl mx-auto p-6 space-y-6">
    <NeonHeroPanel
      score={97.4}
      label="HYPERREFLEXIC"
      message="Peak cognitive performance. Neural pathways optimized."
    />

    <NeonRibbon />

    <GlassLozengeCard>
      <HolographicHeader>CRITICAL NODES</HolographicHeader>
      <p>Your weakest nodes...</p>
    </GlassLozengeCard>
  </div>
</div>

// In Study.tsx:
<NeonPillButton onClick={handleGood} variant="cyan">
  GOOD
</NeonPillButton>

<NeonPillButton onClick={handleAgain} variant="pink">
  AGAIN
</NeonPillButton>

// In Node Form:
<NeonInput
  placeholder="Enter node title..."
  value={title}
  onChange={(e) => setTitle(e.target.value)}
/>

// Progress indicator:
<NeonProgressBar percentage={75.3} showLabel={true} />

*/
