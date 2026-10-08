import { TfIdfAnalyzer } from "./tf-idf-analyzer.js";

// ── Constants ────────────────────────────────────────────────────────────────

/** Cosine similarity threshold for linking two reviews into the same cluster. */
const SIMILARITY_THRESHOLD = 0.15;

/** Reviews with fewer tokens than this after preprocessing are skipped. */
const MIN_TOKENS = 2;

/** Maximum cluster size to prevent one giant cluster from dominating. */
const MAX_CLUSTER_SIZE = 40;

// ── Clusterer ────────────────────────────────────────────────────────────────

export class ReviewClusterer {
  private readonly tfidf = new TfIdfAnalyzer();

  /**
   * Group review indices into clusters of semantically similar reviews.
   *
   * Algorithm:
   * 1. Build TF-IDF vectors for all reviews.
   * 2. Compute pairwise cosine similarity.
   * 3. Add an edge between any pair whose similarity ≥ threshold.
   * 4. Find connected components via BFS — each component is a cluster.
   * 5. Filter out clusters that are too small (< 2 reviews).
   *
   * @param preprocessed  Tokenised text for each review (parallel array)
   * @param vectors       Pre-built TF-IDF vectors (parallel array)
   * @returns             Array of clusters, each cluster is a list of review indices
   */
  cluster(
    preprocessed: string[][],
    vectors: Map<string, number>[]
  ): number[][] {
    const n = preprocessed.length;
    if (n === 0) return [];

    // Identify valid reviews (enough tokens to be meaningful)
    const valid: boolean[] = preprocessed.map(
      (tokens) => tokens.length >= MIN_TOKENS
    );

    // ── Build adjacency list ─────────────────────────────────────────────────
    const adj: Set<number>[] = Array.from({ length: n }, () => new Set());

    for (let i = 0; i < n; i++) {
      if (!valid[i]) continue;
      for (let j = i + 1; j < n; j++) {
        if (!valid[j]) continue;
        const sim = this.tfidf.cosine(vectors[i], vectors[j]);
        if (sim >= SIMILARITY_THRESHOLD) {
          adj[i].add(j);
          adj[j].add(i);
        }
      }
    }

    // ── BFS connected components ─────────────────────────────────────────────
    const visited = new Array<boolean>(n).fill(false);
    const components: number[][] = [];

    for (let start = 0; start < n; start++) {
      if (visited[start] || !valid[start]) {
        visited[start] = true;
        continue;
      }

      const component: number[] = [];
      const queue: number[] = [start];

      while (queue.length > 0) {
        const node = queue.shift()!;
        if (visited[node]) continue;
        visited[node] = true;
        component.push(node);

        for (const neighbour of adj[node]) {
          if (!visited[neighbour]) queue.push(neighbour);
        }
      }

      // Cap oversized clusters by TF-IDF vector magnitude (most representative first)
      const bounded =
        component.length > MAX_CLUSTER_SIZE
          ? [...component]
              .sort((a, b) => vectorMagnitude(vectors[b]) - vectorMagnitude(vectors[a]))
              .slice(0, MAX_CLUSTER_SIZE)
          : component;

      components.push(bounded);
    }

    // Filter out singleton clusters (no strong similarity to anything)
    return components.filter((c) => c.length >= 2);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function vectorMagnitude(v: Map<string, number>): number {
  let sum = 0;
  for (const val of v.values()) sum += val * val;
  return Math.sqrt(sum);
}
