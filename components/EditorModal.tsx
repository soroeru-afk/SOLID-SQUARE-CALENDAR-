'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { LogFile } from '@/lib/fs';
import { motion, AnimatePresence } from 'motion/react';
import { Theme, getThemeColors } from '@/lib/theme';
import { AlignLeft, AlignCenter, AlignRight, X } from 'lucide-react';

export function EditorModal({ log, onClose, onSave, isFallbackMode, theme, textSize, setEditorTextSize, textFont }: any) {
  const [content, setContent] = useState(log.content || '');
  const [textAlign, setTextAlign] = useState<'left'|'center'|'right'>('left');
  const [isVertical, setIsVertical] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const colors = getThemeColors(theme as Theme);

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

  // Handle Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, log, handleSave, onClose]);

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
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>

        {/* Editor Wrapper (Theme Design) */}
        <div className={`relative w-full h-[95vh] max-w-6xl flex flex-col ${colors.panelBg} ${colors.shadowLg} overflow-hidden rounded-md`}>
          
          {/* Editor Header (Stealth UI) */}
          <div className={`flex-none flex items-center justify-between p-6 ${colors.panelBg} shrink-0`}>
            <div className={`text-[10px] ${colors.textSub} px-2 truncate max-w-xs flex items-center gap-4`}>
              <span>{log.name}</span>
            </div>
            
            <div className={`flex items-center gap-6 text-[10px] uppercase tracking-wider ${colors.textSub} font-bold select-none`}>
              {/* Text Size Controls */}
              {setEditorTextSize && (
                <div className={`flex items-center gap-2 ${colors.borderStrong} border px-2 py-0.5 rounded-sm mr-2`}>
                  <button onClick={decreaseTextSize} title="文字を小さく" className={`${colors.textSubHover} hover:opacity-100 transition-colors px-1 font-mono`}>-</button>
                  <span className="font-mono w-[16px] text-center" title="現在の文字サイズ">{textSize}</span>
                  <button onClick={increaseTextSize} title="文字を大きく" className={`${colors.textSubHover} hover:opacity-100 transition-colors px-1 font-mono`}>+</button>
                </div>
              )}

              {/* Align Group */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setTextAlign('left')}
                  title="左寄せ"
                  className={`${colors.textSubHover} transition-colors ${textAlign === 'left' ? colors.textMain : ''}`}>
                  <AlignLeft size={14} strokeWidth={2.5} />
                </button>
                <button 
                  onClick={() => setTextAlign('center')}
                  title="中央寄せ"
                  className={`${colors.textSubHover} transition-colors ${textAlign === 'center' ? colors.textMain : ''}`}>
                  <AlignCenter size={14} strokeWidth={2.5} />
                </button>
                <button 
                  onClick={() => setTextAlign('right')}
                  title="右寄せ"
                  className={`${colors.textSubHover} transition-colors ${textAlign === 'right' ? colors.textMain : ''}`}>
                  <AlignRight size={14} strokeWidth={2.5} />
                </button>
              </div>

              <div className={`w-[1px] h-3 ${colors.borderStrong}`}></div>

              {/* Direction Group */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsVertical(false)}
                  title="横書き"
                  className={`${colors.textSubHover} transition-colors ${!isVertical ? colors.textMain : ''}`}>
                  HORIZ
                </button>
                <button 
                  onClick={() => setIsVertical(true)}
                  title="縦書き"
                  className={`${colors.textSubHover} transition-colors ${isVertical ? colors.textMain : ''}`}>
                  VERT
                </button>
              </div>

              <div className={`w-[1px] h-3 ${colors.borderStrong}`}></div>

              <button 
                onClick={handleSave}
                title="保存 (Ctrl+S)"
                className={`${colors.textSubHover} transition-colors flex items-center gap-1`}
              >
                <span className="opacity-50">[CTRL+S]</span> SAVE
              </button>
              <button 
                onClick={onClose}
                title="閉じる"
                className={`${colors.textSubHover} transition-colors opacity-60 flex items-center`}>
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Editor Body */}
          <div className={`flex-1 w-full flex justify-center py-8 px-6 ${colors.panelBg} overflow-hidden`}>
            <div className="w-full max-w-[760px] h-full relative">
              {content === '' && (
                <div 
                  className={`absolute top-0 left-0 ${colors.textDim} font-bold pointer-events-none whitespace-pre-wrap select-none w-full`} 
                  style={{ textAlign, fontSize: `${textSize}px`, fontFamily: textFont }}
                >
                  {log.title}
                </div>
              )}
              <textarea 
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`w-full h-full bg-transparent resize-none outline-none ${colors.textMain} no-scrollbar relative z-10 leading-[1.75] font-sans`}
                style={{
                  textAlign,
                  writingMode: isVertical ? 'vertical-rl' : 'horizontal-tb',
                  fontSize: `${textSize}px`,
                  fontFamily: textFont
                }}
                spellCheck={false}
              />
            </div>
          </div>

          {/* Footer Line */}
          <div className={`flex-none p-6 flex flex-col items-center justify-center text-[9px] ${colors.textDim} tracking-widest uppercase ${colors.panelBg}`}>
            <div>{content.length} CHARS</div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
