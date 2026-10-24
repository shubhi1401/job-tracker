"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  Sparkles,
} from "lucide-react";

type EventItem = {
  id: number;
  company: string;
  role: string;
  type: "interview" | "follow_up";
  date: Date;
  status: string;
  completed?: boolean;
};

type ReminderResponse = {
  id: number;
  company: string;
  role: string;
  status: string;
  interviewDate: string | null;
  followUpDate: string | null;
  followUpCompleted: boolean;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarPanel() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        const response = await fetch("/api/reminders", { cache: "no-store" });
        if (!response.ok) return;

        const data: ReminderResponse[] = await response.json();
        if (cancelled) return;

        const parsedEvents: EventItem[] = [];

        data.forEach((app) => {
          if (app.interviewDate) {
            parsedEvents.push({
              id: app.id,
              company: app.company,
              role: app.role,
              type: "interview",
              date: new Date(app.interviewDate),
              status: app.status,
            });
          }

          if (app.followUpDate) {
            parsedEvents.push({
              id: app.id,
              company: app.company,
              role: app.role,
              type: "follow_up",
              date: new Date(app.followUpDate),
              status: app.status,
              completed: app.followUpCompleted,
            });
          }
        });

        setEvents(parsedEvents);
      } catch (err) {
        console.error("Calendar events load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function goToToday() {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }

  const isToday = (dayNumber: number) => {
    const now = new Date();
    return (
      now.getFullYear() === year &&
      now.getMonth() === month &&
      now.getDate() === dayNumber
    );
  };

  const isSelected = (dayNumber: number) => {
    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === dayNumber
    );
  };

  const getEventsForDay = (dayNumber: number) => {
    return events.filter((ev) => {
      return (
        ev.date.getFullYear() === year &&
        ev.date.getMonth() === month &&
        ev.date.getDate() === dayNumber
      );
    });
  };

  const selectedDayEvents = events.filter((ev) => {
    return (
      ev.date.getFullYear() === selectedDate.getFullYear() &&
      ev.date.getMonth() === selectedDate.getMonth() &&
      ev.date.getDate() === selectedDate.getDate()
    );
  });

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 shadow-xl shadow-black/10 backdrop-blur">
      {/* Calendar Header with Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">Calendar</h2>
          <p className="text-sm font-semibold text-blue-300">
            {monthName} {year}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToToday}
            className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Today
          </button>

          <button
            type="button"
            onClick={prevMonth}
            aria-label="Previous Month"
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={nextMonth}
            aria-label="Next Month"
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400">
        {DAYS.map((day) => (
          <span key={day} className="py-1">
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="mt-1 grid grid-cols-7 gap-1 text-center">
        {/* Empty padding for days before the 1st */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <span key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Month Days */}
        {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
          const dayNumber = i + 1;
          const dayEvents = getEventsForDay(dayNumber);
          const hasInterview = dayEvents.some((e) => e.type === "interview");
          const hasFollowUp = dayEvents.some((e) => e.type === "follow_up");
          const today = isToday(dayNumber);
          const selected = isSelected(dayNumber);

          return (
            <button
              key={dayNumber}
              type="button"
              onClick={() => setSelectedDate(new Date(year, month, dayNumber))}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-xs font-semibold transition ${
                selected
                  ? "bg-blue-600 text-white shadow-glow"
                  : today
                    ? "border border-blue-400/60 bg-blue-500/20 text-white"
                    : "bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <span>{dayNumber}</span>

              {/* Event Indicator Dots */}
              {dayEvents.length > 0 && (
                <div className="mt-0.5 flex gap-1">
                  {hasInterview && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-glow" />
                  )}
                  {hasFollowUp && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-glow" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-glow" />
          Interview
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-300 shadow-glow" />
          Follow-up
        </span>
      </div>

      {/* Selected Day Agenda */}
      <div className="mt-4 border-t border-white/10 pt-3">
        <p className="text-xs font-semibold text-slate-400">
          Agenda for{" "}
          <span className="text-white">
            {selectedDate.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </p>

        {loading ? (
          <p className="mt-2 text-xs text-slate-500">Loading events...</p>
        ) : selectedDayEvents.length === 0 ? (
          <p className="mt-2 text-xs text-slate-500">
            No interviews or follow-ups scheduled for this day.
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            {selectedDayEvents.map((ev, index) => (
              <div
                key={`${ev.id}-${ev.type}-${index}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 p-2.5 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        ev.type === "interview"
                          ? "bg-cyan-300 shadow-glow"
                          : "bg-amber-300 shadow-glow"
                      }`}
                    />
                    <span className="font-bold text-white truncate">
                      {ev.company}
                    </span>
                    <span className="text-slate-400">({ev.role})</span>
                  </div>
                  <p className="mt-0.5 text-slate-400 text-[11px]">
                    {ev.type === "interview"
                      ? "Interview round"
                      : ev.completed
                        ? "Follow-up (Completed)"
                        : "Follow-up pending"}
                  </p>
                </div>

                <Link
                  href={`/dashboard/applications/${ev.id}`}
                  className="shrink-0 p-1 text-blue-300 hover:text-blue-200"
                  title="View application"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
