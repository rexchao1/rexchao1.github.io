# Design: Drift (direction A, chosen 2026-10-09)

The site is one continuous 3D world in dark space. Scrolling flies the camera along a path of
stations: Wren, Rex's photos, records, the travel map, Tooey, builds, the teams line, contact.
Everything in the world is drawn as fine light particles or thin light lines, like dust catching
light. Words are few and appear only at the station they belong to.

## Color
- Space `#04060A`, the only background.
- Ink `#DCE6F2`, cool white for particles, lines and text.
- Ice `#8FD3FF`, the one accent: travel routes, link underlines, record labels. Nothing else.

## Type
- Michroma for the name, station words and "Say hi". Wide, aerospace. Never for sentences.
- Hanken Grotesk for captions and the few short lines.

## Motion
- Scroll drives a camera along keyframed stops with smoothstep easing, so it dwells at each station.
- Ambient motion only: Wren idles, photos bob, records spin. Respect reduced motion.
- The nearest photo sharpens and shows its caption; others stay dim.

## Do / don't
- Do keep each screen to one idea and at most one short line of text.
- Do use real photos and real screenshots as textures; stand-ins are bracketed.
- Don't add nav bars, cards, paragraphs, numbered sections or mono eyebrow labels.
- Don't add sound or a custom cursor.
- Don't add glows, bloom or gradients.

## Rejected
- B Chrome (metal) and C Signal (wireframe + dithered photos), 2026-10-09: Rex picked A.
