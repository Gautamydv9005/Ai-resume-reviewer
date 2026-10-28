import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

/**
 * Extract plain text from PDF, DOCX, or TXT file
 */
export async function extractTextFromFile(filePath, originalName = '') {
  const ext = (path.extname(originalName || filePath) || '').toLowerCase();

  try {
    const dataBuffer = fs.readFileSync(filePath);

    if (ext === '.pdf') {
      const data = await pdf(dataBuffer);
      return data.text || '';
    }

    if (ext === '.docx' || ext === '.doc') {
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      return result.value || '';
    }

    // Default utf-8 read
    return dataBuffer.toString('utf-8');
  } catch (err) {
    console.error(`[textExtractor] Failed to extract text from ${filePath}:`, err.message);
    return '';
  }
}
