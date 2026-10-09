# Personal site redesign

## Goal
A personal site for recruiters that people remember. It opens inside Animus, scrolls like
igloo.inc (a camera moving through one world), and its most important part is the About section.

## Audience and outcome
Recruiters. They leave with Rex's LinkedIn, email, resume and GitHub, and remember him.

## Decisions
- Order: Animus opening, About, Tooey, Builds, Teams line, Contact.
- Feel: futuristic like an instrument panel (precise, mono labels, live readouts), not glowing sci-fi.
  Dark technical sections, a warm light About section ("the lights come up").
- Voice: first person, short, specific, a little dry. Banned: passionate, seamless, innovative,
  crafting, leverage, cutting-edge, journey. No em dashes.
- Flow and the software factory are left off (avoid a "vibecoder" read). Revisit later.
- Internships stay one line: "Can I work on a team? Ask Photon Commerce and StudioApp.ai."
- No "what I'm looking for" line. Resume and GitHub links yes.
- About: Danville to LA; sports photo strip (baseball with volunteer umpiring as community
  service, skiing at Tahoe, pickleball for fun); LA eats photo wall; animated travel map from
  Danville (Peru, Japan, China, Spain, other Europe, Mexico, Alaska); top artists on spinning
  records; pets Rusty (dog), Petey and Jasper (cats). No powerlifting, no baseball card, no globe.
- Builds hover shelf: dental front desk, Fetch, Bruin Desk, PoseAR (placeholder art), CatCart, Laoshu.
- Animus on the site: the real React Three Fiber scene with a custom look and a scripted
  performance, no live AI calls.
- Music: picked by hand first; Spotify automation maybe later.

## Done when
The site is live at rexchao1.github.io with real photos, real screenshots, every section's
copy approved by Rex, working on phones, and the Animus opening loading fast.

## Steps
1. Brainstorm content and order. DONE
2. Capture project screenshots (Animus, Bruin Desk, Tooey, front desk, Fetch, CatCart, Laoshu). IN PROGRESS
3. Design direction: A (Drift) chosen and locked in design/DESIGN.md. Live prototype: https://claude.ai/artifact/KuuJJr1kUXEKyqP5rohBGp (built by design/drift/build.mjs). DONE
4. Rex sends photos, top artists, resume PDF, rest of Europe list. WAITING ON REX
5. Approve copy and look. TODO
6. Pick the stack and build the site, including the Animus scene port and scroll camera. TODO
7. Phone and performance pass. TODO
8. Merge to main and go live. TODO (ask Rex first)

## Open questions
- Which Tooey facts are OK to publish, and Tooey's current status.
- Where in Europe besides Spain.
- "What I learned" lines on builds are drafts for Rex to confirm.

## Prototype v2 (2026-10-09), from Rex's feedback
- Much shorter scroll. Name is a particle sign behind Wren; the camera flies through it and it scatters ("going inside me").
- About is a compact ring around the camera: photos, a small travel map, small spinning records, the pets. No separate Danville stop.
- Builds sit in a horizontal row the camera slides along; hover grows one and shows a short blurb (touch shows the one in the middle).
- Team line shows the Photon Commerce and StudioApp.ai logos; contact has LinkedIn, GitHub and resume icons.
- Wren stays the stand-in for now (Rex: "keep wren for now").
- Open: Minnie letter screens show "Renu Prosthodontics", probably the real client. Not used on the site until Rex decides.
- Open: two Animus app shots have a relabeled provider bar and made-up token counts. Crop or recapture before use.

## Pivot v3 (2026-10-09): three scenes, short scroll like igloo.inc
Rex: shorter scroll; first page is everything about him, in a personalized, vibrant Animus world where
hovering things opens popups (images + text) in a corner; second, a secluded space-themed projects place where
Tooey is emphasized and every other project plus both internships are visible without more scrolling; last, a
connect page that is happier and different from the projects page. No practice name anywhere (Renu letter screens
stay out).

### Scenes
1. Home (About): Animus "dusk" stage with the real Wren. Rex's things placed on the stage, each hoverable:
   UCLA pennant (CS at UCLA, from Danville), baseball corner (volunteer umpire), skis (Tahoe), pickleball paddle,
   KBBQ grill (LA eats), globe (travel), record player (top artists), pet corner (Rusty, Petey, Jasper), photo
   easel (friends). Hover highlights the object and opens a corner card with photos and two lines.
2. Projects (space): scroll tilts up into the sky into night space. Tooey is a big central planet; front desk,
   Fetch, Bruin Desk, PoseAR, CatCart, Laoshu orbit as smaller worlds; Photon Commerce and StudioApp.ai are two
   stations. All in one view. Hover opens a card with a screenshot and a line.
3. Connect: dive back down into Animus's daylight theme. Wren waves; balloons carry LinkedIn, GitHub, email and
   resume. "Say hi".

### Build approach
- Vite + React + React Three Fiber app at the repo root, importing Animus's scene modules (sky, lights, platform,
  props, Wren) from the local Animus checkout through an alias. Nothing from Animus is copied into this repo yet.
- Preview: build to one self-contained HTML (inlined JS) and publish to the artifact.
- OPEN, ask Rex before deploy: the site repo is public, and deploying needs Animus's scene code in a build that
  GitHub can run (vendor the scene modules into this repo, commit a prebuilt bundle, or make the repo private).

### v3 steps
1. Scaffold the app and render the Animus stage with Wren in a browser. TODO
2. Home scene: personal props, hover highlight, corner cards. TODO
3. Projects scene in space with hover cards. TODO
4. Connect scene in daylight. TODO
5. Scroll transitions between the three, with snapping. TODO
6. Single-file build, strict-policy test, publish. TODO
