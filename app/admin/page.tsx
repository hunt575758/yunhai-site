import { requireChatGPTUser } from "../chatgpt-auth";
import { getAdmin, getReportsWithDetails } from "../../db/data";
import { AdminDashboard } from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  const [admin, reports] = await Promise.all([
    getAdmin(),
    getReportsWithDetails(),
  ]);
  const isCurrentAdmin = admin?.email === user.email.toLowerCase();

  return (
    <main className="admin-page">
      <header className="admin-header">
        <a href="/" className="brand-mark">雲海慈光</a>
        <div>
          <span>{user.displayName}</span>
          <a href="/">查看公開頁面</a>
          <a href="/signout-with-chatgpt?return_to=/">登出</a>
        </div>
      </header>
      <section className="admin-intro">
        <p className="eyebrow">CREATOR STUDIO</p>
        <h1>創作紀錄管理</h1>
        <p>依日期填寫進度文字並上傳圖片，發布後會一格一格排列在公開頁面。</p>
      </section>
      <AdminDashboard
        hasAdmin={Boolean(admin)}
        isCurrentAdmin={isCurrentAdmin}
        adminName={admin?.displayName}
        reports={reports.map((report) => ({
          id: report.id,
          title: report.title,
          reportDate: report.reportDate,
          mediaCount: report.media.length,
        }))}
      />
    </main>
  );
}
