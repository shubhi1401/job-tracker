
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function FollowUpActions({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function markCompleted() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpCompleted: true }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Could not complete reminder.");
        return;
      }

      startTransition(() => router.refresh());
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={markCompleted}
        disabled={loading || isPending}
        className="rounded-lg border border-emerald-500/30 px-3 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50"
      >
        {loading || isPending ? "Saving..." : "Mark Completed"}
      </button>

      {error && <p className="text-xs text-rose-300">{error}</p>}
    </div>
  );
}
