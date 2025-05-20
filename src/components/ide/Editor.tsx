import { useState, useCallback, useEffect, useRef } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import { FileType } from '@/lib/types';
import { motion, useDragControls, Reorder } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { PlusIcon, XIcon } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface CodeEditorProps {
  file: FileType | null;
  onContentChange: (content: string) => void;
}

export function CodeEditor({ file, onContentChange }: CodeEditorProps) {
  const [content, setContent] = useState(file?.content || '');

  const handleChange = useCallback((code: string) => {
    setContent(code);
    onContentChange(code);
  }, [onContentChange]);

  const getLanguage = useCallback((fileLanguage: string | undefined) => {
    if (!fileLanguage) return languages.javascript;
    
    switch (fileLanguage) {
      case 'javascript': return languages.javascript;
      case 'typescript': return languages.typescript;
      case 'jsx': return languages.jsx;
      case 'tsx': return languages.tsx;
      case 'css': return languages.css;
      case 'python': return languages.python;
      case 'json': return languages.json;
      case 'markdown': return languages.markdown;
      default: return languages.javascript;
    }
  }, []);

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500">No file selected</p>
          <p className="text-sm text-gray-400 mt-2">Select a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="h-full overflow-auto"
    >
      <div className="p-2 bg-white border-b border-gray-200 flex items-center">
        <div className="text-sm text-gray-700 font-medium">{file.name}</div>
      </div>
      <div className="p-0 h-[calc(100%-40px)] overflow-auto bg-white">
        <Editor
          value={content}
          onValueChange={handleChange}
          highlight={(code) => highlight(code, getLanguage(file.language), file.language || 'javascript')}
          padding={16}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            minHeight: '100%',
          }}
          className="min-h-full focus:outline-none"
        />
      </div>
    </motion.div>
  );
}

interface EditorTabsProps {
  files: FileType[];
  currentFile: FileType | null;
  onFileSelect: (file: FileType) => void;
  onFileClose: (file: FileType) => void;
}

interface EditorTabsProps {
  files: FileType[];
  currentFile: FileType | null;
  onFileSelect: (file: FileType) => void;
  onFileClose: (file: FileType) => void;
  onNewFile?: () => void;
  onReorderFiles?: (files: FileType[]) => void;
  onCloseOthers?: (file: FileType) => void;
  onCloseToTheRight?: (file: FileType) => void;
}

export function EditorTabs({ 
  files, 
  currentFile, 
  onFileSelect, 
  onFileClose, 
  onNewFile,
  onReorderFiles,
  onCloseOthers,
  onCloseToTheRight 
}: EditorTabsProps) {
  const openFiles = files.filter(file => file.type === 'file' && file.isOpen);
  const [isDragging, setIsDragging] = useState(false);
  const controls = useDragControls();
  const tabsRef = useRef<HTMLDivElement>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentFile) return;
      
      // Close current tab with Ctrl+W
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        onFileClose(currentFile);
      }
      
      // Switch tabs with Ctrl+Tab
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = openFiles.findIndex(f => f.id === currentFile.id);
        const nextIndex = (currentIndex + 1) % openFiles.length;
        onFileSelect(openFiles[nextIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFile, openFiles, onFileClose, onFileSelect]);

  const handleDragStart = () => {
    setIsDragging(true);
    document.body.style.cursor = 'grabbing';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    document.body.style.cursor = '';
  };

  const handleReorder = (newOrder: FileType[]) => {
    if (onReorderFiles) {
      onReorderFiles(newOrder);
    }
  };

  if (openFiles.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full bg-gray-100 border-b border-gray-200">
      <Tabs value={currentFile?.id} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-0 h-9">
          <Reorder.Group 
            axis="x" 
            values={openFiles} 
            onReorder={handleReorder}
            className="flex h-full"
            ref={tabsRef}
          >
            {openFiles.map((file) => (
              <ContextMenu key={file.id}>
                <ContextMenuTrigger>
                  <Reorder.Item 
                    value={file}
                    dragListener={false}
                    dragControls={controls}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  >
                    <div 
                      className={cn(
                        "h-full flex items-center px-3 text-xs font-medium text-gray-600",
                        "border-r border-gray-200 hover:bg-gray-50 transition-colors",
                        file.id === currentFile?.id ? "bg-white text-black border-t-2 border-t-black" : ""
                      )}
                      onClick={() => onFileSelect(file)}
                    >
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onFileClose(file);
                        }}
                        className="ml-2 p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700"
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </Reorder.Item>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48">
                  <ContextMenuItem onClick={() => onFileClose(file)}>
                    Close
                  </ContextMenuItem>
                  {onCloseOthers && (
                    <ContextMenuItem onClick={() => onCloseOthers(file)}>
                      Close Others
                    </ContextMenuItem>
                  )}
                  {onCloseToTheRight && (
                    <ContextMenuItem onClick={() => onCloseToTheRight(file)}>
                      Close to the Right
                    </ContextMenuItem>
                  )}
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </Reorder.Group>
          
          {onNewFile && (
            <button
              onClick={onNewFile}
              className="h-full px-3 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              title="New File"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          )}
        </TabsList>
      </Tabs>
    </div>
  );
}