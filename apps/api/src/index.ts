/**
 * Cloudflare Worker entrypoint for the T7M brand-brief API.
 * Deploy: `npm run deploy -w @t7m/api` (see repo README).
 */
import { createApp } from './app.js';
import type { Env } from './env.js';

const app = createApp();

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  },
};
