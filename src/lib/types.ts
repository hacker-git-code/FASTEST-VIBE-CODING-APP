export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export interface FileType {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: FileType[];
  isOpen?: boolean;
}

export interface EditorState {
  currentFile: FileType | null;
  files: FileType[];
  isDirty: boolean;
}

export interface TerminalCommand {
  id: string;
  command: string;
  output: string;
  timestamp: Date;
  status: 'success' | 'error' | 'info';
}

export interface TerminalState {
  commands: TerminalCommand[];
  history: string[];
  historyIndex: number;
}

export interface CommandItem {
  id: string;
  name: string;
  shortcut?: string;
  section?: string;
  action: () => void;
}

export interface Theme {
  name: string;
  editorBackground: string;
  editorForeground: string;
  sidebarBackground: string;
  terminalBackground: string;
}