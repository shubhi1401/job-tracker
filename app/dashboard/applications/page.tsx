import prisma from "@/lib/prisma";
import Link from "next/link";
export default async function ApplicationsPage() {
  const applications = await prisma.application.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Applications
        </h1>

        <p className="text-slate-400">
          Manage all your job applications.
        </p>
      </div>

      <Link
  href="/dashboard/applications/new"
  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
>
  + Add Application
</Link>
    </div>

    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.05]">
      <table className="w-full text-left">
        <thead className="bg-white/5">
          <tr>
            <th className="p-4">Company</th>
            <th className="p-4">Role</th>
            <th className="p-4">Status</th>
            <th className="p-4">Date</th>
            <th className="p-4">Location</th>
          </tr>
        </thead>

        <tbody>
          {applications.map((application) => (
            <tr
              key={application.id}
              className="border-t border-white/10 hover:bg-white/5"
            >
              <td className="p-4">{application.company}</td>

              <td className="p-4">{application.role}</td>

              <td className="p-4">{application.status}</td>

              <td className="p-4">
                {application.applicationDate.toLocaleDateString()}
              </td>

              <td className="p-4">
                {application.location}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);}