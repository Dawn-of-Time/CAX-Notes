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
  const dateParts = note.date.split('-');
  const displayDate = dateParts.length === 3 ? { y: dateParts[0], m: dateParts[1], d: dateParts[2] } : { y: '', m: '', d: '' };
  
  // 将数字月份转换为英文简写增强视觉感
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
           <div className="date-right">
              <div className="date-month">{monthLabel}</div>
              <div className="date-year">{displayDate.y}</div>
           </div>
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
  const [iframeLoading, setIframeLoading] = useState(true);

  // --- 路由与历史记录管理 ---
  useEffect(() => {
    const handleUrlChange = () => {
      if (!ExecutionEnvironment.canUseDOM) return;
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || 'dashboard';
      const notePath = params.get('note');
      
      setActiveTab(tab);
      if (notePath) {
        // 在所有笔记中查找
        const found = statsData.notes.find(n => n.path === notePath);
        // 特殊处理模板
        if (notePath === '/docs/templates/note-template') {
          setSelectedNote({ title: '笔记模板', path: '/docs/templates/note-template' });
        } else {
          setSelectedNote(found || null);
        }
      } else {
        setSelectedNote(null);
      }
    };

    handleUrlChange(); // 初始加载同步
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const updateStateAndUrl = (tab, note = null) => {
    if (!ExecutionEnvironment.canUseDOM) return;
    const params = new URLSearchParams();
    params.set('tab', tab);
    if (note) params.set('note', note.path || note);
    
    const newUrl = window.location.pathname + '?' + params.toString();
    window.history.pushState({ tab, note }, '', newUrl);
    
    setActiveTab(tab);
    setSelectedNote(note);
  };

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
  useEffect(() => { setNoteTOC([]); setIframeLoading(true); }, [displayDoc?.path]);
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
      const matchesSearch = n.title.toLowerCase().includes(query.toLowerCase()) || n.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
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

  const noteTemplateRaw = statsData.template_raw || '';

  return (
    <div className={`so-container ${isViewingDoc ? 'is-viewing-doc' : ''}`}>
      <aside className="flat-sidebar">
        <div className="sidebar-title-row">
          <div className="sidebar-logo"><Icons.CAD /></div>
          <h1 className="sidebar-main-title">CAD & CG 研习录</h1>
        </div>
        <div className="sidebar-nav-container">
          <nav className="sidebar-nav-group">
            <button className={`flat-nav-link ${activeTab === 'dashboard' && !selectedNote ? 'active' : ''}`} onClick={() => updateStateAndUrl('dashboard')}><Icons.Terminal /> 总览</button>
            <button className={`flat-nav-link ${activeTab === 'library' && !selectedNote ? 'active' : ''}`} onClick={() => updateStateAndUrl('library')}><Icons.Library /> 文库</button>
            <button className={`flat-nav-link ${activeTab === 'template' ? 'active' : ''}`} onClick={() => updateStateAndUrl('template', { title: '笔记模板', path: '/docs/templates/note-template' })}><Icons.Resource /> 笔记模板</button>
            <button className={`flat-nav-link ${activeTab === 'reference' && !selectedNote ? 'active' : ''}`} onClick={() => updateStateAndUrl('reference')}><Icons.Resource /> 引用总库</button>
          </nav>
        </div>
        <div className="sidebar-footer">
          <button className="theme-toggle-btn" onClick={() => setColorMode(colorMode === 'dark' ? 'light' : 'dark')}>
            {colorMode === 'dark' ? <Icons.Sun /> : <Icons.Moon />} 
            <span className="btn-text">切换主题</span>
          </button>
        </div>
      </aside>

      <main className={`flat-main-stage ${isViewingDoc ? 'no-padding' : ''}`}>
        {isViewingDoc ? (
          <div className="view-animate" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
            {activeTab !== 'reference' && (
              <div className="doc-view-header" style={activeTab === 'template' ? {justifyContent: 'center'} : {}}>
                <div className="doc-header-left">
                    {activeTab !== 'template' && (
                      <nav className="breadcrumb-container" style={{border: 'none', padding: 0}}>
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
                <div className="note-iframe-container" style={{height: '100%', width: '100%', position: 'relative', background: 'var(--flat-bg)', overflow: 'hidden'}}>
                   <iframe ref={iframeRef} src={`${displayDoc.path}?minimal=1`} 
                     style={{width: '100%', height: '100%', border: 'none'}} 
                     title={displayDoc.title}
                     onLoad={(e) => {
                       setIframeLoading(false);
                       const doc = e.target.contentWindow.document;
                       
                       // 再次注入样式以确保万无一失
                       const style = doc.createElement('style');
                       style.innerHTML = `
                         .navbar, footer, .theme-doc-sidebar-container, nav[aria-label="Breadcrumbs"], .theme-doc-breadcrumbs, .theme-doc-footer-edit-meta-row, .theme-doc-toc-mobile, .theme-doc-toc-desktop, h1, #library { display: none !important; }
                         .container, .theme-doc-main-container, .col { max-width: 100% !important; padding: 0 !important; margin: 0 !important; width: 100% !important; }
                         main { padding: 40px 60px !important; width: 100% !important; }
                         article { max-width: none !important; width: 100% !important; }
                         html { scroll-behavior: smooth; font-size: 15px; }
                         body { font-size: 15px !important; background-color: transparent !important; }
                         .katex { font-family: KaTeX_Main, 'Times New Roman', serif !important; }
                       `;
                       doc.head.appendChild(style);

                       // 循环提取目录，因为 Docusaurus 是异步渲染 MDX 的
                       const extractTOC = () => {
                         const headings = doc.querySelectorAll('h2, h3');
                         if (headings.length > 0) {
                           const tocItems = Array.from(headings).map(h => ({ 
                             text: h.innerText.replace('#', '').trim(), 
                             hash: '#' + h.id, 
                             level: h.tagName === 'H2' ? 0 : 1 
                           })).filter(item => item.hash !== '#');
                           setNoteTOC(tocItems);
                         }
                       };
                       
                       extractTOC();
                       setTimeout(extractTOC, 500);
                       setTimeout(extractTOC, 2000); // 确保深度渲染完成后再次提取
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
                <div className="stats-grid" style={{display: 'flex', gap: '24px', marginBottom: '64px'}}>
                  <div className="stat-box-mini"><span className="lab">笔记总量</span><span className="val">{statsData.total_papers}</span></div>
                </div>
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
