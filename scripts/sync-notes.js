const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const docsDir = path.resolve(__dirname, '../docs');
const statsFilePath = path.resolve(__dirname, '../src/data/stats.json');

function getAllFiles(dirPath, arrayOfFiles) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles || [];
  
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
  console.log('🔍 正在同步全库笔记...');
  
  const files = getAllFiles(docsDir).filter(f => f.endsWith('.md') && !f.includes('templates') && !f.includes('reference'));
  const notes = [];

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const { data } = matter(content);
      
      // 严格使用 Frontmatter 中的 title，若无则使用文件名
      const title = data.title || path.basename(file, '.md');

      const relativePath = path.relative(docsDir, file).replace(/\\/g, '/');
      const folder = path.dirname(relativePath);
      const routeId = data.id || path.basename(file, '.md');
      const finalPath = folder === '.' ? `/docs/${routeId}` : `/docs/${folder}/${routeId}`;
      
      notes.push({
        title: title,
        path: finalPath,
        tags: data.tags || [],
        date: data.date ? (data.date instanceof Date ? data.date.toISOString().split('T')[0] : String(data.date)) : '2026-04-26'
      });
      console.log(`🔗 成功映射: [${title}] -> ${finalPath}`);
      
    } catch (err) {
      console.error(`❌ 处理失败: ${file}`, err);
    }
  });

  // 按日期降序
  notes.sort((a, b) => new Date(b.date) - new Date(a.date));

  fs.writeFileSync(statsFilePath, JSON.stringify({
    total_papers: notes.length,
    notes,
    recent_activities: notes.slice(0, 5).map(n => ({ title: n.title, date: n.date }))
  }, null, 2));
  
  console.log(`🚀 同步完成！共计 ${notes.length} 篇笔记。`);
}

sync();
