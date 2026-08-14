import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');

mkdirSync(join(dist, 'server'), { recursive: true });
mkdirSync(join(dist, '.openai'), { recursive: true });
copyFileSync(join(root, '.openai', 'hosting.json'), join(dist, '.openai', 'hosting.json'));

writeFileSync(join(dist, 'server', 'index.js'), `const fallback = "/index.html";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const assetRequest = new Request(url, request);
    const response = await env.ASSETS.fetch(assetRequest);

    if (response.status !== 404 || url.pathname.includes(".")) {
      return response;
    }

    const indexUrl = new URL(fallback, url.origin);
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};
`);
