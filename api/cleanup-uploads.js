// Daily cron (see vercel.json): deletes quote uploads older than 30 days
// so the Blob store doesn't fill up. Only Vercel Cron can call it: requests
// must carry `Authorization: Bearer ${CRON_SECRET}`.
import { list, del } from '@vercel/blob';

const MAX_AGE_DAYS = 30;

export default {
  async fetch(request) {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    let cursor;
    let checked = 0;
    const expired = [];

    do {
      const page = await list({ prefix: 'quotes/', cursor, limit: 1000 });
      checked += page.blobs.length;
      for (const blob of page.blobs) {
        if (new Date(blob.uploadedAt).getTime() < cutoff) expired.push(blob.url);
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);

    // Delete in batches to keep each request small.
    for (let i = 0; i < expired.length; i += 100) {
      await del(expired.slice(i, i + 100));
    }

    console.log(`cleanup-uploads: checked ${checked}, deleted ${expired.length}`);
    return Response.json({ checked, deleted: expired.length });
  },
};
