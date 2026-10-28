import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function renderPdf() {
  try {
    const { chromium } = await import('playwright-core');
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    
    console.log('Launching browser to render PDF...');
    const browser = await chromium.launch({ executablePath: edgePath, headless: true });
    const page = await browser.newPage();
    
    const htmlFilePath = 'file:///' + path.join(__dirname, 'AI_Resume_Reviewer_Technology_Stack_Presentation_Guide.html').replace(/\\/g, '/');
    console.log('Navigating to:', htmlFilePath);
    await page.goto(htmlFilePath, { waitUntil: 'networkidle' });
    
    const pdfPath = path.join(__dirname, 'AI_Resume_Reviewer_Technology_Stack_Presentation_Guide.pdf');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '12mm',
        right: '10mm',
        bottom: '12mm',
        left: '10mm'
      }
    });
    
    await browser.close();
    console.log('SUCCESS! PDF successfully created at: ' + pdfPath);
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    process.exit(1);
  }
}

renderPdf();
