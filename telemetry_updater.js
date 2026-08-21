const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..'); // d:\Esports Web Site\main.html
const academyDir = path.resolve(__dirname);     // d:\Esports Web Site\main.html\academy
const indexHtmlPath = path.join(academyDir, 'index.html');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (file === '.git' || file === 'node_modules' || file === '.agents') return;
    try {
      if (fs.statSync(fullPath).isDirectory()) {
        getAllFiles(fullPath, arrayOfFiles);
      } else {
        arrayOfFiles.push(fullPath);
      }
    } catch (e) {}
  });
  return arrayOfFiles;
}

function updateTelemetryInIndex() {
  const allFiles = getAllFiles(rootDir);
  
  let htmlLines = 0, htmlBytes = 0, htmlFiles = 0;
  let cssLines = 0, cssBytes = 0, cssFiles = 0;
  let jsLines = 0, jsBytes = 0, jsFiles = 0;
  let jsonLines = 0, jsonBytes = 0, jsonFiles = 0;
  let totalChars = 0;

  let webpFiles = 0, webpBytes = 0;
  let pngFiles = 0, pngBytes = 0;
  let mp4Files = 0, mp4Bytes = 0;
  let mp3Files = 0, mp3Bytes = 0;
  let otherMediaFiles = 0, otherMediaBytes = 0;

  allFiles.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    const stat = fs.statSync(file);
    const size = stat.size;

    if (['.html', '.css', '.js', '.json', '.yaml', '.yml', '.toml'].includes(ext)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n').length;
        totalChars += content.length;

        if (ext === '.html') { htmlLines += lines; htmlBytes += size; htmlFiles++; }
        else if (ext === '.css') { cssLines += lines; cssBytes += size; cssFiles++; }
        else if (ext === '.js') { jsLines += lines; jsBytes += size; jsFiles++; }
        else { jsonLines += lines; jsonBytes += size; jsonFiles++; }
      } catch (e) {}
    } else if (ext === '.webp') {
      webpFiles++; webpBytes += size;
    } else if (ext === '.png') {
      pngFiles++; pngBytes += size;
    } else if (ext === '.mp4') {
      mp4Files++; mp4Bytes += size;
    } else if (ext === '.mp3' || ext === '.wav') {
      mp3Files++; mp3Bytes += size;
    } else if (['.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) {
      otherMediaFiles++; otherMediaBytes += size;
    }
  });

  const totalLines = htmlLines + cssLines + jsLines + jsonLines;
  const totalCodeFiles = htmlFiles + cssFiles + jsFiles + jsonFiles;
  const totalMediaFiles = webpFiles + pngFiles + mp4Files + mp3Files + otherMediaFiles;
  const totalMediaBytes = webpBytes + pngBytes + mp4Bytes + mp3Bytes + otherMediaBytes;
  const totalMediaMB = (totalMediaBytes / (1024 * 1024)).toFixed(1);

  const htmlPct = ((htmlLines / totalLines) * 100).toFixed(1);
  const cssPct = ((cssLines / totalLines) * 100).toFixed(1);
  const jsPct = ((jsLines / totalLines) * 100).toFixed(1);
  const jsonPct = ((jsonLines / totalLines) * 100).toFixed(1);

  let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

  // Replace total lines
  htmlContent = htmlContent.replace(
    /(<span[^>]*>TOTAL\s*SOURCE\s*CODE<\/span>[\s\S]*?<div[^>]*font-size:\s*2\.2rem[^>]*>)\s*[\d,+]+\s*(<\/div>)/i,
    `$1\n            ${totalLines.toLocaleString()}+\n          $2`
  );

  // Replace lines across files subtitle
  htmlContent = htmlContent.replace(
    /Lines across \d+ dedicated code files/i,
    `Lines across ${totalCodeFiles} dedicated code files`
  );

  // Replace character volume
  const charsFormatted = (totalChars / 1000000).toFixed(2) + 'M+';
  htmlContent = htmlContent.replace(
    /(<span[^>]*>CHARACTER\s*VOLUME<\/span>[\s\S]*?<div[^>]*font-size:\s*2\.2rem[^>]*>)\s*[\d.]+[MKB+]+\s*(<\/div>)/i,
    `$1\n            ${charsFormatted}\n          $2`
  );
  htmlContent = htmlContent.replace(
    /[\d,]+ handcrafted characters/i,
    `${totalChars.toLocaleString()} handcrafted characters`
  );

  // Replace media count & size
  htmlContent = htmlContent.replace(
    /(<span[^>]*>MEDIA\s*&amp;?\s*ASSETS<\/span>[\s\S]*?<div[^>]*font-size:\s*2\.2rem[^>]*>)\s*\d+\s*Files\s*(<\/div>)/i,
    `$1\n            ${totalMediaFiles} Files\n          $2`
  );
  htmlContent = htmlContent.replace(
    /[\d.]+ MB WebP, PNG, MP4 & Audio/i,
    `${totalMediaMB} MB WebP, PNG, MP4 & Audio`
  );

  fs.writeFileSync(indexHtmlPath, htmlContent, 'utf8');
  console.log(`[Telemetry Synchronized] LOC: ${totalLines.toLocaleString()} | Chars: ${totalChars.toLocaleString()} | Files: ${totalCodeFiles} | Media: ${totalMediaFiles} (${totalMediaMB} MB)`);
}

if (require.main === module) {
  updateTelemetryInIndex();
}

module.exports = { updateTelemetryInIndex };
