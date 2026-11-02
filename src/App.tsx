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
  Palette,
  Maximize,
  Minimize,
  Check,
} from "lucide-react";

const FONT_OPTIONS = [
  { label: "DEFAULT SANS", value: "ui-sans-serif, system-ui, sans-serif" },
  { label: "DEFAULT MONO", value: "ui-monospace, SFMono-Regular, monospace" },
  { label: "DEFAULT SERIF", value: "ui-serif, Georgia, serif" },
  { label: "MEIRYO", value: '"Meiryo", "メイリオ", sans-serif' },
  { label: "IMPACT", value: 'Impact, Charcoal, sans-serif' },
  { label: "ARIAL BLACK", value: '"Arial Black", Gadget, sans-serif' },
  {
    label: "NOTO SANS JP BLACK",
    value: '"Noto Sans JP", sans-serif',
    family: "Noto+Sans+JP:wght@900",
  },
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

const THEME_OPTIONS: { value: Theme; label: string; swatch: string }[] = [
  { value: "LIGHT", label: "LIGHT", swatch: "#5d768d" },
  { value: "PEPER", label: "PEPER", swatch: "#D95430" },
  { value: "MONOTONE", label: "MONO", swatch: "#27272a" },
  { value: "NAVY", label: "NAVY", swatch: "#1c2c40" },
  { value: "ROSE", label: "RED", swatch: "#8a2525" },
  { value: "JAPAN", label: "JAPAN", swatch: "#6E0005" },
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
  const [dateSize, setDateSize] = useState<number>(54);
  const [dateFont, setDateFont] = useState<string>(
    '"Arial Black", Gadget, sans-serif',
  );
  const [editorTextSize, setEditorTextSize] = useState<number>(20);
  const [editorMaxWidth, setEditorMaxWidth] = useState<number>(960);
  const [editorLineHeight, setEditorLineHeight] = useState<number>(1.75);
  const [showLogTitlesSquare, setShowLogTitlesSquare] =
    useState<boolean>(false);
  const [showLogTitlesList, setShowLogTitlesList] = useState<boolean>(true);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const [settingsTab, setSettingsTab] = useState<
    "GENERAL" | "EDITOR" | "AUDIO"
  >("GENERAL");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [systemFont, setSystemFont] = useState<string>(
    "'Space Mono', 'Rajdhani', ui-monospace, SFMono-Regular, monospace",
  );
  const [showMonthWatermark, setShowMonthWatermark] = useState<boolean>(true);
  const [monthWatermarkSize, setMonthWatermarkSize] = useState<number>(180);
  const [monthWatermarkOpacity, setMonthWatermarkOpacity] = useState<number>(10);
  const [monthWatermarkOffsetY, setMonthWatermarkOffsetY] = useState<number>(-15);

  // Audio Settings
  const [speechVoice, setSpeechVoice] = useState<string>("Ichiro");
  const [speechRate, setSpeechRate] = useState<number>(2.0);
  const [speechVolume, setSpeechVolume] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const jaVoices = allVoices.filter((v) => v.lang.startsWith("ja"));
      setAvailableVoices(jaVoices);

      // Auto-migrate simple names to full browser voice names
      if (jaVoices.length > 0) {
        setSpeechVoice((currentVoice) => {
          if (jaVoices.some((v) => v.name === currentVoice)) {
            return currentVoice;
          }
          const match = jaVoices.find((v) => {
            const name = v.name.toLowerCase();
            if (currentVoice === "Ichiro" && (name.includes("ichiro") || name.includes("一朗"))) return true;
            if (currentVoice === "Haruka" && (name.includes("haruka") || name.includes("はるか") || name.includes("遥"))) return true;
            if (currentVoice === "Ayumi" && (name.includes("ayumi") || name.includes("歩"))) return true;
            if (currentVoice === "Ayaka" && (name.includes("ayaka") || name.includes("彩香"))) return true;
            return false;
          });
          if (match) {
            return match.name;
          }
          return currentVoice;
        });
      }
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const [isLoaded, setIsLoaded] = useState(false);
  const [needsResume, setNeedsResume] = useState<any | null>(null);

  // --- LOCAL STORAGE & INDEXEDDB PERSISTENCE ---
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("solid-square-settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.textSize) setTextSize(parsed.textSize);
        if (parsed.previewWidth) setPreviewWidth(parsed.previewWidth);
        if (parsed.previewHeight) setPreviewHeight(parsed.previewHeight);
        if (parsed.previewOpacity) setPreviewOpacity(parsed.previewOpacity);
        if (parsed.textFont) setTextFont(parsed.textFont);
        if (parsed.dateSize) {
          setDateSize(parsed.dateSize === 84 ? 54 : parsed.dateSize);
        }
        if (parsed.dateFont) {
          setDateFont(
            parsed.dateFont === "ui-sans-serif, system-ui, sans-serif"
              ? '"Arial Black", Gadget, sans-serif'
              : parsed.dateFont,
          );
        }
        if (parsed.systemFont) setSystemFont(parsed.systemFont);
        if (parsed.showMonthWatermark !== undefined)
          setShowMonthWatermark(parsed.showMonthWatermark);
        if (parsed.monthWatermarkSize) {
          setMonthWatermarkSize(
            parsed.monthWatermarkSize === 104 ? 180 : parsed.monthWatermarkSize,
          );
        }
        if (parsed.monthWatermarkOpacity !== undefined)
          setMonthWatermarkOpacity(parsed.monthWatermarkOpacity);
        if (parsed.monthWatermarkOffsetY !== undefined)
          setMonthWatermarkOffsetY(parsed.monthWatermarkOffsetY);
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

    // Pre-load speech synthesis voices
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    // Enforce uppercase document title to prevent PWA title duplication
    document.title = "SOLID SQUARE CALENDAR";
  }, []);

  useEffect(() => {
    let metaColor = "#000000";
    switch (theme) {
      case "MONOTONE":
        metaColor = "#000000";
        break;
      case "ROSE":
        metaColor = "#080202";
        break;
      case "JAPAN":
        metaColor = "#ffffff";
        break;
      case "LIGHT":
        metaColor = "#ffffff";
        break;
      case "NAVY":
        metaColor = "#060A11";
        break;
      case "PEPER":
        metaColor = "#F2EFE6";
        break;
    }

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', metaColor);
  }, [theme]);

  useEffect(() => {
    loadFontDynamically(textFont);
    loadFontDynamically(dateFont);
    loadFontDynamically(systemFont);
  }, [textFont, dateFont, systemFont]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
    };
    if (isThemeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isThemeDropdownOpen]);

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
          showMonthWatermark,
          monthWatermarkSize,
          monthWatermarkOpacity,
          monthWatermarkOffsetY,
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
    showMonthWatermark,
    monthWatermarkSize,
    monthWatermarkOpacity,
    monthWatermarkOffsetY,
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
          const match = contentToSearch.match(
            /^[\s\S]*?(?:[。！？\n]|[.!?](?:\s|$))/,
          );
          if (match) {
            extractedTitle = match[0].trim();
          } else {
            extractedTitle = contentToSearch.trim();
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
  } else if (theme === "ROSE") {
    sliderBorder = "#4f1818";
    sliderTrack = "#260909";
    sliderThumb = "#b85454";
  } else if (theme === "MONOTONE") {
    sliderBorder = "#3f3f46";
    sliderTrack = "#18181b";
    sliderThumb = "#a1a1aa";
  } else if (theme === "JAPAN") {
    sliderBorder = "#cbd5e1";
    sliderTrack = "#e2e8f0";
    sliderThumb = "#000000";
  } else if (theme === "PEPER") {
    sliderBorder = "#73634F";
    sliderTrack = "#E5DEC9";
    sliderThumb = "#D95430";
  } else {
    sliderBorder = "#334155";
    sliderTrack = "#1e293b";
    sliderThumb = "#94a3b8";
  }

  const sliderStyle = {
    "--slider-border": sliderBorder,
    "--slider-track": sliderTrack,
    "--slider-thumb": sliderThumb,
    backgroundColor: theme === "PEPER" ? "#ffffff" : "transparent",
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

  const controlTextClass =
    (theme === "LIGHT" || theme === "JAPAN")
      ? "text-slate-500"
      : theme === "PEPER"
        ? "text-[#73634F]"
        : colors.textMain;

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
            className={`w-6 h-6 border ${colors.border} ${theme === "PEPER" ? "bg-white" : ""} flex items-center justify-center text-[10px] ${colors.textSub} ${colors.accentBgHover} transition-colors`}
            title="Toggle Sidebar"
          >
            {isSidebarOpen ? (
              <PanelLeftClose size={14} />
            ) : (
              <PanelLeft size={14} />
            )}
          </button>
          <h1
            className={`text-xs font-bold tracking-[0.2em] ${controlTextClass}`}
          >
            SOLID SQUARE CALENDAR
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
            }}
            className={`w-6 h-6 flex items-center justify-center border ${colors.border} ${theme === "PEPER" ? "bg-white" : ""} ${colors.textSub} ${colors.accentBgHover} transition-colors`}
          >
            {document.fullscreenElement ? <Minimize size={12} /> : <Maximize size={12} />}
          </button>

          <div className={`hidden md:flex items-center gap-2 border ${colors.border} ${theme === "PEPER" ? "bg-white" : ""} px-2 h-6`}>
             <span className={`text-[10px] font-bold ${controlTextClass} tracking-widest`}>SIZE</span>
             <div className="w-20 h-full flex items-center">
               <input
                 type="range"
                 min="12"
                 max="140"
                 value={dateSize}
                 onChange={(e) => setDateSize(Number(e.target.value))}
                 className="square-slider !h-5 !border-none"
                 style={{ ...sliderStyle, padding: "0 2px" }}
               />
             </div>
             <span className={`text-[10px] font-bold ${controlTextClass} tracking-widest min-w-[32px] text-right`}>{dateSize}PX</span>
          </div>

          <div className={`hidden md:flex relative items-center h-6 border ${colors.border} ${theme === "PEPER" ? "bg-white" : ""} pl-2 pr-1 w-32`}>
            <select
              value={dateFont}
              onChange={(e) => setDateFont(e.target.value)}
              className={`text-[10px] w-full font-bold ${controlTextClass} tracking-widest bg-transparent appearance-none outline-none pr-4 cursor-pointer truncate`}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.label} value={f.value} className="bg-slate-900 text-slate-100">
                  {f.label}
                </option>
              ))}
            </select>
            <ChevronDown size={10} className={`absolute right-1 ${colors.textSub} pointer-events-none`} />
          </div>

          {/* THEME TOGGLE (NAME) & PULLDOWN (ARROW) */}
          <div className="relative hidden md:block" ref={themeMenuRef}>
            <div
              className={`flex items-stretch h-6 border ${colors.border} ${theme === "PEPER" ? "bg-white" : colors.panelBg} rounded-[2px] transition-colors`}
            >
              {/* Left Button: Swatch + Theme Name (Click to Toggle) */}
              <button
                type="button"
                onClick={() => {
                  const idx = THEME_OPTIONS.findIndex((t) => t.value === theme);
                  const nextTheme = THEME_OPTIONS[(idx + 1) % THEME_OPTIONS.length].value;
                  setTheme(nextTheme);
                }}
                className={`h-full flex items-center gap-1.5 px-2 cursor-pointer ${theme === "PEPER" ? "hover:bg-slate-50" : colors.accentBgHover} transition-colors select-none`}
                title="クリックで次のテーマへ切り替え (トグル)"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs"
                  style={{
                    backgroundColor:
                      THEME_OPTIONS.find((t) => t.value === theme)?.swatch || "#D95430",
                  }}
                />
                <span
                  className={`text-[10px] font-bold ${controlTextClass} tracking-widest uppercase`}
                >
                  {THEME_OPTIONS.find((t) => t.value === theme)?.label || theme}
                </span>
              </button>

              {/* Right Button: Arrow (Click to Open Dropdown) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsThemeDropdownOpen((prev) => !prev);
                }}
                className={`h-full px-1.5 flex items-center justify-center border-l ${colors.border} ${theme === "PEPER" ? "hover:bg-slate-50" : colors.accentBgHover} cursor-pointer transition-colors`}
                title="テーマ一覧を開く (プルダウン)"
              >
                <span
                  className={`text-[7px] leading-none ${colors.textSub} select-none transition-transform duration-150 inline-block ${
                    isThemeDropdownOpen ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
            </div>

            {/* Dropdown Menu (Exact design from user screenshot) */}
            {isThemeDropdownOpen && (
              <div
                className="absolute top-8 right-0 w-44 bg-white border border-[#73634F]/30 rounded-md shadow-2xl py-1 z-50 text-slate-800"
                style={{
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.15)",
                }}
              >
                {/* Header: 🎨 テーマ切り替え */}
                <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-700 select-none">
                  <span className="text-sm">🎨</span>
                  <span>テーマ切り替え</span>
                </div>

                {/* Theme List */}
                <div className="py-1 flex flex-col">
                  {THEME_OPTIONS.map((t) => {
                    const isSelected = theme === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => {
                          setTheme(t.value);
                          setIsThemeDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 flex items-center justify-between text-left transition-colors cursor-pointer text-xs font-bold ${
                          isSelected
                            ? "bg-[#FCEEEA] text-[#D95430]"
                            : "text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Radio style circle indicator */}
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSelected ? "border-[#D95430]" : "border-slate-500"
                            }`}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: isSelected ? "#D95430" : t.swatch,
                              }}
                            />
                          </div>
                          <span className="tracking-wider">{t.label}</span>
                        </div>

                        {isSelected && (
                          <Check size={14} className="text-[#D95430] stroke-[2.5]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div
            className={`${colors.textSub} text-[10px] uppercase font-bold tracking-widest hidden md:block ml-1`}
          >
            v1.2.1 OS
          </div>
          <button
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className={`w-8 h-8 flex items-center justify-center border ${isThemeMenuOpen ? colors.activeBg : colors.border} ${isThemeMenuOpen ? colors.activeText : theme === "PEPER" ? "bg-white text-[#73634F]" : colors.textSub} ${colors.accentBgHover} transition-colors ml-1`}
          >
            <Settings2 size={16} />
          </button>
        </div>

        {/* SETTINGS POPOVER */}
        {isThemeMenuOpen && (
          <div
            className={`absolute top-12 right-4 w-80 border ${colors.borderStrong} ${colors.panelBg} ${colors.shadowLg} flex flex-col p-4 gap-3 max-h-[calc(100vh-64px)] overflow-y-auto overflow-x-hidden no-scrollbar`}
          >
            {/* TABS */}
            <div className="flex border-b border-black/10 dark:border-white/10 mb-1">
              {(["GENERAL", "EDITOR", "AUDIO"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSettingsTab(tab)}
                  className={`flex-1 py-1.5 text-[10px] font-bold tracking-widest ${
                    settingsTab === tab
                      ? theme === "PEPER"
                        ? "text-[#D95430] border-b-2 border-[#D95430]"
                        : `${colors.activeText} border-b-2 border-current`
                      : `${colors.textSub} opacity-60 hover:opacity-100`
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {settingsTab === "GENERAL" && (
              <div className="flex flex-col gap-3.5 w-full overflow-x-hidden pb-3">
                {/* THEME */}
                <div className="flex flex-col gap-1.5">
                  <div
                    className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between`}
                  >
                    <span>THEME</span>
                    <span className={colors.textMain}>{theme}</span>
                  </div>
                  <div
                    className="grid grid-cols-6 bg-black/10 border border-black/20 p-0.5"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    {THEME_OPTIONS.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        className={`py-1 text-[9px] font-bold font-mono tracking-wider flex items-center justify-center gap-1 ${theme === t.value ? `${colors.activeBg} ${colors.activeText} shadow-sm` : colors.textSub}`}
                        title={t.label}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: t.swatch }}
                        />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SYSTEM FONT */}
                <div className="flex flex-col gap-2">
                  <div
                    className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between`}
                  >
                    <span>SYSTEM FONT</span>
                  </div>
                  <div className="relative group">
                    <select
                      value={systemFont}
                      onChange={(e) => setSystemFont(e.target.value)}
                      className={`w-full appearance-none border ${colors.borderStrong} ${theme === "PEPER" ? "bg-white" : "bg-transparent"} px-3 py-1.5 text-xs font-bold tracking-wider ${colors.textMain} outline-none cursor-pointer hover:border-slate-500 transition-colors uppercase`}
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

                {/* DATE FONT */}
                <div className="flex flex-col gap-2">
                  <div
                    className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between`}
                  >
                    <span>DATE FONT</span>
                  </div>
                  <div className="relative group">
                    <select
                      value={dateFont}
                      onChange={(e) => setDateFont(e.target.value)}
                      className={`w-full appearance-none border ${colors.borderStrong} ${theme === "PEPER" ? "bg-white" : "bg-transparent"} px-3 py-1.5 text-xs font-bold tracking-wider ${colors.textMain} outline-none cursor-pointer hover:border-slate-500 transition-colors uppercase`}
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
                    className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between mt-0.5`}
                  >
                    <span>SIZE</span>
                    <span className={colors.textMain}>{dateSize}PX</span>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="120"
                    step="2"
                    value={dateSize}
                    onChange={(e) => setDateSize(parseInt(e.target.value))}
                    className="square-slider w-full"
                    style={sliderStyle}
                  />
                </div>

                {/* MONTH WATERMARK (SIDEBAR MINI CALENDAR) */}
                <div className="flex flex-col gap-2 pt-2 border-t border-dashed border-zinc-700/40">
                  <div
                    className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between`}
                  >
                    <span>MONTH WATERMARK</span>
                    <div className={`flex border ${theme === "PEPER" ? "border-[#73634F] bg-white" : "border-zinc-700/60"} p-0.5 shrink-0`}>
                      <button
                        onClick={() => setShowMonthWatermark(true)}
                        className={`px-3 py-0.5 text-[9px] font-bold transition-colors ${
                          showMonthWatermark
                            ? `${colors.activeBg} ${colors.activeText}`
                            : `${colors.textSub} ${theme === "PEPER" ? "bg-white" : colors.bgHover}`
                        }`}
                      >
                        ON
                      </button>
                      <button
                        onClick={() => setShowMonthWatermark(false)}
                        className={`px-3 py-0.5 text-[9px] font-bold transition-colors ${
                          !showMonthWatermark
                            ? `${colors.activeBg} ${colors.activeText}`
                            : `${colors.textSub} ${theme === "PEPER" ? "bg-white" : colors.bgHover}`
                        }`}
                      >
                        OFF
                      </button>
                    </div>
                  </div>

                  {showMonthWatermark && (
                    <div className="flex flex-col gap-2 mt-0.5">
                      <div className={`text-[8.5px] font-sans ${colors.textSub} tracking-wider`}>
                        ※ フォントはカレンダー日付フォントと自動連動しています
                      </div>

                      <div
                        className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between`}
                      >
                        <span>SIZE</span>
                        <span className={colors.textMain}>{monthWatermarkSize}PX</span>
                      </div>
                      <input
                        type="range"
                        min="60"
                        max="240"
                        step="2"
                        value={monthWatermarkSize}
                        onChange={(e) => setMonthWatermarkSize(parseInt(e.target.value))}
                        className="square-slider w-full"
                        style={sliderStyle}
                      />

                      <div
                        className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between mt-0.5`}
                      >
                        <span>OPACITY</span>
                        <span className={colors.textMain}>{monthWatermarkOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="3"
                        max="25"
                        step="1"
                        value={monthWatermarkOpacity}
                        onChange={(e) => setMonthWatermarkOpacity(parseInt(e.target.value))}
                        className="square-slider w-full"
                        style={sliderStyle}
                      />
                      <div
                        className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between mt-0.5`}
                      >
                        <span>VERTICAL POSITION</span>
                        <span className={colors.textMain}>
                          {monthWatermarkOffsetY > 0
                            ? `+${monthWatermarkOffsetY}PX`
                            : `${monthWatermarkOffsetY}PX`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-60"
                        max="60"
                        step="1"
                        value={monthWatermarkOffsetY}
                        onChange={(e) =>
                          setMonthWatermarkOffsetY(parseInt(e.target.value))
                        }
                        className="square-slider w-full"
                        style={sliderStyle}
                      />

                      <div className="flex justify-end pt-0.5">
                        <button
                          onClick={() => {
                            setMonthWatermarkSize(180);
                            setMonthWatermarkOpacity(10);
                            setMonthWatermarkOffsetY(-15);
                          }}
                          title="初期値にリセット (SIZE: 180PX, OPACITY: 10%, VERTICAL: -15PX)"
                          className={`text-[8.5px] font-mono font-bold px-2 py-1 border ${colors.borderStrong} ${theme === "PEPER" ? "bg-white text-[#73634F]" : colors.textSub} hover:${colors.textMain} hover:border-slate-400 transition-colors uppercase rounded-[2px] cursor-pointer flex items-center gap-1.5 leading-none shadow-xs`}
                        >
                          <span>⟲</span>
                          <span>RESET TO DEFAULT</span>
                        </button>
                      </div>
                    </div>
                  )}
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
                      className={`w-full appearance-none border ${colors.borderStrong} ${theme === "PEPER" ? "bg-white" : "bg-transparent"} px-3 py-2 text-xs font-bold tracking-wider ${colors.textMain} outline-none cursor-pointer hover:border-slate-500 transition-colors uppercase`}
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
                      className={`w-full appearance-none border ${colors.borderStrong} ${theme === "PEPER" ? "bg-white" : "bg-transparent"} px-3 py-2 text-xs font-bold tracking-wider ${colors.textMain} outline-none cursor-pointer hover:border-slate-500 transition-colors uppercase`}
                    >
                      {availableVoices.length > 0 ? (
                        availableVoices.map((v) => (
                          <option
                            key={v.name}
                            value={v.name}
                            className="bg-slate-900 text-slate-100 py-1"
                          >
                            {v.name}
                          </option>
                        ))
                      ) : (
                        <>
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
                        </>
                      )}
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
            systemFont={systemFont}
            dateFont={dateFont}
            showMonthWatermark={showMonthWatermark}
            monthWatermarkSize={monthWatermarkSize}
            monthWatermarkOpacity={monthWatermarkOpacity}
            monthWatermarkOffsetY={monthWatermarkOffsetY}
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
