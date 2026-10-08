// ── Stop words ────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  // Articles / prepositions / conjunctions
  "a", "an", "the", "and", "or", "but", "nor", "so", "yet",
  "at", "by", "for", "from", "in", "into", "of", "off", "on",
  "onto", "out", "over", "to", "up", "with", "about", "above",
  "after", "before", "between", "during", "through", "under",
  "until", "against", "since", "as", "if", "then", "than",
  "because", "however", "although", "though", "while", "when",
  "where", "how", "why", "what", "which", "who", "whom",
  // Pronouns
  "i", "me", "my", "myself", "we", "our", "ours", "ourselves",
  "you", "your", "yours", "yourself", "he", "him", "his",
  "she", "her", "hers", "it", "its", "they", "them", "their",
  // Auxiliary verbs
  "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did",
  "will", "would", "could", "should", "may", "might",
  "can", "cannot", "shall", "need", "am",
  // Common verbs with low discriminative value
  "get", "got", "gets", "go", "goes", "went",
  "come", "came", "make", "made", "take", "took",
  "know", "think", "try", "tried",
  // Adverbs / quantifiers
  "very", "just", "really", "also", "still", "even", "not",
  "no", "only", "now", "then", "too", "so", "all", "more",
  "most", "some", "any", "much", "many", "less", "here", "there",
  "always", "never", "every", "ever", "already", "again",
  // Determiners
  "this", "that", "these", "those", "each", "both", "few",
  "other", "another", "such", "same", "own",
  // High-frequency app-review words with low discriminative power
  "app", "apps", "application", "update", "updates", "version",
  "phone", "device", "mobile", "android",
  "use", "used", "using", "user", "users",
  "please", "thank", "thanks", "star", "stars", "rating",
  "like", "love", "hate", "well", "time", "day", "way",
  "one", "two", "three", "new", "old", "last",
]);

// ── Preprocessor ──────────────────────────────────────────────────────────────

export class TextPreprocessor {
  /**
   * Normalise text and return a list of meaningful tokens.
   * The original review text is never modified — this output is only used
   * for TF-IDF / similarity calculations.
   */
  preprocess(text: string): string[] {
    return (
      text
        .toLowerCase()
        // Replace punctuation / special chars with spaces
        .replace(/[^a-z0-9\s]/g, " ")
        // Remove isolated numbers ("3", "10", etc.)
        .replace(/\b\d+\b/g, " ")
        .split(/\s+/)
        .filter(
          (word) =>
            word.length > 2 && // minimum 3 chars
            !STOP_WORDS.has(word)
        )
    );
  }
}
