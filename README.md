# CAD & CG 研习录 (CAD & CG Research Workstation)

## 📥 工业级笔记入库流程 (Academic Ingestion Workflow)

系统现已启用**缓冲区 (Buffer)** 模式。通过简单的“文件夹打包”方式，即可实现图片冲突预避与自动对齐。

### 第一步：准备待上传文件夹
在根目录下创建 `buffer/` 文件夹。每篇笔记应当拥有一个独立的子目录，内部**扁平化**存放 MD 文件与相关图片。

**目录结构示例：**
```text
buffer/
└── my-new-paper/        <-- 笔记子目录
    ├── paper.md         <-- 笔记文件
    ├── chart-1.png      <-- 图片 1 (与 MD 同级)
    └── photo.jpg        <-- 图片 2 (与 MD 同级)
```

### 第二步：编写笔记
在 `paper.md` 中，引用同级目录下的图片。**无需关心 ID**，系统入库时会自动注入前缀并修正路径。
```html
<figure id="figure1-1">
  <img src="./chart-1.png"/>
  <figcaption>图 1-1 实验结果数据图</figcaption>
</figure>
```

### 第三步：启动同步
在终端运行：
```bash
npm start
```

**系统自动化动作：**
1. **自动分配 ID**：为新笔记分配永久唯一的 `noteid` 并写入 MD 头部。
2. **规范化归档**：
   - 将笔记自动重命名为 `YYYY-MM-DD-ID.md` 格式。
   - 将图片重命名为 `[noteid]-[原名].png`（如 `12-chart-1.png`）。
   - 将所有文件搬运至正式库：`docs/2026/`。
3. **引用自动纠正**：自动将 MD 中的 `src="./chart-1.png"` 修改为更名后的正式路径 `./images/12-chart-1.png`。
4. **清理缓冲区**：入库成功的笔记子文件夹将从 `buffer/` 中自动移除。

---

## 🎨 系统特性
- **扁平化提交**：无需手动创建 `images/` 子目录，直接与 MD 文件混放即可。
- **冲突预避 (Anti-Collision)**：不同笔记中的同名图片在归档后会因不同的 ID 前缀而共存。
- **持久化 ID**：一旦入库，笔记 ID 将永久锁定，方便长期引用。

**当前版本**: v7.5-FLAT-BUFFER (FLAT)  
**设计理念**: 几何之美，源于对拓扑的极致追求。
