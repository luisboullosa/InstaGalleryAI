# Project Blueprint & Roadmap

## App Vision
- **Name:** InstaGalleryAI
- **Core idea:** Blend Instagram media with AI-powered gallery creation and critique workflows while emphasizing visual clarity, minimalist styling, and subtle motion.
- **Visual cues:** muted teal (#63BDBD) primary color, light grey (#F0F0F0) background, soft coral (#F08080) accents, Inter font, and minimalist iconography that keeps images center stage.

## Feature Blueprint
1. **Instagram Integration**
   - Connect to the user’s Instagram account via the Graph API, fetch posts, and later extend to stories/highlights.
   - Filter out videos/reels to keep galleries static, focused on photographic assets.
2. **Theme Input & Suggestions**
   - Allow manual theme input; layer in AI-driven theme suggestions (vibe options: gentle, balanced, harsh).
   - Use posting history and trend analyzers to seed themes.
3. **Gallery Generation**
   - Generate curated galleries per theme using placeholder imagery or Instagram media.
   - Ensure video assets are skipped; support placeholder filler when insufficient matches exist.
4. **AI Critique Layer**
   - Run multiple AI agents (e.g., stylistic critic, AI-detection critic) against each image and the gallery as a whole.
   - Track whether each image honors its intention, identify AI usage, and summarize improvement points.
5. **Critique Report**
   - Synthesize single-view reports that narrate the AI critique (strengths, weaknesses, AI-detection insights).
   - Button/accessibility for viewing/exporting the report with Coral-accented call-to-action.

## Implementation & Improvement TODOs
### Immediate Implementations
- [ ] Finish tabbed gallery UI that switches between post collections and placeholder galleries with a clear default (currently only posts).
- [ ] Ensure `AppProvider` exposes the Instagram collection map and tab controls so components can remain decoupled.
- [ ] Wire AI critique actions (via `getGalleryCritiqueAction`) into the gallery detail pane and sidebar buttons.
- [ ] Improve error messaging when Instagram tokens fail (e.g., “User ID missing from response”).

### Progress Update (Dec 23, 2025)
- [x] Removed client-side fallbacks that automatically insert placeholder images when adding images to a gallery. `handleAddImages` now only uses images from the active Instagram collection and shows a toast when no new images are available.
- [x] Gallery creation (`handleCreateGallery`) now requires Instagram images — creating a gallery without Instagram images shows a destructive toast and is prevented.
- [x] `CritiqueReport` now receives the actual `galleryImages` rather than `PlaceHolderImages`.
- [x] Centralized the `ImagePlaceholder` type in `src/lib/types.ts` and updated component imports to use the shared type.

### Dataset Status & Plan
- Current dataset: `src/lib/placeholder-images.json` remains in the repo for local/dev convenience and contains a small set of Unsplash-sourced example images.
- Short-term plan: keep the dataset for local dev but treat it as dev-only. Code paths that create or append gallery images no longer fall back to placeholders.
- Mid-term plan: replace `placeholder-images.json` with either:
   - A small curated CDN/S3-hosted sample set and update `src/lib/placeholder-images.ts` to point there, or
   - Remove the file and provide a developer script to seed local sample images when needed.

### Next Steps (high priority)
- Remove the hardcoded `INSTAGRAM_ACCESS_TOKEN` from `scripts/start-dev.js` and document `INSTAGRAM_ACCESS_TOKEN` usage in `README.md` (dev -> high priority).
- Implement the multi-agent AI critique orchestration and wire `getGalleryCritiqueAction` to UI triggers.
- Replace or migrate the placeholder dataset as described above (choose CDN or seeding script).


### Mid-term Improvements
- [ ] Implement stories/highlights fetch endpoints and serialize them to the provider state when ready.
- [ ] Build AI theme suggestion assistant that scans Instagram history for keywords and tonal cues.
- [ ] Add analytics-around AI agent outputs (e.g., compare stylistic critique across themes).
- [ ] Refine layout responsiveness (Resizable panels) with subtle transitions that match the style guide.

### Future Enhancements
- [ ] Provide exportable critique reports (PDF/email) using soft coral CTAs.
- [ ] Detect whether an image was created or edited with AI and reflect it in the critique narrative.
- [ ] Offer theme presets (photography, plastic art, etc.) based on detected art types.
- [ ] Extend gallery generation to combine Instagram media with curated placeholders for composition balance.

## Notes
- Focus on the core flow (gallery creation + AI critique) before expanding Instagram feed coverage.
- Document environment requirements (Instagram tokens, Google Drive, AI credentials) in the README and docs folder.
