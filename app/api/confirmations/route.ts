export const dynamic = 'force-dynamic';
import { eq } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { confirmations, reports } from "../../../db/schema";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "請先登入。" }, { status: 401 });

  const body = (await request.json()) as {
    reportId?: number;
    decision?: string;
    comment?: string;
  };
  const reportId = Number(body.reportId);
  const decision = String(body.decision ?? "");
  const comment = String(body.comment ?? "").trim().slice(0, 2000);
  if (!Number.isInteger(reportId) || !["confirmed", "adjustment"].includes(decision)) {
    return Response.json({ error: "確認資料不完整。" }, { status: 400 });
  }
  if (decision === "adjustment" && !comment) {
    return Response.json({ error: "請填寫需要調整的內容。" }, { status: 400 });
  }

  const db = getDb();
  const [report] = await db
    .select()
    .from(reports)
    .where(eq(reports.id, reportId))
    .limit(1);
  if (!report || report.kind !== "monthly") {
    return Response.json({ error: "找不到這份正式月報。" }, { status: 404 });
  }

  await db.insert(confirmations).values({
    reportId,
    reportVersion: report.version,
    decision,
    comment,
    confirmerName: user.displayName,
    confirmerEmail: user.email.toLowerCase(),
  });
  return Response.json({ ok: true }, { status: 201 });
}
