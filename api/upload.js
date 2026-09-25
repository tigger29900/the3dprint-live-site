// Issues short-lived tokens so the quote form can upload customer files
// (STL, 3MF, STEP, images, PDF) straight from the browser to Vercel Blob.
// Files are then linked in the FormSubmit email instead of attached.
import { handleUpload } from '@vercel/blob/client';

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB per file
const ALLOWED_EXTENSIONS = /\.(stl|3mf|obj|step|stp|pdf|jpe?g|png|webp|heic|gif)$/i;
const ALLOWED_ORIGINS = new Set([
  'https://the3dprint.live',
  'https://www.the3dprint.live',
  'https://the3dprint-live-site.vercel.app',
]);

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  // Preview deployments: https://the3dprint-live-site-<hash>-<team>.vercel.app
  return /^https:\/\/the3dprint-live-site-[a-z0-9-]+\.vercel\.app$/.test(origin);
}

export default {
  async fetch(request) {
    if (request.method === 'GET') {
      // Health check: reports whether storage credentials are configured (never their values).
      return Response.json({
        ok: true,
        blobTokenConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
        blobStoreIdConfigured: Boolean(process.env.BLOB_STORE_ID),
      });
    }
    if (request.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }
    if (!isAllowedOrigin(request.headers.get('origin'))) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const result = await handleUpload({
        request,
        body,
        onBeforeGenerateToken: async (pathname) => {
          if (!pathname.startsWith('quotes/') || !ALLOWED_EXTENSIONS.test(pathname)) {
            throw new Error('File type not allowed');
          }
          return {
            // Everything is stored as a download; nothing uploaded is served as a web page.
            allowedContentTypes: ['application/octet-stream'],
            maximumSizeInBytes: MAX_BYTES,
            addRandomSuffix: true,
          };
        },
      });
      return Response.json(result);
    } catch (error) {
      console.error('upload token error:', error);
      return Response.json({ error: error.message }, { status: 400 });
    }
  },
};
