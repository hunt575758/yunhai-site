export const dynamic = 'force-dynamic';
import { getChatGPTUser } from "../../../chatgpt-auth";
import { getAdmin } from "../../../../db/data";
import { getDb } from "../../../../db";
import { admins } from "../../../../db/schema";

export async function POST() {
  const user = await getChatGPTUser();
  if (!user) {
    return Response.json({ error: "請先登入後再啟用管理權限。" }, { status: 401 });
  }

  const existing = await getAdmin();
  if (existing) {
    return Response.json(
      { error: "創作者管理權限已經啟用。" },
      { status: 409 },
    );
  }

  await getDb().insert(admins).values({
    id: 1,
    email: user.email.toLowerCase(),
    displayName: user.displayName,
  });

  return Response.json({ ok: true });
}
