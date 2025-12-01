import { PDFFont, PDFPage } from 'pdf-lib';

export function sanitizeText(text: string): string {
  return text.replace(/[\u{1F300}-\u{1FAFF}]/gu, '');
}

export function drawWrappedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  options: {
    textFont: PDFFont;
    emojiFont: PDFFont;
    size: number;
    maxWidth: number;
    lineGap?: number;
  },
): number {
  const { textFont, emojiFont, size, maxWidth, lineGap = 2 } = options;

  const lines = wrapText(text, textFont, size, maxWidth);
  let currentY = y;

  for (const line of lines) {
    drawTextWithEmojiFallback({
      page,
      text: line,
      x,
      y: currentY,
      size: 9,
      textFont,
      emojiFont,
      maxWidth,
    });

    currentY -= size + lineGap;
  }

  return currentY;
}

export function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);

    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) lines.push(currentLine);

  return lines;
}

export function estimateLineCount(
  text: string,
  maxWidth: number,
  fontSize: number,
) {
  const avgCharWidth = fontSize * 0.55; // estimasi aman
  const charsPerLine = Math.floor(maxWidth / avgCharWidth);
  return Math.ceil(text.length / charsPerLine);
}

export function drawTextWithEmojiFallback({
  page,
  text,
  x,
  y,
  size,
  textFont,
  emojiFont,
  maxWidth,
}: {
  page: PDFPage;
  text: string;
  x: number;
  y: number;
  size: number;
  textFont: PDFFont;
  emojiFont: PDFFont;
  maxWidth?: number;
}) {
  let cursorX = x;

  const parts = text.split(
    /(\p{Extended_Pictographic}|\p{Emoji_Presentation})/gu,
  );

  for (const part of parts) {
    const isEmoji = /(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u.test(
      part,
    );

    const font = isEmoji ? emojiFont : textFont;

    page.drawText(part, {
      x: cursorX,
      y,
      size,
      font,
      maxWidth,
    });

    cursorX += font.widthOfTextAtSize(part, size);
  }
}
