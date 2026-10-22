
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteApplicationButton({
  id,
}: {
  id: number;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this application?")) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete application.");
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <span>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="font-semibold text-rose-300 hover:text-rose-200 disabled:opacity-50"
      >
        {deleting ? "Deleting..." : "Delete"}
      </button>

      {error && (
        <p className="mt-1 text-xs text-rose-300">{error}</p>
      )}
    </span>
  );
}
