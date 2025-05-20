import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { TerminalState, TerminalCommand } from '@/lib/types';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { XIcon, MaximizeIcon, MinimizeIcon } from 'lucide-react';

interface TerminalProps {
  terminalState: TerminalState;
  onCommandExecute: (command: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}

export function Terminal({ terminalState, onCommandExecute, isExpanded, onToggleExpand, onClose }: TerminalProps) {
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [terminalState.commands]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) {
        onCommandExecute(input.trim());
        setInput('');
        setHistoryIndex(-1);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIndex = historyIndex + 1;
      if (nextIndex < terminalState.history.length) {
        setHistoryIndex(nextIndex);
        setInput(terminalState.history[terminalState.history.length - 1 - nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(terminalState.history[terminalState.history.length - 1 - nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };
  
  const focusInput = () => {
    inputRef.current?.focus();
  };
  
  return (
    <motion.div 
      initial={{ height: isExpanded ? 300 : 40 }}
      animate={{ height: isExpanded ? 300 : 40 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "bg-gray-900 text-gray-100 w-full overflow-hidden",
        "flex flex-col"
      )}
    >
      <div className="flex items-center justify-between p-2 bg-gray-800">
        <div className="text-sm font-mono">Terminal</div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-gray-100 hover:bg-gray-700"
            onClick={onToggleExpand}
          >
            {isExpanded ? <MinimizeIcon size={14} /> : <MaximizeIcon size={14} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-gray-100 hover:bg-gray-700"
            onClick={onClose}
          >
            <XIcon size={14} />
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <>
          <div 
            ref={containerRef}
            className="flex-1 overflow-y-auto p-2 font-mono text-sm"
            onClick={focusInput}
          >
            {terminalState.commands.map((cmd) => (
              <div key={cmd.id} className="mb-1">
                <div className="flex">
                  <span className="text-green-400 mr-2">$</span>
                  <span>{cmd.command}</span>
                </div>
                
                <div 
                  className={cn(
                    "pl-5 whitespace-pre-wrap",
                    cmd.status === 'error' && 'text-red-400',
                    cmd.status === 'info' && 'text-blue-400'
                  )}
                >
                  {cmd.output}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center p-2 border-t border-gray-700">
            <span className="text-green-400 mr-2">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none font-mono text-sm"
              autoFocus
            />
          </div>
        </>
      )}
    </motion.div>
  );
}