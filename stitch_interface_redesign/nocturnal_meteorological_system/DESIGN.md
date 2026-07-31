---
name: Nocturnal Meteorological System
colors:
  surface: '#111415'
  surface-dim: '#111415'
  surface-bright: '#373a3b'
  surface-container-lowest: '#0c0f10'
  surface-container-low: '#191c1d'
  surface-container: '#1d2021'
  surface-container-high: '#282a2b'
  surface-container-highest: '#323536'
  on-surface: '#e1e3e4'
  on-surface-variant: '#c8c8ac'
  inverse-surface: '#e1e3e4'
  inverse-on-surface: '#2e3132'
  outline: '#929279'
  outline-variant: '#474833'
  surface-tint: '#c2d000'
  primary: '#ffffff'
  on-primary: '#2f3300'
  primary-container: '#deed1a'
  on-primary-container: '#626a00'
  inverse-primary: '#5c6300'
  secondary: '#c2c7d0'
  on-secondary: '#2c3138'
  secondary-container: '#42474f'
  on-secondary-container: '#b1b5bf'
  tertiary: '#ffffff'
  on-tertiary: '#29313b'
  tertiary-container: '#dbe3f0'
  on-tertiary-container: '#5d6570'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#deed1a'
  primary-fixed-dim: '#c2d000'
  on-primary-fixed: '#1b1d00'
  on-primary-fixed-variant: '#454b00'
  secondary-fixed: '#dee2ec'
  secondary-fixed-dim: '#c2c7d0'
  on-secondary-fixed: '#171c23'
  on-secondary-fixed-variant: '#42474f'
  tertiary-fixed: '#dbe3f0'
  tertiary-fixed-dim: '#bfc7d4'
  on-tertiary-fixed: '#141c25'
  on-tertiary-fixed-variant: '#3f4752'
  background: '#111415'
  on-background: '#e1e3e4'
  surface-variant: '#323536'
typography:
  display-temp:
    fontFamily: Hanken Grotesk
    fontSize: 84px
    fontWeight: '700'
    lineHeight: 90px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-primary:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-secondary:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-data:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-padding: 1.25rem
  stack-gap: 1rem
  element-gap: 0.5rem
  section-margin: 2rem
---

## Brand & Style

The design system is engineered for a premium, mobile-first weather experience that prioritizes rapid data assimilation within a sophisticated, high-end environment. The brand personality is authoritative yet ethereal, blending the precision of scientific instrumentation with the atmospheric beauty of the natural world.

The visual style is **Glassmorphic Minimalism**. It utilizes deep, multi-layered backgrounds to create a sense of vast space, while critical weather data is housed in semi-transparent "glass" containers. This approach ensures that even with high data density, the UI feels breathable and premium. Vibrant accents are reserved strictly for alerts and active states, ensuring that the user's attention is directed exactly where it needs to be during inclement conditions.

## Colors

The palette is anchored by "Midnight Obsidian" and "Deep Navy" to reduce eye strain and provide a cinematic backdrop. 

- **Primary (Electric Sulfur):** A high-visibility yellow used for critical alerts, current temperature highlights, and active navigation states.
- **Surface Tiers:** Backgrounds use a dark gradient from `#0F1216` to `#1A1F26`. Elevated cards use semi-transparent fills with a subtle 1px border to simulate glass.
- **Functional Colors:** Success states utilize a mint green, while precipitation and pressure metrics use a muted cyan to maintain the cool, atmospheric temperature of the UI.

## Typography

Typography is treated as a core data-visualization tool. **Hanken Grotesk** provides a sharp, contemporary feel for primary readings and headers. **Inter** handles the heavy lifting of descriptions and secondary data for maximum legibility. **JetBrains Mono** is introduced for technical metrics (wind speed, humidity, pressure) to evoke the precision of a digital weather station.

High contrast is maintained by using pure white for primary values and the accent yellow for alerts. Secondary information is pushed back using reduced opacity (70%) rather than grey tones to maintain the color harmony of the deep background.

## Layout & Spacing

The system follows a **Fluid Grid** model optimized for vertical scrolling on mobile devices. 

- **Margins:** A consistent 20px (1.25rem) horizontal margin ensures content is safely inset from screen edges.
- **The "Data-Grid":** Secondary weather metrics (wind, UV, visibility) are organized in a 2-column or 4-column flexible grid within glass cards.
- **Vertical Rhythm:** Sections are separated by a 32px (2rem) margin to clearly distinguish between "Current Conditions," "Hourly Forecast," and "Extended Outlook."
- **Safe Areas:** On mobile, critical data remains centered or top-aligned, while navigation persists in a bottom-docked glass bar for thumb-accessibility.

## Elevation & Depth

This design system eschews traditional shadows in favor of **Tonal Layering and Backdrop Blurs**. 

1. **Base Level:** Deep gradient background (`#0F1216`).
2. **Intermediate Level:** Glass containers with a `blur(20px)` and a `1px` stroke (white at 10% opacity) to define the edges.
3. **Interactive Level:** Elements like buttons or active tabs use a solid fill of the Primary color or a brighter glass tint.

The "depth" is perceived through the distortion of the background colors through these translucent layers, creating a sophisticated "instrument panel" aesthetic.

## Shapes

The shape language is consistently **Rounded**. 

Large weather cards and containers use a 16px (1rem) radius. Smaller elements like chips and input fields use a 8px (0.5rem) radius. This softening of the geometry balances the "cold" technical nature of the dark theme and monospaced fonts, making the application feel more approachable and modern.

## Components

- **Glass Cards:** The primary container. Features a semi-transparent dark fill, a top-light subtle inner stroke, and a heavy backdrop blur.
- **Action Buttons:** Use a solid yellow fill with black text for primary actions. Secondary actions use the glass card style with white text.
- **Weather Icons:** Custom thin-stroke (1.5px) icons. Use the primary yellow for "Sun" and active states, and white/cyan for "Rain" or "Clouds."
- **Forecast Lists:** Horizontal scrolling lists for hourly data; vertical rows for 15-day views. Rows should have a subtle separator or alternate between two very close shades of charcoal.
- **Alert Chips:** High-contrast capsules with the Primary yellow background and black `label-data` typography to ensure immediate recognition.
- **Input Fields:** Search bars should be fully rounded (pill-shaped) with a glass texture and a leading search icon.