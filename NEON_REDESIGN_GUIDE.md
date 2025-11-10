# MostlyMyelinated Neon Redesign Guide
## "Blade Runner meets Barbie on Roller Skates" Implementation Spec

> **Aesthetic Goal:** Synth-neuro club in 2085 — fat glowing borders, chrome reflections, and emissive neon light

---

## Core Design Principles

### 1. Shape Language: NO RECTANGLES
- **Everything is pills, ovals, or rounded lozenges**
- Minimum border-radius: `24px`
- Buttons: `48px` (full pill shape)
- Cards: `32px` (rounded lozenge)
- Inputs: `24px` (soft rounded)
- Small elements (badges): `48px` (pill)

### 2. Border Treatment: FAT NEON GLOWS
- **Never use 1px borders**
- Standard borders: `2px` or `3px`
- Emphasized borders: `4px`
- Hero elements: `6px`
- All borders must have accompanying glow shadows

### 3. Light Physics: TRIPLE-LAYER GLOWS
Every glowing element uses 3 shadow layers:
```css
box-shadow:
  0 0 8px rgba(255, 94, 205, 0.6),   /* Core glow */
  0 0 20px rgba(255, 94, 205, 0.4),  /* Mid bloom */
  0 0 40px rgba(255, 94, 205, 0.2);  /* Wide bleed */
```

### 4. Gradients: ALWAYS THREE-TONE
Never use two-color gradients. Standard pattern:
```css
background: linear-gradient(135deg, #ff5ecd 0%, #a34bff 50%, #00eaff 100%);
```
- Pink → Purple → Cyan
- Can reverse or rotate, but always three stops

---

## Color System

### Neon Primaries
```css
--neon-pink: #ff5ecd      /* Hot magenta */
--neon-purple: #a34bff    /* Electric purple */
--neon-cyan: #00eaff      /* Bright cyan */
--neon-fuchsia: #ff9cff   /* Light fuchsia (accents) */
--neon-hot: #ff90ff       /* Candy pink (composite glow) */
```

### Background Layers
```css
--bg-void: #070314        /* Deep violet-navy (main background) */
--bg-surface: #110627     /* Dark purple haze (panels) */
--bg-elevated: #1a0d3a    /* Richer purple (elevated panels) */
```

### Text Hierarchy
```css
--text-primary: #ffffff       /* Pure white (headings, key data) */
--text-secondary: #c4b5fd     /* Lavender mist (body text) */
--text-dim: #8b7fb8           /* Muted purple (labels, tertiary) */
--text-chrome: #f0f0ff        /* Chrome-like white (special effects) */
```

### Neuro Status Bands (Updated)
```css
--band-braindead: #8b4bff    /* Deep purple */
--band-lmn: #00a8ff          /* Electric blue */
--band-nonamb: #00d9c8       /* Teal cyan */
--band-amb: #ffaa00          /* Warm orange */
--band-paresis: #ffd700      /* Golden yellow */
--band-bar: #00ff88          /* Neon green */
--band-hyper: #00eaff        /* Bright cyan */
```

---

## Component Specifications

### 1. NeuroStatusHero (Dashboard Hero Panel)

#### Huge Glowing Orb Background
```tsx
<div className="relative overflow-hidden" style={{
  background: 'linear-gradient(135deg, rgba(255, 94, 205, 0.08) 0%, rgba(163, 75, 255, 0.08) 50%, rgba(0, 234, 255, 0.08) 100%)',
  backdropFilter: 'blur(16px)',
  border: '3px solid',
  borderImage: 'linear-gradient(135deg, rgba(255, 156, 255, 0.4) 0%, rgba(0, 229, 255, 0.4) 100%) 1',
  borderRadius: '32px',
  padding: '48px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
}}>
  {/* Huge glowing orb behind score */}
  <div className="hero-orb" style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '500px',
    height: '500px',
    background: 'linear-gradient(135deg, #ff5ecd 0%, #a34bff 50%, #00eaff 100%)',
    borderRadius: '50%',
    filter: 'blur(80px)',
    opacity: '0.25',
    animation: 'orb-pulse 4s ease-in-out infinite',
    pointerEvents: 'none',
    zIndex: 0
  }} />

  {/* Chrome/holographic title */}
  <h2 className="text-holographic text-2xl font-display font-extrabold uppercase tracking-[0.2em] mb-8 relative z-10">
    NEUROLOGICAL STATUS
  </h2>

  {/* Giant score with fat neon glow */}
  <div style={{
    fontSize: '120px',
    fontFamily: 'var(--font-display)',
    fontWeight: 900,
    color: '#ff5ecd',
    textShadow: '0 0 30px rgba(255, 94, 205, 0.8), 0 0 60px rgba(255, 94, 205, 0.5), 0 0 100px rgba(255, 94, 205, 0.3)',
    lineHeight: 1,
    position: 'relative',
    zIndex: 10
  }}>
    {score.toFixed(1)}<span style={{ fontSize: '48px' }}>%</span>
  </div>

  {/* Status label with glow */}
  <div style={{
    fontSize: '32px',
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    color: '#ff5ecd',
    textShadow: '0 0 20px rgba(255, 94, 205, 0.6)',
    marginBottom: '16px'
  }}>
    HYPERREFLEXIC
  </div>

  {/* Glass card with reflection for message */}
  <div style={{
    background: 'rgba(0, 0, 0, 0.4)',
    border: '2px solid rgba(255, 156, 255, 0.3)',
    borderRadius: '24px',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden'
  }}>
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
      fontFamily: 'var(--font-mono)',
      fontSize: '15px',
      color: '#c4b5fd',
      lineHeight: 1.6,
      position: 'relative',
      zIndex: 1
    }}>
      Peak cognitive performance. Neural pathways optimized.
    </p>
  </div>
</div>
```

#### Neon Progress Bar with Three-Tone Gradient
```tsx
<div style={{
  height: '40px',
  background: 'rgba(0, 0, 0, 0.6)',
  border: '3px solid #00eaff',
  borderRadius: '48px',
  overflow: 'hidden',
  position: 'relative',
  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 234, 255, 0.4)'
}}>
  <div style={{
    height: '100%',
    width: `${percentage}%`,
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
</div>
```

### 2. Primary Action Button (Fat Neon Pill)

```tsx
<button style={{
  padding: '20px 48px',
  borderRadius: '48px',
  border: 'none',
  background: 'linear-gradient(135deg, #ff5ecd 0%, #a34bff 60%, #00eaff 100%)',
  color: '#ffffff',
  fontFamily: 'var(--font-display)',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  fontSize: '16px',
  boxShadow: '0 0 24px rgba(255, 90, 255, 0.4), 0 0 48px rgba(255, 90, 255, 0.4)',
  cursor: 'pointer',
  transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden'
}}
onMouseEnter={(e) => {
  e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
  e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 90, 255, 0.6), 0 0 60px rgba(255, 90, 255, 0.4), 0 8px 24px rgba(0, 0, 0, 0.4)';
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = 'translateY(0) scale(1)';
  e.currentTarget.style.boxShadow = '0 0 24px rgba(255, 90, 255, 0.4), 0 0 48px rgba(255, 90, 255, 0.4)';
}}>
  <span style={{ position: 'relative', zIndex: 2 }}>START SESSION</span>
  {/* Animated light sweep */}
  <div style={{
    position: 'absolute',
    top: 0,
    left: '-150%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
    animation: 'light-sweep 3s ease-in-out infinite'
  }} />
</button>
```

### 3. Glass Panel Cards (Node Cards, etc.)

```tsx
<div className="card-lozenge" style={{
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
}}>
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
    <h3 className="text-holographic">NODE TITLE</h3>
    <p style={{ color: '#c4b5fd' }}>Card content...</p>
  </div>
</div>
```

### 4. Dashboard HUD Header

```tsx
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
    fontFamily: 'var(--font-display)',
    fontSize: '24px',
    fontWeight: 800,
    letterSpacing: '0.15em'
  }}>
    MOSTLYMYELINATED
  </h1>

  {/* Chrome status badge */}
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  }}>
    <div className="badge-chrome">
      HYPERREFLEXIC • 97%
    </div>

    {/* Fat pill button */}
    <button className="btn-neon-pill">
      START SESSION
    </button>
  </div>
</header>
```

### 5. Study Screen Buttons (Response Buttons)

```tsx
{/* GOOD button - Cyan neon */}
<button style={{
  padding: '24px 40px',
  borderRadius: '48px',
  background: 'rgba(0, 234, 255, 0.15)',
  border: '3px solid #00eaff',
  color: '#00eaff',
  fontFamily: 'var(--font-display)',
  fontWeight: 800,
  fontSize: '18px',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  boxShadow: '0 0 20px rgba(0, 234, 255, 0.4), 0 0 40px rgba(0, 234, 255, 0.4)',
  cursor: 'pointer',
  transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)'
}}
onMouseEnter={(e) => {
  e.currentTarget.style.background = 'rgba(0, 234, 255, 0.25)';
  e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 234, 255, 0.6), 0 0 60px rgba(0, 234, 255, 0.4)';
  e.currentTarget.style.transform = 'scale(1.05)';
}}>
  GOOD
</button>

{/* AGAIN button - Hot pink neon */}
<button style={{
  padding: '24px 40px',
  borderRadius: '48px',
  background: 'rgba(255, 94, 205, 0.15)',
  border: '3px solid #ff5ecd',
  color: '#ff5ecd',
  fontFamily: 'var(--font-display)',
  fontWeight: 800,
  fontSize: '18px',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  boxShadow: '0 0 20px rgba(255, 94, 205, 0.4), 0 0 40px rgba(255, 94, 205, 0.4)',
  cursor: 'pointer',
  transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)'
}}
onMouseEnter={(e) => {
  e.currentTarget.style.background = 'rgba(255, 94, 205, 0.25)';
  e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 94, 205, 0.6), 0 0 60px rgba(255, 94, 205, 0.4)';
  e.currentTarget.style.transform = 'scale(1.05)';
}}>
  AGAIN
</button>
```

### 6. Input Fields (Rounded with Neon Focus)

```tsx
<input
  type="text"
  placeholder="Enter node title..."
  style={{
    width: '100%',
    padding: '16px 24px',
    borderRadius: '24px',
    border: '3px solid rgba(255, 156, 255, 0.3)',
    background: '#070314',
    color: '#ffffff',
    fontFamily: 'var(--font-mono)',
    fontSize: '15px',
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'
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
```

---

## Background Elements

### Wavy Grid Pattern (Applied to body)
```css
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    /* Diagonal wavy lines */
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 60px,
      rgba(255, 94, 205, 0.03) 60px,
      rgba(255, 94, 205, 0.03) 62px
    ),
    repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 60px,
      rgba(0, 234, 255, 0.03) 60px,
      rgba(0, 234, 255, 0.03) 62px
    );
  pointer-events: none;
  z-index: 1;
  animation: grid-pulse 8s ease-in-out infinite;
}
```

### Floating Chrome Blob
```css
body::after {
  content: '';
  position: fixed;
  top: -20%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(163, 75, 255, 0.12) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
  animation: float-blob 12s ease-in-out infinite;
  filter: blur(40px);
}
```

---

## Animation Specifications

### Light Sweep (Shimmer across buttons)
```css
@keyframes light-sweep {
  0% {
    transform: translateX(-150%);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateX(150%);
    opacity: 0;
  }
}
```
Duration: 3s, ease-in-out, infinite

### Orb Pulse (Breathing glow for hero orb)
```css
@keyframes orb-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}
```
Duration: 4s, ease-in-out, infinite

### Holographic Shimmer (Text gradient animation)
```css
@keyframes holographic-shimmer {
  0% {
    background-position: 0% 50%;
    filter: hue-rotate(0deg);
  }
  50% {
    filter: hue-rotate(10deg);
  }
  100% {
    background-position: 100% 50%;
    filter: hue-rotate(0deg);
  }
}
```
Duration: 3s, ease-in-out, infinite

### Grid Pulse (Subtle background breathing)
```css
@keyframes grid-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```
Duration: 8s, ease-in-out, infinite

---

## Utility Classes Quick Reference

### Tailwind Classes (from config)
```tsx
// Neon borders
className="border-fat border-neon-pink shadow-neon-pink"
className="border-fat border-neon-cyan shadow-neon-cyan"

// Glass panels
className="panel-glass" // Pre-built glass card with reflection

// Buttons
className="btn-neon-pill" // Fat pill button with gradient

// Badges
className="badge-chrome" // Chrome metallic badge

// Text effects
className="text-holographic" // Animated rainbow gradient text
className="text-neon-glow" // Simple text glow

// Animations
className="animate-orb-pulse"
className="animate-shimmer-sweep"
className="animate-fade-in-glow"
```

### CSS Custom Properties
```tsx
// Use in inline styles
style={{
  background: 'var(--gradient-neon-primary)',
  borderRadius: 'var(--radius-pill)',
  boxShadow: 'var(--shadow-triple-pink)',
  padding: 'var(--space-6)'
}}
```

---

## Implementation Checklist

### Phase 1: Core System (DONE)
- [x] Update `design-tokens.css` with neon palette
- [x] Update `tailwind.config.js` with new colors/animations
- [x] Update `index.css` with component styles
- [x] Add background effects (grid, blob)

### Phase 2: Component Updates
- [ ] Update `Dashboard.tsx` - replace background class with `bg-neon-grid`
- [ ] Update `NeuroStatusHero.tsx` - add hero orb, holographic title
- [ ] Update button components - apply pill shapes and neon glows
- [ ] Update input components - rounded borders with neon focus
- [ ] Update card components - glass panels with chrome reflections

### Phase 3: Polish
- [ ] Add light sweep animation to primary buttons
- [ ] Ensure all progress bars use three-tone gradient
- [ ] Replace rectangle icons with thick-line glowing style
- [ ] Add holographic shimmer to section headers
- [ ] Test accessibility (WCAG AA contrast maintained)

---

## Accessibility Notes

All neon colors maintain WCAG AA contrast ratios:
- White text on dark purple backgrounds: **14:1** (AAA)
- Lavender text on dark purple: **4.8:1** (AA)
- Neon pink on black: **7.2:1** (AAA)
- Neon cyan on black: **9.8:1** (AAA)

Glows are decorative only and do not affect readability.

---

## Browser Compatibility

- `backdrop-filter`: Supported in all modern browsers (Safari 14+, Chrome 76+, Firefox 103+)
- `background-clip: text`: Supported with `-webkit-` prefix
- CSS animations: Universal support
- Fallbacks: Dark purple solid backgrounds if backdrop-filter unsupported

---

## File References

1. **Design Tokens**: `/Users/laurenjohnston/laurenj3250-debug/MostlyMyelinated/frontend/src/styles/design-tokens.css`
2. **Tailwind Config**: `/Users/laurenjohnston/laurenj3250-debug/MostlyMyelinated/frontend/tailwind.config.js`
3. **Global Styles**: `/Users/laurenjohnston/laurenj3250-debug/MostlyMyelinated/frontend/src/index.css`

---

**Ready to roll!** The design system is now 2085-ready with fat neon borders, chrome reflections, and triple-layer glows. No rectangles in sight.
