const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const htmlPath = path.resolve(__dirname, '../Doc/project_final_report.html');
const pdfPath = path.resolve(__dirname, '../Doc/Gemini_Prompt_Manager_Final_Report.pdf');

console.log('HTML Path:', htmlPath);
console.log('PDF Path:', pdfPath);

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;

const cmd = `"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${fileUrl}"`;

console.log('Running command:', cmd);

try {
  execSync(cmd, { stdio: 'inherit' });
  if (fs.existsSync(pdfPath)) {
    console.log('PDF generated successfully! Size:', fs.statSync(pdfPath).size, 'bytes');
  } else {
    console.error('PDF file not found after command execution.');
  }
} catch (err) {
  console.error('Error generating PDF:', err);
}
