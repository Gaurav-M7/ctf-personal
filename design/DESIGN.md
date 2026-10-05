---
name: Campus Commute
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3e4947'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6e7977'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'
  primary: '#005c55'
  on-primary: '#ffffff'
  primary-container: '#0f766e'
  on-primary-container: '#a3faef'
  inverse-primary: '#80d5cb'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#0047bf'
  on-tertiary: '#ffffff'
  tertiary-container: '#1e5fe7'
  on-tertiary-container: '#e6e9ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf2e8'
  primary-fixed-dim: '#80d5cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes a peer-to-peer campus ridesharing experience defined by trust, safety, and mutual community benefit. Designed primarily for university students, faculty, and campus staff, the visual language balances the structured reliability of civic transit with the friendly, accessible energy of collegiate life.

The aesthetic follows **Corporate / Modern with Soft Tactile Accents**, strongly influenced by Material 3 ergonomics:
- **Tone:** Safe, collegial, effortless, and eco-conscious.
- **Visual Weight:** Light and spacious, utilizing generous whitespace on an off-white canvas paired with crisp white interactive cards.
- **Utility First:** Prioritizes glanceable ride data (pickup spots, departure count-downs, seat availability, verified .edu badges) with generous minimum 48px touch targets tailored for one-handed mobile transit use.

## Colors

The palette leverages deep, stable teals to signal sustainability and safety, accompanied by sunny ambers to spotlight shared fuel costs and financial savings.

### Palette Implementation
- **Primary Teal (`#0F766E`):** Represents institutional trust, carbon reduction, and primary call-to-actions.
  - *Dark Shade (`#115E59`):* Pressed states and high-contrast text on light teal.
  - *Light Container (`#F0FDFA`):* Card highlights, driver route banners, and active list selections.
  - *Subtle Accent (`#CCFBF1`):* Inactive status pills, selection rings, and progress indicators.
- **Secondary Amber (`#F59E0B`):** Applied exclusively to monetary elements, split fares, and instant fuel cost calculations.
  - *Amber Light (`#FEF3C7`):* Cost badge backgrounds and rider savings callouts.
- **Tertiary Blue (`#2563EB` / `#3B82F6`):** Dedicated exclusively to student identity verification, `.edu` email checks, and safety assurance credentials.
- **Neutral & Surface Tones:**
  - *Canvas (`#F8FAFC`):* Off-white background preventing screen fatigue under bright outdoor sunlight.
  - *Surface White (`#FFFFFF`):* Pure white elevated cards for rides, routes, and modal overlays.
  - *Surface Muted (`#F1F5F9`):* Form input fields, route visual paths, and secondary button backgrounds.
  - *Subtle Border (`#E2E8F0`):* Structural 1px separation lines.
- **Feedback & Semantics:**
  - *Success (`#10B981`):* Ride confirmed, driver arrived, seat secured.
  - *Warning (`#F59E0B`):* Running 5 mins late, only 1 seat remaining.
  - *Error (`#EF4444`):* Ride canceled, invalid drop-off location.

## Typography

The design system utilizes **Inter** across all typographic touchpoints to maximize legibility across high-density transit data, rapid mobile scrolling, and changing outdoor light levels.

- **Headlines:** Displayed with tight negative letter spacing (`-0.01em` to `-0.02em`) and bold weights (`600`–`700`) to anchor viewport destinations, time estimations, and primary card titles.
- **Body:** Neutral weights (`400`) balanced with generous line heights (`1.4`–`1.5`) provide high legibility for passenger notes, car model specs, and campus safety disclaimers.
- **Labels & Microcopy:** Medium and SemiBold treatments (`500`–`600`) with slight positive tracking applied to `.edu` badges, departure pill tags, seat tallies, and navigation bars.

## Layout & Spacing

Layouts adhere to an adaptive fluid mobile-first grid, built around an 8pt modular coordinate system:
- **Mobile (Default):** Fluid 4-column structure with `16px` (`1rem`) outer screen margin and `16px` gutters. Content containers run flush to the margins with vertical card rhythm spaced at `12px` to `16px`.
- **Tablet / Responsive Fold:** Scales to an 8-column layout with `24px` margins and a maximum content containment width of `640px` for ride detail sheets and scheduling forms.
- **Touch Ergonomics:** All interactive trigger zones strictly enforce a minimum height and width of `48px`. Secondary icons use visual frames of 20–24px surrounded by 12–14px interactive tap buffers.

## Elevation & Depth

Depth is established via diffused ambient drop shadows combined with structural 1px borders, avoiding dark or harsh drop-off shadows.

- **Base Level (Canvas):** `#F8FAFC` flat surface.
- **Level 1 (Cards, Search Modules):** Surface pure `#FFFFFF`, bordered by `1px solid #E2E8F0` with `shadow-sm` (`0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`).
- **Level 2 (Active Trip Cards, Filter Bottom Sheets):** `#FFFFFF` with `shadow-md` (`0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`).
- **Level 3 (Floating Action Buttons & Ride Booking Bars):** `#FFFFFF` or `#0F766E` anchored at the bottom edge with `0 10px 15px -3px rgba(15, 118, 110, 0.12), 0 4px 6px -4px rgba(15, 118, 110, 0.08)`.

## Shapes

The interface balances soft friendliness with structural clarity through deliberate corner radiuses:
- **Cards & Modal Sheets:** Formed using `16px` (`rounded-2xl`) corners to create smooth, approachable content islands.
- **Input Fields & Dropdowns:** Set to `12px` (`rounded-xl`) to clearly separate input controls from background card surfaces.
- **Interactive Badges, Verification Badges, and FABs:** Rendered with full pill curvature (`rounded-full` / `9999px`) to immediately signal dynamic or tap-friendly utility.

## Components

### Buttons
- **Primary (Ride Booking / Post Ride):** Solid `#0F766E` background with `#FFFFFF` text. Height of `48px` minimum, full width or auto with `1.5rem` horizontal padding. Rounded to `12px` (`rounded-xl`). Active state: `#115E59`.
- **Secondary (Message Driver / Details):** `#F0FDFA` background with `#0F766E` text and `1px solid #CCFBF1`.
- **Floating Action Button (Offer a Ride):** Rounded pill (`rounded-full`), `#0F766E` fill, `#FFFFFF` icon + label, elevated via Level 3 shadow.

### Ride Cards
- Contained in pure `#FFFFFF` with `rounded-2xl` corners and `1px solid #E2E8F0`.
- **Header:** Driver avatar (40px) with overlay verified blue check badge, driver name, rating, and campus affiliation.
- **Route Timeline:** Vertical stepped indicator with a teal node (pickup) and amber node (drop-off).
- **Footer:** Split into price tag (`#FEF3C7` background with `#B45309` bold text) and remaining seats pill.

### Chips & Badges
- **Status Pills:** Fully rounded (`rounded-full`), `32px` touch height.
  - *Verified Student:* `#EFF6FF` background, `#2563EB` text, verified icon.
  - *Cost Saved:* `#FEF3C7` background, `#D97706` text.
  - *Seats Left:* `#F0FDFA` background, `#0F766E` text.

### Form Inputs
- Height of `52px` with a subtle `#F1F5F9` background, `rounded-xl` (`12px`), and `1px solid transparent`.
- Focus state activates `1px solid #0F766E` and an ambient teal focus ring (`rgba(15, 118, 110, 0.15)`).

### Lists & Steppers
- Campus pickup points presented in clean card lists separated by `8px` gaps instead of divider lines. Route stops use connected dotted lines in `#CBD5E1`.