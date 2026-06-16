# DESIGN.md — Apple Design System (Dark Mode Adaptation)

## Overview
Duolingo's design language adapted for Vocatopia dark mode. The original Duolingo uses white backgrounds; this adaptation preserves the gamification energy, rounded shapes, chunky buttons, and signature green palette on dark backgrounds ("Duolingo Super" dark mode aesthetic).

---

## Color Palette

### Primary
| Token | Value | Usage |
|-------|-------|-------|
| `--duo-green` | `#58CC02` | Primary CTA, progress, success |
| `--duo-green-press` | `#58A700` | Button bottom-edge shadow (3D depth) |
| `--duo-green-dim` | `rgba(88,204,2,.15)` | Card highlights, done states |

### Feedback
| Token | Value | Usage |
|-------|-------|-------|
| `--duo-gold` | `#FFD900` | Coins, XP, rewards |
| `--duo-orange` | `#FF9600` | Streaks, warnings |
| `--duo-red` | `#FF4B4B` | Wrong answers, hearts |
| `--duo-blue` | `#1CB0F6` | Info, hints |

### Surface (Dark Mode)
| Token | Value | Usage |
|-------|-------|-------|
| `--duo-bg` | `#1C1C1E` | App background |
| `--duo-card` | `#2B2B2F` | Card surfaces |
| `--duo-border` | `rgba(255,255,255,.10)` | Card borders |
| `--duo-text` | `#FFFFFF` | Primary text |
| `--duo-text-sub` | `#AFAFAF` | Secondary text |

---

## Typography

- **Font**: `Nunito` (Google Fonts) — rounded, friendly, high legibility
- **Headings**: `font-weight: 800` (ExtraBold)
- **Body**: `font-weight: 600–700`
- **Labels/captions**: `font-weight: 700`, uppercase with `letter-spacing: 0.5px`

---

## Components

### Buttons — The Duolingo Signature 3D Style
```css
/* Primary CTA */
background: #58CC02;
border-radius: 16px;
border: none;
border-bottom: 4px solid #58A700;  /* creates 3D depth illusion */
padding: 16px 24px;
font-weight: 800;
font-size: 16px;
transition: transform .1s, border-bottom-width .1s;

/* Press state */
:active {
  transform: translateY(2px);
  border-bottom-width: 2px;  /* collapses to simulate press */
}
```

### Cards
```css
background: rgba(255,255,255,.04);
border: 2px solid rgba(255,255,255,.10);
border-radius: 16px;
padding: 16px;
```

### Progress / XP Bar
```css
track: background rgba(255,255,255,.08), height 10px, border-radius 5px
fill:  background #58CC02, transition width .6s
```

### Subject / Skill Cells
```css
Inactive: border 2px solid rgba(255,255,255,.10), border-radius 12px
Done:     border 2px solid #58CC02, background rgba(88,204,2,.12)
```

### Navigation (Bottom)
```css
Active icon: color #58CC02, transform scale(1.15)
Active label: color #58CC02, font-weight 800
Inactive: color #AFAFAF
```

---

## Motion
- Button press: `translateY(2px)` + border-bottom collapse (no scale)
- Correct answer: `bounce` keyframe (scale 1 → 1.1 → 1)
- Wrong answer: `shake` keyframe (translateX ±5px)
- Progress bar: `transition: width .6s cubic-bezier(.4,0,.2,1)`

---

## Gamification Visual Language
| Element | Style |
|---------|-------|
| 🪙 Gold chip | `#FFD900` text, `rgba(255,217,0,.15)` bg |
| 🔥 Streak | `#FF9600` orange |
| ✅ Done state | `#58CC02` green border + dim fill |
| ❌ Wrong | `#FF4B4B` red |
| 💎 Reward | Purple `#CE82FF` |
