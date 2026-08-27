import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { media } from "../../../db/schema";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const mediaId = Number(id);
  if (!Number.isInteger(mediaId)) return new Response("Not found", { status: 404 });

  const [item] = await getDb()
    .select()
    .from(media)
    .where(eq(media.id, mediaId))
    .limit(1);
  if (!item) return new Response("Not found", { status: 404 });

  const object = await env.BUCKET.get(item.objectKey);
  if (!object) return new Response("Not found", { status: 404 });

  return new Response(object.body, {
    headers: {
      "content-type": item.mimeType,
      "content-length": String(item.size),
      "cache-control": "private, max-age=3600",
      "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(item.filename)}`,
    },
  });
}
