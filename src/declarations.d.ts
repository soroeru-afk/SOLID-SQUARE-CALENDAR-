declare module "japanese-holidays" {
  export function isHoliday(date: Date): string | undefined;
  export function getHolidaysOf(year: number): Array<{ month: number; date: number; name: string }>;
}

interface Window {
  showDirectoryPicker(options?: any): Promise<any>;
  showSaveFilePicker(options?: any): Promise<any>;
  showOpenFilePicker(options?: any): Promise<any>;
}
