import path from "node:path";
import os from "node:os";

/**
 * Returns the directory for storing private resumes.
 * On Vercel (read-only filesystem), falls back to the system temp directory (/tmp).
 * In local development, uses the local private-resumes directory.
 */
export function getResumesDir(): string {
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), "private-resumes");
  }
  return path.join(process.cwd(), "private-resumes");
}

/**
 * Returns the directory for storing file-based user data.
 * On Vercel, uses os.tmpdir() to avoid EROFS (read-only filesystem) errors.
 */
export function getDataSubdir(sub: string): string {
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), "job-tracker-data", sub);
  }
  return path.join(process.cwd(), "data", sub);
}
