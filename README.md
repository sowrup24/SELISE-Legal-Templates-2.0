# SELISE Legal Templates

Front-end for creating contracts from templates and sending them for signature.

## What is here

| Folder | What it is |
| --- | --- |
| `app/` | The React app: Vite, React 19, TypeScript, Tailwind v4 and shadcn/ui. Every screen is ported except the document editor. |
| `preview/new-contract-flow.html` | The HTML prototype. It is the design source of truth; the React app follows it. Open it directly in a browser. |

## Run the React app

Needs Node 20 or later.

```bash
cd app
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run lint`.

## Notes for developers

- App state lives in one store: `app/src/lib/store.ts`.
- Pages are in `app/src/pages/`, dialogs in `app/src/components/dialogs.tsx`.
- The document editor (contract builder) is not ported. Its buttons show a toast.
- Data is sample data in `app/src/data/`. There is no backend yet.
- Design tokens are in `app/src/index.css`. Do not change the brand primary `#008af1`.
