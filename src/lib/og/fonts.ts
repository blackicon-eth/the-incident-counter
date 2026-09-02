type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

interface LoadedFont {
  name: string;
  data: ArrayBuffer;
  weight: FontWeight;
  style: "normal" | "italic";
}

const FONTS_CSS_URL =
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&display=swap";

// Google Fonts serves TTF to user agents without WOFF/WOFF2 support. satori
// (next/og) only parses TTF/OTF, so we request with a legacy Android UA.
const LEGACY_UA =
  "Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1";

export async function loadFonts(): Promise<LoadedFont[]> {
  try {
    const css = await fetch(FONTS_CSS_URL, {
      headers: { "user-agent": LEGACY_UA },
    }).then((res) => res.text());

    const fonts: LoadedFont[] = [];
    const seen = new Set<string>();

    const blocks = css.match(/@font-face\s*{[^}]*}/g) ?? [];

    for (const block of blocks) {
      const family = block.match(/font-family:\s*'([^']+)'/)?.[1];
      const weight = block.match(/font-weight:\s*(\d+)/)?.[1];
      const url = block.match(/src:\s*url\(([^)]+)\)/)?.[1];

      if (!family || !weight || !url) {
        continue;
      }

      // Take the first (latin) subset for each family + weight.
      const key = `${family}-${weight}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      const data = await fetch(url).then((res) => res.arrayBuffer());
      fonts.push({
        name: family,
        data,
        weight: Number(weight) as FontWeight,
        style: "normal",
      });
    }

    return fonts;
  } catch {
    return [];
  }
}
