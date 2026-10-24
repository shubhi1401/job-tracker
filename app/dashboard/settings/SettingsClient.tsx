"use client";

import { useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  KeyRound,
  Loader2,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  applicationsCount: number;
  resumesCount: number;
};

export default function SettingsClient({
  initialUser,
}: {
  initialUser: UserProfile;
}) {
  const [user, setUser] = useState<UserProfile>(initialUser);

  // Profile info state
  const [name, setName] = useState(initialUser.name);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileMessage(null);

    if (name.trim().length < 2) {
      setProfileMessage({
        type: "error",
        text: "Name must be at least 2 characters long.",
      });
      return;
    }

    setSavingProfile(true);

    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      setUser((prev) => ({ ...prev, name: data.user.name }));
      setProfileMessage({
        type: "success",
        text: "Your profile information was updated successfully.",
      });
    } catch (err) {
      setProfileMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update profile.",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({
        type: "error",
        text: "Please enter your current password.",
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "New password must be at least 8 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "New passwords do not match.",
      });
      return;
    }

    setSavingPassword(true);

    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage({
        type: "success",
        text: "Your password was changed successfully.",
      });
    } catch (err) {
      setPasswordMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to change password.",
      });
    } finally {
      setSavingPassword(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-400";
  const labelClass = "block text-sm font-medium text-slate-300 mb-2";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3.5 py-1 text-xs font-semibold text-blue-300 shadow-glow backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" />
          User Profile
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Account Settings
        </h1>

        <p className="mt-2 text-slate-400">
          Manage your personal information, credentials, and workspace preferences.
        </p>
      </div>

      {/* Profile Overview Card */}
      <section className="flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-blue-500 via-sky-400 to-cyan-300 text-2xl font-black text-slate-950 shadow-glow">
            {initials || "JT"}
          </div>

          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
            <p className="text-sm text-slate-400">{user.email}</p>
            <p className="mt-1 text-xs text-slate-500">
              Member since{" "}
              {new Date(user.createdAt).toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <BriefcaseBusiness className="mx-auto h-5 w-5 text-blue-300" />
            <p className="mt-2 text-2xl font-black text-white">
              {user.applicationsCount}
            </p>
            <p className="text-xs text-slate-400">Applications</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <FileText className="mx-auto h-5 w-5 text-cyan-300" />
            <p className="mt-2 text-2xl font-black text-white">
              {user.resumesCount}
            </p>
            <p className="text-xs text-slate-400">Resumes</p>
          </div>
        </div>
      </section>

      {/* Profile Information Form */}
      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/15 text-blue-300">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Personal Information</h3>
            <p className="text-xs text-slate-400">Update your public display name.</p>
          </div>
        </div>

        {profileMessage && (
          <div
            role="alert"
            className={`mb-5 flex items-center gap-3 rounded-xl border p-4 text-sm ${
              profileMessage.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-rose-500/30 bg-rose-500/10 text-rose-300"
            }`}
          >
            {profileMessage.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            )}
            <span>{profileMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              disabled
              value={user.email}
              className={`${inputClass} cursor-not-allowed opacity-60`}
            />
            <p className="mt-1 text-xs text-slate-500">
              Email address is managed as your unique account credential.
            </p>
          </div>

          <button
            type="submit"
            disabled={savingProfile || name.trim() === user.name}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </section>

      {/* Password & Security Form */}
      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Security & Password</h3>
            <p className="text-xs text-slate-400">
              Change your password to keep your workspace secure.
            </p>
          </div>
        </div>

        {passwordMessage && (
          <div
            role="alert"
            className={`mb-5 flex items-center gap-3 rounded-xl border p-4 text-sm ${
              passwordMessage.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-rose-500/30 bg-rose-500/10 text-rose-300"
            }`}
          >
            {passwordMessage.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            )}
            <span>{passwordMessage.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
              placeholder="Enter current password"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>New Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingPassword ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      </section>

      {/* Account Info Footer */}
      <section className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-slate-400">
        <ShieldCheck className="h-5 w-5 shrink-0 text-blue-300" />
        <p className="leading-6">
          Your account data and applications are encrypted and kept strictly confidential.
        </p>
      </section>
    </div>
  );
}
