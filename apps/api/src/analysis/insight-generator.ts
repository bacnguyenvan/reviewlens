import type { Review, ReviewInsight, ReviewInsightCategory, ReviewInsightSeverity } from "@reviewlens/shared";
import { TfIdfAnalyzer } from "./tf-idf-analyzer.js";

// ── Category keyword sets ─────────────────────────────────────────────────────

const COMPLAINT_KEYWORDS = new Set([
  "crash", "crashes", "crashed", "crashing",
  "freeze", "frozen", "freezing", "froze",
  "slow", "lag", "laggy", "lagging",
  "broken", "error", "errors", "bug", "bugs", "buggy",
  "fix", "fixes", "fixed",
  "terrible", "awful", "horrible", "worst", "horrible",
  "annoying", "frustrated", "frustrating", "disappointed", "disappointing",
  "fails", "fail", "failed", "failure",
  "issue", "issues", "problem", "problems",
  "stopped", "stopping", "keeps", "keeps",
  "battery", "drain", "draining",
  "login", "signin", "logout", "password", "account", "auth",
  "payment", "charge", "charged", "billing", "subscription", "refund",
  "ads", "advertisement", "advertisements", "popup", "popups",
  "lost", "lose", "losing", "missing",
  "data", "deleted", "delete",
  "impossible", "useless", "waste", "scam",
  "uninstall", "uninstalling",
]);

const FEATURE_REQUEST_KEYWORDS = new Set([
  "please", "wish", "want", "need", "request",
  "feature", "option", "support", "allow", "enable",
  "suggestion", "suggest", "improvement", "improve",
  "hope", "hoping", "implement",
  "add", "include", "consider",
  "dark", "mode", "theme", "widget",
  "notification", "notifications",
  "offline", "download", "backup", "sync",
  "custom", "customize", "customizable",
  "would", "could", "should",
]);

const POSITIVE_KEYWORDS = new Set([
  "great", "amazing", "awesome", "excellent", "best",
  "perfect", "wonderful", "fantastic", "superb", "outstanding",
  "helpful", "smooth", "easy", "fast", "clean", "simple",
  "beautiful", "nice", "enjoy", "fun", "brilliant",
  "recommend", "recommended",
]);

// ── Severity keyword sets ─────────────────────────────────────────────────────

const HIGH_SEVERITY_KEYWORDS = new Set([
  "crash", "crashes", "crashed", "crashing",
  "freeze", "frozen", "freezing",
  "payment", "charge", "charged", "billing", "refund",
  "login", "signin", "password", "account",
  "security", "data", "lost", "deleted",
  "broken", "unusable", "impossible", "scam",
]);

const MEDIUM_SEVERITY_KEYWORDS = new Set([
  "slow", "lag", "laggy", "performance",
  "battery", "drain",
  "bug", "bugs", "error", "errors",
  "ads", "advertisement",
  "freeze", "freezing",
  "issue", "issues", "problem", "problems",
  "fails", "stopped",
]);

// ── Title templates ───────────────────────────────────────────────────────────

interface TitleTemplate {
  readonly keywords: readonly string[];
  readonly category: ReviewInsightCategory | null;
  readonly title: string;
}

const TITLE_TEMPLATES: readonly TitleTemplate[] = [
  { keywords: ["crash", "crashes", "crashing", "crashed"], category: null, title: "App Crashes" },
  { keywords: ["freeze", "frozen", "freezing", "froze"], category: null, title: "App Freezing" },
  { keywords: ["battery", "drain", "draining"], category: null, title: "Battery Drain" },
  { keywords: ["slow", "lag", "laggy", "performance"], category: null, title: "Performance Issues" },
  { keywords: ["login", "signin", "password", "auth", "account"], category: null, title: "Login / Auth Problems" },
  { keywords: ["payment", "charge", "billing", "subscription", "refund"], category: null, title: "Payment Issues" },
  { keywords: ["ads", "advertisement", "popup"], category: null, title: "Intrusive Ads" },
  { keywords: ["dark", "mode", "theme"], category: "feature_request", title: "Dark Mode Request" },
  { keywords: ["notification", "notifications", "notify"], category: null, title: "Notification Issues" },
  { keywords: ["offline", "internet", "connection", "network"], category: null, title: "Offline / Connectivity Issues" },
  { keywords: ["download", "upload", "sync", "backup"], category: null, title: "Download / Sync Issues" },
  { keywords: ["storage", "space", "memory"], category: null, title: "Storage Issues" },
  { keywords: ["widget"], category: null, title: "Widget Issues" },
  { keywords: ["audio", "sound", "music"], category: null, title: "Audio Issues" },
  { keywords: ["video", "stream", "playback", "streaming"], category: null, title: "Video Playback Issues" },
  { keywords: ["camera"], category: null, title: "Camera Issues" },
  { keywords: ["search"], category: null, title: "Search Issues" },
  { keywords: ["location", "gps", "maps", "map"], category: null, title: "Location / GPS Issues" },
  { keywords: ["great", "love", "amazing", "awesome", "excellent", "wonderful"], category: "positive", title: "Positive User Experience" },
  { keywords: ["easy", "simple", "intuitive", "clean"], category: "positive", title: "Ease of Use Praised" },
  { keywords: ["fast", "smooth", "responsive", "quick"], category: "positive", title: "Performance Praised" },
  { keywords: ["helpful", "useful", "powerful"], category: "positive", title: "Useful Features Praised" },
];

// ── Suggested action templates ────────────────────────────────────────────────

interface ActionTemplate {
  readonly keywords: readonly string[];
  readonly action: string;
}

const ACTION_TEMPLATES: readonly ActionTemplate[] = [
  {
    keywords: ["crash", "crashes", "crashing"],
    action: "Review crash logs and stack traces to identify the most common crash paths. Prioritise fixes for crashes that affect the core user flow.",
  },
  {
    keywords: ["freeze", "frozen", "freezing"],
    action: "Profile the app for blocking operations on the main thread. Check for deadlocks and long-running synchronous tasks causing UI freezes.",
  },
  {
    keywords: ["battery", "drain"],
    action: "Audit background processes, wake locks, and location polling. Use platform profiling tools to identify the top battery consumers.",
  },
  {
    keywords: ["slow", "lag", "performance"],
    action: "Profile the app for performance bottlenecks. Focus on startup time, screen transitions, and data-loading operations.",
  },
  {
    keywords: ["login", "signin", "password", "auth", "account"],
    action: "Investigate authentication flows and session persistence. Check for token expiry edge cases, re-authentication loops, and account recovery paths.",
  },
  {
    keywords: ["payment", "charge", "billing", "subscription", "refund"],
    action: "Audit the payment and subscription flow end-to-end. Verify billing integration, receipt validation, and subscription-status syncing.",
  },
  {
    keywords: ["ads", "advertisement", "popup"],
    action: "Review ad frequency and placement. Ensure ads are not blocking core functionality or appearing too frequently — consider a less intrusive ad strategy.",
  },
  {
    keywords: ["dark", "mode", "theme"],
    action: "Evaluate dark mode implementation effort. This is a high-demand feature — assess platform support and prioritise based on mention frequency.",
  },
  {
    keywords: ["notification"],
    action: "Review notification delivery and settings. Ensure notifications respect user preferences and are sent at appropriate frequency and timing.",
  },
  {
    keywords: ["offline", "connection", "network"],
    action: "Improve offline support and graceful error handling for network failures. Cache critical content to reduce dependency on a live connection.",
  },
];

// ── InsightGenerator ─────────────────────────────────────────────────────────

export class InsightGenerator {
  private readonly tfidf = new TfIdfAnalyzer();

  generate(
    reviews: Review[],
    clusters: number[][],
    preprocessed: string[][],
    vectors: Map<string, number>[]
  ): ReviewInsight[] {
    const insights: ReviewInsight[] = [];

    for (const cluster of clusters) {
      const clusterReviews = cluster.map((i) => reviews[i]);
      const clusterVectors = cluster.map((i) => vectors[i]);
      const clusterTokens = cluster.map((i) => preprocessed[i]);

      // Top keywords for this cluster (by combined TF-IDF weight)
      // May be empty for non-English reviews (ASCII preprocessor strips them)
      const keywords = this.tfidf.topTerms(clusterVectors, 8);

      // Category is always detectable via rating even when no text tokens exist
      const category = detectCategory(clusterReviews, clusterTokens);
      const severity = calculateSeverity(clusterReviews, keywords, category);
      const title = keywords.length > 0
        ? generateTitle(keywords, category)
        : ratingBasedTitle(category);
      const summary = generateSummary(clusterReviews, keywords, category);
      const suggestedAction = generateSuggestedAction(keywords, category);
      const examples = pickExamples(clusterReviews);

      insights.push({
        title,
        category,
        severity,
        mentions: clusterReviews.length,
        summary,
        examples,
        keywords: keywords.slice(0, 6),
        suggestedAction,
      });
    }

    return insights;
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function detectCategory(
  reviews: Review[],
  tokenGroups: string[][]
): ReviewInsightCategory {
  let complaintScore = 0;
  let featureScore = 0;
  let positiveScore = 0;

  for (const tokens of tokenGroups) {
    for (const t of tokens) {
      if (COMPLAINT_KEYWORDS.has(t)) complaintScore++;
      if (FEATURE_REQUEST_KEYWORDS.has(t)) featureScore++;
      if (POSITIVE_KEYWORDS.has(t)) positiveScore++;
    }
  }

  // Rating acts as a prior: low ratings reinforce complaint, high ratings reinforce positive
  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  if (avgRating <= 2.5) complaintScore += 3;
  else if (avgRating >= 4.0) positiveScore += 2;

  // Feature request needs an explicit signal and shouldn't be over-shadowed by complaints
  if (featureScore > complaintScore && featureScore > positiveScore) {
    return "feature_request";
  }
  if (positiveScore > complaintScore) return "positive";
  return "complaint";
}

function calculateSeverity(
  reviews: Review[],
  keywords: string[],
  category: ReviewInsightCategory
): ReviewInsightSeverity {
  const mentions = reviews.length;

  if (category === "feature_request") {
    if (mentions >= 10) return "high";
    if (mentions >= 5) return "medium";
    return "low";
  }

  if (category === "positive") {
    return "low";
  }

  // Complaints: check for high-severity keywords first
  if (keywords.some((kw) => HIGH_SEVERITY_KEYWORDS.has(kw))) return "high";

  // Very low average rating + multiple mentions → escalate
  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  if (avgRating < 1.5 && mentions >= 3) return "high";

  // Medium severity
  if (keywords.some((kw) => MEDIUM_SEVERITY_KEYWORDS.has(kw))) return "medium";
  if (mentions >= 5) return "medium";

  return "low";
}

function generateTitle(
  keywords: string[],
  category: ReviewInsightCategory
): string {
  const kwSet = new Set(keywords);

  for (const template of TITLE_TEMPLATES) {
    if (template.category !== null && template.category !== category) continue;
    if (template.keywords.some((kw) => kwSet.has(kw))) {
      return template.title;
    }
  }

  // Fallback: capitalise the top 2 keywords
  const top = keywords.slice(0, 2).map(capitalise).join(" ");
  const suffix =
    category === "positive"
      ? "Feedback"
      : category === "feature_request"
        ? "Request"
        : "Issues";
  return `${top} ${suffix}`;
}

function generateSummary(
  reviews: Review[],
  keywords: string[],
  category: ReviewInsightCategory
): string {
  const count = reviews.length;
  const topKw = keywords.slice(0, 3).join(", ");
  const avgRating = (
    reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  ).toFixed(1);

  const kwPhrase = topKw.length > 0 ? `Common themes include: ${topKw}. ` : "";

  if (category === "positive") {
    return (
      `${count} ${count === 1 ? "user" : "users"} expressed positive feedback, ` +
      `with an average rating of ${avgRating}/5. ` +
      kwPhrase +
      `This highlights what users appreciate most about the app.`
    );
  }

  if (category === "feature_request") {
    const related = topKw.length > 0 ? ` related to: ${topKw}` : "";
    return (
      `${count} ${count === 1 ? "user" : "users"} ` +
      `${count === 1 ? "is" : "are"} requesting a feature or improvement${related}. ` +
      `This represents recurring user demand that may warrant prioritisation on the product roadmap.`
    );
  }

  const related = topKw.length > 0 ? ` related to: ${topKw}` : "";
  return (
    `${count} ${count === 1 ? "user" : "users"} reported problems${related}. ` +
    `The average rating among affected reviews is ${avgRating}/5. ` +
    `This is a recurring issue that impacts user satisfaction and app store performance.`
  );
}

function generateSuggestedAction(
  keywords: string[],
  category: ReviewInsightCategory
): string {
  const kwSet = new Set(keywords);

  for (const template of ACTION_TEMPLATES) {
    if (template.keywords.some((kw) => kwSet.has(kw))) {
      return template.action;
    }
  }

  if (category === "feature_request") {
    return "Evaluate this feature request against the product roadmap. Consider adding it to the backlog and scoring it against user demand and implementation effort.";
  }

  if (category === "positive") {
    return "This aspect is resonating well with users — maintain the quality and use it as a reference benchmark for other areas of the app.";
  }

  return "Investigate the reported issue by reviewing relevant logs and user feedback. Prioritise a fix based on the frequency of mentions and overall user impact.";
}

function pickExamples(reviews: Review[], maxCount = 3): string[] {
  // Prefer reviews that are representative in length (not too short, not too long)
  const scored = reviews.map((r) => {
    const len = r.content.length;
    // Ideal range: 40–250 chars
    const score = len >= 40 && len <= 250 ? 0 : len < 40 ? 1 : 2;
    return { review: r, score };
  });

  scored.sort((a, b) => a.score - b.score);

  return scored.slice(0, maxCount).map((s) => s.review.content);
}

function capitalise(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Fallback title when no text tokens are available (e.g. non-English reviews).
 * Category is derived from star rating, so a title can still be generated.
 */
function ratingBasedTitle(category: ReviewInsightCategory): string {
  switch (category) {
    case "complaint": return "User Complaints";
    case "feature_request": return "Feature Requests";
    case "positive": return "Positive Feedback";
  }
}
