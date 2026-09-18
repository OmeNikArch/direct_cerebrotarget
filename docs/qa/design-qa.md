# Hero design QA

- Source visual truth: `C:\Users\Cerebro\Downloads\Frame 2147226205.png`
- Source line asset: `C:\Users\Cerebro\Downloads\Yellow line YD.svg`, preserved in the project as `site/assets/yellow-line-yd.svg`
- Implementation evidence: `http://127.0.0.1:4173/`
- Combined comparison artifact: `http://127.0.0.1:4173/hero-comparison.html`
- Browser-rendered comparison: the latest reference and live hero were reviewed together in the Codex in-app browser

## Fidelity surfaces

- Layout: desktop uses a title/proof top row, an exact 80 px spacer, and a CTA/facts lower row. At the compact-desktop breakpoint the CTA track is widened so its no-wrap label clears the first fact.
- Alignment: the proof-column divider and the divider before fact 03 resolve to the same x-coordinate at compact and wide desktop sizes. At the 1025 px emulation the measured delta is 0 px.
- Colors: the hero background is a native CSS gradient using exactly `#3C5CDD`, `#0A238B`, and `#0C2049`. There is no background image or video.
- Line: the exact supplied path and its `#FFAE00 → #FFD400` gradient are embedded with a 10 px non-scaling stroke. The SVG is clipped by the hero and no longer enters the following section.
- Motion: the line draws left-to-right on entry. Scroll progress directly controls `stroke-dashoffset`; at full progress opacity is also set to zero so no anti-aliased fragment remains. Up-scroll restores the line.
- Scroll indicator: the indicator is a fourth grid row with a measured 100 px margin from the bottom of the CTA/facts UTP row.
- Responsive behavior: the line remains hidden below 768 px, the mobile CTA remains no-wrap, and compact/mobile structure retains the previously approved title → proof → actions → facts order.
- Accessibility: reduced motion skips the timed intro while preserving a deterministic scroll state; the line is decorative and `aria-hidden`.

## Measured browser evidence

- Desktop content width: 1625 px
- Hero and following-section boundary: both at y = 920 px
- Line boundary: y = 779–920 px, fully contained by the hero
- UTP row bottom: y = 655.5625 px
- Scroll indicator top: y = 755.5625 px
- UTP-to-indicator gap: exactly 100 px
- Horizontal overflow: 0 px
- During down-scroll, positive `strokeDashoffset` leaves only the right-hand tail visible, confirming left-to-right erasure
- After Page Down: `strokeDashoffset = 1`, computed opacity = 0, no visible remnant
- After returning to top: `strokeDashoffset = 0`, computed opacity = 1

## Findings

- No actionable P0, P1 or P2 differences remain for the requested hero changes.
- P3: the existing Tailwind CDN production warning remains outside this redesign scope; no runtime error was introduced.

final result: passed
