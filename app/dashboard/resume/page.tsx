
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

type Resume = {
  id: number;
  fileName: string;
  createdAt: string;
};

function ResumeManager({ initialResumes }: { initialResumes: Resume[] }) {
  return (
    <main>
      <h1>Resumes</h1>
      {initialResumes.length === 0 ? (
        <p>No resumes yet.</p>
      ) : (
        <ul>
          {initialResumes.map((resume) => (
            <li key={resume.id}>
              {resume.fileName} — {new Date(resume.createdAt).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export const metadata: Metadata = {
  title: "Resume | JobTracker AI",
};

export default async function ResumePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const resumes = await (await import("@/lib/prisma")).default.resume.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, fileName: true, createdAt: true },
  });

  return <ResumeManager initialResumes={resumes.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }))} />;
}
