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
  Reference: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 11H7a4 4 0 0 1 4-4V5a5 5 0 0 0-5 5v7h5v-6zM21 11h-3a4 4 0 0 1 4-4V5a5 5 0 0 0-5 5v7h5v-6z"/></svg>,
  Resource: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>,
  Refresh: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>,
  Sun: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="20" y1="12" x2="22" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>,
  Moon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  List: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
};

function UnifiedNoteItem({ note, onSelect, active }) {
  const dateParts = note.date.split('-');
  const displayDate = dateParts.length === 3 ? { y: dateParts[0], m: dateParts[1], d: dateParts[2] } : { y: '', m: '', d: '' };
  
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthLabel = months[parseInt(displayDate.m) - 1] || displayDate.m;

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
        <div className="note-date-badge">
           <div className="date-day">{displayDate.d}</div>
           <div className="date-month-year">{monthLabel} {displayDate.y}</div>
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
  const [iframeLoading, setIframeLoading] = useState(true);
  const { colorMode, setColorMode } = useColorMode();
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('全部标签');
  const [showMobileTOC, setShowMobileTOC] = useState(false);

  // 用于彻底解决 404 闪烁的延迟路径状态
  const [iframeSrc, setIframeSrc] = useState('');

  // 初始化 URL 处理
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') || 'dashboard';
    const docPath = params.get('doc');
    
    setActiveTab(tab);
    if (docPath) {
      const allNotes = [...statsData.notes];
      const foundNote = allNotes.find(n => n.path === docPath);
      if (foundNote) {
        setSelectedNote(foundNote);
        setIframeSrc(`${foundNote.path}?minimal=1`);
      }
      else if (docPath === '/docs/templates/note-template') {
        setSelectedNote({ title: '笔记模板', path: '/docs/templates/note-template' });
        setIframeSrc('/docs/templates/note-template?minimal=1');
      }
      else if (docPath === '/docs/reference/library') {
        setSelectedNote({ title: '引用总库', path: '/docs/reference/library' });
        setIframeSrc('/docs/reference/library?minimal=1');
      }
    }
  }, []);

  const updateStateAndUrl = (tab, note = null) => {
    setActiveTab(tab);
    setSelectedNote(note);
    setNoteTOC([]); 
    setIframeLoading(true);
    setIframeSrc(''); // 先清空路径，防止旧页面或 404 闪烁

    const params = new URLSearchParams();
    params.set('tab', tab);
    if (note) params.set('doc', note.path);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    
    if (note) {
      // 给予 50ms 缓冲，确保状态同步后再加载
      setTimeout(() => setIframeSrc(`${note.path}?minimal=1`), 50);
    }
  };

  const handleTOCClick = (hash) => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.location.hash = hash;
    }
  };

  const recentNotes = useMemo(() => statsData.notes.slice(0, 5), []);
  const allTags = useMemo(() => ['全部标签', ...new Set(statsData.notes.flatMap(n => n.tags))], []);
  const filteredNotes = useMemo(() => {
    return statsData.notes.filter(n => {
      const matchesTag = selectedTag === '全部标签' || n.tags.includes(selectedTag);
      const matchesSearch = n.title.toLowerCase().includes(query.toLowerCase()) || n.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
      return matchesTag && matchesSearch;
    });
  }, [selectedTag, query]);

  const [greeting] = useState(() => {
    if (!ExecutionEnvironment.canUseDOM) return "你好，CAD 研习生";
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "早上好！保持专注，今天也是精进算法与模型的好时机。";
    if (hour >= 12 && hour < 18) return "下午好！攻坚克难，让几何逻辑更进一步。";
    return "晚上好！沉淀思考，在代码与模型中寻找突破。";
  });

  const noteTemplateRaw = statsData.template_raw;
  const isViewingDoc = !!selectedNote;
  const displayDoc = selectedNote || { title: '', path: '' };

  return (
    <div className="flat-app-shell">
      <aside className="flat-sidebar">
        <div className="sidebar-title-row">
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <Icons.CAD />
            <h1 className="sidebar-main-title">CAD & CG 研习录</h1>
          </div>
          <button className="mobile-theme-toggle" onClick={() => setColorMode(colorMode === 'dark' ? 'light' : 'dark')}>
            {colorMode === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <button className={`flat-nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => updateStateAndUrl('dashboard')}><Icons.Terminal /> 总览</button>
          <button className={`flat-nav-link ${activeTab === 'library' ? 'active' : ''}`} onClick={() => updateStateAndUrl('library')}><Icons.Library /> 文库</button>
          <button className={`flat-nav-link ${activeTab === 'template' ? 'active' : ''}`} onClick={() => updateStateAndUrl('template', { title: '笔记模板', path: '/docs/templates/note-template' })}><Icons.Resource /> 笔记模板</button>
          <button className={`flat-nav-link ${activeTab === 'reference' ? 'active' : ''}`} onClick={() => updateStateAndUrl('reference', { title: '引用总库', path: '/docs/reference/library' })}><Icons.Reference /> 引用总库</button>
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle-btn" onClick={() => setColorMode(colorMode === 'dark' ? 'light' : 'dark')}>
            {colorMode === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
            <span className="btn-text">切换主题</span>
          </button>
        </div>
      </aside>

      <main className={`flat-main-stage ${isViewingDoc ? 'no-padding' : ''} ${isViewingDoc ? 'is-viewing-doc' : ''}`}>
        {isViewingDoc ? (
          <div className="view-animate" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
            {/* 移动端目录按钮 */}
            {noteTOC.length > 0 && (
              <button className="mobile-toc-toggle" onClick={() => setShowMobileTOC(true)}>
                <Icons.List />
              </button>
            )}

            {/* 移动端目录弹出层 */}
            {showMobileTOC && (
              <div className="mobile-toc-modal" onClick={() => setShowMobileTOC(false)}>
                <div className="mobile-toc-content" onClick={e => e.stopPropagation()}>
                  <div className="mobile-toc-header">
                    <span style={{fontWeight: 800}}>文档目录</span>
                    <button className="mobile-toc-close" onClick={() => setShowMobileTOC(false)}>×</button>
                  </div>
                  <div className="custom-toc-container">
                    {noteTOC.map((item, i) => (
                      <div key={i} 
                        className={`toc-item level-${item.level}`} 
                        onClick={() => { handleTOCClick(item.hash); setShowMobileTOC(false); }}>
                        {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab !== 'reference' && (
              <div className="doc-view-header" style={activeTab === 'template' ? {justifyContent: 'center'} : {}}>
                <div className="doc-header-left">
                    {activeTab !== 'template' && (
                      <nav className="breadcrumb-container" style={{border: 'none', padding: 0, background: 'transparent'}}>
                        <div className="breadcrumb-item clickable" onClick={() => updateStateAndUrl('library')}>文库</div>
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

            <div className="note-iframe-wrapper" style={{flex: 1, width: '100%', position: 'relative'}}>
              {iframeLoading && templateViewMode !== 'source' && (
                <div className="iframe-loader">
                   <div className="spinner"></div>
                </div>
              )}
              {activeTab === 'template' && templateViewMode === 'source' ? (
                <div className="source-view-container">
                  <pre><code style={{fontSize: '13px', lineHeight: '1.6'}}>{"```markdown\n" + noteTemplateRaw + "\n```"}</code></pre>
                </div>
              ) : (
                <div className="note-iframe-container" style={{
                  height: '100%', width: '100%', position: 'relative', 
                  background: 'var(--flat-bg)', overflow: 'hidden',
                  opacity: iframeLoading ? 0 : 1, transition: 'opacity 0.2s'
                }}>
                   {iframeSrc && (
                     <iframe ref={iframeRef} src={iframeSrc} 
                       style={{width: '100%', height: '100%', border: 'none'}} 
                       title={displayDoc.title}
                       onLoad={(e) => {
                         try {
                           const doc = e.target.contentWindow.document;
                           
                           // 1. 注入样式
                           const style = doc.createElement('style');
                           style.innerHTML = `
                             .navbar, footer, .theme-doc-sidebar-container, 
                             nav[aria-label="Breadcrumbs"], .theme-doc-breadcrumbs, 
                             .theme-doc-footer-edit-meta-row, .theme-doc-toc-mobile, 
                             .theme-doc-toc-desktop, h1, #library, .breadcrumbs { display: none !important; }
                             .container, .theme-doc-main-container, .col { max-width: 100% !important; padding: 0 !important; margin: 0 !important; width: 100% !important; }
                             main { padding: 24px 60px !important; width: 100% !important; }
                             article { max-width: none !important; width: 100% !important; }
                             html { scroll-behavior: smooth; font-size: 15px; }
                             body { font-size: 15px !important; background-color: transparent !important; }
                             .katex { font-family: KaTeX_Main, 'Times New Roman', serif !important; }

                             /* 注入 Admonition 优化 (极致紧凑版) */
                             [class*='admonition'] { padding: 6px 12px !important; margin: 0.5rem 0 !important; border-radius: 4px !important; }
                             
                             [class*='admonitionHeading'] { 
                               display: flex !important; 
                               align-items: center !important; 
                               margin: 0 !important; 
                               padding: 0 !important; 
                               font-size: 1em !important; 
                               line-height: 1.2 !important; 
                               text-transform: uppercase; 
                               font-weight: 800 !important; 
                             }
                             
                             /* 确保图标容器和图标本身垂直居中且无偏移 */
                             [class*='admonitionIcon'] { 
                               display: flex !important; 
                               align-items: center !important; 
                               margin-right: 6px !important; 
                               padding: 0 !important;
                               flex-shrink: 0 !important;
                             }
                             [class*='admonitionHeading'] svg { 
                               width: 14px !important; 
                               height: 14px !important; 
                               display: block !important; 
                             }

                             [class*='admonitionContent'] { 
                               margin: 0 !important; 
                               padding: 0 !important; 
                               line-height: 1.2 !important; 
                               font-size: 13px !important; 
                             }
                             [class*='admonitionContent'] > *:first-child { margin-top: 2px !important; }
                             [class*='admonitionContent'] p { margin: 0 !important; }
                             [class*='admonitionContent'] > *:last-child { margin-bottom: 0 !important; }
                           `;
                           doc.head.appendChild(style);

                           // 2. 提取目录
                           const extractTOC = () => {
                             const headings = Array.from(doc.querySelectorAll('h2, h3, h4'));
                             const toc = headings.map(h => ({
                               text: h.innerText.replace('#', '').trim(),
                               level: h.tagName === 'H2' ? 1 : h.tagName === 'H3' ? 2 : 3,
                               hash: '#' + (h.id || h.getAttribute('data-id') || '')
                             })).filter(item => item.text && item.hash !== '#');
                             setNoteTOC(toc);
                           };
                           
                           extractTOC();
                           setTimeout(extractTOC, 300);
                           setTimeout(extractTOC, 1000);
                           setIframeLoading(false); // 内容就绪后再关闭 loading
                         } catch (err) {
                           console.error("TOC Extraction failed:", err);
                           setNoteTOC([]);
                           setIframeLoading(false);
                         }
                       }}
                      />
                   )}
                 </div>
               )}
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="view-animate">
                <div className="greeting-text">{greeting}</div>
                <div style={{borderBottom: '1px solid var(--flat-border)', paddingBottom: '16px', marginBottom: '24px'}}><h3 style={{fontSize: '13px', fontWeight: '900', margin: 0, opacity: 0.3, textTransform: 'uppercase', letterSpacing: '1px'}}>笔记动态</h3></div>
                {recentNotes.length > 0 ? recentNotes.map((note, i) => <UnifiedNoteItem key={i} note={note} onSelect={(n) => updateStateAndUrl('dashboard', n)} active={selectedNote?.path === note.path} />) : <div style={{padding: '40px', textAlign: 'center', opacity: 0.3, fontWeight: '800'}}>NO_RECENT_ACTIVITY</div>}
              </div>
            )}
            {activeTab === 'library' && (
              <div className="view-animate">
                <div className="library-filter-bar">
                  <div className="search-wrapper"><div className="search-icon-container"><Icons.Search /></div><input className="search-input" placeholder="检索笔记或标签..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
                  <select className="flat-select" value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}>{allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}</select>
                </div>
                <div style={{display: 'flex', flexDirection: 'column'}}>{filteredNotes.map((note, i) => <UnifiedNoteItem key={i} note={note} onSelect={(n) => updateStateAndUrl('library', n)} active={selectedNote?.path === note.path} />)}</div>
              </div>
            )}
          </>
        )}
      </main>

      <aside className="flat-right-panel">
        {isViewingDoc ? (
          noteTOC.length > 0 && (
            <div className="view-animate">
              <div className="sidebar-toc-title">目录</div>
              <div className="custom-toc-container">
                {noteTOC.map((item, i) => (
                  <div key={i} className={`toc-item level-${item.level}`} onClick={() => handleTOCClick(item.hash)}>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          <>
            <MonthlyCalendar notes={statsData.notes} />
            <div className="flat-stats-card">
              <span className="lab">知识库容量</span>
              <div className="val">
                {statsData.total_papers}
                <span className="unit">篇笔记</span>
              </div>
            </div>
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
