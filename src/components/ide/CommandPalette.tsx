import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command } from 'cmdk';
import { CommandItem } from '@/lib/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
  onSelectCommand: (command: CommandItem) => void;
}

export function CommandPalette({ isOpen, onClose, commands, onSelectCommand }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Group commands by section
  const groupedCommands = commands.reduce((groups, command) => {
    const section = command.section || 'General';
    if (!groups[section]) {
      groups[section] = [];
    }
    groups[section].push(command);
    return groups;
  }, {} as Record<string, CommandItem[]>);
  
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-[20vh]"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Command className="border-none" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
              <div className="flex items-center border-b border-gray-200 px-4 py-3">
                <div className="mr-2 text-gray-400">⌘</div>
                <Command.Input
                  ref={inputRef}
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search commands..."
                  className="flex-1 outline-none border-none text-sm"
                />
              </div>
              
              <Command.List className="max-h-[60vh] overflow-y-auto p-2">
                {search && !commands.some(c => c.name.toLowerCase().includes(search.toLowerCase())) && (
                  <div className="py-6 text-center text-gray-500">
                    No commands found
                  </div>
                )}
                
                {Object.entries(groupedCommands).map(([section, sectionCommands]) => {
                  const filteredCommands = sectionCommands.filter(c => 
                    c.name.toLowerCase().includes(search.toLowerCase())
                  );
                  
                  if (filteredCommands.length === 0) return null;
                  
                  return (
                    <div key={section} className="mb-4">
                      <div className="text-xs text-gray-500 font-medium px-2 py-1">
                        {section}
                      </div>
                      
                      {filteredCommands.map(command => (
                        <Command.Item
                          key={command.id}
                          value={command.name}
                          onSelect={() => {
                            onSelectCommand(command);
                            onClose();
                          }}
                          className="flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 aria-selected:bg-gray-100"
                        >
                          <span>{command.name}</span>
                          {command.shortcut && (
                            <span className="text-xs text-gray-500">{command.shortcut}</span>
                          )}
                        </Command.Item>
                      ))}
                    </div>
                  );
                })}
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}