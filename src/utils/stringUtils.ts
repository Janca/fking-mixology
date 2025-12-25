function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function toTitleCase(str: string): string {
  if (!str) return "";

  const minorWords = new Set([
    "a",
    "an",
    "the",
    "and",
    "as",
    "at",
    "but",
    "by",
    "en",
    "for",
    "if",
    "in",
    "of",
    "on",
    "or",
    "the",
    "to",
    "v",
    "vs",
    "via",
    "with",
  ]);

  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word, index, array) => {
      if (index === 0 || index === array.length - 1) {
        return capitalize(word);
      }

      return minorWords.has(word) ? word : capitalize(word);
    })
    .join(" ");
}
