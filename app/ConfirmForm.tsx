"use client";

import { useState } from "react";
import { Check, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ConfirmForm({ reportId }: { reportId: number }) {
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(decision: "confirmed" | "adjustment") {
    setSending(true);
    setMessage("");
    const response = await fetch("/api/confirmations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reportId, decision, comment }),
    });
    const result = (await response.json()) as { error?: string };
    setSending(false);
    if (!response.ok) {
      setMessage(result.error ?? "送出失敗，請稍後再試。");
      return;
    }
    setMessage(decision === "confirmed" ? "已完成本階段確認。" : "調整意見已送出並留下紀錄。");
    setComment("");
    window.setTimeout(() => window.location.reload(), 900);
  }

  return (
    <div className="confirmation-form">
      <label htmlFor={`comment-${reportId}`}>確認意見（需要調整時請務必填寫）</label>
      <Textarea
        id={`comment-${reportId}`}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="可在此說明希望調整的神情、色調、光線或細節……"
        className="confirmation-textarea"
      />
      <div className="confirmation-actions">
        <Button
          type="button"
          className="confirm-button"
          disabled={sending}
          onClick={() => submit("confirmed")}
        >
          <Check /> 本階段方向確認
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={sending}
          onClick={() => submit("adjustment")}
        >
          <MessageSquareText /> 需要調整
        </Button>
      </div>
      {message && <p className="form-message" role="status">{message}</p>}
    </div>
  );
}
