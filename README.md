# Manan Mandaliya — portfolio

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui. Dark-only glass design.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build; every route is prerendered
npm run lint
```

## Where to edit things

| What | Where |
| --- | --- |
| Name, contact details, photo, tagline, scheduling link, About, skills, experience | `src/content/site.ts` |
| Project cards and case-study metadata | `src/content/projects.ts` |
| Design tokens, glass utilities, fonts | `src/app/globals.css`, `src/app/layout.tsx` |
| Case-study pages | `src/app/work/<slug>/page.tsx` |
| Interactive demos (recreated with mock data) | `src/components/demos/` |
| Resume PDF, hero photo, foil pattern | `public/` |

Icons are picked up from `src/app/` (`favicon.ico`, `icon.svg`, `icon.png`, `apple-icon.png`).

## Notes

- The demos are rebuilt from scratch with fictional data; nothing proprietary is shown.
- The hero portrait card is `src/components/home/hero-portrait.tsx` (photo: `public/me.webp`).
- Search the code for `TODO(manan)` for details only you can fill in.
