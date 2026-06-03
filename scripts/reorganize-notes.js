const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../docs/2026');

function reorganize() {
  const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.md'));
  const entries = [];

  // 1. 读取并解析所有文件
  files.forEach(file => {
    const filePath = path.join(targetDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 简单的 frontmatter 解析
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatterMatch) return;

    const frontmatter = frontmatterMatch[1];
    const dateMatch = frontmatter.match(/date:\s*['"]?(\d{4}-\d{2}-\d{2})['"]?/);
    const titleMatch = frontmatter.match(/title:\s*(.*)/);

    entries.push({
      oldPath: filePath,
      date: dateMatch ? dateMatch[1] : '0000-00-00',
      title: titleMatch ? titleMatch[1].trim().replace(/^['"]|['"]$/g, '') : '',
      content: content,
      frontmatter: frontmatter
    });
  });

  // 2. 排序：日期升序 -> 标题字母升序
  entries.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.title.localeCompare(b.title, 'en', { sensitivity: 'base' });
  });

  // 3. 准备更新
  console.log(`找到 ${entries.length} 个文件，开始处理...`);

  // 先删除旧文件（因为文件名可能会冲突）
  entries.forEach(entry => {
    fs.unlinkSync(entry.oldPath);
  });

  // 写入新文件
  entries.forEach((entry, index) => {
    const newId = index + 1;
    const newFileName = `${entry.date}-${newId}.md`;
    const newPath = path.join(targetDir, newFileName);

    // 更新内容中的 id
    let newContent = entry.content.replace(
      /(id:\s*)(\d+)/,
      `$1${newId}`
    );
    
    // 如果没有找到 id 字段（防止万一），在 frontmatter 中添加
    if (!newContent.match(/id:\s*\d+/)) {
       newContent = newContent.replace(/^---/, `---\nid: ${newId}`);
    }

    fs.writeFileSync(newPath, newContent, 'utf8');
    console.log(`[${newId}] ${entry.date} | ${entry.title.substring(0, 30)}... -> ${newFileName}`);
  });

  console.log('排序及重命名完成！');
}

try {
  reorganize();
} catch (err) {
  console.error('执行出错:', err);
}
