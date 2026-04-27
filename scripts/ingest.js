const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const bufferDir = path.resolve(__dirname, '../buffer');
const docsRootDir = path.resolve(__dirname, '../docs');

function syncIngest() {
  if (!fs.existsSync(bufferDir)) return;

  const subFolders = fs.readdirSync(bufferDir).filter(f => fs.statSync(path.join(bufferDir, f)).isDirectory());
  if (subFolders.length === 0) return;

  console.log(`🔍 正在执行学术归档 (精简版)...`);

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
    const mdFiles = allFiles.filter(f => f.endsWith('.md'));

    if (mdFiles.length === 0) return;

    mdFiles.forEach(mdFile => {
      const mdPath = path.join(noteFolderPath, mdFile);
      let { data, content: body } = matter(fs.readFileSync(mdPath, 'utf8'));

      // 1. 处理日期：始终设为当前日期
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      data.date = dateStr;

      // 2. 移除作者信息
      if (data.author) delete data.author;

      // 3. 处理标题：使用 Frontmatter 中的 title，若无则使用文件名
      if (!data.title) {
        data.title = path.basename(mdFile, '.md');
      }

      const noteId = data.id || ++maxId;
      data.id = noteId;
      
      const year = now.getFullYear();
      const targetDocsDir = path.join(docsRootDir, String(year));
      const targetImagesDir = path.join(targetDocsDir, 'images');

      if (!fs.existsSync(targetImagesDir)) fs.mkdirSync(targetImagesDir, { recursive: true });

      const prefix = `CADCG_NID${noteId}_`;
      console.log(`📦 入库笔记: [${data.title}] (ID: ${noteId})`);

      // 4. 处理图片搬运与引用转换
      const imageFiles = allFiles.filter(f => !f.endsWith('.md'));
      let newBody = body;

      imageFiles.forEach(imgName => {
        const sourceImgPath = path.join(noteFolderPath, imgName);
        let newImgName = imgName.startsWith('CADCG_NID') ? imgName : `${prefix}${imgName}`;
        const targetImgPath = path.join(targetImagesDir, newImgName);

        const escapedName = imgName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // <img> 标签格式
        const imgTagRegex = new RegExp(`src\\s*=\\s*(["'])(?:\\.\\/)?${escapedName}\\1`, 'g');
        if (imgTagRegex.test(newBody)) {
          if (fs.existsSync(sourceImgPath)) fs.copyFileSync(sourceImgPath, targetImgPath);
          newBody = newBody.replace(imgTagRegex, `src={require("./images/${newImgName}").default}`);
        }

        // Markdown ![]() 格式
        const mdImgRegex = new RegExp(`!\\s*\\[(.*?)\\]\\s*\\((?:\\.\\/)?${escapedName}\\)`, 'g');
        if (mdImgRegex.test(newBody)) {
          if (fs.existsSync(sourceImgPath)) fs.copyFileSync(sourceImgPath, targetImgPath);
          newBody = newBody.replace(mdImgRegex, `<img src={require("./images/${newImgName}").default} alt="$1" />`);
        }
      });

      // 写回正式库
      const finalFileName = `${dateStr}-${noteId}.md`;
      const finalMdPath = path.join(targetDocsDir, finalFileName);
      fs.writeFileSync(finalMdPath, matter.stringify(newBody, data));
      console.log(`   ✅ 归档成功: ${finalFileName}`);
    });

    fs.rmSync(noteFolderPath, { recursive: true, force: true });
  });
}

syncIngest();
