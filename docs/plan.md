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
- Flow is left off (avoid a "vibecoder" read). The Software Factory is in, by Rex's call on 2026-10-09.
- Internships stay one line: "Can I work on a team? Ask Photon Commerce and StudioApp.ai."
- No "what I'm looking for" line. Resume and GitHub links yes.
- About: Danville to LA; sports photo strip (baseball with volunteer umpiring as community
  service, skiing at Tahoe, pickleball for fun); LA eats photo wall; animated travel map from
  Danville (Peru, Japan, China, Spain, other Europe, Mexico; Alaska left off the site on request); top artists on spinning
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
4. Rex sends photos, top artists, rest of Europe list. WAITING ON REX (resume PDF in: `public/Rex_Chao.pdf`, opens in a new tab; replace the file to update it)
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
1. Home (About): a sunny ballpark that spreads out to hills and a snowy ski mountain with a chairlift (Rex: "grassy and sunshine like baseball and maybe a mountain for skiing", "don't make the first an island make it spread out"). Rex's character stands at home plate. Rex's things placed on the stage, each hoverable:
   UCLA pennant (CS at UCLA, from Danville), baseball corner (volunteer umpire), skis (Tahoe), pickleball paddle,
   KBBQ grill (LA eats), globe (travel), record player (top artists), pet corner (Rusty, Petey, Jasper), photo
   easel (friends). Hover highlights the object and opens a corner card with photos and two lines.
2. Projects (space): scroll tilts up into the sky into night space. Tooey is a big central planet; front desk,
   Fetch, Bruin Desk, PoseAR, CatCart, Laoshu, Animus orbit as smaller worlds; Photon Commerce and StudioApp.ai are two
   stations. All in one view. Hover opens a card with a screenshot and a line.
3. Connect: back down to the ballpark at golden hour. Rex waves; balloons carry LinkedIn, GitHub, email and
   resume. "Say hi".

### Build approach (changed 2026-10-09)
Rex: "Don't use animus. Maybe just make your own 3d model. i want it customized for me. add animus to the builds".
- No Animus code. Own world in `src/`: LA golden-hour sky with palms (`World.tsx`), a floating island, a stylized Rex
  character in a UCLA hoodie (`home/Avatar.tsx`, hair and skin colors are placeholders until Rex confirms), and his
  things built from primitives (`home/props.tsx`). Vite + React + React Three Fiber with its own node_modules.
- Animus becomes a build in the projects scene (shots in ../shots/animus; crop the relabeled provider bar).
- The deploy question is gone: everything is in this repo.
- Preview: build to one self-contained HTML (inlined JS) and publish to the artifact.

### v3 steps
1. Scaffold the app. DONE (first on Animus, then replaced by an own world)
2. Home scene: personal props, hover highlight, corner cards. DONE (photos are placeholders)
3. Projects scene in space with hover cards. DONE
4. Connect scene. DONE
5. Scroll transitions between the three, with snapping. DONE (wheel, swipe, keys, dots; phones get their own framing)
6. Single-file build, strict-policy test, publish. DONE (now `npm run build:artifact`)

### Text size
Rex: "keep all the text big like before like the title and github and stuff and projects." Name, project names,
contact links and cards stay large; do not shrink them for polish.

### Still open
- Real photos for the cards (sports, food, travel, friends, pets), top artists, Europe beyond Spain.
- Rex's hair and skin colors for the character (`LOOK` in src/home/Avatar.tsx are placeholders).
- What Rex did at Photon Commerce and StudioApp.ai, if he wants more than "Team player? Ask them."
- PoseAR art; the chairlift on the mountain faces away from the camera.

## Pivot v4 (2026-10-09): readable text page, one 3D moment
Rex: "too much with these animations. I want more easy to read text", like neilchandran.com, with scroll effects
"toned way down"; then "a scrolling animation where it goes into my name like 3d still", "more like a zoom out and
my name ends up smaller and fixed on the screen".
- The three-scene world is retired. It is kept at git tag `world-v3` (Site.tsx, World.tsx, home/, space/, connect/).
- Opening: "Rex Chao" in 3D fills the screen. Scrolling (about one screen, scrubbed, reversible) zooms out and the
  name shrinks into the top-left of a slim header, where it stays, still 3D, with a slight tilt toward the pointer.
- Below: a plain one-column text page. Intro, Tooey, Builds, About, Contact. The header nav scrolls to each section
  and highlights the current one. Normal scrolling, no snapping. Motion: sections ease in once. Reduced motion skips
  the zoom.
- Name look is open: solid letters or particles that assemble. Both live in one prototype with a switch.

### v4 steps
1. Prototype the name zoom (solid and particles) with a rough text page, publish for Rex. DONE (https://claude.ai/artifact/EN99o68RXcSfvtP3YK4xue, `src/Page.tsx`, `src/intro/Name.tsx`; name font made from Bricolage Grotesque 800 with opentype.js, only the letters in "Rex Chao")
2. Rex picks a look; remove the other one and the retired world code. DONE (particles; drei and postprocessing removed)
3. Copy pass on the text page with Rex; real photos if About gets any. TODO
4. Phone and performance pass. TODO
5. Merge to main and go live. DONE 2026-10-09 (Rex: "go ahead and deploy it")

### v4 round 2 (2026-10-09), from Rex's feedback
Rex: "better looking", builds as "a gallery where you can hover and it will expand", "less scrolling", LinkedIn,
GitHub and resume at the bottom as bigger buttons with logos, a "cool background" on the front page, and not that
blue for the name.
- Opening: dark dusk sky with a dot field that warms near the pointer and a sunset glow at the bottom (`intro/Dusk.tsx`).
  The name is pearl over the dusk and blends to the theme's ink as it docks. No blue.
- Tooey and the builds share one Work gallery: two rows of tiles, Tooey wider at rest, hover opens a tile and shows its
  line. Phones get one swipeable row. The internships sit under it as two logo chips.
- About is a two-column list of short facts. Contact is big buttons (LinkedIn, GitHub, Resume, email with copy) at the
  bottom only. Nav is Work, About, Contact.

### v4 round 3 (2026-10-09)
Rex: work panels with "more white space in between" and "smaller", hover "expands up and grows"; art for the hobbies.
- Work is a 4-across grid of small tiles with wide gaps; hover lifts a tile and grows it upward with its line. Tooey
  carries a "Building now" badge. Phones: two across, tap opens a tile full width.
- Outside of code: each fact is a small card with a drawn line badge in its own color (baseball, mountain, paddle,
  grill, plane, paw). These stand in until Rex sends photos.
- Rex: drop Laoshu and PoseAR, add the Software Factory (this reverses the earlier "leave it off" decision). Its tile is
  a drawn diagram (plan, queue, agents, critic, console) since there is no screenshot; the line comes from his resume.
  Seven tiles: four on top, three centered below. Internships are now two bigger cards under a "Can I work on a team?
  Ask them." heading; roles say only "Intern" until Rex says what he did.

### v4 round 4 (2026-10-09)
- Rex picked the particle name. The solid look, the prototype switch and the old world code are gone.
- Work tiles are covers (project color, dot texture, a small kind label, the name; Tooey's "Building now" badge sits on
  its cover). Hover grows a tile to about 1.65x and swaps the cover for the real screenshot with its line. Edge tiles
  grow inward. Phones: tap opens a tile full width with the screenshot.

### Deploy (2026-10-09)
- `main` deploys through `.github/workflows/deploy.yml` (GitHub Pages, build type "workflow"): `npm ci`, `npm run build`,
  upload `./dist`. `npm run build` is the normal multi-file site; `npm run build:artifact` makes the single-file
  preview (`dist/artifact.html`). `npm run check` type-checks and builds.
- The old Next.js site's history was merged in with `-s ours`, so `main` moved forward without a force push.
- rexchao.com (and www) is served by Vercel, not GitHub Pages: project `rexchao-portfolio` on the `rexchao1-1660` Vercel
  account, Git-linked to this repo's `main`. Its framework preset must be Vite with output `dist`; when it was still
  Next.js the first redesign deploy failed and the old site stayed up (fixed 2026-10-09). GitHub Pages still builds
  rexchao1.github.io from the same push.
- The live resume PDF (`public/Rex_Chao.pdf`) includes Rex's phone number; he chose to ship it as is.


## Light checks (2026-10-22)

Goal: new sessions keep checks small and still check changed behavior. Instructions only; preserve site code and deployment settings. Done when AGENTS.md has the shared policy and real commands, the diff is reviewed, and the commit is saved to the private Portfolio website history.

- [x] Read the site instructions, plan and package commands.
- [x] Add the policy and review the diff.
- [x] Commit and save to the private Portfolio website history.

## Work section v5 (2026-10-31): project popups with guided demos

Rex: "especially the projects tab better. clicks open a big pop up that gives details about the project with a demo
and link to github or website", and "make the demos / previews way better".
- Cards show the real screen in a browser, phone or bare frame over the project's color. Tooey is a full-width
  featured card. Hovering a card plays a short guided demo: the screen zooms toward each feature with a caption.
- Clicking opens a popup (`src/Work.tsx`, native `<dialog>`): the full demo with play/pause and a step bar, the story,
  links, a "Built with" list. Arrow keys move between projects; Esc or the backdrop closes. Phones get a full-screen sheet.
- All project data, demo notes (x/y as fractions of the image) and links live in `src/content.ts`.
- Links only to public things: Tooey website, factory repo (not-so-simple-software-factory), Fetch repo and DMG, CatCart
  repo. Front desk, Bruin Desk and Animus say why the code is private.
- New screens: Factory work board and planning (from its public README), Fetch guide (from its README), the live Tooey
  website. Existing shots are only 760px wide, so they soften when zoomed; sharper captures would help.
- Open: popup copy is a draft for Rex to confirm, especially Tooey's problem line, Animus and CatCart.

## Hero v6 (2026-10-31): bead name, follows the system theme

Rex: the dusk hero "doesn't give impressive"; picked outlined beads, kept "the sky blue and night", and wants "the whole
page change dark and light with the system".
- The name is ~2400 opaque beads (`src/intro/Name.tsx`): light mode is white beads with ink rings on a sky blue
  hero; dark mode is light blue (#8fd0ff) beads with white rings on a night hero. Beads fill in solid ink as the
  name docks so the header name stays readable. The fine "dust" particles and the dusk sunset are gone.
- Hero colors are `--hero` and `--hero-fg` in each theme block of `page.css`; `useTheme` in `Page.tsx` reads the
  computed color scheme, so a `data-theme` override also works.
- Next: make the sections below the hero more playful (ideas and mocks were shown to Rex; not picked yet).
