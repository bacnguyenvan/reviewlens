// Validates and normalizes a Google Play package name or store URL.
// Returns the package name string, or null if invalid.

const PACKAGE_NAME_RE = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/;

export function parsePackageName(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Handle Google Play Store URLs:
  // https://play.google.com/store/apps/details?id=com.example.app
  try {
    const url = new URL(trimmed);
    if (
      url.hostname === "play.google.com" &&
      url.pathname.startsWith("/store/apps/details")
    ) {
      const id = url.searchParams.get("id");
      if (id && PACKAGE_NAME_RE.test(id)) return id;
      return null;
    }
  } catch {
    // Not a URL — fall through to package name check
  }

  if (PACKAGE_NAME_RE.test(trimmed)) return trimmed;
  return null;
}
