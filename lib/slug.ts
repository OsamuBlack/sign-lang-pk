export const slug = (input: string): string => {
  // If input is a simple string, convert to kebab-case
  // if (SIMPLE_RE.test(input)) {
  return input
    .toLowerCase()
    .replace(/ & /g, " and ")
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace("---", "-")
    .replace("--", "-");
  // }

  // Otherwise, encode URI components
};

/**
 * Reconstructs original string from slug.
 * - If URI encoded, decodes.
 * - Otherwise, does kebab-case to title-case reversal.
 */
export const unslug = (input: string): string => {
  console.log(
    input,
    input
      .replace(/ and /g, " & ")
      .replaceAll("-", " ")
  );
  return input
    // .replace(/ and /g, " & ")
    .replaceAll("-", " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};
