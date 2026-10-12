---
name: University Event Management Platform
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#464554'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#4b41e1'
  on-secondary: '#ffffff'
  secondary-container: '#645efb'
  on-secondary-container: '#fffbff'
  tertiary: '#545c72'
  on-tertiary: '#ffffff'
  tertiary-container: '#6c748b'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
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
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system delivers a clean, modern SaaS aesthetic tailored for a university event management platform. The design style combines Corporate Modernism with refined minimalism, balancing institutional trust with contemporary ease of use. The color palette centers on crisp white and light-grey surfaces, grounded by deep navy typography and elevated by energetic indigo and violet accents. 

The emotional response is professional, organized, and approachable. It evokes clarity and calm efficiency, ensuring that busy campus administrators, student organizers, and attendees can effortlessly navigate complex scheduling, ticketing, and venue coordination without cognitive fatigue.

## Colors

The color palette is built for clarity and hierarchy, favoring light, breathable backgrounds paired with high-contrast textual elements. 

- **Primary & Secondary:** Vibrant indigo (`#6366f1`) and deep violet (`#4f46e5`) drive interactive elements, active states, and primary calls to action.
- **Neutrals:** Deep navy (`#0f172a`) anchors text and crucial iconography for maximum legibility. Surfaces utilize crisp whites (`#ffffff`) and soft light-greys (`#f8fafc`) to structure the dashboard layout.
- **Semantic Palette:** Green (`#22c55e`) communicates successful operations and confirmed registrations, amber (`#f59e0b`) highlights pending approvals and time-sensitive warnings, and red (`#ef4444`) denotes critical errors or cancellation actions.

## Typography

Typography relies on **Inter** to maintain a neutral, systematic, and highly legible interface suited for data-dense event schedules and administrative tables. 

- **Scale & Hierarchy:** Headings utilize tight tracking and semi-bold-to-bold weights to establish immediate structural clarity across dashboard widgets. Body copy prioritizes high-contrast readability against light backgrounds.
- **Responsive Adaptations:** For mobile viewports, scale down `headline-xl` (32px) to a maximum of 26px to prevent awkward wrapping on narrow screens. Ensure touch targets for textual links maintain a minimum height of 44px.

## Layout & Spacing

The platform uses a responsive 12-column fluid grid system optimized for desktop administrative views and tablet-based check-in kiosks. 

- **Spacing Rhythm:** Built on a strict 4px/8px baseline grid, utilizing designated spacing tokens to maintain consistent padding within cards, table rows, and navigational containers.
- **Breakpoints:** 
  - *Mobile (< 768px):* Single-column stacking, collapsible sidebar navigation, and edge-to-edge card layouts with 1rem outer margins.
  - *Tablet (768px – 1024px):* Two-column widget distribution, persistent icon-only navigation, and 1.5rem gutters.
  - *Desktop (> 1024px):* Full 12-column grid with a fixed sidebar, generous whitespace, 1.5rem gutters, and 2rem outer canvas margins.

## Elevation & Depth

Visual hierarchy is achieved through a combination of subtle tonal layers, low-contrast outlines, and delicate ambient shadows. 

- **Surfaces:** Utilize pure white (`#ffffff`) cards resting on a soft light-grey (`#f8fafc`) canvas to separate interactive modules from the background.
- **Shadows:** Apply ultra-diffused, low-opacity shadows (`0 4px 6px -1px rgba(15, 23, 42, 0.05)`) to floating elements, dropdown menus, and active modal dialogs.
- **Borders:** Implement subtle "ghost borders" (`#e2e8f0`) to delineate grid cells, table dividers, and unselected card containers without relying on heavy visual noise.

## Shapes

The design system adopts a **Rounded** shape language (`roundedness` level 2), creating an approachable and modern software experience.

- **Standard Radius:** Base UI elements, input fields, and standard buttons utilize a `0.5rem` border radius.
- **Containers:** Large structural elements, such as dashboard cards and modal windows, scale up to `1rem` (`rounded-lg`) to soften the administrative density.
- **Pills & Badges:** Status indicators, tags, and avatar containers use fully rounded pill shapes to clearly separate categorical metadata from primary content blocks.

## Components

- **Buttons:** Primary actions use solid indigo/violet gradients or solid primary fills with white text, a `0.5rem` radius, and clear hover state darkening. Secondary actions feature ghost borders with deep navy text. Destructive actions utilize the semantic red color.
- **Chips & Badges:** Compact pill-shaped containers used for event categories and status indicators (success green, amber pending, red errors), featuring soft background tints paired with matching dark semantic text.
- **Lists:** Clean, data-dense rows with subtle bottom borders, generous vertical padding, and clear typographic distinction between primary titles and secondary metadata.
- **Checkboxes & Radios:** Precision-engineered square and circular inputs with crisp borders, utilizing the primary indigo accent for checked states.
- **Input Fields:** Outlined text boxes with `0.5rem` corner rounding, clear placeholder text, and high-contrast labels positioned above. Include distinct focus rings using the primary indigo color at 20% opacity.
- **Cards:** White container surfaces featuring subtle structural borders and light ambient shadows, housing distinct dashboard metrics, event summaries, and administrative controls.
- **Data Tables:** Structured grid layouts featuring sticky headers, sortable column indicators, alternating row hover states, and integrated pagination controls for managing large volumes of campus events and student registrations.