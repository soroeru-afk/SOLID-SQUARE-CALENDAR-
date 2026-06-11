"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { LogFile } from "@/lib/fs";
import { motion, AnimatePresence } from "motion/react";
import { Theme, getThemeColors } from "@/lib/theme";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Square,
} from "lucide-react";

export function EditorModal({
  log,
  onClose,
  onSave,
  isFallbackMode,
  theme,
  textSize,
  setEditorTextSize,
  textFont,
  editorMaxWidth = 760,
  setEditorMaxWidth,
  editorLineHeight = 1.75,
  setEditorLineHeight,
  speechVoice = "Ichiro",
  speechRate = 2.0,
  speechVolume = 1.0,
  speechPitch = 1.0,
          onNavigate,
  hasPrev,
  hasNext,
}: any) {
  const [content, setContent] = useState(log.content || "");
  
  useEffect(() => {
    setContent(log.content || "");
    setIsEditing(log.isNew || false);
  }, [log]);

  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">(
    "left",
  );
  const [isVertical, setIsVertical] = useState(() => localStorage.getItem("solid-square-is-vertical") === "true");
  const [isPaperMode, setIsPaperMode] = useState(() => localStorage.getItem("solid-square-is-paper") === "true");
  
  useEffect(() => {
    localStorage.setItem("solid-square-is-vertical", String(isVertical));
  }, [isVertical]);
  
  useEffect(() => {
    localStorage.setItem("solid-square-is-paper", String(isPaperMode));
  }, [isPaperMode]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(log.isNew || false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<number | null>(null);

  const startScroll = (direction: -1 | 1) => {
    if (!textareaRef.current) return;
    const scrollStep = () => {
      if (textareaRef.current) {
        textareaRef.current.scrollBy({ left: direction * 10 });
      }
      scrollRef.current = requestAnimationFrame(scrollStep);
    };
    scrollStep();
  };

  const stopScroll = () => {
    if (scrollRef.current !== null) {
      cancelAnimationFrame(scrollRef.current);
      scrollRef.current = null;
    }
  };

  // Speech Synthesis
  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice =
      voices.find((v) => v.name.includes(speechVoice)) ||
      voices.find((v) => v.lang.includes("ja-JP"));

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = speechRate;
    utterance.volume = speechVolume;
    utterance.pitch = speechPitch;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const toggleSpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      speakText(content);
    }
  };

  const handleTextareaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (isEditing) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const textarea = e.currentTarget;
      const clickPos = textarea.selectionStart;
      if (typeof clickPos === "number") {
        let textToRead = content.substring(clickPos);
        if (!textToRead.trim()) {
          textToRead = content;
        }
        speakText(textToRead);
      }
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Handle vertical scroll with mouse wheel
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleWheel = (e: WheelEvent) => {
      if (isVertical && e.deltaY !== 0) {
        e.preventDefault();
        // Since vertical-rl flow relies on horizontal scrolling, map deltaY to scrollLeft.
        // Scroll amount is adjusted for typical mouse wheel feel (reversed per user request)
        textarea.scrollLeft -= e.deltaY;
      }
    };

    textarea.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      textarea.removeEventListener("wheel", handleWheel);
    };
  }, [isVertical]);

  // タイトルを動的に生成
  const displayTitle = (() => {
    const contentToSearch = content.trim();
    if (!contentToSearch) return "UNTITLED";
    // 改行、または日本語の句点、感嘆符、疑問符、あるいは英語の末尾記号（.+スペース）で句切る。
    const match = contentToSearch.match(
      /^[\s\S]*?(?:[。！？\n]|[.!?](?:\s|$))/,
    );
    if (match) {
      return match[0].trim();
    } else {
      return contentToSearch.trim();
    }
  })();

  const colors = getThemeColors(theme as Theme);
  const isPaperActive = isPaperMode;
  const panelBgClass = isPaperActive ? "bg-[#FAF6F0]" : colors.panelBg;
  const textMainClass = isPaperActive ? "text-[#181818]" : colors.textMain;
  const textDimClass = isPaperActive ? "text-black/30" : colors.textDim;

  // Focus on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSave = useCallback(() => {
    onSave(log, content);
  }, [onSave, log, content]);

  const increaseTextSize = () => {
    if (setEditorTextSize) setEditorTextSize(Math.min(textSize + 2, 72));
  };

  const decreaseTextSize = () => {
    if (setEditorTextSize) setEditorTextSize(Math.max(textSize - 2, 8));
  };

  // Handle Ctrl+S and Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        onClose();
      }
      
      // j and k navigation when not editing text
      if (!isEditing && e.target instanceof HTMLElement) {
         const tagName = e.target.tagName.toLowerCase();
         if (tagName !== "textarea" && tagName !== "input") {
            if (e.key === "k" && hasPrev && onNavigate) {
               e.preventDefault();
               onNavigate('PREV');
            }
            if (e.key === "j" && hasNext && onNavigate) {
               e.preventDefault();
               onNavigate('NEXT');
            }
         }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [content, log, handleSave, onClose, isEditing, hasPrev, hasNext, onNavigate]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-12"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        ></div>

        {/* Editor Wrapper (Theme Design) */}
        <div
          className={`relative w-full h-[95vh] max-w-6xl flex flex-col ${colors.panelBg} ${colors.shadowLg} overflow-hidden rounded-md`}
        >
          {/* Editor Header (Stealth UI) */}
          <div
            className={`relative flex-none flex flex-col px-6 pt-6 pb-4 ${colors.panelBg} shrink-0 border-b border-black/5 dark:border-white/5`}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              title="閉じる"
              className={`absolute top-3 right-3 z-50 ${colors.borderStrong} border px-1.5 py-0.5 rounded-sm ${colors.textSubHover} transition-colors flex items-center justify-center cursor-pointer`}
            >
              <X size={12} strokeWidth={2.5} />
            </button>

            {/* Title Display */}
            <div className="mb-4 pr-10 mt-1">
              <div
                className={`font-bold ${colors.textMain} whitespace-pre-wrap break-all`}
                style={{
                  fontSize: `${Math.max(18, textSize * 1.2)}px`,
                  fontFamily: textFont,
                  lineHeight: 1.4,
                  minHeight: "2.8em",
                }}
              >
                {displayTitle}
              </div>
              <div
                className={`text-[10px] ${colors.textSub} mt-2 opacity-40 truncate`}
              >
                {log.name}
              </div>
            </div>

            {/* Toolbar */}
            <div
              className={`flex items-center justify-between gap-x-4 gap-y-3 w-full text-[10px] uppercase tracking-wider ${colors.textSub} font-bold select-none flex-wrap overflow-x-auto no-scrollbar`}
            >
              <div className="flex items-center gap-3 flex-wrap">
                {/* Text Size Controls */}
                {setEditorTextSize && (
                  <div
                    className={`flex items-center gap-2 ${colors.borderStrong} border px-2 py-0.5 rounded-sm`}
                  >
                  <button
                    onClick={decreaseTextSize}
                    title="文字を小さく"
                    className={`${colors.textSubHover} hover:opacity-100 transition-colors px-1 font-mono`}
                  >
                    -
                  </button>
                  <span
                    className="font-mono w-[16px] text-center"
                    title="現在の文字サイズ"
                  >
                    {textSize}
                  </span>
                  <button
                    onClick={increaseTextSize}
                    title="文字を大きく"
                    className={`${colors.textSubHover} hover:opacity-100 transition-colors px-1 font-mono`}
                  >
                    +
                  </button>
                </div>
              )}

              {/* Layout Controls */}
              <div className="flex items-center gap-2">
                {setEditorMaxWidth && (
                  <div
                    className={`flex items-center gap-2 ${colors.borderStrong} border px-2 py-0.5 rounded-sm`}
                    title="幅"
                  >
                    <span className="opacity-50">W:</span>
                    <button
                      onClick={() =>
                        setEditorMaxWidth(Math.max(400, editorMaxWidth - 40))
                      }
                      className={`${colors.textSubHover} hover:opacity-100 transition-colors px-1 font-mono`}
                    >
                      -
                    </button>
                    <span className="font-mono w-[28px] text-center">
                      {editorMaxWidth}
                    </span>
                    <button
                      onClick={() =>
                        setEditorMaxWidth(Math.min(1600, editorMaxWidth + 40))
                      }
                      className={`${colors.textSubHover} hover:opacity-100 transition-colors px-1 font-mono`}
                    >
                      +
                    </button>
                  </div>
                )}

                {setEditorLineHeight && (
                  <div
                    className={`flex items-center gap-2 ${colors.borderStrong} border px-2 py-0.5 rounded-sm`}
                    title="行間"
                  >
                    <span className="opacity-50">LH:</span>
                    <button
                      onClick={() =>
                        setEditorLineHeight(
                          Math.max(
                            1,
                            Number((editorLineHeight - 0.1).toFixed(1)),
                          ),
                        )
                      }
                      className={`${colors.textSubHover} hover:opacity-100 transition-colors px-1 font-mono`}
                    >
                      -
                    </button>
                    <span className="font-mono w-[20px] text-center">
                      {editorLineHeight.toFixed(1)}
                    </span>
                    <button
                      onClick={() =>
                        setEditorLineHeight(
                          Math.min(
                            4,
                            Number((editorLineHeight + 0.1).toFixed(1)),
                          ),
                        )
                      }
                      className={`${colors.textSubHover} hover:opacity-100 transition-colors px-1 font-mono`}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap ml-auto">
                {/* Align Group */}
                <div className="flex items-center gap-4">
                <button
                  onClick={() => setTextAlign("left")}
                  title="左寄せ"
                  className={`${colors.textSubHover} transition-colors ${textAlign === "left" ? colors.textMain : ""}`}
                >
                  <AlignLeft size={14} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => setTextAlign("center")}
                  title="中央寄せ"
                  className={`${colors.textSubHover} transition-colors ${textAlign === "center" ? colors.textMain : ""}`}
                >
                  <AlignCenter size={14} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => setTextAlign("right")}
                  title="右寄せ"
                  className={`${colors.textSubHover} transition-colors ${textAlign === "right" ? colors.textMain : ""}`}
                >
                  <AlignRight size={14} strokeWidth={2.5} />
                </button>
              </div>

              <div className={`w-[1px] h-3 ${colors.borderStrong}`}></div>

              {/* Direction Group */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsVertical(false)}
                  title="横書き"
                  className={`${colors.textSubHover} transition-colors ${!isVertical ? colors.textMain : ""}`}
                >
                  HORIZ
                </button>
                <button
                  onClick={() => setIsVertical(true)}
                  title="縦書き"
                  className={`${colors.textSubHover} transition-colors ${isVertical ? colors.textMain : ""}`}
                >
                  VERT
                </button>
              </div>

              <div className={`w-[1px] h-3 ${colors.borderStrong}`}></div>
              <button
                onClick={() => setIsPaperMode(!isPaperMode)}
                title="ペーパーモード"
                className={`${colors.textSubHover} transition-colors ${isPaperMode ? colors.textMain : ""}`}
              >
                PAPER / {isPaperMode ? "ON" : "OFF"}
              </button>

              <div className={`w-[1px] h-3 ${colors.borderStrong}`}></div>

              {/* Play Button */}
              <button
                onClick={toggleSpeech}
                className={`flex items-center gap-2 ${colors.borderStrong} border px-3 py-0.5 rounded-sm ${isPlaying ? colors.activeText : ""} ${colors.bgHover} transition-colors`}
                title={isPlaying ? "STOP" : "VOICE"}
              >
                {isPlaying ? (
                  <Square size={12} fill="currentColor" />
                ) : (
                  <Play size={12} fill="currentColor" />
                )}
                <span>VOICE</span>
              </button>

              {/* Edit Toggle */}
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                  if (!isEditing) {
                    setTimeout(() => textareaRef.current?.focus(), 0);
                  }
                }}
                title={isEditing ? "編集モードを終了" : "編集モードにする"}
                className={`${colors.borderStrong} border px-3 py-0.5 rounded-sm flex items-center transition-colors ${isEditing ? colors.activeText + " " + colors.activeBg : colors.textSubHover}`}
              >
                EDIT
              </button>

              {/* Save Button */}
              <button
                onClick={handleSave}
                title="保存 (Ctrl+S)"
                className={`${colors.borderStrong} border px-3 py-0.5 rounded-sm ${colors.textSubHover} transition-colors flex items-center gap-1`}
              >
                <span className="opacity-50">[CTRL+S]</span> SAVE
              </button>

              <div className={`w-[1px] h-3 ${colors.borderStrong}`}></div>

              {/* Navigation Group */}
              {onNavigate && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => hasPrev && onNavigate('PREV')}
                    disabled={!hasPrev}
                    title="新しく古いファイルへ"
                    className={`${colors.borderStrong} border px-3 py-0.5 rounded-sm flex items-center transition-colors ${hasPrev ? colors.textSubHover : "opacity-30 cursor-not-allowed"}`}
                  >
                    PREV
                  </button>
                  <button
                    onClick={() => hasNext && onNavigate('NEXT')}
                    disabled={!hasNext}
                    title="古いファイルへ"
                    className={`${colors.borderStrong} border px-3 py-0.5 rounded-sm flex items-center transition-colors ${hasNext ? colors.textSubHover : "opacity-30 cursor-not-allowed"}`}
                  >
                    NEXT
                  </button>
                </div>
              )}
              </div>

            </div>
          </div>

          {/* Editor Body */}
          <div
            className={`flex-1 w-full flex justify-center py-8 px-6 ${panelBgClass} overflow-hidden group relative`}
          >
            {isVertical && (
              <>
                <button
                  onMouseDown={() => startScroll(-1)}
                  onMouseUp={stopScroll}
                  onMouseLeave={stopScroll}
                  onTouchStart={() => startScroll(-1)}
                  onTouchEnd={stopScroll}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full ${colors.borderStrong} border bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center`}
                  style={{ zIndex: 20 }}
                  title="左へスクロール"
                >
                  <ChevronLeft size={32} className={textMainClass} />
                </button>
                <button
                  onMouseDown={() => startScroll(1)}
                  onMouseUp={stopScroll}
                  onMouseLeave={stopScroll}
                  onTouchStart={() => startScroll(1)}
                  onTouchEnd={stopScroll}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full ${colors.borderStrong} border bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center`}
                  style={{ zIndex: 20 }}
                  title="右へスクロール"
                >
                  <ChevronRight size={32} className={textMainClass} />
                </button>
              </>
            )}

            <div
              className={`w-full h-full relative transition-all`}
              style={{ maxWidth: `${editorMaxWidth}px` }}
            >
              {content === "" && (
                <div
                  className={`absolute top-0 left-0 ${textDimClass} font-bold pointer-events-none whitespace-pre-wrap select-none w-full`}
                  style={{
                    textAlign,
                    fontSize: `${textSize}px`,
                    fontFamily: textFont,
                    writingMode: isVertical ? "vertical-rl" : "horizontal-tb",
                  }}
                >
                  Type your text here...
                </div>
              )}
              <textarea
                ref={textareaRef}
                value={content}
                readOnly={!isEditing}
                onChange={(e) => setContent(e.target.value)}
                onClick={handleTextareaClick}
                className={`w-full h-full bg-transparent resize-none outline-none ${textMainClass} no-scrollbar relative z-10 font-sans ${!isEditing ? "selection:bg-black/10 dark:selection:bg-white/10" : ""}`}
                style={{
                  textAlign,
                  writingMode: isVertical ? "vertical-rl" : "horizontal-tb",
                  fontSize: `${textSize}px`,
                  fontFamily: textFont,
                  lineHeight: Number(editorLineHeight),
                }}
                spellCheck={false}
              />
            </div>
          </div>

          {/* Footer Line */}
          <div
            className={`flex-none p-6 flex flex-col items-center justify-center text-[9px] ${colors.textDim} tracking-widest uppercase ${colors.panelBg}`}
          >
            <div>{content.length} CHARS</div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
