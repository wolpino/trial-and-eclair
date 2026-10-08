Trial and Eclair — Collected Product Vision Document

---

1. Executive Summary & Core Philosophy

Trial and Eclair is a dedicated recipe development and collection workspace for desktop and tablet web. 

The Core Philosophy: Not a Food Blog
Most cooking software online falls into two broken extremes: bloated food blogs buried under life stories and ad trackers, or sterile, spreadsheet-like databases. 

Trial and Eclair treats recipe creation like a craft and a science:
- Recipes evolve over time through trial, error, adjustments, and tasting.
- Prior attempts should never be overwritten or lost.
- The interface should feel like an inviting, tactile space in a real kitchen, not enterprise software.

---

2. Visual & Sensory Experience

The visual identity marries warm physical kitchen metaphors with functional software design:

The Physical Kitchen Setting
- The Counter & Wall: The workspace is framed as an actual board resting against a sunlit kitchen wall, sitting directly on a wooden kitchen counter.
- Realistic Foreground Props: On the counter in front of the board rests a tangible, grounded foreground element — a stoneware sage bowl of fresh farm eggs with folded kitchen linen on the counter edge. 
- Dynamic Solar Lighting & Shadows:
  - Light streams in through a simulated multi-pane kitchen window.
  - Real-Time Sun Tracking: The sunlight angle, beam position, and shadow cast dynamically adapt based on the user's local clock:
    - Morning (East/Low): Warm, long diagonal sun shafts cutting across the board with long shadows.
    - Midday (High): Bright, focused overhead light with crisp, short shadows.
    - Late Afternoon / Golden Hour (West/Low): Rich, deep amber light stretching across the counter.
    - Night / Moonlight: Soft, cool ambient moonlight at roughly 15% intensity — preserving atmosphere without blinding contrast.

Tactile Metaphors
1. The Ideas Board: A choice between Corkboard (warm pinned index cards) and Whiteboard (clean slate with colorful magnetic sticky notes).
2. The Lab Notebook: Open composition-notebook spread for recipe iteration. Textured cream paper, subtle ruled margins, notebook tabs, and scribbled annotations.
3. The Recipe Box: A classic A–Z wooden index-card filing box for home cooks and finished go-to recipes.
4. Typography:
   - Lora (warm literary serif) for titles, headings, and notebook headers.
   - Nunito Sans (friendly, readable sans) for UI, navigation, and notes.
   - Monospace for exact ingredient quantities, baker’s percentages, and oven temperatures.
5. Color Palette: Muted natural kitchen tones — warm cream paper, soft sage green, terracotta accents, golden butter yellows, and deep walnut woods.

---

3. The Three Personas & Ecosystem

| Persona | Primary Needs | Primary Surface | Access Tier |
| :--- | :--- | :--- | :--- |
| Recipe Developer | Iterating, testing variations, logging bakes, publishing | Ideas Board + Lab Notebook + Test Bake Log | Core Developer (Full Access) |
| Home Cook | Everyday reference, simple collection, no version clutter | A–Z Recipe Box + Reference Shelf | Free / Simple Tier |
| Public Viewer | Reading published recipes, following forks & stories | Clean Public Recipe Pages & Cookbooks | No account required |

---

4. Key Pillars & Feature Modules

Pillar 1: Ideas & Brainstorming (The Scratchpad)
- The Board: A cork or whiteboard surface where fleeting culinary ideas live before becoming formal recipes.
- Frictionless Capture: Add thoughts, flavor pairings, technique questions, or ingredient combinations without having to format a full recipe.
- Color-Coded Status: Organize by status (`Sprout`, `Testing`, `Polishing`, `Stashed`) and custom tags.
- "Start Developing": One-click action to promote an idea into a formal recipe in the notebook (always optional — recipes can also be created from scratch).

Pillar 2: The Lab Notebook & Immutable Versioning
- The Dual-Column Spread: 
  - Left column: Ordered ingredient list with quantities, units, and preparation notes.
  - Right column: Ordered step-by-step method and techniques.
- The Version Rail (`v1`, `v2`, `v3`...):
  - The working version is editable.
  - Prior versions are permanently frozen and immutable.
  - "Save as New Version": Deep-copies the current formulation into a new snapshot version, allowing bakers to alter hydration, sugar percentages, or bake times without losing the previous formulation.
- Version Comparison / Diffing: Compare any two versions side-by-side to highlight exactly what ingredients or steps changed between bakes.

Pillar 3: Test Bakes & Tasting Journal
- Session Logging: Directly attached to specific recipe versions.
- Key Metrics: Date, oven temperature, bake duration, ambient room temperature/humidity (optional for sourdough/pastry).
- Sensory & Tasting Observations: Notes on crumb structure, crust thickness, browning, sweetness, salt balance, and texture.
- Rating & Photo Log: Visual documentation of the bake to diagnose results over time.

Pillar 4: The Home-Cook Recipe Box
- A–Z Index Card Archive: A distraction-free filing drawer for everyday cooking.
- Fast Search & Filter: Instantly find dishes by title, category, or main ingredient.
- Clean Single-Version Format: Strips away the development version rail so home cooks see only the current best version ready to cook.

Pillar 5: Publishing, Stories & Cookbooks
- Personal Story & Hero Photo: When a developer marks a recipe as complete, they can attach a hero photograph and the story behind the dish.
- Public Shareable Links: Fast, clean public reader view with zero intrusive pop-ups or auto-playing video ads.
- Digital Cookbooks: Curate selected published recipes into themed bundles (e.g., “Autumn Viennoiserie”, “Weeknight Sourdough”) with custom covers and shareable URLs.
- Fork Lineage: When someone adapts or forks a public recipe, the original recipe and creator are credited in the lineage trail (with opt-out control for authors).

Pillar 6: The Reference Shelf & Library
- An organized shelf for personal culinary sources: physical cookbooks owned, favorite chef references, culinary articles, and imported bookmarks.
- Future import capabilities: scanning recipes from photos, PDFs, or URL imports.

---

5. Current Implementation vs. Roadmap

What is Built in MVP (v1)
- Authentication: Private, secure personal account sign-in and sign-up.
- Kitchen Counter Stage: Photorealistic sunny kitchen backdrop, realistic sage egg bowl on the wooden counter edge, and dynamic real-time sun angle & shadow tracking with nighttime moonlight transition.
- Ideas Board: Corkboard vs. Whiteboard toggle, CRUD note management, color tagging, status filters, and promotion to full recipes.
- A–Z Recipe Archive: Index-card filing layout with real-time title and category search.
- Recipe Lab Notebook: Two-column composition layout (ingredients on left, method on right), version rail, and deep-copy "Save as New Version" engine preserving historic snapshots.
- Test Bake Logger: Per-version bake logs with date, oven temp, bake duration, tasting notes, and ratings.

Planned for Phase 2 & Beyond
1. Side-by-side Version Diffing: Visual comparison showing added, removed, or adjusted grams/temperatures between two test versions.
2. Photo Uploads for Test Bakes: Dragging in crumb and crust photos directly into a bake entry.
3. Baker's Percentages & Unit Conversion: Automatic flour-weight scaling and metric/imperial toggles.
4. Public Publishing & Shareable Links: Generating clean public reading pages with hero photos.
5. Cookbook Collections: Bundling published recipes into shareable digital booklets.
6. Reference Shelf & Recipe Import: URL scraping and PDF/card photo import.

---

Would you like to refine any specific section of this vision doc, or shall we prioritize one of the Phase 2 features (such as side-by-side version comparison or test bake photos)?