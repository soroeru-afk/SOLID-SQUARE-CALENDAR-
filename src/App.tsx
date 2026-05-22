import { useState, useRef, useEffect } from 'react';
import { LogFile, readLogFiles, createNewLogFile, readFileContent, writeFileContent, parseFallbackFiles } from '@/lib/fs';
import { Sidebar } from '@/components/Sidebar';
import { GridSqView } from '@/components/GridSqView';
import { ListView } from '@/components/ListView';
import { EditorModal } from '@/components/EditorModal';
import { Theme, getThemeColors } from '@/lib/theme';
import { Settings2, X, ChevronDown, PanelLeftClose, PanelLeft } from 'lucide-react';

const FONT_OPTIONS = [
  { label: 'DEFAULT SANS', value: 'ui-sans-serif, system-ui, sans-serif' },
  { label: 'DEFAULT MONO', value: 'ui-monospace, SFMono-Regular, monospace' },
  { label: 'DEFAULT SERIF', value: 'ui-serif, Georgia, serif' },
  { label: 'DELA GOTHIC ONE', value: '"Dela Gothic One", sans-serif' },
  { label: 'TRAIN ONE', value: '"Train One", cursive' },
  { label: 'REGGAE ONE', value: '"Reggae One", cursive' },
  { label: 'DOTGOTHIC16', value: '"DotGothic16", sans-serif' },
  { label: 'M PLUS 1P', value: '"M PLUS 1p", sans-serif' },
  { label: 'NOTO SANS JP', value: '"Noto Sans JP", sans-serif' },
  { label: 'NOTO SERIF JP', value: '"Noto Serif JP", serif' },
  { label: 'SHIPPORI MINCHO', value: '"Shippori Mincho", serif' },
  { label: 'HINA MINCHO', value: '"Hina Mincho", serif' },
  { label: 'ZEN OLD MINCHO', value: '"Zen Old Mincho", serif' },
  { label: 'ZEN DOTS', value: '"Zen Dots", cursive' },
  { label: 'RAMPART ONE', value: '"Rampart One", cursive' },
  { label: 'KAISEI DECOL', value: '"Kaisei Decol", serif' },
];

export default function App() {
  const [dirHandle, setDirHandle] = useState<any | null>(null);
  const [logs, setLogs] = useState<LogFile[]>([]);
  const [viewMode, setViewMode] = useState<'SQUARE' | 'LIST'>('SQUARE');
  const [selectedLog, setSelectedLog] = useState<LogFile | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [theme, setTheme] = useState<Theme>('NAVY');
  const [textSize, setTextSize] = useState<number>(12);
  const [textFont, setTextFont] = useState<string>('ui-sans-serif, system-ui, sans-serif');
  const [dateSize, setDateSize] = useState<number>(48);
  const [dateFont, setDateFont] = useState<string>('ui-sans-serif, system-ui, sans-serif');
  const [editorTextSize, setEditorTextSize] = useState<number>(16);
  const [showLogTitlesSquare, setShowLogTitlesSquare] = useState<boolean>(false);
  const [showLogTitlesList, setShowLogTitlesList] = useState<boolean>(true);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [systemFont, setSystemFont] = useState<string>("'Space Mono', 'Rajdhani', ui-monospace, SFMono-Regular, monospace");

  // --- LOCAL STORAGE PERSISTENCE ---
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('solid-square-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.textSize) setTextSize(parsed.textSize);
        if (parsed.textFont) setTextFont(parsed.textFont);
        if (parsed.dateSize) setDateSize(parsed.dateSize);
        if (parsed.dateFont) setDateFont(parsed.dateFont);
        if (parsed.systemFont) setSystemFont(parsed.systemFont);
        if (parsed.editorTextSize) setEditorTextSize(parsed.editorTextSize);
        if (parsed.showLogTitlesSquare !== undefined) setShowLogTitlesSquare(parsed.showLogTitlesSquare);
        else if (parsed.showLogTitles !== undefined) setShowLogTitlesSquare(parsed.showLogTitles); // Legacy fallback
        if (parsed.showLogTitlesList !== undefined) setShowLogTitlesList(parsed.showLogTitlesList);
        if (parsed.viewMode) setViewMode(parsed.viewMode);
      }
      
      const savedLogs = localStorage.getItem('solid-square-logs');
      if (savedLogs) {
        const parsedLogs = JSON.parse(savedLogs);
        if (Array.isArray(parsedLogs) && parsedLogs.length > 0) {
          setLogs(parsedLogs);
          setDirHandle({ name: 'CACHED_DATA', isFallback: true });
          setIsFallbackMode(true);
        }
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('solid-square-settings', JSON.stringify({
        theme, textSize, textFont, dateSize, dateFont, systemFont, editorTextSize, showLogTitlesSquare, showLogTitlesList, viewMode
      }));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }, [theme, textSize, textFont, dateSize, dateFont, systemFont, editorTextSize, showLogTitlesSquare, showLogTitlesList, viewMode]);

  useEffect(() => {
    try {
      if (logs.length > 0) {
        // Strip out non-serializable objects (like handle, fallbackFile) before saving
        const serializableLogs = logs.map(l => ({
          name: l.name,
          dateStr: l.dateStr,
          timeStr: l.timeStr,
          title: l.title,
          content: l.content || '',
          isFallback: true
        }));
        localStorage.setItem('solid-square-logs', JSON.stringify(serializableLogs));
      } else {
        localStorage.removeItem('solid-square-logs');
      }
    } catch (e) {
      console.error('Failed to save logs to local storage', e);
    }
  }, [logs]);
  // ---------------------------------

  const handleFallbackLoad = async (files: FileList) => {
    const fileArray = Array.from(files);
    const fetchedLogs = await parseFallbackFiles(fileArray);
    setLogs(fetchedLogs);
    setDirHandle({ name: 'MEMORY_IMPORT', isFallback: true });
    setIsFallbackMode(true);
  };

  const clearDirHandle = () => {
    setDirHandle(null);
    setLogs([]);
    setIsFallbackMode(false);
  };

  const handleNewFolder = async () => {
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      setDirHandle(handle);
      setIsFallbackMode(false);
      setLogs(await readLogFiles(handle));
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error(e);
        if (e.message && e.message.includes('Cross origin')) {
          alert("【プレビュー環境の制限】\nセキュリティ制限により、このプレビュー画面内ではフォルダの選択や作成を行うことができません。\n\nお手数ですが、現在ご利用いただいている PWA（アプリ版）を開いてお試しください。");
        } else {
          alert('Failed to select or create directory.');
        }
      }
    }
  };

  const handleRefresh = async () => {
    if (dirHandle) {
      if (!isFallbackMode) {
        setLogs(await readLogFiles(dirHandle));
      }
    }
  };

  const handleLogClick = async (log: LogFile) => {
    try {
      let content = log.content || '';
      // Fallback just in case content wasn't loaded eagerly
      if (!content && log.handle) {
        content = await readFileContent(log.handle);
      }
      setSelectedLog({ ...log, content });
      setIsEditorOpen(true);
    } catch (e) {
      console.error(e);
      alert('Failed to read file content.');
    }
  };

  const handleNewLog = async (date: Date) => {
    // Generate current time for the specific date
    const now = new Date();
    const specificDate = new Date(date);
    specificDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    const tempLog: LogFile = {
      handle: null,
      name: `NEW_LOG_${specificDate.getTime()}`,
      dateStr: specificDate.getFullYear() + String(specificDate.getMonth() + 1).padStart(2, '0') + String(specificDate.getDate()).padStart(2, '0'),
      timeStr: String(specificDate.getHours()).padStart(2, '0') + String(specificDate.getMinutes()).padStart(2, '0'),
      title: '',
      content: '',
      isNew: true,
      dateObj: specificDate
    };

    setSelectedLog(tempLog);
    setIsEditorOpen(true);
  };

  const handleSaveLog = async (logToSave: any, newContent: string) => {
    try {
      if (logToSave.isNew) {
        // Extract title from the first non-empty line of content
        const lines = newContent.split('\n');
        let extractedTitle = 'UNTITLED';
        for (const line of lines) {
           const trimmed = line.trim();
           if (trimmed) {
             extractedTitle = trimmed.substring(0, 30);
             break;
           }
        }
        
        let newLog = { ...logToSave, title: extractedTitle };
        
        if (dirHandle && !dirHandle.isFallback) {
          newLog = await createNewLogFile(dirHandle, logToSave.dateObj, extractedTitle);
          await writeFileContent(newLog.handle, newContent);
        } else {
          // Use SaveFilePicker or fallback to download for iframes/viewer mode
          const yyyy = logToSave.dateObj.getFullYear();
          const mm = String(logToSave.dateObj.getMonth() + 1).padStart(2, '0');
          const dd = String(logToSave.dateObj.getDate()).padStart(2, '0');
          const HH = String(logToSave.dateObj.getHours()).padStart(2, '0');
          const MM = String(logToSave.dateObj.getMinutes()).padStart(2, '0');
          const safeTitle = extractedTitle.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'UNTITLED';
          const suggestedName = `${yyyy}${mm}${dd}_${HH}${MM}_${safeTitle}.txt`;
          
          newLog.name = suggestedName;
          
          try {
            const fileHandle = await window.showSaveFilePicker({
              suggestedName,
              types: [{
                description: 'Text Document',
                accept: { 'text/plain': ['.txt'] },
              }],
            });
            await writeFileContent(fileHandle, newContent);
            newLog.handle = fileHandle;
          } catch (e: any) {
            if (e.name !== 'AbortError') {
              // Fallback to manual download if File System API is blocked in iframe
              const blob = new Blob([newContent], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = suggestedName;
              a.click();
              URL.revokeObjectURL(url);
            } else {
              throw e;
            }
          }
        }
        
        setSelectedLog({ ...newLog, content: newContent, isNew: false });
        
        if (!dirHandle || dirHandle.isFallback) {
          setLogs(prev => [...prev, { ...newLog, content: newContent, isFallback: true }]);
        }
      } else {
        if (logToSave.handle) {
          await writeFileContent(logToSave.handle, newContent);
        } else {
          // Fallback missing handle: prompt to save manually or download
          try {
            const fileHandle = await window.showSaveFilePicker({
              suggestedName: logToSave.name,
              types: [{
                description: 'Text Document',
                accept: { 'text/plain': ['.txt'] },
              }],
            });
            await writeFileContent(fileHandle, newContent);
            
            // Update the log in memory so next save works directly
            const updatedLog = { ...logToSave, handle: fileHandle, content: newContent };
            setSelectedLog(updatedLog);
            setLogs(prevLogs => prevLogs.map(l => l.name === logToSave.name ? updatedLog : l));
          } catch (e: any) {
            if (e.name !== 'AbortError') {
              // Fallback to download
              const blob = new Blob([newContent], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = logToSave.name;
              a.click();
              URL.revokeObjectURL(url);

              // Update in memory
              const updatedLog = { ...logToSave, content: newContent };
              setSelectedLog(updatedLog);
              setLogs(prevLogs => prevLogs.map(l => l.name === logToSave.name ? updatedLog : l));
            } else {
              throw e;
            }
          }
        }
      }
      
      if (dirHandle && !dirHandle.isFallback) {
        await handleRefresh();
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error("Save Error:", e);
      }
    }
  };

  const changeMonth = (delta: number) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + delta);
    setCurrentDate(d);
  };

  const colors = getThemeColors(theme);

  const sliderStyle = {
    '--slider-border': theme === 'NAVY' ? '#334155' : '#cbd5e1', 
    '--slider-track': theme === 'NAVY' ? '#1e293b' : '#e2e8f0',
    '--slider-thumb': theme === 'NAVY' ? '#94a3b8' : '#64748b'
  } as React.CSSProperties;

  const showLogTitles = viewMode === 'SQUARE' ? showLogTitlesSquare : showLogTitlesList;
  const setShowLogTitles = (val: boolean) => {
    if (viewMode === 'SQUARE') {
      setShowLogTitlesSquare(val);
    } else {
      setShowLogTitlesList(val);
    }
  };

  return (
    <div className={`flex flex-col h-screen w-full ${colors.bg} ${colors.textMain}`} style={{ fontFamily: systemFont }}>
      {/* HEADER */}
      <header className={`flex-none h-12 flex items-center justify-between border-b ${colors.border} px-4 ${colors.panelBg} relative z-40`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`w-6 h-6 border ${colors.border} flex items-center justify-center text-[10px] ${colors.textSub} ${colors.accentBgHover} transition-colors`}
            title="Toggle Sidebar"
          >
            {isSidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeft size={14} />}
          </button>
          <h1 className={`text-xs font-bold tracking-[0.2em] ${colors.textMain}`}>SOLID SQUARE CALENDAR</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`${colors.textSub} text-[10px] uppercase font-bold tracking-widest hidden md:block`}>v1.2.0</div>
          <button 
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className={`w-8 h-8 flex items-center justify-center border ${isThemeMenuOpen ? colors.activeBg : colors.border} ${isThemeMenuOpen ? colors.activeText : colors.textSub} ${colors.accentBgHover} transition-colors`}
          >
            <Settings2 size={16} />
          </button>
        </div>

        {/* SETTINGS POPOVER */}
        {isThemeMenuOpen && (
          <div className={`absolute top-12 right-4 w-72 border ${colors.borderStrong} ${colors.panelBg} ${colors.shadowLg} flex flex-col p-4 gap-6 max-h-[80vh] overflow-y-auto`}>
            
            {/* THEME */}
            <div className="flex flex-col gap-2">
              <div className={`text-[10px] font-bold ${colors.textSub} tracking-widest flex items-center justify-between`}>
                <span>01 THEME</span>
                <span className={colors.textMain}>{theme}</span>
              </div>
              <div className="flex bg-black/10 border border-black/20 p-0.5" style={{ borderColor: 'var(--border-color)' }}>
                <button onClick={() => setTheme('LIGHT')} className={`flex-1 py-1 text-xs font-bold font-mono tracking-widest ${theme === 'LIGHT' ? `${colors.activeBg} ${colors.activeText} shadow-sm` : colors.textSub}`}>LIGHT</button>
                <button onClick={() => setTheme('NAVY')} className={`flex-1 py-1 text-xs font-bold font-mono tracking-widest ${theme === 'NAVY' ? `${colors.activeBg} ${colors.activeText} shadow-sm` : colors.textSub}`}>NAVY</button>
              </div>
            </div>

            {/* SYSTEM FONT */}
            <div className="flex flex-col gap-3">
              <div className={`text-[10px] font-bold ${colors.textSub} tracking-widest flex items-center justify-between`}>
                <span>02 SYSTEM FONT</span>
              </div>
              <div className="relative group">
                <select 
                  value={systemFont}
                  onChange={(e) => setSystemFont(e.target.value)}
                  className={`w-full appearance-none border ${colors.borderStrong} bg-transparent px-3 py-2 text-xs font-bold tracking-wider ${colors.textMain} outline-none cursor-pointer hover:border-slate-500 transition-colors uppercase`}
                  style={{ fontFamily: systemFont }}
                >
                  <option value="'Space Mono', 'Rajdhani', ui-monospace, SFMono-Regular, monospace" className="bg-slate-900 text-slate-100 py-1" style={{ fontFamily: "'Space Mono', 'Rajdhani', ui-monospace, SFMono-Regular, monospace" }}>SPACE MONO</option>
                  {FONT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100 py-1" style={{ fontFamily: opt.value }}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.textSub} pointer-events-none group-hover:text-slate-300`} />
              </div>
            </div>

            {/* DATE NUMBER */}
            <div className="flex flex-col gap-3">
              <div className={`text-[10px] font-bold ${colors.textSub} tracking-widest flex items-center justify-between`}>
                <span>03 DATE FONT</span>
              </div>
              <div className="relative group">
                <select 
                  value={dateFont}
                  onChange={(e) => setDateFont(e.target.value)}
                  className={`w-full appearance-none border ${colors.borderStrong} bg-transparent px-3 py-2 text-xs font-bold tracking-wider ${colors.textMain} outline-none cursor-pointer hover:border-slate-500 transition-colors uppercase`}
                  style={{ fontFamily: dateFont }}
                >
                  {FONT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100 py-1" style={{ fontFamily: opt.value }}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.textSub} pointer-events-none group-hover:text-slate-300`} />
              </div>

              <div className={`text-[10px] font-bold ${colors.textSub} tracking-widest flex items-center justify-between mt-1`}>
                <span>SIZE</span>
                <span className={colors.textMain}>{dateSize}PX</span>
              </div>
              <input 
                type="range" 
                min="24" max="120" step="4" 
                value={dateSize}
                onChange={(e) => setDateSize(parseInt(e.target.value))}
                className="square-slider"
                style={sliderStyle}
              />
            </div>

            {/* LOG TEXT */}
            <div className="flex flex-col gap-3">
              <div className={`text-[10px] font-bold ${colors.textSub} tracking-widest flex items-center justify-between`}>
                <span>04 LOG FONT</span>
              </div>
              <div className="relative group">
                <select 
                  value={textFont}
                  onChange={(e) => setTextFont(e.target.value)}
                  className={`w-full appearance-none border ${colors.borderStrong} bg-transparent px-3 py-2 text-xs font-bold tracking-wider ${colors.textMain} outline-none cursor-pointer hover:border-slate-500 transition-colors uppercase`}
                  style={{ fontFamily: textFont }}
                >
                  {FONT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100 py-1" style={{ fontFamily: opt.value }}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.textSub} pointer-events-none group-hover:text-slate-300`} />
              </div>
              
              <div className={`text-[10px] font-bold ${colors.textSub} tracking-widest flex items-center justify-between mt-1`}>
                <span>SIZE</span>
                <span className={colors.textMain}>{textSize}PX</span>
              </div>
              <input 
                type="range" 
                min="8" max="24" step="1" 
                value={textSize}
                onChange={(e) => setTextSize(parseInt(e.target.value))}
                className="square-slider"
                style={sliderStyle}
              />
            </div>

            {/* VIEW SETTINGS & EDITOR SIZE */}
            <div className="flex flex-col gap-3 border-t border-black/10 pt-4" style={{ borderColor: 'var(--slider-border)' }}>
              <div className={`text-[10px] font-bold ${colors.textSub} tracking-widest flex items-center justify-between mt-1`}>
                <span>05 EDITOR SIZE</span>
                <span className={colors.textMain}>{editorTextSize}PX</span>
              </div>
              <input 
                type="range" 
                min="8" max="48" step="1" 
                value={editorTextSize}
                onChange={(e) => setEditorTextSize(parseInt(e.target.value))}
                className="square-slider"
                style={sliderStyle}
              />
            </div>

          </div>
        )}
      </header>

      {/* BODY */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        {isSidebarOpen && (
          <Sidebar 
            currentDate={currentDate}
            changeMonth={changeMonth}
            viewMode={viewMode}
            setViewMode={setViewMode}
            dirHandle={dirHandle}
            logs={logs}
            isFallbackMode={isFallbackMode}
            onFallbackLoad={handleFallbackLoad}
            onClearDir={clearDirHandle}
            onNewFolder={handleNewFolder}
            onRefresh={handleRefresh}
            theme={theme}
            showLogTitles={showLogTitles}
            setShowLogTitles={setShowLogTitles}
          />
        )}

        {/* MAIN CANVAS */}
        <main className={`flex-1 overflow-hidden ${colors.bg} relative`}>
          {viewMode === 'SQUARE' && (
             <GridSqView currentDate={currentDate} logs={logs} onLogClick={handleLogClick} onNewLog={handleNewLog} theme={theme} textSize={textSize} textFont={textFont} dateSize={dateSize} dateFont={dateFont} showLogTitles={showLogTitles} />
          )}

          {viewMode === 'LIST' && (
             <ListView currentDate={currentDate} logs={logs} onLogClick={handleLogClick} onNewLog={handleNewLog} theme={theme} textSize={textSize} textFont={textFont} dateSize={dateSize} dateFont={dateFont} showLogTitles={showLogTitles} />
          )}
        </main>
      </div>

      {/* EDITOR */}
      {isEditorOpen && selectedLog && (
        <EditorModal 
          log={selectedLog} 
          onClose={() => setIsEditorOpen(false)} 
          onSave={handleSaveLog} 
          isFallbackMode={isFallbackMode}
          theme={theme}
          textSize={editorTextSize}
          setEditorTextSize={setEditorTextSize}
          textFont={textFont}
        />
      )}
    </div>
  );
}
