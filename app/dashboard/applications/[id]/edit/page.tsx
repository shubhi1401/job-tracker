
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import EditApplicationForm from "./EditApplicationForm";

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const applicationId = Number(id);

  if (!Number.isInteger(applicationId) || applicationId <= 0) {
    notFound();
  }

  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId: user.id },
  });

  if (!application) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Edit Application</h1>
        <p className="mt-2 text-slate-400">
          Update your job application details.
        </p>
      </div>
      <EditApplicationForm application={application} />
    </div>
  );
}
