import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FileType } from '@/lib/types';
import { FolderIcon, FileIcon, ChevronDownIcon, ChevronRightIcon, PlusIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FileExplorerItemProps {
  item: FileType;
  level: number;
  onItemClick: (item: FileType) => void;
  onItemToggle: (item: FileType) => void;
  onContextMenu: (item: FileType, action: 'rename' | 'delete') => void;
  currentFile: FileType | null;
}

function FileExplorerItem({ 
  item, 
  level, 
  onItemClick, 
  onItemToggle, 
  onContextMenu,
  currentFile 
}: FileExplorerItemProps) {
  const isActive = currentFile?.id === item.id;
  const isFolder = item.type === 'folder';
  
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="group">
          <div 
            onClick={() => isFolder ? onItemToggle(item) : onItemClick(item)}
            className={cn(
              'flex items-center py-1 px-2 text-sm cursor-pointer hover:bg-gray-200 rounded',
              isActive && 'bg-gray-200',
              'transition-colors duration-150'
            )}
            style={{ paddingLeft: `${(level + 1) * 12}px` }}
          >
            <div className="mr-1.5">
              {isFolder ? (
                item.isOpen ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />
              ) : (
                <FileIcon size={14} />
              )}
            </div>
            <span className={cn('truncate', isActive && 'font-medium')}>{item.name}</span>
          </div>
          
          {isFolder && item.isOpen && item.children && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {item.children.map(child => (
                  <FileExplorerItem
                    key={child.id}
                    item={child}
                    level={level + 1}
                    onItemClick={onItemClick}
                    onItemToggle={onItemToggle}
                    onContextMenu={onContextMenu}
                    currentFile={currentFile}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </ContextMenuTrigger>
      
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onContextMenu(item, 'rename')}>
          Rename
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onContextMenu(item, 'delete')}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

interface FileExplorerProps {
  files: FileType[];
  currentFile: FileType | null;
  onFileSelect: (file: FileType) => void;
  onFileToggle: (file: FileType) => void;
  onFileAdd: (name: string, type: 'file' | 'folder') => void;
  onFileRename: (file: FileType, newName: string) => void;
  onFileDelete: (file: FileType) => void;
}

export function FileExplorer({ 
  files, 
  currentFile, 
  onFileSelect, 
  onFileToggle,
  onFileAdd,
  onFileRename,
  onFileDelete
}: FileExplorerProps) {
  const [contextFile, setContextFile] = useState<FileType | null>(null);
  const [contextAction, setContextAction] = useState<'rename' | 'delete' | null>(null);
  const [newName, setNewName] = useState('');
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFileType, setNewFileType] = useState<'file' | 'folder'>('file');
  const [newFileName, setNewFileName] = useState('');
  
  const handleContextMenu = (file: FileType, action: 'rename' | 'delete') => {
    setContextFile(file);
    setContextAction(action);
    
    if (action === 'rename') {
      setNewName(file.name);
    }
  };
  
  const handleDialogClose = () => {
    setContextFile(null);
    setContextAction(null);
    setNewName('');
  };
  
  const handleConfirm = () => {
    if (!contextFile || !contextAction) return;
    
    if (contextAction === 'rename' && newName.trim()) {
      onFileRename(contextFile, newName.trim());
    } else if (contextAction === 'delete') {
      onFileDelete(contextFile);
    }
    
    handleDialogClose();
  };
  
  const handleAddFile = () => {
    if (newFileName.trim()) {
      onFileAdd(newFileName.trim(), newFileType);
      setIsAddingFile(false);
      setNewFileName('');
    }
  };
  
  return (
    <div className="h-full overflow-y-auto bg-gray-50 border-r border-gray-200">
      <div className="p-3 flex justify-between items-center border-b border-gray-200">
        <h2 className="text-sm font-semibold">Explorer</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsAddingFile(true)}
              >
                <PlusIcon size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add new file</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="p-2">
        {files.map(file => (
          <FileExplorerItem
            key={file.id}
            item={file}
            level={0}
            onItemClick={onFileSelect}
            onItemToggle={onFileToggle}
            onContextMenu={handleContextMenu}
            currentFile={currentFile}
          />
        ))}
      </div>
      
      <Dialog open={contextAction !== null} onOpenChange={() => handleDialogClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {contextAction === 'rename' ? 'Rename' : 'Delete'} {contextFile?.name}
            </DialogTitle>
          </DialogHeader>
          
          {contextAction === 'rename' && (
            <div className="py-4">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new name"
                className="w-full"
              />
            </div>
          )}
          
          {contextAction === 'delete' && (
            <div className="py-4">
              <p>Are you sure you want to delete {contextFile?.name}?</p>
              <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
            <Button variant="default" onClick={handleConfirm}>
              {contextAction === 'rename' ? 'Rename' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAddingFile} onOpenChange={setIsAddingFile}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New {newFileType === 'file' ? 'File' : 'Folder'}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex space-x-2">
              <Button
                variant={newFileType === 'file' ? 'default' : 'outline'}
                onClick={() => setNewFileType('file')}
                className="flex-1"
              >
                File
              </Button>
              <Button
                variant={newFileType === 'folder' ? 'default' : 'outline'}
                onClick={() => setNewFileType('folder')}
                className="flex-1"
              >
                Folder
              </Button>
            </div>
            
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder={`Enter ${newFileType === 'file' ? 'file' : 'folder'} name`}
              className="w-full"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingFile(false)}>Cancel</Button>
            <Button variant="default" onClick={handleAddFile}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}