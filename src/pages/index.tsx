import React, { useState, useEffect, useMemo, useRef } from 'react';
import Layout from '@theme/Layout';
import { useColorMode } from '@docusaurus/theme-common';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import statsData from '@site/src/data/stats.json';

// --- 图标库 ---
const Icons = {
  CAD: () => (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <path d="M16 2L2 10V22L16 30L30 22V10L16 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
      <circle cx="16" cy="16" r="3" fill="currentColor"/>
      <path d="M16 2V13M30 22L19 18M2 22L13 18" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2"/>
    </svg>
  ),
  Terminal: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>,
  Library: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
  Award: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>,
  Resource: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>,
  Refresh: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>,
  Sun: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="20" y1="12" x2="22" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>,
  Cloud: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>,
  Rain: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 13v8M8 13v8M12 15v8M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>,
  Moon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
};

const getWeatherDesc = (code) => {
  if (code === 0) return { label: '晴朗', icon: <Icons.Sun /> };
  if (code <= 3) return { label: '多云', icon: <Icons.Cloud /> };
  if (code >= 51 && code <= 67) return { label: '有雨', icon: <Icons.Rain /> };
  return { label: '晴间多云', icon: <Icons.Cloud /> };
};

function UnifiedNoteItem({ note, onSelect, active }) {
  return (
    <div className={`unified-note-item ${active ? 'active' : ''}`}>
      <div className="note-content-main">
        <div className="note-link-title" onClick={() => onSelect(note)}>{note.title}</div>
        {note.tags && note.tags.length > 0 && (
           <div className="note-tags-list">
             {note.tags.map(t => <span key={t} className="flat-tag">{t}</span>)}
           </div>
         )}
      </div>
      <div className="note-content-side">
        <div className="note-meta-column">
           <span className="meta-bit">BY @{note.author}</span>
           <span className="meta-bit">ON {note.date}</span>
        </div>
      </div>
    </div>
  );
}

function RealTimeWeather() {
  const [weather, setWeather] = useState({ temp: '--', city: '定位中', code: 0 });
  const fetchWeather = async () => {
    if (!ExecutionEnvironment.canUseDOM || !("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude: lat, longitude: lon } = pos.coords;
        const [wRes, gRes] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`),
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=zh`)
        ]);
        const [wData, gData] = await Promise.all([wRes.json(), gRes.json()]);
        setWeather({ temp: Math.round(wData.current_weather.temperature) + '°C', city: gData.address.city || gData.address.town || '未知位置', code: wData.current_weather.weathercode });
      } catch (e) {}
    }, () => {
        setWeather({ temp: '22°C', city: '杭州', code: 0 });
    });
  };
  useEffect(() => {
    fetchWeather();
    const timer = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);
  const desc = getWeatherDesc(weather.code);
  return (
    <div className="light-status-card">
       <div className="weather-main-row">
          <div className="weather-left">
             <span className="weather-city-label">{weather.city}</span>
             <button className="weather-refresh-btn" onClick={fetchWeather}><Icons.Refresh /></button>
          </div>
          <div className="weather-middle">
             <div className="weather-icon-box" style={{color: 'var(--flat-primary)'}}>{desc.icon}</div>
          </div>
          <div className="weather-right">
             <div className="weather-temp-value">{weather.temp}</div>
          </div>
       </div>
    </div>
  );
}

function MonthlyCalendar({ notes }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const dayCounts = useMemo(() => {
    const counts = {};
    notes.forEach(note => {
      const d = new Date(note.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        counts[day] = (counts[day] || 0) + 1;
      }
    });
    return counts;
  }, [notes, year, month]);
  if (!mounted) return <div className="calendar-container" style={{height: '240px'}} />;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({length: firstDay}, () => null).concat(Array.from({length: daysInMonth}, (_, i) => i + 1));
  return (
    <div className="calendar-container">
      <div className="calendar-title">科研活跃度 · {now.toLocaleString('zh-CN', { month: 'long' })}</div>
      <div className="calendar-header-weeks">{['日', '一', '二', '三', '四', '五', '六'].map(d => <span key={d}>{d}</span>)}</div>
      <div className="flat-calendar-grid">
        {days.map((day, i) => {
          const count = day ? (dayCounts[day] || 0) : 0;
          const lvl = count === 0 ? 0 : Math.min(count, 4);
          return (
            <div key={i} className={`calendar-day-cell lvl-${lvl} ${day ? 'has-tooltip' : ''}`} data-tooltip={day ? `${year}-${month+1}-${day}: ${count} 篇笔记` : ''} style={{ opacity: day ? 1 : 0 }}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WorkstationShell() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedNote, setSelectedNote] = useState(null);
  const [templateViewMode, setTemplateViewMode] = useState('source'); // 'source' | 'preview'
  const [noteTOC, setNoteTOC] = useState([]);
  const iframeRef = useRef(null);
  const { colorMode, setColorMode } = useColorMode();
  const [greeting, setGreeting] = useState('开启今日的几何探索之旅。');
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('全部');
  const displayDoc = useMemo(() => {
    if (activeTab === 'template') return { title: '笔记模板', path: '/docs/templates/note-template' };
    if (activeTab === 'reference') return { title: '引用总库', path: '/docs/reference/library' };
    if (selectedNote) return selectedNote;
    return null;
  }, [activeTab, selectedNote]);
  const isViewingDoc = !!displayDoc;
  useEffect(() => { setNoteTOC([]); }, [displayDoc?.path]);
  const handleTOCClick = (hash) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.location.hash = hash;
    }
  };
  useEffect(() => {
    const hour = new Date().getHours();
    const texts = ["愿你的参数化模型永远收敛。", "几何之美，源于对拓扑的极致追求。", "准备好迎接今日的计算挑战了吗？", "开启今日的几何探索之旅。", "每一行代码都在重塑三维世界。"];
    const base = hour < 9 ? '早上好' : hour < 12 ? '上午好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好';
    setGreeting(`${base}，${texts[Math.floor(Math.random() * texts.length)]}`);
  }, []);
  const allTags = useMemo(() => {
    const tags = new Set(['全部']);
    statsData.notes.forEach(n => n.tags.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, []);
  const filteredNotes = useMemo(() => {
    return statsData.notes.filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(query.toLowerCase()) || n.tags.some(t => t.toLowerCase().includes(query.toLowerCase())) || n.author.toLowerCase().includes(query.toLowerCase());
      const matchesTag = selectedTag === '全部' || n.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [query, selectedTag]);
  const recentNotes = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);
    return statsData.notes.filter(n => {
      const d = new Date(n.date);
      return d >= oneWeekAgo && d <= today;
    });
  }, []);

  const noteTemplateRaw = `---
title: '论文题目'
author: 姓名
tags:
  - tag1
  - tag2
---

:::tip[资料卡]
 - 会议/期刊：

 - 其他信息：
:::

## 1 一级标题
### 1.1 二级标题
#### （1）三级标题

正文。

## 2 格式规范
### 2.1 正文
正文段落间需要空一行，否则将视为同一段落。

### 2.2 图
引用图时，可如此表达：如[图2-1](#figure2-1)所示。括号中的内容是图id。格式如下：
<figure id="figure2-1">
  <img src="./images/2-1图链接.png"/>
  <figcaption>图2-1 图题</figcaption>
</figure>

:::info[图编号的含义]
记图编号为图$x-y$，其中：
$x$——一级标题编号；
$y$——图序号（即第几幅图。计数自1起，并在跨越章后重置）。
:::

若图含子图，可如此表达：如[图2-2](#figure1-2)、[图2-2(a)](#figure1-2a)、[图2-2(b)](#figure1-2b)所示。图格式如下：

<figure id="figure2-2">
  <figure id="figure2-2a">
    <img src="./images/2-2(a)图名.png"/>
    <figcaption>图2-2(a) 子图</figcaption>
  </figure>

  <figure id="figure2-2b">
    <img src="./images/2-2(b)图名.png"/>
    <figcaption>图2-2(b) 子图</figcaption>
  </figure>

  <figcaption>图2-2 含子图的图</figcaption>
</figure>

### 2.3 表
引用表时，可如此表达：如[表2-1](#table2-1)所示。括号中的内容是表id。表格式如下：

<table id="table2-1">
  <caption>表2-1 表题</caption>
  <thead>
    <tr><th>表头第一列</th><th>表头第二列</th></tr>
  </thead>
  <tbody>
    <tr><td>表身第一行第一列内容</td><td>表身第一行第二列内容</td></tr>
    <tr><td>表身第二行第一列内容</td><td>表身第二行第二列内容</td></tr>
  </tbody>
</table>

表编号的含义与图相仿。

### 2.4 公式
公式使用示例：设$R_a$是由于环境光照产生的结果强度曲线，$L_c$是环境光的强度曲线，$O_a$是物体的颜色曲线，则环境光照公式为：

$$
R_a = L_c \\cdot O_a
$$ 

### 2.5 其他
未尽事宜，可前往Docusaurus官网查阅资料，或在搜索引擎中查找有关markdown的语法。

## 3 内容要素
笔记内容可参考下述要素撰写：
 - 解决何问题
 - 大致采取何方法
 - 优势与不足
 - 创新点[Optional]
 - 个人感悟`;

  return (
    <div className="so-container">
      <aside className="flat-sidebar">
        <div className="sidebar-title-row">
          <div className="sidebar-logo"><Icons.CAD /></div>
          <h1 className="sidebar-main-title">CAD & CG 研习录</h1>
        </div>
        <nav style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
          <button className={`flat-nav-link ${activeTab === 'dashboard' && !selectedNote ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setSelectedNote(null); }}><Icons.Terminal /> 总览</button>
          <button className={`flat-nav-link ${activeTab === 'library' && !selectedNote ? 'active' : ''}`} onClick={() => { setActiveTab('library'); setSelectedNote(null); }}><Icons.Library /> 文库</button>
          <button className={`flat-nav-link ${activeTab === 'hunters' && !selectedNote ? 'active' : ''}`} onClick={() => { setActiveTab('hunters'); setSelectedNote(null); }}><Icons.Award /> 排行</button>
        </nav>
        <div className="sidebar-divider" />
        <nav style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
          <button className={`flat-nav-link ${activeTab === 'template' ? 'active' : ''}`} onClick={() => { setActiveTab('template'); setSelectedNote(null); }}><Icons.Resource /> 笔记模板</button>
          <button className={`flat-nav-link ${activeTab === 'reference' && !selectedNote ? 'active' : ''}`} onClick={() => { setActiveTab('reference'); setSelectedNote(null); }}><Icons.Resource /> 引用总库</button>
        </nav>
        <div className="sidebar-footer"><button className="theme-toggle-btn" onClick={() => setColorMode(colorMode === 'dark' ? 'light' : 'dark')}>{colorMode === 'dark' ? <Icons.Sun /> : <Icons.Moon />} 切换主题</button></div>
      </aside>

      <main className={`flat-main-stage ${isViewingDoc ? 'no-padding' : ''}`}>
        {isViewingDoc ? (
          <div className="view-animate" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
            {activeTab !== 'reference' && (
              <div className="doc-view-header" style={activeTab === 'template' ? {justifyContent: 'center'} : {}}>
                <div className="doc-header-left">
                    {activeTab !== 'template' && (
                      <nav className="breadcrumb-container" style={{border: 'none', padding: 0}}>
                        <div className="breadcrumb-item clickable" onClick={() => { setSelectedNote(null); setActiveTab('library'); }}>文库</div>
                        <div className="breadcrumb-item active">{displayDoc.title}</div>
                      </nav>
                    )}
                </div>
                {activeTab === 'template' && (
                  <div className="view-mode-toggle">
                      <div className={`toggle-slider ${templateViewMode}`} />
                      <button className={`toggle-btn ${templateViewMode === 'source' ? 'active' : ''}`} onClick={() => setTemplateViewMode('source')}>源码</button>
                      <button className={`toggle-btn ${templateViewMode === 'preview' ? 'active' : ''}`} onClick={() => setTemplateViewMode('preview')}>预览</button>
                  </div>
                )}
              </div>
            )}

            <div className="note-iframe-wrapper" style={{flex: 1, width: '100%'}}>
              {activeTab === 'template' && templateViewMode === 'source' ? (
                <div className="source-view-container">
                  <pre><code style={{fontSize: '13px', lineHeight: '1.6'}}>{"```markdown\n" + noteTemplateRaw + "\n```"}</code></pre>
                </div>
              ) : (
                <div className="note-iframe-container" style={{height: '100%', width: '100%', position: 'relative', background: 'var(--flat-bg)', overflow: 'hidden'}}>
                   <iframe ref={iframeRef} src={`${displayDoc.path}?minimal=1`} style={{width: '100%', height: '100%', border: 'none'}} title={displayDoc.title}
                     onLoad={(e) => {
                       const doc = e.target.contentWindow.document;
                       const katexLink = doc.createElement('link');
                       katexLink.rel = 'stylesheet'; katexLink.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
                       doc.head.appendChild(katexLink);
                       const style = doc.createElement('style');
                       style.innerHTML = `
                         .navbar, footer, .theme-doc-sidebar-container, nav[aria-label="Breadcrumbs"], .theme-doc-breadcrumbs, .theme-doc-footer-edit-meta-row, .theme-doc-toc-mobile, .theme-doc-toc-desktop, h1 { display: none !important; }
                         .container, .theme-doc-main-container, .col { max-width: 100% !important; padding: 0 !important; margin: 0 !important; width: 100% !important; }
                         main { padding: 40px 60px !important; width: 100% !important; }
                         article { max-width: none !important; width: 100% !important; }
                         html { scroll-behavior: smooth; font-size: 14px; }
                         body { font-size: 14px !important; }
                         .katex { font-family: KaTeX_Main, 'Times New Roman', serif !important; }
                       `;
                       doc.head.appendChild(style);
                       const extractTOC = () => {
                         const headings = doc.querySelectorAll('h2, h3');
                         if (headings.length > 0) {
                           const tocItems = Array.from(headings).map(h => ({ text: h.innerText.replace('#', '').trim(), hash: '#' + h.id, level: h.tagName === 'H2' ? 0 : 1 })).filter(item => item.hash !== '#');
                           setNoteTOC(tocItems);
                         }
                       };
                       setTimeout(extractTOC, 600);
                     }}
                   />
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="view-animate">
                <div className="greeting-text">{greeting}</div>
                <div style={{display: 'flex', gap: '24px', marginBottom: '64px'}}>
                  <div className="stat-box-mini"><span className="lab">笔记总量</span><span className="val">{statsData.total_papers}</span></div>
                  <div className="stat-box-mini"><span className="lab">活跃成员</span><span className="val">{statsData.total_members}</span></div>
                </div>
                <div style={{borderBottom: '1px solid var(--flat-border)', paddingBottom: '16px', marginBottom: '24px'}}><h3 style={{fontSize: '13px', fontWeight: '900', margin: 0, opacity: 0.3, textTransform: 'uppercase', letterSpacing: '1px'}}>笔记动态</h3></div>
                {recentNotes.length > 0 ? recentNotes.map((note, i) => <UnifiedNoteItem key={i} note={note} onSelect={setSelectedNote} active={selectedNote?.path === note.path} />) : <div style={{padding: '40px', textAlign: 'center', opacity: 0.3, fontWeight: '800'}}>NO_RECENT_ACTIVITY</div>}
              </div>
            )}
            {activeTab === 'library' && (
              <div className="view-animate">
                <div className="library-filter-bar">
                  <div className="search-wrapper"><div className="search-icon-container"><Icons.Search /></div><input className="search-input" placeholder="检索笔记、标签或作者..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
                  <select className="flat-select" value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}>{allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}</select>
                </div>
                <div style={{display: 'flex', flexDirection: 'column'}}>{filteredNotes.map((note, i) => <UnifiedNoteItem key={i} note={note} onSelect={setSelectedNote} active={selectedNote?.path === note.path} />)}</div>
              </div>
            )}
            {activeTab === 'hunters' && (
              <div className="view-animate">
                {statsData.leaderboard.map((m, i) => (
                   <div key={i} className="flat-card-row">
                      <div className="rank-badge">0{i+1}</div>
                      <div className="member-info"><div className="name">@{m.name}</div><div className="level">{m.rank} LEVEL</div></div>
                      <div className="count">{m.count} NOTES</div>
                   </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <aside className="flat-right-panel">
        {isViewingDoc ? (
          <div className="view-animate">
            <div className="sidebar-toc-title">目录</div>
            <div className="custom-toc-container">
              {noteTOC.length > 0 ? noteTOC.map((item, i) => <div key={i} className={`toc-item level-${item.level}`} onClick={() => handleTOCClick(item.hash)}>{item.text}</div>) : <div style={{fontSize:'12px', opacity:0.3, fontWeight:800}}>CONTENT_INDEX_EMPTY</div>}
            </div>
          </div>
        ) : (
          <>
            <RealTimeWeather />
            <MonthlyCalendar notes={statsData.notes} />
          </>
        )}
      </aside>
    </div>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout title="科研控制台" noFooter>
      <WorkstationShell />
    </Layout>
  );
}
