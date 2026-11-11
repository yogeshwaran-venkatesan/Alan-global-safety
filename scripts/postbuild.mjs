// Runs after `ng build` (npm "postbuild").
// Static hosts (Vercel, Netlify, Cloudflare Pages, Firebase) serve /404.html
// for unknown URLs, so publish the prerendered "page not found" page there.
import { copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const out = fileURLToPath(new URL('../dist/alan-global-safety/browser/', import.meta.url));
const source = out + '404/index.html';

if (!existsSync(source)) {
  console.error('postbuild: 404/index.html was not prerendered');
  process.exit(1);
}
copyFileSync(source, out + '404.html');
console.log('postbuild: wrote 404.html');
