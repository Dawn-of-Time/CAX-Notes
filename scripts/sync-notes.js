const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const docsDir = path.resolve(__dirname, '../docs');
const statsFilePath = path.resolve(__dirname, '../src/data/stats.json');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (path.basename(fullPath) !== 'images') {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

function sync() {
  console.log('🔍 校准持久化路由映射...');
  
  const files = getAllFiles(docsDir).filter(f => f.endsWith('.md') && !f.includes('templates'));
  const notes = [];

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const { data } = matter(content);
      
      if (data.title && data.author) {
        // 1. 获取年份文件夹
        const relativePath = path.relative(docsDir, file).replace(/\\/g, '/');
        const folder = path.dirname(relativePath);
        
        // 2. 路由对齐逻辑：
        // 如果 md 里有 id: 1，Docusaurus 的路由是 /docs/2026/1
        // 如果没有 id，Docusaurus 的路由是 /docs/2026/2026-04-26-1
        const routeId = data.id || path.basename(file, '.md');
        
        const finalPath = folder === '.' ? `/docs/${routeId}` : `/docs/${folder}/${routeId}`;
        
        notes.push({
          title: data.title,
          path: finalPath,
          tags: data.tags || [],
          author: data.author,
          date: data.date ? (data.date instanceof Date ? data.date.toISOString().split('T')[0] : data.date) : '2026-04-26'
        });
        console.log(`🔗 [ID: ${data.id || 'N/A'}] 映射成功 -> ${finalPath}`);
      }
    } catch (err) {
      console.error(`❌ 处理失败: ${file}`);
    }
  });

  // 3. 更新统计与排行
  notes.sort((a, b) => new Date(b.date) - new Date(a.date));
  const authorCounts = {};
  notes.forEach(n => authorCounts[n.author] = (authorCounts[n.author] || 0) + 1);
  const leaderboard = Object.entries(authorCounts)
    .map(([name, count]) => ({ name, count, rank: count >= 10 ? 'CHIEF' : count >= 5 ? 'SENIOR' : 'MEMBER' }))
    .sort((a, b) => b.count - a.count);

  fs.writeFileSync(statsFilePath, JSON.stringify({
    total_papers: notes.length,
    total_members: leaderboard.length,
    notes,
    leaderboard,
    recent_activities: notes.slice(0, 5).map(n => ({ title: n.title, user: n.author, date: n.date }))
  }, null, 2));
  
  console.log(`🚀 映射校准完成。`);
}

sync();
