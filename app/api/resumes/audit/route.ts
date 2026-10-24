import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const STRONG_VERBS = [
  "architected",
  "spearheaded",
  "engineered",
  "optimized",
  "transformed",
  "automated",
  "deployed",
  "implemented",
  "accelerated",
  "designed",
  "scale",
  "scaled",
  "developed",
  "launched",
  "mentored",
  "refactored",
  "standardized",
  "orchestrated",
  "streamlined",
];

const WEAK_PHRASES = [
  "responsible for",
  "worked on",
  "helped with",
  "assisted in",
  "duties included",
  "tasked with",
  "participated in",
];

const SECTIONS = [
  { name: "Experience / Work History", pattern: /experience|employment|work\s+history/i },
  { name: "Education", pattern: /education|degree|university|college|bachelor|master/i },
  { name: "Technical Skills", pattern: /skills|technologies|proficiencies|tech\s+stack/i },
  { name: "Projects", pattern: /projects|portfolio/i },
  { name: "Contact & Links", pattern: /github|linkedin|portfolio|email|phone|@/i },
];

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const text = String(body.text || "").trim();

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: "Resume text is too short for analysis." },
        { status: 400 }
      );
    }

    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // 1. Section Completeness Check
    const detectedSections = SECTIONS.filter((sec) => sec.pattern.test(text)).map(
      (sec) => sec.name
    );
    const missingSections = SECTIONS.filter(
      (sec) => !sec.pattern.test(text)
    ).map((sec) => sec.name);

    // 2. Strong Verbs Check
    const lowerText = text.toLowerCase();
    const foundStrongVerbs = STRONG_VERBS.filter((verb) =>
      new RegExp(`\\b${verb}\\b`, "i").test(lowerText)
    );

    const foundWeakPhrases = WEAK_PHRASES.filter((phrase) =>
      lowerText.includes(phrase)
    );

    // 3. Quantification Check (numbers, %, $, x times)
    const metricMatches = text.match(/\b\d+([.,]\d+)?%?|\$\d+|\b\d+x\b/g) || [];
    const metricCount = metricMatches.length;

    // 4. Calculate Score (0 - 100)
    let score = 50;

    // Section completeness (up to +25)
    score += Math.round((detectedSections.length / SECTIONS.length) * 25);

    // Word count sanity (between 400 and 1000 words is ideal)
    if (wordCount >= 400 && wordCount <= 900) {
      score += 15;
    } else if (wordCount >= 250) {
      score += 8;
    }

    // Strong verbs (up to +15)
    score += Math.min(15, foundStrongVerbs.length * 3);

    // Metrics & quantification (up to +15)
    score += Math.min(15, metricCount * 2);

    // Penalty for weak phrases
    score -= foundWeakPhrases.length * 4;

    score = Math.max(20, Math.min(98, score));

    // 5. Actionable Suggestions
    const recommendations: string[] = [];

    if (missingSections.length > 0) {
      recommendations.push(
        `Add missing standard sections: ${missingSections.join(", ")} to improve ATS parsing compatibility.`
      );
    }

    if (metricCount < 4) {
      recommendations.push(
        `Quantify your accomplishments. Use numbers, % improvements, and scale (e.g. "reduced latency by 35%" or "supported 10k+ daily users").`
      );
    }

    if (foundWeakPhrases.length > 0) {
      recommendations.push(
        `Replace passive phrasing (${foundWeakPhrases.map((w) => `"${w}"`).join(", ")}) with strong impact verbs like "Architected", "Engineered", or "Spearheaded".`
      );
    }

    if (wordCount < 400) {
      recommendations.push(
        `Your resume may be too brief (${wordCount} words). Elaborate on technical challenges, trade-offs, and project responsibilities.`
      );
    } else if (wordCount > 1000) {
      recommendations.push(
        `Your resume is relatively long (${wordCount} words). Consider condensing bullet points to focus on your most relevant high-signal work.`
      );
    }

    if (foundStrongVerbs.length < 5) {
      recommendations.push(
        `Incorporate more decisive engineering action verbs at the start of each bullet point.`
      );
    }

    return NextResponse.json({
      score,
      wordCount,
      detectedSections,
      missingSections,
      foundStrongVerbs,
      foundWeakPhrases,
      metricCount,
      recommendations,
    });
  } catch (error) {
    console.error("RESUME AUDIT ERROR:", error);
    return NextResponse.json(
      { error: "Could not audit resume." },
      { status: 500 }
    );
  }
}
