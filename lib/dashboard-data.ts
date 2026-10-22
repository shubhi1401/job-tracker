import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarCheck,
  CalendarClock,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Target,
  XCircle
} from "lucide-react";

export const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, active: true },
  {
    label: "Applications",
    href: "/dashboard/applications",
    icon: BriefcaseBusiness
  },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Resume", href: "/dashboard/resume", icon: FileText },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Logout", href: "/login", icon: LogOut }
];

export const dashboardStats = [
  {
    label: "Total Applications",
    value: "128",
    change: "+18 this month",
    icon: BriefcaseBusiness
  },
  {
    label: "Interviews",
    value: "24",
    change: "+7 scheduled",
    icon: CalendarCheck
  },
  {
    label: "Offers",
    value: "6",
    change: "3 awaiting reply",
    icon: Target
  },
  {
    label: "Rejections",
    value: "31",
    change: "-12% vs last month",
    icon: XCircle
  },
  {
  label: "Resume Match",
  href: "/dashboard/resume-match",
  icon: BriefcaseBusiness,
  active: false,
},
{
  label: "Reminders",
  href: "/dashboard/reminders",
  icon: CalendarClock,
},
];

export const recentApplications = [
  {
    company: "Google",
    role: "Frontend Engineer",
    date: "Jun 24, 2026",
    status: "Interview",
    match: "92%"
  },
  {
    company: "Microsoft",
    role: "React Developer",
    date: "Jun 22, 2026",
    status: "Applied",
    match: "88%"
  },
  {
    company: "Adobe",
    role: "UI Engineer",
    date: "Jun 19, 2026",
    status: "Offer",
    match: "95%"
  },
  {
    company: "Atlassian",
    role: "Next.js Developer",
    date: "Jun 17, 2026",
    status: "Rejected",
    match: "76%"
  }
];

export const calendarDays = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun"
];

export const calendarDates = Array.from({ length: 30 }, (_, index) => index + 1);

export const upcomingInterviews = [
  {
    company: "Google",
    role: "Technical Round",
    time: "Today, 4:30 PM"
  },
  {
    company: "Adobe",
    role: "Design Systems Call",
    time: "Tomorrow, 11:00 AM"
  },
  {
    company: "Spotify",
    role: "Hiring Manager",
    time: "Jun 29, 2:00 PM"
  }
];

export const activityTimeline = [
  {
    title: "Resume analyzed for Google role",
    description: "AI found 8 high-impact keyword matches.",
    time: "15 mins ago"
  },
  {
    title: "Interview scheduled with Adobe",
    description: "Calendar invite added for Design Systems Call.",
    time: "2 hours ago"
  },
  {
    title: "Cover letter generated",
    description: "Personalized letter created for Microsoft React Developer.",
    time: "Yesterday"
  },
  {
    title: "Application moved to Offer",
    description: "Adobe UI Engineer application reached offer stage.",
    time: "Jun 24"
  }
];

export const notificationIcon = Bell;
