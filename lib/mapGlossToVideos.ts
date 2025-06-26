// Map gloss words to an array of { label, url } for the video player.
// - Lowercase and replace '-' with ' ' for matching.
// - If word not found, break into alphabets and map each letter to its video.
// - Accepts: gloss string, wordsWithVideos (array), alphabets (array)
// - Returns: Array<{ label: string, url: string }>
export function mapGlossToVideos(
  gloss: string,
  wordsWithVideos: {
    id: number;
    word: string;
    wordVideos: {
      wordId: number | null;
      videoId: number | null;
      video: {
        url: string;
        size: number;
      } | null;
    }[];
  }[],
  alphabets: {
    id: number;
    word: string;
    wordVideos: {
      wordId: number | null;
      videoId: number | null;
      video: {
        url: string;
        size: number;
      } | null;
    }[];
  }[]
): { label: string; url: string }[] {
  const wordMap = new Map(
    wordsWithVideos.filter(
      (w) => w.wordVideos[0] && w.wordVideos[0].video?.url
    ).map((w) => [w.word, w.wordVideos[0].video?.url])
  );

  const alphabetsSet = alphabets.filter((a) => a.wordVideos[0]);

  const alphaMap = new Map(
    alphabetsSet.map((a) => [
      a.word.toLowerCase(),
      a.wordVideos[0].video?.url || "",
    ])
  );

  const words: string[] = gloss.split(/\s+(?!\()/).filter(Boolean);

  const result: { label: string; url: string }[] = [];

  for (const word of words) {
    const cleaned = word.toLowerCase().replace(/-/g, " ");
    if (wordMap.has(cleaned)) {
      result.push({ label: word, url: wordMap.get(cleaned)! });
    } else {
      // Break into alphabets
      for (const char of word.replace(/[^a-zA-Z]/g, "").toLowerCase()) {
        if (alphaMap.has(char)) {
          result.push({ label: char.toUpperCase(), url: alphaMap.get(char)! });
        }
      }
    }
  }
  return result;
}
