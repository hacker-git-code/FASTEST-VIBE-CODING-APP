import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FileType, TerminalState } from '@/lib/types';
import { createNewFile, createTerminalCommand } from '@/lib/utils';
import { EditorTabs } from './Editor';
import { ErrorBoundary } from '../ErrorBoundary';

// Import styles
import '@/styles/ide.css';

// Helper functions
function findFileById(files: FileType[], id: string): FileType | null {
  for (const file of files) {
    if (file.id === id) return file;
    if (file.type === 'folder' && file.children) {
      const found = findFileById(file.children, id);
      if (found) return found;
    }
  }
  return null;
}

function getAllFilesFlat(files: FileType[]): FileType[] {
  let result: FileType[] = [];
  for (const file of files) {
    result.push(file);
    if (file.type === 'folder' && file.children) {
      result = result.concat(getAllFilesFlat(file.children));
    }
  }
  return result;
}

function cloneFiles(files: FileType[]): FileType[] {
  return JSON.parse(JSON.stringify(files));
}

// Main IDE component
export default function IDE() {
  // State
  const [files, setFiles] = useState<FileType[]>([]);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [terminalState, setTerminalState] = useState<TerminalState>({
    commands: [],
    history: [],
    historyIndex: -1
  });
  
  const currentFile = currentFileId ? findFileById(files, currentFileId) : null;
  const openFiles = getAllFilesFlat(files).filter(
    (f): f is FileType & { type: 'file'; isOpen: true } => 
      f.type === 'file' && !!f.isOpen
  );

  // Handle file selection
  const handleFileSelect = useCallback((file: FileType) => {
    setCurrentFileId(file.id);
    
    if (!file.isOpen) {
      const newFiles = cloneFiles(files);
      const fileToUpdate = findFileById(newFiles, file.id);
      if (fileToUpdate) {
        fileToUpdate.isOpen = true;
        setFiles(newFiles);
      }
    }
  }, [files]);
  
  // Handle file close
  const handleFileClose = useCallback((file: FileType) => {
    const newFiles = cloneFiles(files);
    const fileToUpdate = findFileById(newFiles, file.id);
    
    if (fileToUpdate) {
      fileToUpdate.isOpen = false;
      
      if (file.id === currentFileId) {
        const remainingOpenFiles = getAllFilesFlat(newFiles)
          .filter((f): f is FileType & { type: 'file'; isOpen: true } => 
            f.type === 'file' && !!f.isOpen && f.id !== file.id
          );
          
        setCurrentFileId(remainingOpenFiles[0]?.id ?? null);
      }
      
      setFiles(newFiles);
    }
  }, [files, currentFileId]);
  
  // Close all tabs except the current one
  const handleCloseOtherTabs = useCallback((file: FileType) => {
    const newFiles = cloneFiles(files);
    const allFiles = getAllFilesFlat(newFiles);
    
    allFiles.forEach(f => {
      if (f.type === 'file' && f.isOpen && f.id !== file.id) {
        f.isOpen = false;
      }
    });
    
    setCurrentFileId(file.id);
    setFiles(newFiles);
  }, [files]);
  
  // Close tabs to the right of the current tab
  const handleCloseTabsToTheRight = useCallback((file: FileType) => {
    const newFiles = cloneFiles(files);
    const allFiles = getAllFilesFlat(newFiles);
    const openFiles = allFiles.filter(
      (f): f is FileType & { type: 'file'; isOpen: true } => 
        f.type === 'file' && !!f.isOpen
    );
    
    const currentIndex = openFiles.findIndex(f => f.id === file.id);
    
    if (currentIndex >= 0) {
      for (let i = currentIndex + 1; i < openFiles.length; i++) {
        const fileToClose = findFileById(newFiles, openFiles[i].id);
        if (fileToClose) {
          fileToClose.isOpen = false;
        }
      }
      
      setFiles(newFiles);
    }
  }, [files]);
  
  // Reorder tabs
  const handleReorderTabs = useCallback((newOrder: FileType[]) => {
    const currentOrder = getAllFilesFlat(files)
      .filter((f): f is FileType & { type: 'file'; isOpen: true } => 
        f.type === 'file' && !!f.isOpen
      );
    
    if (newOrder.length !== currentOrder.length || 
        newOrder.some((file, i) => file.id !== currentOrder[i]?.id)) {
      // Just clone and update to trigger re-render
      const newFiles = cloneFiles(files);
      setFiles(newFiles);
    }
  }, [files]);
  
  // Create a new file
  const handleNewFile = useCallback(() => {
    const parentFolder = files[0];
    if (parentFolder && parentFolder.type === 'folder') {
      const newFile = createNewFile('NewFile.js', 'javascript');
      const newFiles = cloneFiles(files);
      
      if (parentFolder.children) {
        parentFolder.children.push(newFile);
      } else {
        parentFolder.children = [newFile];
      }
      
      setFiles(newFiles);
      setCurrentFileId(newFile.id);
    }
  }, [files]);

  // Handle file content change
  const handleFileContentChange = useCallback((content: string) => {
    if (currentFileId) {
      setFiles(prevFiles => {
        const newFiles = cloneFiles(prevFiles);
        const fileToUpdate = findFileById(newFiles, currentFileId);
        if (fileToUpdate) {
          fileToUpdate.content = content;
        }
        return newFiles;
      });
    }
  }, [currentFileId]);

  // Initialize with sample files
  useEffect(() => {
    // Initial project structure
    const initialFiles: FileType[] = [
      {
        id: uuidv4(),
        name: 'Project',
        type: 'folder',
        isOpen: true,
        children: [
          {
            id: uuidv4(),
            name: 'src',
            type: 'folder',
            isOpen: true,
            children: [
              {
                id: uuidv4(),
                name: 'App.tsx',
                type: 'file',
                content: `import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>Welcome to VibeCode IDE</h1>
      <p>Start editing to see changes</p>
    </div>
  );
}

export default App;`,
                language: 'tsx',
                isOpen: true
              }
            ]
          }
        ]
      }
    ];

    const initialTerminalState: TerminalState = {
      commands: [
        createTerminalCommand('ls -la', 'total 8\ndrwxr-xr-x 2 user user 4096 Jun 10 10:30 .\ndrwxr-xr-x 4 user user 4096 Jun 10 10:30 ..\n-rw-r--r-- 1 user user  948 Jun 10 10:30 package.json\n-rw-r--r-- 1 user user  214 Jun 10 10:30 README.md\ndrwxr-xr-x 2 user user 4096 Jun 10 10:30 src'),
      ],
      history: ['ls -la'],
      historyIndex: -1
    };

    setFiles(initialFiles);
    setCurrentFileId(initialFiles[0]?.children?.[0]?.children?.[0]?.id ?? null);
    setTerminalState(initialTerminalState);
  }, []);

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close tab with Ctrl+W
      if (e.ctrlKey && e.key === 'w' && currentFile) {
        e.preventDefault();
        handleFileClose(currentFile);
      }
      
      // Cycle through tabs with Ctrl+Tab
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        if (openFiles.length > 1) {
          const currentIndex = openFiles.findIndex(f => f.id === currentFileId);
          const nextIndex = (currentIndex + 1) % openFiles.length;
          setCurrentFileId(openFiles[nextIndex].id);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFile, currentFileId, openFiles, handleFileClose]);

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Editor Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <EditorTabs
            files={openFiles}
            currentFile={currentFile}
            onFileSelect={handleFileSelect}
            onFileClose={handleFileClose}
            onNewFile={handleNewFile}
            onReorderFiles={handleReorderTabs}
            onCloseOthers={handleCloseOtherTabs}
            onCloseToTheRight={handleCloseTabsToTheRight}
          />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Explorer */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
            {/* File explorer content will go here */}
          </div>
          
          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            {currentFile ? (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-auto p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {currentFile.content}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a file to start editing
              </div>
            )}
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="h-6 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 px-2 flex items-center">
          {currentFile && (
            <span>
              {currentFile.name} • Line {1}, Column {1}
            </span>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
