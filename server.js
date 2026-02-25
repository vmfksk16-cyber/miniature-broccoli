diff --git a/server.js b/server.js
new file mode 100644
index 0000000000000000000000000000000000000000..c85353f117db3b9ae50fbbfc13178afa122a1455
--- /dev/null
+++ b/server.js
@@ -0,0 +1,57 @@
+const http = require('http');
+const fs = require('fs');
+const path = require('path');
+
+const PORT = process.env.PORT || 4173;
+const ROOT = __dirname;
+
+const mimeTypes = {
+  '.html': 'text/html; charset=utf-8',
+  '.css': 'text/css; charset=utf-8',
+  '.js': 'application/javascript; charset=utf-8',
+  '.json': 'application/json; charset=utf-8',
+  '.png': 'image/png',
+  '.jpg': 'image/jpeg',
+  '.jpeg': 'image/jpeg',
+  '.svg': 'image/svg+xml',
+  '.ico': 'image/x-icon',
+};
+
+function send(res, status, body, contentType = 'text/plain; charset=utf-8') {
+  res.writeHead(status, { 'Content-Type': contentType });
+  res.end(body);
+}
+
+const server = http.createServer((req, res) => {
+  const reqPath = decodeURIComponent((req.url || '/').split('?')[0]);
+  const safePath = reqPath === '/' ? '/index.html' : reqPath;
+  const targetPath = path.normalize(path.join(ROOT, safePath));
+
+  if (!targetPath.startsWith(ROOT)) {
+    send(res, 403, 'Forbidden');
+    return;
+  }
+
+  fs.stat(targetPath, (statErr, stats) => {
+    if (statErr || !stats.isFile()) {
+      send(res, 404, 'Not Found');
+      return;
+    }
+
+    const ext = path.extname(targetPath).toLowerCase();
+    const contentType = mimeTypes[ext] || 'application/octet-stream';
+
+    fs.readFile(targetPath, (readErr, data) => {
+      if (readErr) {
+        send(res, 500, 'Internal Server Error');
+        return;
+      }
+
+      send(res, 200, data, contentType);
+    });
+  });
+});
+
+server.listen(PORT, '0.0.0.0', () => {
+  console.log(`Smart farm dashboard is running at http://localhost:${PORT}`);
+});
