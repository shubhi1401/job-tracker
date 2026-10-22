
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock } from "lucide-react";

type Interview = {
  id: number;
  company: string;
  role: string;
  interviewDate: string;
  status: string;
};

export function UpcomingInterviews() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadInterviews() {
      try {
        const response = await fetch("/api/interviews/upcoming", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load upcoming interviews.");
        }

        const data: Interview[] = await response.json();

        if (!cancelled) {
          setInterviews(data);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load interviews. Please refresh.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInterviews();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 shadow-xl shadow-black/10 backdrop-blur">
      <div className="mb-5">
        <h2 className="text-xl font-black text-white">
          Upcoming Interviews
        </h2>
        <p className="text-sm text-slate-400">
          Your next scheduled rounds.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">
          Loading interviews...
        </p>
      ) : error ? (
        <p role="alert" className="text-sm text-rose-300">
          {error}
        </p>
      ) : interviews.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-center">
          <CalendarClock className="mx-auto mb-2 h-7 w-7 text-slate-400" />
          <p className="font-semibold text-white">
            No upcoming interviews
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Add an interview date to one of your applications to see it here.
          </p>
          <Link
            href="/dashboard/applications"
            className="mt-3 inline-block text-sm font-semibold text-blue-300 hover:text-blue-200"
          >
            View applications
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((interview) => (
            <article
              key={interview.id}
              className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 transition hover:border-blue-300/40"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-500/15 text-blue-300">
                  <CalendarClock className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-white">
                    {interview.company}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {interview.role}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-blue-200">
                    {new Date(interview.interviewDate).toLocaleString(
                      undefined,
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }
                    )}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
