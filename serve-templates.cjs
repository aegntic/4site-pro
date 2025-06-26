const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const TEMPLATES_DIR = path.join(__dirname, 'templates');

const server = http.createServer((req, res) => {
  let filePath = path.join(TEMPLATES_DIR, req.url === '/' ? 'template-showcase.html' : req.url);
  
  // Security: prevent directory traversal
  if (!filePath.startsWith(TEMPLATES_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
      return;
    }

    // Set content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    };

    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`
🚀 4site.pro Template Server Running!
====================================

✅ Server started on http://localhost:${PORT}

📁 Available Templates:
   - Liquid Metal Commerce
   - Motion Design System  
   - Glassmorphism Dashboard
   - Cyberpunk Terminal

🌐 Open http://localhost:${PORT} in your browser to view the showcase

Press Ctrl+C to stop the server
  `);
});