# Instagram Secret Management

`INSTAGRAM_ACCESS_TOKEN` is the only credential the app currently needs to fetch your Instagram feed via `/api/instagram/media`. Follow these steps to keep it off GitHub:

1. Create a file named `.env.local` at the project root (Next.js loads it automatically during `npm run dev` and `npm run build`).
2. Inside `.env.local`, add your token:
   ```env
   INSTAGRAM_ACCESS_TOKEN=your_long_lived_instagram_token
   ```
3. `.env.local` is already covered by `.gitignore`, so it will never be committed. Do not rename it to `.env.local.example` (that file is tracked) unless you intend to commit a placeholder.
4. The server route reads the variable via `process.env.INSTAGRAM_ACCESS_TOKEN` and returns a 400 error if it is missing, so you can verify at runtime by hitting `/api/instagram/media` after setting the file.
5. When deploying, provide the same variable through your host’s secret manager (e.g., Vercel Environment Variables, Docker secrets, or any CI/CD pipeline) so `process.env.INSTAGRAM_ACCESS_TOKEN` is populated in production.

This pattern keeps secrets local while letting your code reference them exactly where you already use `process.env.INSTAGRAM_ACCESS_TOKEN` in `src/app/api/instagram/media/route.ts`.
