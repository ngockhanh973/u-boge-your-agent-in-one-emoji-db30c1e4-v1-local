import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// The entry: exactly one emoji glyph. It stands for an agent that never
// forgets — every instruction, file and tool result stays in its memory,
// where a human would have dropped it long ago.
const EMOJI = "🐘";

function countGraphemes(text: string): number {
  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  return [...segmenter.segment(text)].length;
}

function isSingleEmojiGlyph(text: string): boolean {
  if (text.length === 0 || text.trim().length === 0) return false;
  if (countGraphemes(text) !== 1) return false;
  if ([...text].length < 1 || [...text].length > 16) return false;
  return /\p{Extended_Pictographic}/u.test(text);
}

function resolveOutputPath(): string {
  const fromEnv = process.env.OUTPUT_PATH;
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  return "/output/entry.txt";
}

function writeEntry(path: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, EMOJI, "utf8");
  // Round-trip check: the file must hold exactly the one emoji, no
  // trailing newline, no extra whitespace, nothing else.
  const back = readFileSync(path, "utf8");
  if (back !== EMOJI) {
    throw new Error(`round-trip mismatch in ${path}: ${JSON.stringify(back)}`);
  }
  console.log(`wrote ${path} (${Buffer.byteLength(EMOJI, "utf8")} bytes)`);
}

function main(): void {
  if (!isSingleEmojiGlyph(EMOJI)) {
    throw new Error(`EMOJI failed validation: ${JSON.stringify(EMOJI)}`);
  }
  const primary = resolveOutputPath();
  try {
    writeEntry(primary);
  } catch (error) {
    const fallback = join(process.cwd(), "output", "entry.txt");
    writeEntry(fallback);
    console.log(`primary ${primary} unavailable (${error}); wrote ${fallback}`);
  }
}

main();
