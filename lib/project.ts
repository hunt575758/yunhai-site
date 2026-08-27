export const PROJECT_START = "2026-08-18";
export const PROJECT_END = "2026-12-15";

export const stages = [
  {
    number: 1,
    month: "第一個月",
    dates: "8月18日－9月16日",
    days: "第1－30天",
    theme: "底稿與明暗基礎",
    work: "構圖轉印、人物比例、法相定位、手部結構，以及天空、雲海、山巒與主要光源配置。",
    standard: "構圖、比例與光源方向確認",
  },
  {
    number: 2,
    month: "第二個月",
    dates: "9月17日－10月16日",
    days: "第31－60天",
    theme: "第一層設色與法相塑造",
    work: "建立膚色、僧衣、袈裟與背景主色，逐步刻畫五官、神情、手部、念珠及衣紋。",
    standard: "法相神情、服飾色調與主體層次確認",
  },
  {
    number: 3,
    month: "第三個月",
    dates: "10月17日－11月15日",
    days: "第61－90天",
    theme: "背景深化與光感統合",
    work: "深化天空、雲海、山巒與光束，調整邊緣、冷暖、明暗及空氣感。",
    standard: "背景空間、光感與人物關係確認",
  },
  {
    number: 4,
    month: "第四個月",
    dates: "11月16日－12月15日",
    days: "第91－120天",
    theme: "整體統整與完成檢視",
    work: "統整全幅色調，深化法相與衣紋細節，修整邊緣、光影與畫面節奏。",
    standard: "整體氣韻、細節完成度與最終成果確認",
  },
] as const;

export function projectProgress(now = new Date()) {
  const start = new Date(`${PROJECT_START}T00:00:00Z`);
  const end = new Date(`${PROJECT_END}T00:00:00Z`);
  const total = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
  const elapsed = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
  const day = Math.max(0, Math.min(total, elapsed));
  return {
    day,
    total,
    percent: Math.round((day / total) * 100),
    stage: day === 0 ? 0 : Math.min(4, Math.ceil(day / 30)),
  };
}

export function youtubeEmbedUrl(url: string) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    let id = "";
    if (parsed.hostname === "youtu.be") id = parsed.pathname.slice(1);
    if (parsed.hostname.endsWith("youtube.com")) {
      if (parsed.pathname === "/watch") id = parsed.searchParams.get("v") ?? "";
      if (parsed.pathname.startsWith("/shorts/")) id = parsed.pathname.split("/")[2] ?? "";
      if (parsed.pathname.startsWith("/embed/")) id = parsed.pathname.split("/")[2] ?? "";
    }
    return /^[A-Za-z0-9_-]{6,}$/.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : null;
  } catch {
    return null;
  }
}
