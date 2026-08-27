import { env } from "cloudflare:workers";
import { and, desc, eq } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { isAdmin } from "../../../db/data";
import { getDb } from "../../../db";
import { media, reports } from "../../../db/schema";
import { youtubeEmbedUrl } from "../../../lib/project";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function textValue(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function fileValues(form: FormData, key: string) {
  return form
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "請先登入。" }, { status: 401 });
  if (!(await isAdmin(user.email))) {
    return Response.json({ error: "你沒有創作者管理權限。" }, { status: 403 });
  }

  const form = await request.formData();
  const kind = textValue(form, "kind");
  const stage = Number(textValue(form, "stage") || 0);
  const title = textValue(form, "title");
  const reportDate = textValue(form, "reportDate");
  const cumulativeDays = Number(textValue(form, "cumulativeDays"));
  const youtubeUrl = textValue(form, "youtubeUrl");
  const fullImages = fileValues(form, "fullImage");
  const details = fileValues(form, "details");
  const processImages = fileValues(form, "processImages");
  const otherImages = fileValues(form, "otherImages");
  const files = [...fullImages, ...details, ...processImages, ...otherImages];

  if (!title || !reportDate || !Number.isInteger(cumulativeDays) || cumulativeDays < 1 || cumulativeDays > 120) {
    return Response.json(
      { error: "請完整填寫標題、日期與累計創作天數（1－120天）。" },
      { status: 400 },
    );
  }
  if (kind !== "journal" && kind !== "monthly") {
    return Response.json({ error: "紀錄類型不正確。" }, { status: 400 });
  }
  if (kind === "monthly" && (!Number.isInteger(stage) || stage < 1 || stage > 4)) {
    return Response.json({ error: "請選擇正式月報階段。" }, { status: 400 });
  }
  if (kind === "monthly" && fullImages.length !== 1) {
    return Response.json({ error: "正式月報必須上傳一張固定角度全幅照。" }, { status: 400 });
  }
  if (youtubeUrl && !youtubeEmbedUrl(youtubeUrl)) {
    return Response.json({ error: "YouTube連結格式不正確。" }, { status: 400 });
  }
  if (files.length > 30) {
    return Response.json({ error: "每次最多上傳30張圖片。" }, { status: 400 });
  }
  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return Response.json(
        { error: `${file.name} 格式不支援，請使用JPG、PNG或WebP圖片。` },
        { status: 400 },
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: `${file.name} 超過25MB，請先縮小圖片後再上傳。` },
        { status: 400 },
      );
    }
  }

  const db = getDb();
  let version = 1;
  if (kind === "monthly") {
    const [latest] = await db
      .select({ version: reports.version })
      .from(reports)
      .where(and(eq(reports.kind, "monthly"), eq(reports.stage, stage)))
      .orderBy(desc(reports.version))
      .limit(1);
    version = (latest?.version ?? 0) + 1;
  }

  const [report] = await db
    .insert(reports)
    .values({
      kind,
      stage: kind === "monthly" ? stage : null,
      title,
      reportDate,
      cumulativeDays,
      summary: textValue(form, "summary"),
      completed: textValue(form, "completed"),
      changes: textValue(form, "changes"),
      pendingItems: textValue(form, "pendingItems"),
      nextGoal: textValue(form, "nextGoal"),
      youtubeUrl,
      version,
      createdByEmail: user.email.toLowerCase(),
      createdByName: user.displayName,
    })
    .returning();

  const uploadedKeys: string[] = [];
  try {
    let sortOrder = 0;
    for (const [index, file] of files.entries()) {
      const extension = file.name.includes(".") ? file.name.split(".").pop() : "bin";
      const objectKey = `reports/${report.id}/${crypto.randomUUID()}.${extension}`;
      await env.BUCKET.put(objectKey, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type },
        customMetadata: { originalName: file.name },
      });
      uploadedKeys.push(objectKey);
      await db.insert(media).values({
        reportId: report.id,
        objectKey,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        category:
          index < fullImages.length
            ? "full"
            : index < fullImages.length + details.length
              ? "detail"
              : index < fullImages.length + details.length + processImages.length
                ? "process"
                : "other",
        sortOrder: sortOrder++,
      });
    }
  } catch (error) {
    for (const key of uploadedKeys) await env.BUCKET.delete(key);
    await db.delete(reports).where(eq(reports.id, report.id));
    const message = error instanceof Error ? error.message : "上傳失敗";
    return Response.json({ error: message }, { status: 500 });
  }

  return Response.json({ report }, { status: 201 });
}
