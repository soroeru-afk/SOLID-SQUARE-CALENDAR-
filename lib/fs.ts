export interface LogFile {
  handle: any;
  name: string;
  dateStr: string;   // YYYYMMDD
  timeStr: string;   // HHMM
  title: string;
  content?: string;
  isFallback?: boolean;
  fallbackFile?: File;
  isDrive?: boolean;
  isNew?: boolean;
  dateObj?: Date;
}

export async function parseFallbackFiles(files: File[]): Promise<LogFile[]> {
  const logFiles: LogFile[] = [];
  for (const file of files) {
    if (file.name.endsWith('.txt')) {
      const match = file.name.match(/^(\d{8})_(\d{4})_(.+)\.txt$/);
      if (match) {
        const content = await file.text();
        logFiles.push({
          handle: null,
          name: file.name,
          dateStr: match[1],
          timeStr: match[2],
          title: match[3],
          isFallback: true,
          content: content // eagerly loaded for caching
        });
      }
    }
  }
  return logFiles.sort((a, b) => b.name.localeCompare(a.name));
}

export async function pickDirectory(): Promise<any | null> {
  try {
    return await (window as any).showDirectoryPicker({ mode: 'readwrite' });
  } catch (e: any) {
    if (e.name === 'AbortError') {
      return null; // User cancelled
    }
    // Do not use console.error here to avoid triggering auto-error reporters in iframes
    throw e;
  }
}

export async function readLogFiles(dirHandle: any): Promise<LogFile[]> {
  const files: LogFile[] = [];
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file' && entry.name.endsWith('.txt')) {
      const match = entry.name.match(/^(\d{8})_(\d{4})_(.+)\.txt$/);
      if (match) {
        try {
          const fileData = await entry.getFile();
          const content = await fileData.text();
          files.push({
            handle: entry,
            name: entry.name,
            dateStr: match[1],
            timeStr: match[2],
            title: match[3],
            content: content
          });
        } catch (e) {
          console.error("Failed to read file part of logs", e);
        }
      }
    }
  }
  return files.sort((a, b) => b.name.localeCompare(a.name)); // Sort descending
}

export async function readFileContent(handle: any, fallbackFile?: File): Promise<string> {
  if (fallbackFile) {
    return await fallbackFile.text();
  }
  const file = await handle.getFile();
  return await file.text();
}

export async function writeFileContent(handle: any, content: string): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
}

export async function createNewLogFile(dirHandle: any, date: Date, title: string): Promise<LogFile> {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  const MM = String(date.getMinutes()).padStart(2, '0');
  const safeTitle = title.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'UNTITLED';
  const fileName = `${yyyy}${mm}${dd}_${HH}${MM}_${safeTitle}.txt`;
  
  const handle = await dirHandle.getFileHandle(fileName, { create: true });
  return {
    handle,
    name: fileName,
    dateStr: `${yyyy}${mm}${dd}`,
    timeStr: `${HH}${MM}`,
    title: safeTitle,
  };
}
