import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "./index";
import {
  admins,
  confirmations,
  media,
  reports,
  type Confirmation,
  type MediaItem,
  type Report,
} from "./schema";

export type ReportWithDetails = Report & {
  media: MediaItem[];
  confirmations: Confirmation[];
};

export async function getReportsWithDetails(): Promise<ReportWithDetails[]> {
  const db = getDb();
  const [reportRows, mediaRows, confirmationRows] = await Promise.all([
    db.select().from(reports).orderBy(desc(reports.reportDate), desc(reports.id)),
    db.select().from(media).orderBy(asc(media.sortOrder), asc(media.id)),
    db
      .select()
      .from(confirmations)
      .orderBy(desc(confirmations.createdAt), desc(confirmations.id)),
  ]);

  return reportRows.map((report) => ({
    ...report,
    media: mediaRows.filter((item) => item.reportId === report.id),
    confirmations: confirmationRows.filter(
      (item) => item.reportId === report.id,
    ),
  }));
}

export async function getAdmin() {
  const [admin] = await getDb().select().from(admins).limit(1);
  return admin ?? null;
}

export async function isAdmin(email: string) {
  const [admin] = await getDb()
    .select()
    .from(admins)
    .where(eq(admins.email, email.toLowerCase()))
    .limit(1);
  return Boolean(admin);
}
