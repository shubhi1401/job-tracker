import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

type PrepGuide = {
  roleOverview: string;
  behavioralQuestions: {
    question: string;
    tips: string;
  }[];
  technicalQuestions: {
    question: string;
    keyPoints: string[];
  }[];
  smartQuestionsToAsk: string[];
};

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const company = String(body.company || "").trim();
    const role = String(body.role || "").trim();
    const level = String(body.level || "Mid-Level");

    if (!company || !role) {
      return NextResponse.json(
        { error: "Company and role are required." },
        { status: 400 }
      );
    }

    const isEng =
      /engineer|developer|frontend|backend|fullstack|software|web|data|tech/i.test(
        role
      );
    const isDesign = /design|ui|ux|product/i.test(role);

    const behavioralQuestions = [
      {
        question: `Tell me about a time at your previous role when you handled a tight deadline or conflicting priorities.`,
        tips: `Use the STAR method: State the Situation (critical sprint/release), Task (what was required of you), Action (how you reprioritized, communicated with stakeholders, or cut scope safely), and Result (delivered on time with zero regressions).`,
      },
      {
        question: `Describe a situation where you strongly disagreed with a teammate or lead on a technical approach. How did you resolve it?`,
        tips: `Highlight intellectual humility and data-driven discussions. Explain how you listened to their concerns, benchmarked alternatives, aligned on team tradeoffs, and fully committed to the chosen path.`,
      },
      {
        question: `Can you walk through a complex project you spearheaded from ambiguous requirements to production?`,
        tips: `Demonstrate ownership. Highlight how you clarified unknowns with product managers, drafted architectural options, broke down tasks, and handled production rollouts.`,
      },
      {
        question: `Tell me about a failure or a production incident you were involved in. What did you learn?`,
        tips: `Take ownership without blaming others. Focus on root-cause analysis, post-mortem blameless culture, and the preventive automated safeguards you established afterward.`,
      },
      {
        question: `Why ${company}, and what makes you excited about this specific ${role} opportunity?`,
        tips: `Connect your personal engineering ethos to ${company}'s actual product and mission. Mention specific recent developments, engineering culture, or market opportunities you admire.`,
      },
    ];

    const technicalQuestions = isEng
      ? [
          {
            question: `How would you architect a high-traffic feature for ${company} to ensure low latency and high availability?`,
            keyPoints: [
              "Caching strategies (Redis, CDN caching, edge rendering)",
              "Database indexing, query optimization, and connection pooling",
              "Graceful error boundaries and resilient fallbacks",
            ],
          },
          {
            question: `What are your strategies for maintaining state consistency, data fetching, and bundle size in modern web applications?`,
            keyPoints: [
              "Server Components vs Client Components boundary design",
              "Optimistic updates and cache invalidation",
              "Code-splitting, tree shaking, and dynamic imports",
            ],
          },
          {
            question: `How do you approach automated testing and continuous deployment without slowing down team velocity?`,
            keyPoints: [
              "Testing pyramid: Unit tests for critical business logic, integration tests for API flows",
              "End-to-end smoke tests for high-impact conversion funnels",
              "Feature flags and staged canary rollouts",
            ],
          },
          {
            question: `Explain how you diagnose and remediate a sudden memory leak or CPU spike in a production environment.`,
            keyPoints: [
              "Profiling heap snapshots and CPU flamegraphs",
              "Examining unclosed event listeners, connection leaks, or unbounded caches",
              "Adding telemetry and APM metrics (OpenTelemetry, Datadog)",
            ],
          },
          {
            question: `How do you ensure accessibility, security best practices, and cross-browser resilience in client-facing applications?`,
            keyPoints: [
              "Semantic HTML, ARIA standards, and keyboard navigation testing",
              "Defenses against XSS, CSRF, and injection vulnerabilities",
              "Strict CSP headers and dependency audit checks",
            ],
          },
        ]
      : [
          {
            question: `How do you validate problem statements and gather quantitative vs qualitative insights before designing solutions?`,
            keyPoints: [
              "User interview synthesis and journey mapping",
              "Analyzing telemetry funnels and drop-off metrics",
              "Prototyping fast iterations for stakeholder feedback",
            ],
          },
          {
            question: `How do you balance rapid delivery deadlines against high craftsmanship and design system standards?`,
            keyPoints: [
              "Reusing design tokens and standardized component libraries",
              "Collaborating early with engineers on feasibility and scope",
              "Establishing clear phase 1 vs phase 2 iterations",
            ],
          },
          {
            question: `Describe how you align cross-functional stakeholders when opinions diverge on a feature direction.`,
            keyPoints: [
              "Framing discussions around user pain points and core business KPIs",
              "Running A/B experiments to let real user behaviors settle debates",
              "Transparent documentation and retrospective reviews",
            ],
          },
          {
            question: `How do you ensure end-to-end consistency across web, mobile, and edge touchpoints?`,
            keyPoints: [
              "Single source of truth design system and governance",
              "Responsive layout fluid scales and accessibility guidelines",
              "Regular cross-platform usability audits",
            ],
          },
          {
            question: `What metrics do you track after launch to assess whether your solution was successful?`,
            keyPoints: [
              "Adoption rate, task completion time, and CSAT / NPS feedback",
              "Retention and downstream business conversion metrics",
              "Qualitative friction logs and customer support ticket trends",
            ],
          },
        ];

    const smartQuestionsToAsk = [
      `"What does success look like for this ${role} in the first 90 days, and what are the most immediate technical priorities?"`,
      `"How does the team balance shipping new features with technical debt and architectural improvements at ${company}?"`,
      `"Can you tell me about the team's typical sprint rhythm, code review culture, and how decisions are made when deadlines are tight?"`,
      `"What is a recent engineering or product challenge the team faced at ${company}, and what surprised you about the outcome?"`,
    ];

    const guide: PrepGuide = {
      roleOverview: `For a ${level} ${role} role at ${company}, interviewers prioritize strong foundational execution, structured communication, and the ability to operate autonomously. Demonstrating clear tradeoff analysis and cross-functional empathy will set you apart from other candidates.`,
      behavioralQuestions,
      technicalQuestions,
      smartQuestionsToAsk,
    };

    return NextResponse.json({
      company,
      role,
      level,
      guide,
    });
  } catch (error) {
    console.error("INTERVIEW PREP ERROR:", error);
    return NextResponse.json(
      { error: "Could not generate interview prep guide." },
      { status: 500 }
    );
  }
}
