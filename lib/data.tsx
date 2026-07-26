import {
  BarChart3,
  Bot,
  BriefcaseBusiness,
  FileCheck2,
  Handshake,
  MailPlus,
  Sparkles,
  Target,
  UsersRound
} from "lucide-react";
export const navLinks = ["Home", "Features", "Pricing", "About"];
export const trustedCompanies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Adobe",
  "Atlassian",
  "Spotify"
];
export const features = [
  {
    icon: BriefcaseBusiness,
    title: "Application Tracker",
    description:
      "Organize every job lead, status, deadline, interview, and follow-up in one focused workspace."
  },
  {
    icon: FileCheck2,
    title: "AI Resume Analyzer",
    description:
      "Get instant feedback on clarity, keywords, formatting, and recruiter-friendly improvements."
  },
  {
    icon: Target,
    title: "Resume vs Job Match Score",
    description:
      "Compare your resume with job descriptions and uncover the exact gaps to close."
  },
  {
    icon: MailPlus,
    title: "AI Cover Letter Generator",
    description:
      "Create tailored, confident cover letters that match the role and your experience."
  },
  {
    icon: Handshake,
    title: "Referral Management",
    description:
      "Track contacts, referral requests, conversations, and warm introductions without losing context."
  },
  {
    icon: BarChart3,
    title: "Interview Analytics",
    description:
      "Understand interview rates, offer trends, bottlenecks, and where your search is strongest."
  }
];
export const steps = [
  {
    step: "Step 1",
    title: "Add your application",
    description: "Save the role, company, deadline, recruiter, notes, and current status."
  },
  {
    step: "Step 2",
    title: "AI analyzes your resume",
    description: "Receive match scores, keyword gaps, and practical resume suggestions."
  },
  {
    step: "Step 3",
    title: "Track progress",
    description: "Move applications through your pipeline and never miss a follow-up."
  },
  {
    step: "Step 4",
    title: "Get interview-ready",
    description: "Practice questions, review insights, and walk into interviews prepared."
  }
];
export const stats = [
  { value: "10,000+", label: "Applications Tracked", icon: BriefcaseBusiness },
  { value: "95%", label: "User Satisfaction", icon: Sparkles },
  { value: "500+", label: "Companies", icon: UsersRound },
  { value: "AI", label: "Powered Insights", icon: Bot }
];
export const testimonials = [
  {
    quote:
      "JobTracker AI turned my scattered job search into a clean system. The resume match score helped me focus on the right improvements.",
    name: "Aarav Mehta",
    role: "Frontend Developer"
  },
  {
    quote:
      "The dashboard feels premium and genuinely useful. I could see exactly where I was getting interviews and where I needed better targeting.",
    name: "Sophia Carter",
    role: "Product Designer"
  },
  {
    quote:
      "Cover letters, referrals, follow-ups, interview prep—everything finally lived in one place. It saved me hours every week.",
    name: "Daniel Kim",
    role: "Software Engineer"
  }
];
