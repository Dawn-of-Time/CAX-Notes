const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const bufferDir = path.resolve(__dirname, '../buffer');
const docsRootDir = path.resolve(__dirname, '../docs');

function syncIngest() {
  if (!fs.existsSync(bufferDir)) return;

  const subFolders = fs.readdirSync(bufferDir).filter(f => fs.statSync(path.join(bufferDir, f)).isDirectory());
  if (subFolders.length === 0) return;

  console.log(`🔍 正在执行学术归档 (增强型语法转换模式)...`);

  let maxId = 0;
  function findMaxId(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        findMaxId(fullPath);
      } else if (item.endsWith('.md')) {
        try {
          const match = item.match(/-(\d+)\.md$/);
          if (match) {
            const id = parseInt(match[1]);
            if (id > maxId) maxId = id;
          }
        } catch(e){}
      }
    });
  }
  findMaxId(docsRootDir);

  subFolders.forEach(folder => {
    const noteFolderPath = path.join(bufferDir, folder);
    const allFiles = fs.readdirSync(noteFolderPath).filter(f => !f.startsWith('.'));
    const mdFile = allFiles.find(f => f.endsWith('.md'));

    if (!mdFile) return;

    const mdPath = path.join(noteFolderPath, mdFile);
    let { data, content: body } = matter(fs.readFileSync(mdPath, 'utf8'));

    const noteId = data.id || ++maxId;
    data.id = noteId;
    
    const dateStr = data.date ? (data.date instanceof Date ? data.date.toISOString().split('T')[0] : String(data.date)) : '2026-04-26';
    const year = new Date(dateStr).getFullYear() || 2026;
    const targetDocsDir = path.join(docsRootDir, String(year));
    const targetImagesDir = path.join(targetDocsDir, 'images');

    if (!fs.existsSync(targetImagesDir)) fs.mkdirSync(targetImagesDir, { recursive: true });

    // --- 复杂前缀定义 ---
    const prefix = `CADCG_NID${noteId}_`;
    console.log(`📦 入库笔记: [${data.title}] (ID: ${noteId})`);

    // 1. 处理图片搬运与引用
    const imageFiles = allFiles.filter(f => !f.endsWith('.md'));
    let newBody = body;

    imageFiles.forEach(imgName => {
      const sourceImgPath = path.join(noteFolderPath, imgName);
      let newImgName = imgName.startsWith(prefix) ? imgName : `${prefix}${imgName}`;
      const targetImgPath = path.join(targetImagesDir, newImgName);

      fs.copyFileSync(sourceImgPath, targetImgPath);

      const escapedName = imgName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const imgRefRegex = new RegExp(`src\\s*=\\s*(["'])(?:\\.\\/)?(?!images\\/|CADCG_NID)${escapedName}\\1`, 'g');
      newBody = newBody.replace(imgRefRegex, `src="./images/${newImgName}"`);
    });

    // 写回正式库
    const finalFileName = `${dateStr}-${noteId}.md`;
    const finalMdPath = path.join(targetDocsDir, finalFileName);
    fs.writeFileSync(finalMdPath, matter.stringify(newBody, data));

    fs.rmSync(noteFolderPath, { recursive: true, force: true });
    console.log(`   ✅ 归档成功: ${finalFileName} (已完成语法转换)`);
  });
}

syncIngest();
