import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      company,
      role,
      baseSalary,
      bonusPercent = 0,
      stockPerYear = 0,
      signOnBonus = 0,
      targetBase,
      competingOffer,
      priority = "BASE_SALARY",
      tone = "COLLABORATIVE",
    } = body;

    if (!company || !role || !baseSalary) {
      return NextResponse.json(
        { error: "Company, role, and current base salary are required." },
        { status: 400 }
      );
    }

    const currentBase = Number(baseSalary) || 0;
    const currentBonus = Math.round(currentBase * ((Number(bonusPercent) || 0) / 100));
    const currentStock = Number(stockPerYear) || 0;
    const currentSignOn = Number(signOnBonus) || 0;
    const currentFirstYearTC = currentBase + currentBonus + currentStock + currentSignOn;

    // Calculate smart counter targets
    const suggestedBaseIncrease = Math.round(currentBase * 0.10); // 10% target increase
    const recommendedBase = targetBase
      ? Number(targetBase)
      : Math.round((currentBase + suggestedBaseIncrease) / 1000) * 1000;

    const recommendedSignOn =
      currentSignOn > 0
        ? Math.round((currentSignOn * 1.5) / 1000) * 1000
        : Math.round((currentBase * 0.08) / 1000) * 1000;

    const recommendedEquity =
      currentStock > 0
        ? Math.round((currentStock * 1.2) / 1000) * 1000
        : Math.round((currentBase * 0.15) / 1000) * 1000;

    const candidateName = user.name || "[Your Name]";

    // Format currency helper
    const fmt = (n: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(n);

    // Build customized email
    let emailSubject = `Regarding the ${role} Offer - ${candidateName}`;
    let opening = "";
    let bodyArgument = "";
    let closing = "";

    if (tone === "CONFIDENT") {
      opening = `Thank you so much for extending the offer to join ${company} as a ${role}. I have thoroughly enjoyed meeting the team, and I am very energized by the technical impact I can drive here.`;
    } else if (tone === "EXCITED") {
      opening = `I was thrilled to receive the offer for the ${role} position at ${company}! The team's vision and technical roadmap are incredible, and ${company} remains my top choice.`;
    } else {
      // COLLABORATIVE
      opening = `Thank you very much for putting this offer together for the ${role} position. I am genuinely excited about the opportunity to partner with the team at ${company} and contribute to your upcoming initiatives.`;
    }

    if (competingOffer && competingOffer.trim()) {
      bodyArgument = `To be transparent, I am currently evaluating another compelling opportunity that offers ${competingOffer.trim()}. However, because of ${company}'s culture, team quality, and technical challenges, ${company} is where I would prefer to build my career long-term.\n\nIf we are able to adjust the base compensation to ${fmt(
        recommendedBase
      )}${
        priority === "SIGN_ON"
          ? ` and include a sign-on bonus of ${fmt(recommendedSignOn)}`
          : priority === "EQUITY"
          ? ` or increase the annual equity grant to ${fmt(recommendedEquity)}`
          : ""
      }, I would be ready to accept immediately and withdraw from other processes.`;
    } else {
      if (priority === "BASE_SALARY") {
        bodyArgument = `After carefully reviewing the full package and comparing against current market benchmarks for this seniority level, I would like to explore if there is flexibility around the base salary. Based on my track record and the immediate value I will bring, I was targeting a base salary closer to ${fmt(
          recommendedBase
        )}. If we can reach this number, I will gladly accept and sign.`;
      } else if (priority === "SIGN_ON") {
        bodyArgument = `I appreciate the overall package structure. Understanding that base salary bands can have strict constraints, would ${company} be open to bridging the gap through a one-time sign-on bonus of ${fmt(
          recommendedSignOn
        )}? This would make the decision effortless for me and allow me to commit right away.`;
      } else if (priority === "EQUITY") {
        bodyArgument = `I believe deeply in ${company}'s long-term trajectory and would love my compensation to be directly tied to the company's shared success. Would there be room to increase the annualized equity allocation to approximately ${fmt(
          recommendedEquity
        )}? That would align with my expectations and allow me to immediately accept.`;
      } else {
        bodyArgument = `I appreciate the offer and would love to discuss a few elements to ensure our expectations are aligned. Based on my qualifications and market research, I would love to explore if we can adjust the base to ${fmt(
          recommendedBase
        )} alongside remote work flexibility.`;
      }
    }

    closing = `I am very enthusiastic about this partnership and hope we can find a mutually exciting resolution. Please let me know if you would like to schedule a brief call or if this can be reviewed with the hiring team.\n\nWarm regards,\n${candidateName}`;

    const emailBody = `${opening}\n\n${bodyArgument}\n\n${closing}`;

    // Strategic talking points for phone calls
    const strategicPointers = [
      `Always anchor high: Start your request at ${fmt(
        recommendedBase
      )} so that any compromise lands cleanly above your minimum reserve.`,
      priority === "SIGN_ON"
        ? `Recruiters have the most discretionary leeway with one-time Sign-On Bonuses compared to strict annual base salary bands.`
        : `If base salary is strictly capped by HR bands, pivot immediately to Sign-on bonus (${fmt(
            recommendedSignOn
          )}) or accelerated equity vesting.`,
      `Deliver verbal enthusiasm first: Always begin the conversation by expressing genuine excitement for the role before pivoting to the numbers.`,
      `Offer immediate closing leverage: State explicitly that if they can meet ${fmt(
        recommendedBase
      )}, you will sign today and cancel all other interview loops.`,
    ];

    const phoneScript = `Recruiter: "Hi ${candidateName}, did you have a chance to review the offer?"\n\nYou: "Yes! First of all, thank you so much. I was genuinely thrilled to receive it, and meeting the team confirmed that ${company} is where I want to be. I reviewed the full breakdown, and I wanted to discuss if there is any flexibility around the base salary. Given the responsibilities and market benchmarks, I was hoping to land closer to ${fmt(
      recommendedBase
    )}. If we can make that work, I would be ready to sign today."\n\nIf recruiter says base is locked: "I completely understand internal salary bands. Could we bridge that difference with a ${fmt(
      recommendedSignOn
    )} sign-on bonus or additional equity? That would make this an easy yes for me."`;

    return NextResponse.json({
      recommendedBase,
      recommendedSignOn,
      recommendedEquity,
      currentFirstYearTC,
      emailSubject,
      emailBody,
      strategicPointers,
      phoneScript,
    });
  } catch (error) {
    console.error("NEGOTIATION GENERATE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to generate negotiation strategy." },
      { status: 500 }
    );
  }
}
