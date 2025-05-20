import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';
import { FileType, TerminalCommand } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createNewFile(name: string, language: string = 'javascript'): FileType {
  return {
    id: uuidv4(),
    name,
    type: 'file',
    content: '',
    language
  };
}

export function createNewFolder(name: string): FileType {
  return {
    id: uuidv4(),
    name,
    type: 'folder',
    children: []
  };
}

export function createTerminalCommand(
  command: string, 
  output: string = '', 
  status: 'success' | 'error' | 'info' = 'success'
): TerminalCommand {
  return {
    id: uuidv4(),
    command,
    output,
    timestamp: new Date(),
    status
  };
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

export function getLanguageFromFilename(filename: string): string {
  const extension = getFileExtension(filename).toLowerCase();
  
  const extensionMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'md': 'markdown',
    'py': 'python',
    'rb': 'ruby',
    'go': 'go',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'sh': 'bash',
  };
  
  return extensionMap[extension] || 'text';
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}