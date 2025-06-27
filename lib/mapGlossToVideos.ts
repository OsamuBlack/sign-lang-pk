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
): Array<{ label: string; url: string } | { label: string; group: string[]; urls: string[] }> {
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

  const result: Array<{ label: string; url: string } | { label: string; group: string[]; urls: string[] }> = [];

  let i = 0;
  while (i < words.length) {
    const word = words[i];
    const cleaned = word.toLowerCase().replace(/-/g, " ");
    if (wordMap.has(cleaned)) {
      result.push({ label: word, url: wordMap.get(cleaned)! });
      i++;
    } else {
      // Check for consecutive alphabet words
      let group: string[] = [];
      let urls: string[] = [];
      let j = i;
      while (j < words.length) {
        const chars = words[j].replace(/[^a-zA-Z]/g, "").toLowerCase().split("");
        // Only group if all chars are single letters and exist in alphaMap
        if (
          chars.length === 1 &&
          alphaMap.has(chars[0])
        ) {
          group.push(chars[0].toUpperCase());
          urls.push(alphaMap.get(chars[0])!);
          j++;
        } else {
          break;
        }
      }
      if (group.length > 0) {
        result.push({ label: group.join(""), group, urls });
        i = j;
      } else {
        // fallback: try to finger-spell the word as a group
        const chars = word.replace(/[^a-zA-Z]/g, "").toLowerCase().split("");
        group = [];
        urls = [];
        for (const char of chars) {
          if (alphaMap.has(char)) {
            group.push(char.toUpperCase());
            urls.push(alphaMap.get(char)!);
          }
        }
        if (group.length > 0) {
          result.push({ label: group.join(""), group, urls });
        }
        i++;
      }
    }
  }
  return result;
}
