/**
 * The initialization sequence:
 *
 * index.ts                  (vite entry, await polyfill & xdomain)
 * => index.tsx              (app entry)
 *    => misc/webfonts.ts
 *    => initApp.ts          (session initialization)
 *       => appState.ts      (app global state)
 *       => misc/analytics.js
 *    => App.tsx             (top-level react component)
 *       => AppRouter.tsx    (react routing)
 *          => Layout.tsx    (app view layout)
 *          => page routes
 */
import "./index.tsx";

export {}; // Fix the error "All files must be modules when the '--isolatedModules' flag is provided".
