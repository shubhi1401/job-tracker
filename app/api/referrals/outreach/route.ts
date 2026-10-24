import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export type OutreachType =
  | "LINKEDIN_NOTE"
  | "COFFEE_CHAT"
  | "RECRUITER_PITCH"
  | "FOLLOW_UP";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      contactName,
      company,
      contactRole,
      relationship = "Alumni",
      targetRole = "Software Engineer",
      outreachType = "LINKEDIN_NOTE",
      tone = "FRIENDLY_PROFESSIONAL",
    } = body;

    if (!contactName || !company) {
      return NextResponse.json(
        { error: "Contact name and company are required." },
        { status: 400 }
      );
    }

    const firstName = contactName.split(" ")[0];
    const candidateName = user.name || "A fellow engineer";

    let subject = "";
    let message = "";
    const tips: string[] = [];

    switch (outreachType as OutreachType) {
      case "LINKEDIN_NOTE": {
        // Must stay strictly under 300 characters
        if (relationship.toLowerCase().includes("alumni")) {
          message = `Hi ${firstName}, I'm a fellow alum interested in ${company}'s work in tech. I'd love to connect and follow your journey as a ${contactRole}! - ${candidateName}`;
        } else if (relationship.toLowerCase().includes("recruiter")) {
          message = `Hi ${firstName}, saw you recruit for ${company}. I'm a ${targetRole} with hands-on experience in full-stack systems and would love to connect for future engineering openings!`;
        } else {
          message = `Hi ${firstName}, came across your profile and was impressed by your work as a ${contactRole} at ${company}. Would love to connect and follow your team's technical updates!`;
        }

        // Guarantee under 300 characters
        if (message.length > 295) {
          message = message.slice(0, 290) + "...";
        }

        subject = `LinkedIn Connection Request - ${candidateName}`;
        tips.push("LinkedIn connection notes have a strict 300-character limit.");
        tips.push("Never ask for an internal referral in the connection note; establish contact first.");
        tips.push("Best sent between Tuesday and Thursday from 8:30 AM to 10:30 AM in their local timezone.");
        break;
      }

      case "COFFEE_CHAT": {
        subject = `Quick question from a fellow engineer / ${relationship} - ${company}`;
        message = `Hi ${firstName},\n\nI hope you're having a great week!\n\nI came across your profile while researching engineering initiatives at ${company}. As a ${targetRole} with a strong background in building scalable web applications, I've been really inspired by what ${company} is shipping.\n\nI would love to learn more about your experience as a ${contactRole} and what engineering culture is like at ${company}. Would you be open to a brief 10–15 minute virtual coffee chat sometime in the next week or two?\n\nCompletely understand if you're busy with sprint deliveries—either way, wishing you and the team continued success!\n\nBest regards,\n${candidateName}`;

        tips.push("Mentioning a specific time window (10–15 mins) drastically lowers the friction to agree.");
        tips.push("Giving an easy 'out' at the end makes you appear respectful of their time and senior.");
        break;
      }

      case "RECRUITER_PITCH": {
        subject = `Interest in ${targetRole} roles at ${company} - ${candidateName}`;
        message = `Hi ${firstName},\n\nI hope your week is off to a great start!\n\nI'm reaching out because I've been following ${company}'s technical growth and am deeply interested in joining the team as a ${targetRole}.\n\nRecently, I've been building full-stack distributed web applications, optimizing performance, and architecting modern systems. Given ${company}'s current roadmap, I wanted to check if you have active or upcoming headcount for engineers with my profile.\n\nI would love to share a brief overview of my recent work or hop on a short intro call if there's a match. Would you be open to a quick chat this week?\n\nThanks so much for your time,\n${candidateName}`;

        tips.push("Recruiters scan messages in under 10 seconds; the role title must be in the first 2 sentences.");
        tips.push("Focus on the value you bring to their upcoming roadmap rather than what you want from them.");
        break;
      }

      case "FOLLOW_UP": {
        subject = `Re: Following up regarding ${targetRole} at ${company}`;
        message = `Hi ${firstName},\n\nI hope you're having a productive week!\n\nI wanted to gently follow up on my previous note. I understand you have a packed schedule, so no rush at all.\n\nI'm still very excited about ${company} and would welcome the opportunity to connect for 10 minutes whenever your calendar allows.\n\nThanks again for your time and consideration,\n${candidateName}`;

        tips.push("Wait at least 4 to 6 business days before sending a first follow-up.");
        tips.push("Over 40% of positive networking responses occur on the first follow-up message!");
        break;
      }
    }

    return NextResponse.json({
      subject,
      message,
      characterCount: message.length,
      outreachType,
      tips,
    });
  } catch (error) {
    console.error("OUTREACH GENERATOR ERROR:", error);
    return NextResponse.json(
      { error: "Failed to generate outreach message." },
      { status: 500 }
    );
  }
}
