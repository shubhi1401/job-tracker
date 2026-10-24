import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const COMMON_SKILLS = [
  "TypeScript",
  "JavaScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "PostgreSQL",
  "SQL",
  "MongoDB",
  "Docker",
  "AWS",
  "Tailwind CSS",
  "REST API",
  "GraphQL",
  "Git",
  "CI/CD",
  "Agile",
  "Unit Testing",
  "System Design",
];

function extractMatchingSkills(text: string): string[] {
  const lower = text.toLowerCase();
  return COMMON_SKILLS.filter((skill) =>
    lower.includes(skill.toLowerCase())
  );
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const company = String(body.company || "").trim();
    const role = String(body.role || "").trim();
    const jobDescription = String(body.jobDescription || "").trim();
    const resumeText = String(body.resumeText || "").trim();
    const tone = String(body.tone || "confident").toLowerCase();
    const applicantName = String(body.applicantName || user.name || "Candidate").trim();

    if (!company || !role) {
      return NextResponse.json(
        { error: "Company name and Job role are required." },
        { status: 400 }
      );
    }

    // Extract skills from resume and job description
    const resumeSkills = extractMatchingSkills(resumeText);
    const jobSkills = extractMatchingSkills(jobDescription);
    const overlappingSkills = jobSkills.filter((s) => resumeSkills.includes(s));

    const highlightedSkills = (
      overlappingSkills.length > 0 ? overlappingSkills : resumeSkills
    ).slice(0, 4);

    const skillsPhrase =
      highlightedSkills.length > 0
        ? highlightedSkills.join(", ")
        : "full-stack development, collaborative problem solving, and modern engineering practices";

    // Build letter paragraphs based on tone
    let openingHook = "";
    let bodyP1 = "";
    let bodyP2 = "";
    let closing = "";

    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    if (tone === "enthusiastic") {
      openingHook = `I was thrilled to come across the ${role} opening at ${company}. Having followed ${company}'s ongoing work and industry presence, I am genuinely excited by the prospect of bringing my technical expertise and problem-solving drive to your team.`;
      bodyP1 = `Throughout my work in software development, I have developed a strong foundation in ${skillsPhrase}. I take pride in taking complex technical requirements and transforming them into scalable, high-impact features that deliver real value to users. My background has prepared me to hit the ground running and actively contribute to ${company}'s ambitious roadmap.`;
      bodyP2 = `What excites me most about ${company} is the opportunity to solve challenging problems alongside a dedicated, forward-thinking team. Whether optimizing core workflows or collaborating cross-functionally, I bring high energy, clear communication, and an eagerness to continuously raise the technical bar.`;
      closing = `I would welcome the opportunity to discuss how my enthusiasm and skill set align with ${company}'s vision. Thank you for your time and consideration—I look forward to hearing from you!`;
    } else if (tone === "concise") {
      openingHook = `I am writing to express my interest in the ${role} position at ${company}. With proven hands-on experience in ${skillsPhrase}, I am confident in my ability to deliver immediate value to your engineering team.`;
      bodyP1 = `My background centers on building reliable, maintainable software and shipping features with a strong focus on performance and usability. In my recent work, I have focused on translating product requirements into clean architectures, leveraging modern engineering standards to reduce turnaround time and maintain code quality.`;
      bodyP2 = `I admire ${company}'s high standard of execution. I am excited to apply my experience in ${highlightedSkills.slice(0, 2).join(" and ") || "software engineering"} to accelerate your goals and help your team scale effectively.`;
      closing = `I look forward to discussing how my experience can contribute to ${company}'s upcoming milestones. Thank you for your time and consideration.`;
    } else {
      // Confident & Professional (Default)
      openingHook = `I am writing to apply for the ${role} position at ${company}. With a track record of delivering impactful solutions and a solid technical foundation in ${skillsPhrase}, I am eager to contribute to ${company}'s continued success.`;
      bodyP1 = `Throughout my career, I have focused on engineering resilient, scalable applications that balance user needs with engineering excellence. My experience working with ${skillsPhrase} has equipped me to diagnose technical challenges rapidly, collaborate smoothly across product teams, and execute initiatives from concept to deployment.`;
      bodyP2 = `What distinguishes ${company} is your commitment to delivering thoughtful, industry-leading solutions. I am energized by the opportunity to bring my analytical mindset, cross-functional collaboration, and technical proficiency to your team to help drive measurable outcomes.`;
      closing = `I welcome the opportunity to speak with your hiring team to discuss how my background and qualifications can support ${company}'s immediate priorities. Thank you for your consideration.`;
    }

    const coverLetter = [
      `${applicantName}`,
      `${user.email}`,
      `${dateStr}`,
      "",
      `Hiring Team`,
      `${company}`,
      "",
      `Dear Hiring Team at ${company},`,
      "",
      openingHook,
      "",
      bodyP1,
      "",
      bodyP2,
      "",
      closing,
      "",
      `Sincerely,`,
      `${applicantName}`,
    ].join("\n");

    return NextResponse.json({
      coverLetter,
      highlightedSkills,
      tone,
    });
  } catch (error) {
    console.error("GENERATE COVER LETTER ERROR:", error);
    return NextResponse.json(
      { error: "Could not generate cover letter. Please try again." },
      { status: 500 }
    );
  }
}
