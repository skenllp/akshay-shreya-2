# Akshay & Shreya — Wedding Invitation

Customised version of the Jishnu & Vibha template. Static site (HTML, CSS, vanilla JS, GSAP + ScrollTrigger, Lenis); fonts and libraries are self-hosted. No build step.

## Deploy
Drag this folder onto Netlify, or import into Vercel (framework "Other", no build command).

## Notes
- Opening video: `assets/video/wedding-opening.mp4` (Kerala Nilavilakku opening, lightened slightly; poster `assets/images/opening-poster.jpg` is its exact first frame; does not autoplay: visitors tap "Tap to Open" to start it; Skip Intro button; falls back to the hero if it cannot play).
- Sangeeth: Saturday 30 January 2027, 5:30 PM – 8:30 PM (`assets/calendar/sangeeth.ics`).
- RSVP has been removed entirely (section, styles, script, config and Apps Script backend).
- Opening film ends in a golden-light fade into the hero (`#gold-wash`, `endIntro()` in `js/main.js`).
- Date reveal: Golden Invitation Unfold (`#invite-stage`) — a native button, works with keyboard, reduced motion and without JS (date always in the DOM).
- Love Story: six chapters (2022 MBA classmates → 2022–24 college → 2024 Chennai/Kerala → 2024–25 distance → 2025 choosing each other → forever), `initStory()`. Text is staggered per line; the 2024 chapter draws a minimal dotted Kerala–Chennai line (`.route`). Gold atmosphere (lamps, garlands, florals) is the `.cine` / `.deco` layer with an inline SVG sprite at the top of `index.html`.
- Gallery "Our Moments": couple-only, 7 unique photos in two justified rows (`.g-row`, tile width follows aspect ratio so rows stay flush). No solo portraits; nothing shared with the hero, portraits or Love Story. Add a photo by adding one `<figure class="g-item" data-lb="gallery">`.
- Lightbox: per-group (gallery swipes only through the gallery), counter, arrows, keyboard, finger-follow swipe, drag-down to close.
- Proposal photo removed from the site (the story makes no proposal claim).
- Photos: website copies in `assets/images/couple/`; untouched originals are in `../original-photos/` (not deployed).

- Celebrations: three alternating illustrated events joined by one scroll-driven gold dotted SVG path (`buildJourney()` in `js/main.js`, GSAP ScrollTrigger scrub). It is rebuilt on resize, font load and image load, and shows fully drawn for `prefers-reduced-motion`.
- Footer: no couple photograph; dark brown/burgundy veil over the existing lantern background.
- Music: `assets/music.webm` (same track as the Jishnu & Vibha site) with `assets/music.mp3` as a fallback for browsers without WebM/Opus. It starts when the visitor taps Tap to Open / Skip Intro; the round button bottom-left pauses or resumes it.
- Share image: `assets/images/og-image.jpg` (1200×630) at https://akshay-shreya.vercel.app/assets/images/og-image.jpg.
