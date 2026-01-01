# Motubas Brand Guidelines

## 1. Brand Essence

**Motubas** is the digital companion for the "Motuba" (Mobil Tua Bangka) community. We prove that old cars, when maintained well, are reliable assets, not burdens.

### Vision
To modernize how Indonesian car enthusiasts maintain their aging vehicles, ensuring every "Motuba" has a clear, valuable history.

### Target Audience
-   **Demographic**: Men, 30–50 years old.
-   **Psychographic**:
    -   Car owners who view their vehicle as a partner, not just a tool.
    -   Value function and reliability over flashiness.
    -   Tech literacy varies; they prefer straightforward, "no-nonsense" tools.
    -   Appreciates transparency and honesty (no hidden potential repairs).

---

## 2. Brand Persona: "Om Motu"

Our brand speaks through our AI and UI persona, **Om Motu**.

-   **Archetype**: The "Bengkel Best Friend".
-   **Traits**: Reliable, Knowledgeable (Suhu), Relaxed (Santai), Honest.
-   **Vibe**: That one uncle who knows everything about engines but explains it simply while drinking coffee.

### Voice & Tone
-   **Friendly & Respectful**: Uses terms like *"Om"*, *"Sobat"*, *"Gans"*. Avoids stiff bureaucratic language like *"Anda"* or *"Pengguna"*.
-   **Informal but Clear**:
    -   ✅ *"Mesinnya ngelitik lagi ya Om? Coba cek olinya dulu."*
    -   ❌ *"Terdeteksi anomali pada pembakaran internal. Harap periksa pelumas."*
-   **Encouraging**: Maintenance can be stressful. We make it feel manageable.
    -   ✅ *"Tenang Om, sparepart ginian banyak kok di pasaran."*

---

## 3. Visual Identity

The design should bridge the gap between **Nostalgia** (Classic Cars) and **Modern Utility** (Clean Tech).

### Color Palette "Garage Modern"

We move away from generic "Startup Blue" to colors that resonate with automotive culture.

-   **Primary: Mechanic Navy** (Reliability, Trust)
    -   Use for: Primary buttons, Headers, Active states.
    -   *Vibe*: The clean shirt of a head mechanic.
-   **Accent: Rust Orange / Turn Signal Amber** (Attention, Warmth)
    -   Use for: Alerts, 'Due Soon' badges, Call-to-Actions (sparingly).
    -   *Vibe*: Vintage dashboard lights, classic indicators.
-   **Background: Metallic White & Oil Gray**
    -   Use for: Backgrounds, Cards.
    -   *Vibe*: Clean workshop floor, brushed metal parts.
-   **Status Colors**:
    -   **Safe Green**: "Mesin Sehat" status.
    -   **Warning Yellow**: "Perlu Service" (Due soon).
    -   **Danger Red**: "Turun Mesin" (Overdue/Critical).

### Typography

-   **Headings**: Strong, sturdy sans-serif (e.g., **Inter** or **Roboto Condensed**). Needs to be legible for older eyes. High contrast is mandatory.
-   **Body**: Clean sans-serif with generous line height (1.5x).
-   **Sizing**: **Mobile-First sizing**. Minimum font size 16px for body text to accommodate user eyesight in 30-50s range.

### Imagery & Iconography

-   **Style**: Functional line icons (like the dashboard indicators).
-   **Photos**: Real cars in real garages, not pristine 3D showroom renders. Show grease, tools, and hands working.
-   **Empty States**: Use illustrations of classic car silhouettes (Kijang Kapsul, Panther, Civic Wonder) instead of abstract shapes.

---

## 4. UI/UX Principles for Motubas

1.  **"Bapak-Bapak Friendly" (Accessibility First)**
    -   **Big Buttons**: Fingers can be large or greasy. Button height min 48px.
    -   **High Contrast**: No light grey text on white backgrounds.
    -   **Direct Navigation**: Don't hide things in nested menus. "Tambah Service" should be huge.

2.  **No Jargon Without Explanation**
    -   If we say "Timing Belt", explain briefly why it matters if needed (or let Om Motu explain).

3.  **Mobile First**
    -   Most users check this app *at the bengkel* or *in the garage*.
    -   The interface must be usable with one hand.

---

## 5. Implementation in Code
-   **Class Names**: Use functional Tailwind utilities but maintain semantic consistency (e.g., `text-muted-foreground` for non-critical info).
-   **Components**: Reusable `Card` components for "Service History" to act like a physical logbook card.
