import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const KNOWN_SKILLS = [
  "TypeScript", "JavaScript", "React", "Next.js", "Node.js", "Python", "Go", "Golang",
  "Rust", "Java", "C++", "C#", ".NET", "Ruby", "Ruby on Rails", "PHP", "Laravel",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Prisma", "GraphQL",
  "REST", "gRPC", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform",
  "CI/CD", "GitHub Actions", "Tailwind CSS", "CSS", "HTML", "Redux", "Zustand",
  "Kafka", "RabbitMQ", "Microservices", "Distributed Systems", "SQL", "NoSQL",
  "FastAPI", "Django", "Flask", "Spring Boot", "Express", "NestJS", "Vue", "Angular",
  "Swift", "Kotlin", "React Native", "Flutter", "Machine Learning", "LLMs", "AI"
];

const ROLE_INDICATORS = [
  "engineer", "developer", "designer", "architect", "manager", "lead",
  "analyst", "scientist", "consultant", "specialist", "intern", "director",
  "administrator", "officer", "programmer", "technician", "strategist",
  "researcher", "associate", "sre", "swe", "sde", "devops"
];

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { jobText } = body;

    if (!jobText || typeof jobText !== "string" || jobText.trim().length < 10) {
      return NextResponse.json(
        { error: "Please paste a job description with at least 10 characters." },
        { status: 400 }
      );
    }

    const text = jobText.trim();
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => Boolean(l) && l.length > 0);

    let detectedRole = "";
    let detectedCompany = "";

    // 1. Check for combined patterns like "Senior Engineer at Google" or "Product Manager @ Stripe"
    for (const line of lines.slice(0, 5)) {
      const atMatch = line.match(/^([A-Za-z0-9\s\/\-&,()]+?)\s+(?:at|@)\s+([A-Za-z0-9\s&.,'-]+?)(?:\s*[-–|•·]|\s*$)/i);
      if (atMatch && atMatch[1] && atMatch[2]) {
        const potentialRole = atMatch[1].trim();
        const potentialCompany = atMatch[2].trim();
        if (ROLE_INDICATORS.some((ind) => potentialRole.toLowerCase().includes(ind))) {
          detectedRole = potentialRole;
          detectedCompany = potentialCompany;
          break;
        }
      }
    }

    // 2. Explicit Role Label: "Role: Software Engineer" or "Job Title: Staff Frontend"
    if (!detectedRole) {
      const explicitRoleRegex = /(?:Role|Position|Job Title|Title|Designation|Job Role|Opening)[:\s-—|]+([^\n\r,;|]+)/i;
      const roleMatch = text.match(explicitRoleRegex);
      if (roleMatch && roleMatch[1]) {
        detectedRole = roleMatch[1].trim();
      }
    }

    // 3. Sentence Action Pattern: "is looking for a / seeking / hiring [Role] to join..."
    if (!detectedRole) {
      const sentenceRegex = /(?:looking for|seeking|hiring|searching for)\s+(?:an?|the|our next)?\s*([A-Za-z0-9\s\/\-&]+?(?:Engineer|Developer|Designer|Architect|Manager|Lead|Analyst|Scientist|Specialist|Consultant|Intern|Director|Administrator|Officer|Programmer|Technician|Strategist|Researcher|Associate|SDE|SWE|DevOps))\b/i;
      const sentenceMatch = text.match(sentenceRegex);
      if (sentenceMatch && sentenceMatch[1]) {
        detectedRole = sentenceMatch[1].trim();
      }
    }

    // 4. Line-by-line inspection (top 8 lines) for standard job titles
    if (!detectedRole) {
      for (const line of lines.slice(0, 8)) {
        // Strip common prefixes
        const cleanLine = line.replace(/^(?:Job Summary|Job Description|About the Job|Overview|Hiring)[:\s-]*/i, "").trim();
        if (cleanLine.length >= 4 && cleanLine.length <= 80) {
          const lower = cleanLine.toLowerCase();
          const hasIndicator = ROLE_INDICATORS.some((ind) => {
            const wordRegex = new RegExp(`\\b${ind}\\b`, "i");
            return wordRegex.test(lower);
          });

          if (hasIndicator && !lower.includes("responsibilities") && !lower.includes("requirements")) {
            // Remove trailing company or location info if present
            detectedRole = cleanLine.replace(/\s+(?:at|@|in)\s+[A-Za-z0-9\s,.-]+$/i, "").trim();
            break;
          }
        }
      }
    }

    // Clean up detected role (remove trailing "to join", "who will", etc.)
    if (detectedRole) {
      detectedRole = detectedRole
        .replace(/\s+(?:to join|who will|for our|to help|to build|at\s.*)$/i, "")
        .replace(/^[•·\-\*]\s*/, "")
        .replace(/[,;]+$/, "")
        .trim();
    }

    // 5. Company Extraction (if not detected via "at / @" above)
    if (!detectedCompany) {
      const explicitCompanyRegex = /(?:Company|Organization|Employer)[:\s]+([A-Za-z0-9\s&.,'-]+)/i;
      const compMatch = text.match(explicitCompanyRegex);
      if (compMatch && compMatch[1]) {
        detectedCompany = compMatch[1].trim();
      }
    }

    if (!detectedCompany) {
      const companySentenceRegex = /(?:About|Join|At)\s+([A-Z][A-Za-z0-9&.,'-]+)(?:,\s*we|\s+is|\s+we're|\s+is looking|\s+teams|\s+helps)/;
      const compSentenceMatch = text.match(companySentenceRegex);
      if (compSentenceMatch && compSentenceMatch[1]) {
        detectedCompany = compSentenceMatch[1].trim();
      }
    }

    if (!detectedCompany) {
      const isLookingMatch = text.match(/([A-Z][A-Za-z0-9&.,'-]{2,30})\s+(?:is looking|is hiring|is seeking)/);
      if (isLookingMatch && isLookingMatch[1]) {
        detectedCompany = isLookingMatch[1].trim();
      }
    }

    // 6. Location & Work Model extraction
    let detectedLocation = "";
    let detectedWorkModel = "ONSITE";

    if (/remote/i.test(text)) {
      detectedWorkModel = "REMOTE";
      detectedLocation = "Remote";
      const remoteDetailMatch = text.match(/remote\s*\(([^)]+)\)/i);
      if (remoteDetailMatch) {
        detectedLocation = `Remote (${remoteDetailMatch[1].trim()})`;
      }
    } else if (/hybrid/i.test(text)) {
      detectedWorkModel = "HYBRID";
      detectedLocation = "Hybrid";
    }

    const explicitLocationRegex = /(?:Location|Based in|Work Location|Office)[:\s]+([^\n\r,;|]+(?:,\s*[A-Z]{2}|,\s*[A-Za-z]+)?)/i;
    const locMatch = text.match(explicitLocationRegex);
    if (locMatch && locMatch[1]) {
      const parsedLoc = locMatch[1].trim();
      detectedLocation = detectedLocation && !parsedLoc.toLowerCase().includes(detectedLocation.toLowerCase())
        ? `${parsedLoc} (${detectedLocation})`
        : parsedLoc;
    }

    if (!detectedLocation) {
      const cityStateMatch = text.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}\b)/);
      if (cityStateMatch) {
        detectedLocation = cityStateMatch[1].trim();
      } else {
        detectedLocation = "Remote / Unspecified";
      }
    }

    // 7. Salary extraction
    let detectedSalary = "";
    const salaryRegex = /(?:Salary|Compensation|Pay Range|Base Pay|Pay|Estimated)[:\s]*([$€£₹][0-9,kK\s\-\.\/]+(?:year|yr|hr|hour|annually|LPA)?|\$[0-9]{2,3}(?:,[0-9]{3})*(?:\s*-\s*\$[0-9]{2,3}(?:,[0-9]{3})*)?)/i;
    const salaryMatch = text.match(salaryRegex);
    if (salaryMatch && salaryMatch[1]) {
      detectedSalary = salaryMatch[1].trim();
    } else {
      const rawSalary = text.match(/[$€£₹][0-9]{2,3}(?:,[0-9]{3}|\s*k|\s*K)?\s*(?:-|to)\s*[$€£₹][0-9]{2,3}(?:,[0-9]{3}|\s*k|\s*K)?/);
      if (rawSalary) {
        detectedSalary = rawSalary[0].trim();
      }
    }

    // 8. Recruiter extraction
    let recruiterEmail = "";
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      recruiterEmail = emailMatch[0];
    }

    let recruiterName = "";
    const recruiterMatch = text.match(/(?:Recruiter|Hiring Manager|Contact|HR|Point of Contact)[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i);
    if (recruiterMatch && recruiterMatch[1]) {
      recruiterName = recruiterMatch[1];
    }

    // 9. Skill extraction
    const detectedSkills: string[] = [];
    const lowerText = text.toLowerCase();
    for (const skill of KNOWN_SKILLS) {
      const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (pattern.test(lowerText)) {
        detectedSkills.push(skill);
      }
    }

    // 10. Structured Notes extraction
    const keyResponsibilities: string[] = [];
    let isCollecting = false;
    for (const line of lines) {
      if (/responsibilities|what you'll do|what you will do|the role|about the job/i.test(line)) {
        isCollecting = true;
        continue;
      }
      if (isCollecting) {
        if (/requirements|qualifications|what you bring|who you are|benefits|compensation/i.test(line)) {
          isCollecting = false;
          break;
        }
        if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
          keyResponsibilities.push(line.replace(/^[•\-\*]\s*/, ""));
          if (keyResponsibilities.length >= 4) break;
        }
      }
    }

    let suggestedNotes = "";
    if (detectedSkills.length > 0) {
      suggestedNotes += `Key Skills: ${detectedSkills.slice(0, 10).join(", ")}\n\n`;
    }
    if (keyResponsibilities.length > 0) {
      suggestedNotes += "Key Responsibilities:\n" + keyResponsibilities.map((r) => `• ${r}`).join("\n");
    }

    return NextResponse.json({
      company: detectedCompany || "",
      role: detectedRole || "",
      location: detectedLocation || "",
      workModel: detectedWorkModel,
      salary: detectedSalary || "",
      recruiterName: recruiterName || "",
      recruiterEmail: recruiterEmail || "",
      skills: detectedSkills,
      suggestedNotes: suggestedNotes.trim(),
    });
  } catch (error) {
    console.error("PARSE JOB DESCRIPTION ERROR:", error);
    return NextResponse.json(
      { error: "Failed to parse job description." },
      { status: 500 }
    );
  }
}
