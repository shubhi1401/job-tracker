import Link from "next/link";
export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white p-5">
      <h1 className="text-2xl font-bold mb-8">Job Tracker</h1>
      <nav>
        <ul className="space-y-4">
          <li>
            <Link
              href="/dashboard"
              className="block p-2 rounded hover:bg-gray-700"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/applications"
              className="block p-2 rounded hover:bg-gray-700"
            >
              Applications
            </Link>
          </li>
          <li>
            <Link
              href="/add-application"
              className="block p-2 rounded hover:bg-gray-700"
            >
              Add Application
            </Link>
          </li>
          <li>
            <Link
              href="/analytics"
              className="block p-2 rounded hover:bg-gray-700"
            >
              Analytics
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}