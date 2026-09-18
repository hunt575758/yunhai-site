import { CalendarDays, ImageIcon, Play } from "lucide-react";
import { getChatGPTUser } from "./chatgpt-auth";
import { getAdmin, getReportsWithDetails, type ReportWithDetails } from "../db/data";
import { youtubeEmbedUrl } from "../lib/project";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

function EntryMedia({ entry }: { entry: ReportWithDetails }) {
  const images = entry.media.filter((item) => item.mimeType.startsWith("image/"));
  const embed = youtubeEmbedUrl(entry.youtubeUrl);
  if (images.length === 0 && !embed) return null;

  return (
    <div className="entry-media">
      {images.length > 0 && (
        <div className={`image-grid count-${Math.min(images.length, 4)}`}>
          {images.map((item) => (
            <a key={item.id} href={`/media/${item.id}`} target="_blank" rel="noreferrer">
              <img src={`/media/${item.id}`} alt={item.caption || `${entry.title}創作照片`} />
            </a>
          ))}
        </div>
      )}
      {embed && (
        <div className="entry-video">
          <iframe
            src={embed}
            title={`${entry.title} YouTube影片`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          <span><Play /> 作畫影片</span>
        </div>
      )}
    </div>
  );
}

export default async function Home() {
  const [entries, user, admin] = await Promise.all([
    getReportsWithDetails(),
    getChatGPTUser(),
    getAdmin(),
  ]);
  const currentUserIsAdmin = Boolean(
    user && (!admin || admin.email === user.email.toLowerCase()),
  );
  const orderedEntries = [...entries].sort((a, b) => a.id - b.id);
  const manualEntries = [
    {
      reportDate: "2026-09-03",
      cumulativeDays: 17,
      summary: "進行第4次臉部描繪。現在暖色調已經畫好，接下來逐漸加入寒色調，讓皮膚的色彩層次慢慢堆疊起來。",
      images: [
        "/progress/2026-09-03/01-overview.jpg",
        "/progress/2026-09-03/02-face.jpg",
        "/progress/2026-09-03/03-hands.jpg",
      ],
    },
    {
      reportDate: "2026-09-04",
      cumulativeDays: 18,
      summary: "為背景的雲層加入光芒，也加深較暗區域的厚度感。",
      images: [
        "/progress/2026-09-04/01-overview.jpg",
        "/progress/2026-09-04/02-cloud-light.jpg",
        "/progress/2026-09-04/03-cloud-left.jpg",
        "/progress/2026-09-04/04-mountain-cloud.jpg",
        "/progress/2026-09-04/05-palette.jpg",
        "/progress/2026-09-04/06-cloud-right.jpg",
      ],
    },
    {
      reportDate: "2026-09-09",
      cumulativeDays: 23,
      summary: "師父的袈裟，這個紅色使用的是林布蘭特頂級的紅色顏料。透過多層次的堆疊，才能呈現出飽滿的光澤與視覺美感。",
      images: [
        "/progress/2026-09-09/01-robe-overview.jpg",
        "/progress/2026-09-09/02-robe-upper.jpg",
        "/progress/2026-09-09/03-robe-detail.jpg",
      ],
    },
  ];

  return (
    <main className="site-shell">
      <header className="simple-nav">
        <a href="/" className="site-name">雲海慈光</a>
        {currentUserIsAdmin && <a href="/admin" className="manage-link">新增創作進度</a>}
      </header>

      <section className="simple-hero">
        <div className="portrait-sketch">
          <img src="/pencil-portrait-reference.jpeg" alt="天代師父法相鉛筆素描" />
        </div>
        <div className="portrait-video">
          <iframe
            src="https://www.youtube-nocookie.com/embed/RJ2Y6Y0FPns"
            title="天代師父法相鉛筆素描創作影片"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="hero-title">
          <p>油畫創作進度紀錄</p>
          <h1>《雲海慈光》</h1>
          <span>天代師父法相油畫創作計畫</span>
        </div>
      </section>

      <section className="plan-intro">
        <div><span>創作時間</span><strong>2026年8月18日－12月15日</strong><small>共120天</small></div>
        <div><span>作品尺寸</span><strong>100 × 72 公分</strong><small>比利時細全麻畫布</small></div>
        <p>以油畫記錄法相、衣紋、雲海、山巒與光線逐步完成的過程。以下依日期由上往下保存每一次創作進度。</p>
      </section>

      <section className="entries-section">
        <div className="entries-heading">
          <p>PROGRESS JOURNAL</p>
          <h2>創作進度</h2>
        </div>

        {orderedEntries.length === 0 ? (
          <div className="entries-empty">
            <ImageIcon />
            <h3>尚未新增進度</h3>
            <p>發布後，日期、文字與圖片會依序顯示在這裡。</p>
          </div>
        ) : (
          <div className="entries-list">
            {orderedEntries.map((entry, index) => (
              <article className="progress-entry" key={entry.id}>
                <div className="entry-time">
                  <span className="entry-number">第 {index + 1} 篇</span>
                  <CalendarDays />
                  <span>{formatDate(entry.reportDate)}</span>
                  <strong>第 {entry.cumulativeDays} 天</strong>
                </div>
                <div className="entry-content">
                  <EntryMedia entry={entry} />
                  <p className="entry-note">{entry.summary || entry.completed || entry.changes || entry.title}</p>
                </div>
              </article>
            ))}
            {manualEntries.map((entry, index) => (
              <article className="progress-entry" key={entry.reportDate}>
                <div className="entry-time">
                  <span className="entry-number">第 {orderedEntries.length + index + 1} 篇</span>
                  <CalendarDays />
                  <span>{formatDate(entry.reportDate)}</span>
                  <strong>第 {entry.cumulativeDays} 天</strong>
                </div>
                <div className="entry-content">
                  <div className={`image-grid count-${Math.min(entry.images.length, 4)}`}>
                    {entry.images.map((src) => (
                      <a key={src} href={src} target="_blank" rel="noreferrer">
                        <img src={src} alt={`${entry.reportDate} 創作進度照片`} />
                      </a>
                    ))}
                  </div>
                  <p className="entry-note">{entry.summary}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="simple-footer">
        <strong>《雲海慈光》</strong>
        <span>2026年油畫創作紀錄</span>
      </footer>
    </main>
  );
}
