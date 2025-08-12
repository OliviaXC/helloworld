export async function parseResumeText(buffer: Buffer, extension: string): Promise<string> {
  try {
    if (extension === ".pdf") {
      const pdfParse = (await import("pdf-parse")).default as (buf: Buffer) => Promise<{ text: string }>;
      const result = await pdfParse(buffer);
      return result.text;
    }
    if (extension === ".docx") {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    if (extension === ".txt") {
      return buffer.toString("utf8");
    }
  } catch (_err) {
    // Fallback to naive text decoding on any parsing error
    return buffer.toString("utf8");
  }
  // Fallback: try to decode as text
  return buffer.toString("utf8");
}