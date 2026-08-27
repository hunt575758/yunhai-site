"use client";

import { FormEvent, useState } from "react";
import { CalendarDays, CheckCircle2, ImagePlus, LockKeyhole, UploadCloud, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ReportSummary = {
  id: number;
  title: string;
  reportDate: string;
  mediaCount: number;
};

export function AdminDashboard({
  hasAdmin,
  isCurrentAdmin,
  adminName,
  reports,
}: {
  hasAdmin: boolean;
  isCurrentAdmin: boolean;
  adminName?: string;
  reports: ReportSummary[];
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function claimAdmin() {
    setBusy(true);
    const response = await fetch("/api/admin/claim", { method: "POST" });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setBusy(false);
      setMessage(result.error ?? "啟用失敗。");
      return;
    }
    window.location.reload();
  }

  async function submitEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const day = String(form.get("cumulativeDays") ?? "").trim();
    form.set("kind", "journal");
    form.set("stage", "0");
    form.set("title", `第${day}天創作進度`);
    setBusy(true);
    setMessage("圖片上傳中，請不要關閉頁面……");

    const response = await fetch("/api/reports", { method: "POST", body: form });
    const result = (await response.json()) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setMessage(result.error ?? "發布失敗，請稍後再試。");
      return;
    }
    setMessage("已發布，正在更新頁面……");
    window.setTimeout(() => window.location.reload(), 700);
  }

  if (!hasAdmin) {
    return (
      <section className="claim-card">
        <LockKeyhole />
        <div>
          <h2>啟用創作者管理權限</h2>
          <p>請確認目前使用的是你自己的ChatGPT帳號。</p>
          <Button onClick={claimAdmin} disabled={busy}>啟用我的管理權限</Button>
          {message && <p className="form-message">{message}</p>}
        </div>
      </section>
    );
  }

  if (!isCurrentAdmin) {
    return (
      <section className="claim-card">
        <LockKeyhole />
        <div>
          <h2>此頁僅供創作者使用</h2>
          <p>目前管理員為 {adminName ?? "網站擁有者"}。</p>
          <Button asChild variant="outline"><a href="/">返回公開頁面</a></Button>
        </div>
      </section>
    );
  }

  return (
    <div className="simple-admin-stack">
      <section className="simple-admin-form">
        <h2>新增一筆進度</h2>
        <p>每發布一次就會自動成為第一篇、第二篇……每篇可放很多張圖片，文字會顯示在格子最下方。</p>

        <form onSubmit={submitEntry} className="simple-entry-form">
          <div className="simple-form-row">
            <label><span><CalendarDays /> 日期</span><Input name="reportDate" type="date" required /></label>
            <label><span>累計天數</span><Input name="cumulativeDays" type="number" min="1" max="120" required placeholder="例如：12" /></label>
          </div>

          <label>
            <span>進度文字</span>
            <Textarea name="summary" required placeholder="例如：今天完成手部結構調整，並重新整理念珠與衣紋的位置。" />
          </label>

          <label className="simple-upload-box">
            <span><ImagePlus /> 上傳圖片</span>
            <Input name="details" type="file" accept="image/jpeg,image/png,image/webp" multiple />
            <small>可以只上傳一張，也能一次選擇多張；每次最多30張。</small>
          </label>

          <label>
            <span><Video /> YouTube影片連結（選填）</span>
            <Input name="youtubeUrl" type="url" placeholder="沒有影片可以留白" />
          </label>

          <Button type="submit" className="simple-publish-button" disabled={busy}>
            <UploadCloud /> {busy ? "處理中……" : "發布這一筆進度"}
          </Button>
          {message && <p className="form-message" role="status">{message}</p>}
        </form>
      </section>

      <section className="simple-history">
        <h2>已發布紀錄</h2>
        {reports.length === 0 ? <p>尚未發布任何紀錄。</p> : reports.map((report) => (
          <article key={report.id}>
            <CheckCircle2 />
            <div><strong>{report.title}</strong><span>{report.reportDate} · {report.mediaCount}張圖片</span></div>
          </article>
        ))}
      </section>
    </div>
  );
}
