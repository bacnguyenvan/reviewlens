// ── TF-IDF Analyzer ───────────────────────────────────────────────────────────
//
// Builds TF-IDF vectors and computes cosine similarity between them.
// No external dependencies — pure TypeScript math.

export class TfIdfAnalyzer {
  /**
   * Build a TF-IDF vector for each document.
   *
   * TF  = term_count / document_length
   * IDF = log((N + 1) / (df + 1))   with +1 smoothing on both sides
   */
  buildVectors(docs: string[][]): Map<string, number>[] {
    const n = docs.length;
    if (n === 0) return [];

    // ── Document frequency ──────────────────────────────────────────────────
    const df = new Map<string, number>();
    for (const doc of docs) {
      for (const term of new Set(doc)) {
        df.set(term, (df.get(term) ?? 0) + 1);
      }
    }

    // ── IDF ─────────────────────────────────────────────────────────────────
    const idf = new Map<string, number>();
    for (const [term, count] of df) {
      idf.set(term, Math.log((n + 1) / (count + 1)));
    }

    // ── TF-IDF per document ─────────────────────────────────────────────────
    return docs.map((doc) => {
      if (doc.length === 0) return new Map();

      // Raw term counts
      const tf = new Map<string, number>();
      for (const term of doc) {
        tf.set(term, (tf.get(term) ?? 0) + 1);
      }

      // Weighted vector
      const vector = new Map<string, number>();
      for (const [term, count] of tf) {
        const termFreq = count / doc.length;
        vector.set(term, termFreq * (idf.get(term) ?? 0));
      }

      return vector;
    });
  }

  /** Cosine similarity between two TF-IDF vectors. Returns 0–1. */
  cosine(a: Map<string, number>, b: Map<string, number>): number {
    if (a.size === 0 || b.size === 0) return 0;

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (const [term, val] of a) {
      dot += val * (b.get(term) ?? 0);
      normA += val * val;
    }
    for (const val of b.values()) {
      normB += val * val;
    }

    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Return the top-N terms from a combined set of TF-IDF vectors,
   * ranked by their total weight across those vectors.
   */
  topTerms(vectors: Map<string, number>[], n: number): string[] {
    const scores = new Map<string, number>();
    for (const vec of vectors) {
      for (const [term, score] of vec) {
        scores.set(term, (scores.get(term) ?? 0) + score);
      }
    }
    return [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([term]) => term);
  }
}
