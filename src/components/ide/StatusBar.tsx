import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatusBarProps {
  filePath: string | null;
  language: string | null;
  position: { line: number; column: number } | null;
  isDirty: boolean;
  isConnected: boolean;
}

export function StatusBar({ filePath, language, position, isDirty, isConnected }: StatusBarProps) {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="flex items-center justify-between h-6 px-3 text-xs bg-gray-100 border-t border-gray-200 text-gray-600">
      <div className="flex items-center space-x-3">
        <div className="flex items-center">
          <div 
            className={cn(
              "w-2 h-2 rounded-full mr-1",
              isConnected ? "bg-green-500" : "bg-red-500"
            )}
          />
          <span>{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
        
        {filePath && (
          <div className="flex items-center">
            <span className="mr-1">{filePath}</span>
            {isDirty && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-500"
              >
                *
              </motion.span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        {language && (
          <div className="capitalize">{language}</div>
        )}
        
        {position && (
          <div>
            Ln {position.line}, Col {position.column}
          </div>
        )}
        
        <div>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}