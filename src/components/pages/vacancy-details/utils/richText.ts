export type RichBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "ul"; items: string[] };

function normalizeLines(text: string): string[] {
  return text.replace(/\r\n/g, "\n").replace(/\t/g, " ").split("\n");
}

function isBullet(line: string): boolean {
  const t = line.trim();
  return t.startsWith("- ") || t.startsWith("• ") || t.startsWith("* ");
}

function cleanBullet(line: string): string {
  return line.trim().replace(/^(-|\*|•)\s+/, "");
}

function isHeading(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (t.endsWith(":")) return true;
  return /^[A-ZА-Я][A-Za-zА-Яа-я0-9\s/&-]{2,}$/.test(t);
}

export function toRichBlocks(text: string): RichBlock[] {
  const lines = normalizeLines(text);

  const blocks: RichBlock[] = [];
  let paragraphBuf: string[] = [];
  let listBuf: string[] = [];

  const flushParagraph = () => {
    const p = paragraphBuf.join(" ").trim();
    if (p) blocks.push({ type: "p", text: p });
    paragraphBuf = [];
  };

  const flushList = () => {
    if (listBuf.length) blocks.push({ type: "ul", items: [...listBuf] });
    listBuf = [];
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      flushList();
      flushParagraph();
      continue;
    }

    if (isBullet(line)) {
      flushParagraph();
      listBuf.push(cleanBullet(line));
      continue;
    }

    if (isHeading(line) && line.length <= 40) {
      flushList();
      flushParagraph();
      blocks.push({ type: "h", text: line.replace(/:$/, "") });
      continue;
    }

    flushList();
    paragraphBuf.push(line);
  }

  flushList();
  flushParagraph();

  return blocks;
}
