import { useState, useRef, useEffect } from "react";
import { get, set, del } from "idb-keyval";
import {
  LogFile,
  readLogFiles,
  createNewLogFile,
  readFileContent,
  writeFileContent,
  parseFallbackFiles,
} from "@/lib/fs";
import { Sidebar } from "@/components/Sidebar";
import { GridSqView } from "@/components/GridSqView";
import { ListView } from "@/components/ListView";
import { EditorModal } from "@/components/EditorModal";
import { Theme, getThemeColors } from "@/lib/theme";
import {
  Settings2,
  X,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

const FONT_OPTIONS = [
  { label: "DEFAULT SANS", value: "ui-sans-serif, system-ui, sans-serif" },
  { label: "DEFAULT MONO", value: "ui-monospace, SFMono-Regular, monospace" },
  { label: "DEFAULT SERIF", value: "ui-serif, Georgia, serif" },
  {
    label: "DELA GOTHIC ONE",
    value: '"Dela Gothic One", sans-serif',
    family: "Dela+Gothic+One",
  },
  { label: "TRAIN ONE", value: '"Train One", cursive', family: "Train+One" },
  { label: "REGGAE ONE", value: '"Reggae One", cursive', family: "Reggae+One" },
  {
    label: "DOTGOTHIC16",
    value: '"DotGothic16", sans-serif',
    family: "DotGothic16",
  },
  {
    label: "M PLUS 1P",
    value: '"M PLUS 1p", sans-serif',
    family: "M+PLUS+1p:wght@400;700",
  },
  {
    label: "NOTO SANS JP",
    value: '"Noto Sans JP", sans-serif',
    family: "Noto+Sans+JP:wght@400;700",
  },
  {
    label: "NOTO SERIF JP",
    value: '"Noto Serif JP", serif',
    family: "Noto+Serif+JP:wght@400;700",
  },
  {
    label: "SHIPPORI MINCHO",
    value: '"Shippori Mincho", serif',
    family: "Shippori+Mincho:wght@400;700",
  },
  {
    label: "HINA MINCHO",
    value: '"Hina Mincho", serif',
    family: "Hina+Mincho",
  },
  {
    label: "ZEN OLD MINCHO",
    value: '"Zen Old Mincho", serif',
    family: "Zen+Old+Mincho:wght@400;700",
  },
  { label: "ZEN DOTS", value: '"Zen Dots", cursive', family: "Zen+Dots" },
  {
    label: "RAMPART ONE",
    value: '"Rampart One", cursive',
    family: "Rampart+One",
  },
  {
    label: "KAISEI DECOL",
    value: '"Kaisei Decol", serif',
    family: "Kaisei+Decol",
  },
];

const loadFontDynamically = (fontValue: string) => {
  const fontOption = FONT_OPTIONS.find((f) => f.value === fontValue);
  if (fontOption && fontOption.family) {
    const linkId = `font-${fontOption.family}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${fontOption.family}&display=swap`;
      document.head.appendChild(link);
    }
  }
};

export default function App() {
  const [dirHandle, setDirHandle] = useState<any | null>(null);
  const [logs, setLogs] = useState<LogFile[]>([]);
  const [viewMode, setViewMode] = useState<"SQUARE" | "LIST">("SQUARE");
  const [selectedLog, setSelectedLog] = useState<LogFile | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [theme, setTheme] = useState<Theme>("MONOTONE");
  const [textSize, setTextSize] = useState<number>(12);
  const [previewWidth, setPreviewWidth] = useState<number>(150);
  const [previewHeight, setPreviewHeight] = useState<number>(150);
  const [previewOpacity, setPreviewOpacity] = useState<number>(70);
  const [textFont, setTextFont] = useState<string>(
    "ui-sans-serif, system-ui, sans-serif",
  );
  const [dateSize, setDateSize] = useState<number>(84);
  const [dateFont, setDateFont] = useState<string>(
    "ui-sans-serif, system-ui, sans-serif",
  );
  const [editorTextSize, setEditorTextSize] = useState<number>(20);
  const [editorMaxWidth, setEditorMaxWidth] = useState<number>(760);
  const [editorLineHeight, setEditorLineHeight] = useState<number>(1.75);
  const [showLogTitlesSquare, setShowLogTitlesSquare] =
    useState<boolean>(false);
  const [showLogTitlesList, setShowLogTitlesList] = useState<boolean>(true);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<
    "GENERAL" | "EDITOR" | "AUDIO"
  >("GENERAL");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [systemFont, setSystemFont] = useState<string>(
    "'Space Mono', 'Rajdhani', ui-monospace, SFMono-Regular, monospace",
  );

  // Audio Settings
  const [speechVoice, setSpeechVoice] = useState<string>("Ichiro");
  const [speechRate, setSpeechRate] = useState<number>(2.0);
  const [speechVolume, setSpeechVolume] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);

  const [isLoaded, setIsLoaded] = useState(false);
  const [needsResume, setNeedsResume] = useState<any | null>(null);

  // --- LOCAL STORAGE & INDEXEDDB PERSISTENCE ---
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("solid-square-settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.theme) setTheme(parsed.theme === "ROSE" ? "RED" : parsed.theme);
        if (parsed.textSize) setTextSize(parsed.textSize);
        if (parsed.previewWidth) setPreviewWidth(parsed.previewWidth);
        if (parsed.previewHeight) setPreviewHeight(parsed.previewHeight);
        if (parsed.previewOpacity) setPreviewOpacity(parsed.previewOpacity);
        if (parsed.textFont) setTextFont(parsed.textFont);
        if (parsed.dateSize) setDateSize(parsed.dateSize);
        if (parsed.dateFont) setDateFont(parsed.dateFont);
        if (parsed.systemFont) setSystemFont(parsed.systemFont);
        if (parsed.editorTextSize) setEditorTextSize(parsed.editorTextSize);
        if (parsed.editorMaxWidth) setEditorMaxWidth(parsed.editorMaxWidth);
        if (parsed.editorLineHeight)
          setEditorLineHeight(parsed.editorLineHeight);
        if (parsed.showLogTitlesSquare !== undefined)
          setShowLogTitlesSquare(parsed.showLogTitlesSquare);
        else if (parsed.showLogTitles !== undefined)
          setShowLogTitlesSquare(parsed.showLogTitles); // Legacy fallback
        if (parsed.showLogTitlesList !== undefined)
          setShowLogTitlesList(parsed.showLogTitlesList);
        if (parsed.viewMode) setViewMode(parsed.viewMode);

        if (parsed.speechVoice) setSpeechVoice(parsed.speechVoice);
        if (parsed.speechRate) setSpeechRate(parsed.speechRate);
        if (parsed.speechVolume) setSpeechVolume(parsed.speechVolume);
        if (parsed.speechPitch) setSpeechPitch(parsed.speechPitch);
      }

      const savedLogs = localStorage.getItem("solid-square-logs");
      if (savedLogs) {
        const parsedLogs = JSON.parse(savedLogs);
        if (Array.isArray(parsedLogs) && parsedLogs.length > 0) {
          setLogs(parsedLogs);
          setDirHandle({ name: "CACHED_DATA", isFallback: true });
          setIsFallbackMode(true);
        }
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    }

    const initDirHandle = async () => {
      try {
        const handle = await get("solid-square-dir-handle");
        if (handle) {
          const permission = await handle.queryPermission({ mode: "readwrite" });
          if (permission === "granted") {
            setDirHandle(handle);
            setIsFallbackMode(false);
            setLogs(await readLogFiles(handle));
          } else {
            setNeedsResume(handle);
          }
        }
      } catch (err) {
        console.error("Failed to load dir handle from idb", err);
      }
      setIsLoaded(true);
    };

    initDirHandle();
  }, []);

  useEffect(() => {
    loadFontDynamically(textFont);
    loadFontDynamically(dateFont);
    loadFontDynamically(systemFont);
  }, [textFont, dateFont, systemFont]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        "solid-square-settings",
        JSON.stringify({
          theme,
          textSize,
          previewWidth,
          previewHeight,
          previewOpacity,
          textFont,
          dateSize,
          dateFont,
          systemFont,
          editorTextSize,
          editorMaxWidth,
          editorLineHeight,
          showLogTitlesSquare,
          showLogTitlesList,
          viewMode,
          speechVoice,
          speechRate,
          speechVolume,
          speechPitch,
        }),
      );
    } catch (e) {
      console.error("Failed to save settings", e);
    }
  }, [
    theme,
    textSize,
    previewWidth,
    previewHeight,
    previewOpacity,
    textFont,
    dateSize,
    dateFont,
    systemFont,
    editorTextSize,
    editorMaxWidth,
    editorLineHeight,
    showLogTitlesSquare,
    showLogTitlesList,
    viewMode,
    speechVoice,
    speechRate,
    speechVolume,
    speechPitch,
    isLoaded,
  ]);

  useEffect(() => {
    try {
      if (logs.length > 0) {
        // Strip out non-serializable objects (like handle, fallbackFile) before saving
        const serializableLogs = logs.map((l) => ({
          name: l.name,
          dateStr: l.dateStr,
          timeStr: l.timeStr,
          title: l.title,
          content: l.content || "",
          isFallback: true,
        }));
        localStorage.setItem(
          "solid-square-logs",
          JSON.stringify(serializableLogs),
        );
      } else {
        localStorage.removeItem("solid-square-logs");
      }
    } catch (e) {
      console.error("Failed to save logs to local storage", e);
    }
  }, [logs]);
  // ---------------------------------

  const handleFallbackLoad = async (files: FileList) => {
    const fileArray = Array.from(files);
    const fetchedLogs = await parseFallbackFiles(fileArray);
    setLogs(fetchedLogs);
    setDirHandle({ name: "MEMORY_IMPORT", isFallback: true });
    setIsFallbackMode(true);
  };

  const clearDirHandle = async () => {
    setDirHandle(null);
    setLogs([]);
    setIsFallbackMode(false);
    await del("solid-square-dir-handle");
    setNeedsResume(null);
  };

  const handleNewFolder = async () => {
    if (window.self !== window.top) {
      alert("【プレビュー環境の制限】\nセキュリティ制限により、このプレビュー画面（iFrame）内ではフォルダを選択・開くことができません。\n\nアプリを新しいタブで開くか、ローカル環境でご利用ください。\n※プレビューでの一時的な読み込みには下の「DIRECTORY IMPORT」をご利用いただけます。");
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      setDirHandle(handle);
      setIsFallbackMode(false);
      setLogs(await readLogFiles(handle));
      await set("solid-square-dir-handle", handle);
      setNeedsResume(null);
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.error(e);
        if (e.message && e.message.includes("Cross origin")) {
          alert(
            "【プレビュー環境の制限】\nセキュリティ制限により、このプレビュー画面内ではフォルダの選択や開くことができません。\n\nアプリを新しいタブで開くか、ローカル環境でお試しください。",
          );
        } else {
          alert("Failed to open directory.");
        }
      }
    }
  };

  const handleResumeFolder = async () => {
    if (window.self !== window.top) {
      alert("【プレビュー環境の制限】\nセキュリティ制限により、このプレビュー画面（iFrame）内ではフォルダに再接続することができません。\n\nアプリを新しいタブで開くか、ローカル環境でご利用ください。");
      return;
    }
    try {
      if (needsResume) {
        const permission = await needsResume.requestPermission({ mode: "readwrite" });
        if (permission === "granted") {
          setDirHandle(needsResume);
          setIsFallbackMode(false);
          setLogs(await readLogFiles(needsResume));
          setNeedsResume(null);
        }
      }
    } catch (e: any) {
      console.error(e);
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
      let content = log.content || "";
      if (!content) {
        if (log.fallbackFile) {
          content = await readFileContent(null, log.fallbackFile);
        } else if (log.handle) {
          content = await readFileContent(log.handle);
        }
      }
      setSelectedLog({ ...log, content });
      setIsEditorOpen(true);
    } catch (e) {
      console.error(e);
      alert("Failed to read file content.");
    }
  };

  const handleNavigate = async (dir: "PREV" | "NEXT") => {
    if (!selectedLog) return;
    const currentIndex = logs.findIndex((l) => l.name === selectedLog.name);
    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    if (dir === "PREV") {
      newIndex = currentIndex + 1; // older file
    } else {
      newIndex = currentIndex - 1; // newer file
    }

    if (newIndex >= 0 && newIndex < logs.length) {
      await handleLogClick(logs[newIndex]);
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
      dateStr:
        specificDate.getFullYear() +
        String(specificDate.getMonth() + 1).padStart(2, "0") +
        String(specificDate.getDate()).padStart(2, "0"),
      timeStr:
        String(specificDate.getHours()).padStart(2, "0") +
        String(specificDate.getMinutes()).padStart(2, "0"),
      title: "",
      content: "",
      isNew: true,
      dateObj: specificDate,
    };

    setSelectedLog(tempLog);
    setIsEditorOpen(true);
  };

  const handleSaveLog = async (logToSave: any, newContent: string) => {
    try {
      if (logToSave.isNew) {
        // Extract title from the first non-empty line of content
        let extractedTitle = "UNTITLED";
        const contentToSearch = newContent.trim();
        if (contentToSearch) {
          const lines = contentToSearch.split("\n").map(l => l.trim()).filter(Boolean);
          if (lines.length > 0) {
            const firstLine = lines[0];
            const isEmojiOrSymbolOnly = /^[^\w\s\u4e00-\u9faf\u3040-\u309f\u30a0-\u30ff\uff66-\uff9f]{1,4}$/u.test(firstLine);
            if (isEmojiOrSymbolOnly && lines.length > 1) {
              const secondLine = lines[1];
              const match = secondLine.match(/^[^。！？.!?]*(?:[。！？]|[.!?](?:\s|$))?/);
              const secondLineFirstSentence = match ? match[0].trim() : secondLine;
              extractedTitle = `${firstLine} ${secondLineFirstSentence}`;
            } else {
              const match = firstLine.match(/^[^。！？.!?]*(?:[。！？]|[.!?](?:\s|$))?/);
              if (match && match[0].trim()) {
                extractedTitle = match[0].trim();
              } else {
                extractedTitle = firstLine;
              }
            }
          }
        }

        let newLog = { ...logToSave, title: extractedTitle };

        if (dirHandle && !dirHandle.isFallback) {
          newLog = await createNewLogFile(
            dirHandle,
            logToSave.dateObj,
            extractedTitle,
          );
          await writeFileContent(newLog.handle, newContent);
        } else {
          // Use SaveFilePicker or fallback to download for iframes/viewer mode
          const yyyy = logToSave.dateObj.getFullYear();
          const mm = String(logToSave.dateObj.getMonth() + 1).padStart(2, "0");
          const dd = String(logToSave.dateObj.getDate()).padStart(2, "0");
          const HH = String(logToSave.dateObj.getHours()).padStart(2, "0");
          const MM = String(logToSave.dateObj.getMinutes()).padStart(2, "0");
          const safeTitle =
            extractedTitle.replace(/[/\\?%*:|"<>]/g, "-").trim() || "UNTITLED";
          const suggestedName = `${yyyy}${mm}${dd}_${HH}${MM}_${safeTitle}.txt`;

          newLog.name = suggestedName;

          try {
            const fileHandle = await window.showSaveFilePicker({
              suggestedName,
              types: [
                {
                  description: "Text Document",
                  accept: { "text/plain": [".txt"] },
                },
              ],
            });
            await writeFileContent(fileHandle, newContent);
            newLog.handle = fileHandle;
          } catch (e: any) {
            if (e.name !== "AbortError") {
              // Fallback to manual download if File System API is blocked in iframe
              const blob = new Blob([newContent], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
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
          setLogs((prev) => [
            ...prev,
            { ...newLog, content: newContent, isFallback: true },
          ]);
        }
      } else {
        if (logToSave.handle) {
          await writeFileContent(logToSave.handle, newContent);
        } else {
          // Fallback missing handle: prompt to save manually or download
          try {
            const fileHandle = await window.showSaveFilePicker({
              suggestedName: logToSave.name,
              types: [
                {
                  description: "Text Document",
                  accept: { "text/plain": [".txt"] },
                },
              ],
            });
            await writeFileContent(fileHandle, newContent);

            // Update the log in memory so next save works directly
            const updatedLog = {
              ...logToSave,
              handle: fileHandle,
              content: newContent,
            };
            setSelectedLog(updatedLog);
            setLogs((prevLogs) =>
              prevLogs.map((l) => (l.name === logToSave.name ? updatedLog : l)),
            );
          } catch (e: any) {
            if (e.name !== "AbortError") {
              // Fallback to download
              const blob = new Blob([newContent], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = logToSave.name;
              a.click();
              URL.revokeObjectURL(url);

              // Update in memory
              const updatedLog = { ...logToSave, content: newContent };
              setSelectedLog(updatedLog);
              setLogs((prevLogs) =>
                prevLogs.map((l) =>
                  l.name === logToSave.name ? updatedLog : l,
                ),
              );
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
      if (e.name !== "AbortError") {
        console.error("Save Error:", e);
      }
    }
  };

  const changeMonth = (delta: number) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + delta);
    setCurrentDate(d);
  };

  const colors = getThemeColors(theme as Theme);

  let sliderBorder, sliderTrack, sliderThumb;
  if (theme === "LIGHT") {
    sliderBorder = "#cbd5e1";
    sliderTrack = "#e2e8f0";
    sliderThumb = "#64748b";
  } else if (theme === "RED") {
    sliderBorder = "#4f1818";
    sliderTrack = "#260909";
    sliderThumb = "#b85454";
  } else if (theme === "MONOTONE") {
    sliderBorder = "#3f3f46";
    sliderTrack = "#18181b";
    sliderThumb = "#a1a1aa";
  } else {
    sliderBorder = "#334155";
    sliderTrack = "#1e293b";
    sliderThumb = "#94a3b8";
  }

  const sliderStyle = {
    "--slider-border": sliderBorder,
    "--slider-track": sliderTrack,
    "--slider-thumb": sliderThumb,
  } as React.CSSProperties;

  const showLogTitles =
    viewMode === "SQUARE" ? showLogTitlesSquare : showLogTitlesList;
  const setShowLogTitles = (val: boolean) => {
    if (viewMode === "SQUARE") {
      setShowLogTitlesSquare(val);
    } else {
      setShowLogTitlesList(val);
    }
  };

  return (
    <div
      className={`flex flex-col h-screen w-full ${colors.bg} ${colors.textMain}`}
      style={{ fontFamily: systemFont }}
    >
      {/* HEADER */}
      <header
        className={`flex-none h-12 flex items-center justify-between border-b ${colors.border} px-4 ${colors.panelBg} relative z-40`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`w-6 h-6 border ${colors.border} flex items-center justify-center text-[10px] ${colors.textSub} ${colors.accentBgHover} transition-colors`}
            title="Toggle Sidebar"
          >
            {isSidebarOpen ? (
              <PanelLeftClose size={14} />
            ) : (
              <PanelLeft size={14} />
            )}
          </button>
          <h1
            className={`text-xs font-bold tracking-[0.2em] ${colors.textMain}`}
          >
            SOLID SQUARE CALENDAR
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`${colors.textSub} text-[10px] uppercase font-bold tracking-widest hidden md:block`}
          >
            v1.2.0
          </div>
          <button
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className={`w-8 h-8 flex items-center justify-center border ${isThemeMenuOpen ? colors.activeBg : colors.border} ${isThemeMenuOpen ? colors.activeText : colors.textSub} ${colors.accentBgHover} transition-colors`}
          >
            <Settings2 size={16} />
          </button>
        </div>

        {/* SETTINGS POPOVER */}
        {isThemeMenuOpen && (
          <div
            className={`absolute top-12 right-4 w-72 border ${colors.borderStrong} ${colors.panelBg} ${colors.shadowLg} flex flex-col p-4 gap-4 max-h-[80vh] overflow-y-auto`}
          >
            {/* TABS */}
            <div className="flex border-b border-black/10 dark:border-white/10 mb-2">
              {(["GENERAL", "EDITOR", "AUDIO"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSettingsTab(tab)}
                  className={`flex-1 py-1.5 text-[10px] font-bold tracking-widest ${settingsTab === tab ? `${colors.activeText} border-b-2 border-current` : `${colors.textSub} opacity-50`}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {settingsTab === "GENERAL" && (
              <div className="flex flex-col gap-6">
                {/* THEME */}
                <div className="flex flex-col gap-2">
                  <div
                    className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between`}
                  >
                    <span>THEME</span>
                    <span className={colors.textMain}>{theme}</span>
                  </div>
                  <div
                    className="flex bg-black/10 border border-black/20 p-0.5"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    <button
                      onClick={() => setTheme("LIGHT")}
                      className={`flex-1 py-1 text-xs font-bold font-mono tracking-widest ${theme === "LIGHT" ? `${colors.activeBg} ${colors.activeText} shadow-sm` : colors.textSub}`}
                    >
                      LIGHT
                    </button>
                    <button
                      onClick={() => setTheme("NAVY")}
                      className={`flex-1 py-1 text-xs font-bold font-mono tracking-widest ${theme === "NAVY" ? `${colors.activeBg} ${colors.activeText} shadow-sm` : colors.textSub}`}
                    >
                      NAVY
                    </button>
                    <button
                      onClick={() => setTheme("MONOTONE")}
                      className={`flex-1 py-1 text-xs font-bold font-mono tracking-widest ${theme === "MONOTONE" ? `${colors.activeBg} ${colors.activeText} shadow-sm` : colors.textSub}`}
                    >
                      BLACK
                    </button>
                    <button
                      onClick={() => setTheme("RED")}
                      className={`flex-1 py-1 text-xs font-bold font-mono tracking-widest ${theme === "RED" ? `${colors.activeBg} ${colors.activeText} shadow-sm` : colors.textSub}`}
                    >
                      RED
                    </button>
                  </div>
                </div>

                {/* SYSTEM FONT */}
                <div className="flex flex-col gap-3">
                  <div
                    className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between`}
                  >
                    <span>SYSTEM FONT</span>
                  </div>
                  <div className="relative group">
                    <select
                      value={systemFont}
                      onChange={(e) => setSystemFont(e.target.value)}
                      className={`w-full appearance-none border ${colors.borderStrong} bg-transparent px-3 py-2 text-xs font-bold tracking-wider ${colors.textMain} outline-none cursor-pointer hover:border-slate-500 transition-colors uppercase`}
                      style={{ fontFamily: systemFont }}
                    >
                      <option
                        value="'Space Mono', 'Rajdhani', ui-monospace, SFMono-Regular, monospace"
                        className="bg-slate-900 text-slate-100 py-1"
                        style={{
                          fontFamily:
                            "'Space Mono', 'Rajdhani', ui-monospace, SFMono-Regular, monospace",
                        }}
                      >
                        SPACE MONO
                      </option>
                      {FONT_OPTIONS.map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          className="bg-slate-900 text-slate-100 py-1"
                          style={{ fontFamily: opt.value }}
                        >
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.textSub} pointer-events-none group-hover:text-slate-300`}
                    />
                  </div>
                </div>

                {/* DATE NUMBER */}
                <div className="flex flex-col gap-3">
                  <div
                    className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between`}
                  >
                    <span>DATE FONT</span>
                  </div>
                  <div className="relative group">
                    <select
                      value={dateFont}
                      onChange={(e) => setDateFont(e.target.value)}
                      className={`w-full appearance-none border ${colors.borderStrong} bg-transparent px-3 py-2 text-xs font-bold tracking-wider ${colors.textMain} outline-none cursor-pointer hover:border-slate-500 transition-colors uppercase`}
                      style={{ fontFamily: dateFont }}
                    >
                      {FONT_OPTIONS.map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          className="bg-slate-900 text-slate-100 py-1"
                          style={{ fontFamily: opt.value }}
                        >
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.textSub} pointer-events-none group-hover:text-slate-300`}
                    />
                  </div>
                  <div
                    className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between mt-1`}
                  >
                    <span>SIZE</span>
                    <span className={colors.textMain}>{dateSize}PX</span>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="120"
                    step="4"
                    value={dateSize}
                    onChange={(e) => setDateSize(parseInt(e.target.value))}
                    className="square-slider"
                    style={sliderStyle}
                  />
                </div>
              </div>
            )}

            {settingsTab === "EDITOR" && (
              <div className="flex flex-col gap-6">
                {/* LOG TEXT */}
                <div className="flex flex-col gap-3">
                  <div
                    className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between`}
                  >
                    <span>LOG FONT</span>
                  </div>
                  <div className="relative group">
                    <select
                      value={textFont}
                      onChange={(e) => setTextFont(e.target.value)}
                      className={`w-full appearance-none border ${colors.borderStrong} bg-transparent px-3 py-2 text-xs font-bold tracking-wider ${colors.textMain} outline-none cursor-pointer hover:border-slate-500 transition-colors uppercase`}
                      style={{ fontFamily: textFont }}
                    >
                      {FONT_OPTIONS.map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          className="bg-slate-900 text-slate-100 py-1"
                          style={{ fontFamily: opt.value }}
                        >
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.textSub} pointer-events-none group-hover:text-slate-300`}
                    />
                  </div>
                  <div
                    className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between mt-1`}
                  >
                    <span>PREVIEW SIZE</span>
                    <span className={colors.textMain}>{textSize}PX</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="24"
                    step="1"
                    value={textSize}
                    onChange={(e) => setTextSize(parseInt(e.target.value))}
                    className="square-slider"
                    style={sliderStyle}
                  />

                  <div
                    className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between mt-3`}
                  >
                    <span>PREVIEW WIDTH</span>
                    <span className={colors.textMain}>{previewWidth}%</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="300"
                    step="10"
                    value={previewWidth}
                    onChange={(e) => setPreviewWidth(parseInt(e.target.value))}
                    className="square-slider"
                    style={sliderStyle}
                  />

                  <div
                    className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between mt-3`}
                  >
                    <span>PREVIEW HEIGHT</span>
                    <span className={colors.textMain}>{previewHeight}PX</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="600"
                    step="10"
                    value={previewHeight}
                    onChange={(e) => setPreviewHeight(parseInt(e.target.value))}
                    className="square-slider"
                    style={sliderStyle}
                  />

                  <div
                    className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between mt-3`}
                  >
                    <span>PREVIEW OPACITY</span>
                    <span className={colors.textMain}>{previewOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="10"
                    value={previewOpacity}
                    onChange={(e) => setPreviewOpacity(parseInt(e.target.value))}
                    className="square-slider"
                    style={sliderStyle}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <div
                    className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between mt-1`}
                  >
                    <span>EDITOR SIZE</span>
                    <span className={colors.textMain}>{editorTextSize}PX</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="48"
                    step="1"
                    value={editorTextSize}
                    onChange={(e) =>
                      setEditorTextSize(parseInt(e.target.value))
                    }
                    className="square-slider"
                    style={sliderStyle}
                  />
                </div>
              </div>
            )}

            {settingsTab === "AUDIO" && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <div
                    className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between`}
                  >
                    <span>VOICE</span>
                  </div>
                  <div className="relative group">
                    <select
                      value={speechVoice}
                      onChange={(e) => setSpeechVoice(e.target.value)}
                      className={`w-full appearance-none border ${colors.borderStrong} bg-transparent px-3 py-2 text-xs font-bold tracking-wider ${colors.textMain} outline-none cursor-pointer hover:border-slate-500 transition-colors uppercase`}
                    >
                      <option
                        value="Ichiro"
                        className="bg-slate-900 text-slate-100 py-1"
                      >
                        Ichiro (JP)
                      </option>
                      <option
                        value="Ayumi"
                        className="bg-slate-900 text-slate-100 py-1"
                      >
                        Ayumi (JP)
                      </option>
                      <option
                        value="Haruka"
                        className="bg-slate-900 text-slate-100 py-1"
                      >
                        Haruka (JP)
                      </option>
                      <option
                        value="Keita"
                        className="bg-slate-900 text-slate-100 py-1"
                      >
                        Keita (JP)
                      </option>
                      <option
                        value="Nanami"
                        className="bg-slate-900 text-slate-100 py-1"
                      >
                        Nanami (JP)
                      </option>
                    </select>
                    <ChevronDown
                      size={14}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.textSub} pointer-events-none group-hover:text-slate-300`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div
                    className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between mt-1`}
                  >
                    <span>SPEED (RATE)</span>
                    <span className={colors.textMain}>
                      {speechRate.toFixed(1)}X
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="square-slider"
                    style={sliderStyle}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <div
                    className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between mt-1`}
                  >
                    <span>VOLUME</span>
                    <span className={colors.textMain}>
                      {Math.round(speechVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={speechVolume}
                    onChange={(e) =>
                      setSpeechVolume(parseFloat(e.target.value))
                    }
                    className="square-slider"
                    style={sliderStyle}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <div
                    className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between mt-1`}
                  >
                    <span>PITCH</span>
                    <span className={colors.textMain}>
                      {speechPitch.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={speechPitch}
                    onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                    className="square-slider"
                    style={sliderStyle}
                  />
                </div>
              </div>
            )}
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
            needsResume={needsResume}
            onResumeFolder={handleResumeFolder}
            onRefresh={handleRefresh}
            theme={theme}
            showLogTitles={showLogTitles}
            setShowLogTitles={setShowLogTitles}
          />
        )}

        {/* MAIN CANVAS */}
        <main className={`flex-1 overflow-hidden ${colors.bg} relative`}>
          {viewMode === "SQUARE" && (
            <GridSqView
              currentDate={currentDate}
              logs={logs}
              onLogClick={handleLogClick}
              onNewLog={handleNewLog}
              theme={theme}
              textSize={textSize}
              previewWidth={previewWidth}
              previewHeight={previewHeight}
              previewOpacity={previewOpacity}
              textFont={textFont}
              dateSize={dateSize}
              dateFont={dateFont}
              showLogTitles={showLogTitles}
            />
          )}

          {viewMode === "LIST" && (
            <ListView
              currentDate={currentDate}
              logs={logs}
              onLogClick={handleLogClick}
              onNewLog={handleNewLog}
              theme={theme}
              textSize={textSize}
              previewWidth={previewWidth}
              previewHeight={previewHeight}
              previewOpacity={previewOpacity}
              textFont={textFont}
              dateSize={dateSize}
              dateFont={dateFont}
              showLogTitles={showLogTitles}
            />
          )}
        </main>
      </div>

      {/* EDITOR */}
      {isEditorOpen && selectedLog && (() => {
        const currentIndex = logs.findIndex((l) => l.name === selectedLog.name);
        const hasPrev = currentIndex >= 0 && currentIndex < logs.length - 1;
        const hasNext = currentIndex > 0;
        return (
          <EditorModal
            log={selectedLog}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleSaveLog}
            onNavigate={handleNavigate}
            hasPrev={hasPrev}
            hasNext={hasNext}
            isFallbackMode={isFallbackMode}
            theme={theme}
            textSize={editorTextSize}
            setEditorTextSize={setEditorTextSize}
            editorMaxWidth={editorMaxWidth}
            setEditorMaxWidth={setEditorMaxWidth}
            editorLineHeight={editorLineHeight}
            setEditorLineHeight={setEditorLineHeight}
            textFont={textFont}
            speechVoice={speechVoice}
            speechRate={speechRate}
            speechVolume={speechVolume}
            speechPitch={speechPitch}
          />
        );
      })()}
    </div>
  );
}
