---
name: CareBridge LIFF
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf3'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d5e3fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#233144'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#006e2b'
  on-secondary: '#ffffff'
  secondary-container: '#5efd83'
  on-secondary-container: '#00722d'
  tertiary: '#006194'
  on-tertiary: '#ffffff'
  tertiary-container: '#007bb9'
  on-tertiary-container: '#fdfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#69ff89'
  secondary-fixed-dim: '#3ee26c'
  on-secondary-fixed: '#002108'
  on-secondary-fixed-variant: '#00531f'
  tertiary-fixed: '#cce5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d31'
  on-tertiary-fixed-variant: '#004b73'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d5e3fc'
  mint-bg: '#F0FDF4'
  surface-subtle: '#F8FAFC'
  status-available: '#059669'
  status-borrowed: '#0284C7'
  status-pending: '#D97706'
  status-overdue: '#DC2626'
  status-maintenance: '#64748B'
  badge-available-bg: '#DCFCE7'
  badge-borrowed-bg: '#E0F2FE'
  badge-pending-bg: '#FEF3C7'
  badge-overdue-bg: '#FEE2E2'
  badge-maintenance-bg: '#F1F5F9'
typography:
  headline-xl:
    fontFamily: plusJakartaSans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: plusJakartaSans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 30px
  headline-md:
    fontFamily: plusJakartaSans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  headline-sm:
    fontFamily: plusJakartaSans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: plusJakartaSans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: plusJakartaSans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: plusJakartaSans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: plusJakartaSans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: plusJakartaSans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: plusJakartaSans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 2.5rem
  screen-gutter: 1rem
  card-padding: 1rem
  bottom-nav-height: 4.25rem
  touch-target-min: 3rem
---

## Brand & Style

This design system delivers a public health interface tailored for Thailand's Sub-district Health Promoting Hospitals (รพ.สต.). It operates primarily within LINE LIFF (LINE Front-end Framework) to facilitate medical equipment loaning, tracking, and returns for diverse end-users—ranging from village health volunteers (อสม.) and community nurses to elderly patients and family caregivers.

### Personality & Tone
- **Reassuring & Caring:** Grounded in clinical public health trust, avoiding sterile or intimidating hospital aesthetics.
- **Frictionless & Direct:** Seamlessly integrated into the LINE chat ecosystem, minimizing complex authentication barriers.
- **Accessible & Dignified:** High legibility, generous touch targets, clear Thai typographic hierarchy, and unambiguous status indicators designed specifically for low-digital-literacy and elderly users.

### Design Movement
The system combines **Modern Healthcare Utility** with **LINE In-App Cleanliness**. It emphasizes clear white and mint-tinted content cards, soft rounded corners, crisp high-contrast status pills, tactile tap affordances, and zero decorative noise. Layouts prioritize fast mobile scanning, direct action buttons, and prominent QR identification cues.

## Colors

The color palette unites the official LINE ecosystem green (`#06C755`) with a dependable clinical emerald green (`#059669`), anchored by slate neutrals and distinct status indicators. 

### Color Roles
- **Primary (`#059669`):** Represents public health authority, safety, and operational actions (primary CTAs, active tab icons, key progress states).
- **Secondary (`#06C755`):** The LINE signature green, utilized for LINE-native bridges, notification highlights, and official account actions.
- **Tertiary (`#0284C7`):** Hospital sky blue, used for informational flags, active loan statuses, and assistive patient records.
- **Neutral (`#475569`):** Balanced slate gray, calibrated to reduce harsh pure-black eye strain while delivering WCAG AAA contrast against light backgrounds.

### Domain Status Colors
Status badges map directly to the service's equipment tracking workflow:
- **พร้อมยืม (Available):** Text `#059669` on `#DCFCE7` background.
- **อยู่ระหว่างยืม (Borrowed / Active):** Text `#0284C7` on `#E0F2FE` background.
- **รออนุมัติ (Pending Review):** Text `#D97706` on `#FEF3C7` background.
- **เกินกำหนดส่งคืน (Overdue):** Text `#DC2626` on `#FEE2E2` background.
- **ซ่อมบำรุง/งดให้บริการ (Maintenance):** Text `#64748B` on `#F1F5F9` background.

The default presentation is strict light mode, optimizing outdoor legibility for community health volunteers conducting field home visits.

## Typography

Typography prioritizes extreme readability across bilingual Thai and English contexts. The geometry provides open counterforms and distinct terminal clarity, pairing seamlessly with native Thai UI system fonts (such as Sarabun and Prompt).

### Scale & Hierarchy Rules
- **Headline XL (28px):** Screen entry points (e.g., "ยืม-คืน อุปกรณ์การแพทย์", "ประวัติการยืม").
- **Headline LG (22px):** Medical device item titles and modal confirm titles.
- **Headline MD (18px):** Section subheadings, date headers, user credential badges.
- **Headline SM (16px):** Form grouping headers and inventory card spec subtitles.
- **Body LG / MD (16px / 15px):** Instruction text, form inputs, and dialogue body copy. Set with generous line heights (`lineHeight: 24px–26px`) to ensure Thai tone marks (วรรณยุกต์) and ascenders/descenders never clip or collide.
- **Label MD / SM (13px / 11px):** Status badges, pill tags, and asset identifiers (`asset_code`). Uses bold weights for immediate visual recognition.

## Layout & Spacing

This design system employs a single-column, fluid vertical layout tailored strictly for LINE LIFF mobile web views (`max-width: 480px` centered on wider screens or tablets).

### Layout & Rhythms
- **Screen Margins:** Fixed `1rem` (16px) gutter on mobile edges to maximize viewport utility while preventing edge mis-taps.
- **Card Spacing:** Equipment inventory cards use an 8px (`space-xs`) internal grouping rhythm and a 16px (`space-md`) vertical separation between cards.
- **Action Zones & Safe Areas:** The primary interaction zone sits at the bottom viewport:
  - Sticky bottom sheets and persistent action bars account for iOS/Android home indicators (`env(safe-area-inset-bottom)`).
  - All primary tappable triggers adhere to `touch-target-min: 3rem` (48px) to accommodate senior citizens and busy healthcare staff wearing latex gloves.

## Elevation & Depth

Visual depth is communicated primarily through low-contrast surface tints and subtle ambient shadows, creating crisp separations without visual clutter.

### Elevation Levels
- **Level 0 (Flat / Canvas):** Neutral background `#F8FAFC` or subtle mint tint `#F0FDF4`.
- **Level 1 (Default Cards & Items):** Pure `#FFFFFF` card surfaces with a subtle 1px border (`#E2E8F0`) and ambient drop: `0px 2px 4px rgba(15, 23, 42, 0.04)`.
- **Level 2 (Active Sheets & Sticky Bars):** Bottom action sheets and sticky filters use `0px -4px 16px rgba(15, 23, 42, 0.08)` to clearly separate interactive buttons from scrollable inventory content.
- **Level 3 (Modals & QR Scanner Dialogues):** Backdrop overlay with 50% opacity slate (`rgba(15, 23, 42, 0.5)`) and centered dialogs elevated with `0px 12px 32px rgba(15, 23, 42, 0.16)`.

## Shapes

The design system uses a rounded shape language (Level 2) to foster warmth, approachability, and modern utility.

### Corner Radii Guidelines
- **Cards & Content Containers:** `rounded-lg` (1rem / 16px) for clean, friendly encapsulation of medical device listings.
- **Form Controls & Inputs:** `0.75rem` (12px) for structured, easy-to-tap text fields and date selectors.
- **Buttons:** `0.75rem` (12px) for general actions; `pill` (9999px) for search filters and toggle chips.
- **Status Badges & Category Tags:** Fully pill-shaped (`9999px`) to emphasize state encapsulation and differentiate metadata from clickable interactive buttons.
- **LIFF Header & Bottom Modals:** Top corners rounded at `1.5rem` (24px) for pull-up sheets.

## Components

### Buttons
- **Primary Action (ยืมอุปกรณ์ / บันทึกข้อมูล):** Solid Emerald (`#059669`) with white text, 48px height minimum, semi-bold 16px typography. Focus and active states apply a subtle brightness drop.
- **Secondary Action (ติดต่อเจ้าหน้าที่ LINE):** Solid LINE Green (`#06C755`) or surface outline with emerald border (`#059669`), providing recognizable platform affinity.
- **Destructive Action (ยกเลิกคำขอ / แจ้งชำรุด):** Subtle soft red fill (`#FEE2E2`) with crimson text (`#DC2626`).

### Status Badges & Chips
- **Equipment Status Badges:** Compact pill badges (padding: 4px 12px) displaying state with high contrast:
  - `พร้อมยืม` (Green badge)
  - `อยู่ระหว่างยืม` (Sky blue badge)
  - `รออนุมัติ` (Amber badge)
  - `เกินกำหนดส่งคืน` (Red badge)
- **Category Filter Chips:** Horizontal scrolling bar of pills at the top of device catalogues (e.g., "ทั้งหมด", "เตียงผู้ป่วย", "ถังออกซิเจน", "รถเข็น (Wheelchair)"). Selected chips invert to solid primary emerald.

### Medical Inventory Card
- **Layout:** Horizontal split or vertical stacked card with a 1:1 rounded device thumbnail (`96x96px` on mobile), item title in `headline-sm`, serial/asset code badge (`asset_code`), remaining stock counter ("คงเหลือ 2 เครื่อง"), and current operational badge in the upper right corner.
- **Feedback:** Pressed state shifts card background to `#F8FAFC`.

### Form Fields & Inputs
- **Inputs:** 48px height with 1px border (`#CBD5E1`), 12px rounded corners, and soft emerald focus outline (`#059669`).
- **Thai ID & Phone Inputs:** Formatted segmented masks for `x-xxxx-xxxxx-xx-x` and `xxx-xxx-xxxx` with numeric keyboard defaults (`inputmode="numeric"`).

### QR Code Scanning Trigger
- **Floating or Header Action:** Prominent floating scan button or input-adjacent icon button for staff and patients to quickly scan asset stickers on physical devices.

### Bottom Action Sheet
- **Modal Framework:** Slides up from the bottom edge of the LIFF viewport with a 24px top radius, containing quick loan verification, return date confirmation, and emergency รพ.สต. phone contacts.