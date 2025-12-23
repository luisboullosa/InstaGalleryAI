# InstaGalleryAI
A multi-model approach to AI-powered gallery criticism built with Next.js 15 and GenKit flows.

## Development (self-hosted)

1. Install dependencies:
	 ```bash
	 npm install
	 ```
2. Start the dev server (Turbopack on port 9002):
	 ```bash
	 npm run dev
	 ```
3. Visit `http://localhost:9002` and interact with the app; backend actions execute via server actions defined in `src/app/actions.ts`.

## Production build / hosting

- Build the optimized app:
	```bash
	npm run build
	```
- Serve the built app in your environment (custom server, Docker container, or any platform that supports Next.js 15):
	```bash
	npm run start
	```
- The server listens on `$PORT` (default 3000) unless overridden.

## Self-hosting notes

- The project no longer depends on Firebase-specific tooling—just Next.js, Radix UI, GenKit, and the AI flows under `src/ai`.
- If you need persistence (users, galleries, critiques), implement your own API routes or services and wire them into the existing actions; currently the app only relies on server actions interacting with GenKit flows and placeholder data.
- Add any platform-specific deployment steps (CI/CD, Dockerfiles, secrets) in this repo so the app can run anywhere you choose.

## Instagram integration (optional)

The **Connect to Instagram** button in the sidebar uses the Instagram Graph API to pull your recent posts into the gallery. Configure the following environment variable before starting the app:

```bash
INSTAGRAM_ACCESS_TOKEN=your_long_lived_access_token
```

You can obtain a long-lived token by following Instagram's [Graph API authentication flow](https://developers.facebook.com/docs/instagram-basic-display-api/getting-started). Once the token is available, the app will hit `/api/instagram/media` on the server, translate each media item into a gallery image, and populate the dashboard automatically. The route is guarded by the presence of that environment variable so nothing is fetched until you provide it.
