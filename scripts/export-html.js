const fs = require('fs');
const path = require('path');

const buildDir = path.resolve(__dirname, '../build');

async function exportHtml() {
  if (!fs.existsSync(buildDir)) {
    console.error('❌ 未找到 build 目录，请先运行 npm run build');
    process.exit(1);
  }

  console.log('📦 正在准备离线查看工具...');

  // 1. 创建一个微型 Node.js 服务器脚本，处理 SPA 路由
  const serverJsContent = `
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  // 移除查询参数
  filePath = filePath.split('?')[0];

  const serveFile = (targetPath) => {
    fs.readFile(targetPath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // SPA 路由支持：如果找不到文件，返回主 index.html
          const indexPath = path.join(__dirname, 'index.html');
          if (targetPath !== indexPath) {
            serveFile(indexPath);
          } else {
            res.writeHead(404);
            res.end('Not Found');
          }
        } else {
          res.writeHead(500);
          res.end('Server Error: ' + err.code);
        }
      } else {
        const ext = targetPath.toLowerCase().substring(targetPath.lastIndexOf('.'));
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
        res.end(content);
      }
    });
  };

  serveFile(filePath);
});

server.listen(port, () => {
  console.log('Server running at http://localhost:' + port);
});
`;

  fs.writeFileSync(path.join(buildDir, 'offline-server.js'), serverJsContent);

  // 2. 创建 Windows 批处理文件
  const batContent = `@echo off
setlocal
cd /d "%~dp0"
echo ======================================================
echo           CAD & CG 研习录 离线查看器
echo ======================================================
echo.
echo [1] 正在启动本地服务器...
echo [2] 自动打开浏览器...
echo.
echo 提示：查看完毕后，关闭此窗口即可停止服务器。
echo.

start http://localhost:3000
node offline-server.js

pause
`;

  fs.writeFileSync(path.join(buildDir, '双击我在浏览器查看(离线版).bat'), batContent);

  console.log('\n✅ 离线工具准备就绪！');
  console.log('------------------------------------------------------');
  console.log('您的构建结果位于: ' + buildDir);
  console.log('离线查看方式：进入 build 目录，双击运行 "双击我在浏览器查看(离线版).bat"');
  console.log('------------------------------------------------------\n');
}

exportHtml();
