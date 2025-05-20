import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { XIcon, MinimizeIcon, MaximizeIcon, SendIcon, BotIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Message, MessageRole } from '@/lib/types';
import { Message as MessageComponent } from '@/components/Message';
import { TypingIndicator } from '@/components/TypingIndicator';

interface AIAssistantProps {
  isOpen: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}

export function AIAssistant({ isOpen, isExpanded, onToggleExpand, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  // Mock AI responses
  const mockResponses = [
    "I've analyzed your code and found a potential optimization in your algorithm.",
    "Based on your project structure, I recommend splitting this component into smaller, more maintainable parts.",
    "Try using a more efficient data structure for this particular use case. Consider using a Map instead of an array for O(1) lookups.",
    "I've detected a pattern in your code that might lead to memory leaks. Consider using useCallback for these functions.",
    "The syntax error in your code is on line 45. You're missing a closing parenthesis.",
  ];
  
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * mockResponses.length);
      const aiMessage: Message = {
        id: uuidv4(),
        content: mockResponses[randomIndex],
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  }, [input, isLoading]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "fixed bottom-4 right-4 bg-white rounded-lg shadow-xl overflow-hidden z-30",
        "flex flex-col border border-gray-200",
        isExpanded ? "w-[400px] h-[500px]" : "w-[300px] h-[50px]"
      )}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
        <div className="flex items-center">
          <BotIcon size={16} className="mr-2" />
          <div className="text-sm font-medium">AI Assistant</div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-gray-800"
            onClick={onToggleExpand}
          >
            {isExpanded ? <MinimizeIcon size={14} /> : <MaximizeIcon size={14} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-gray-800"
            onClick={onClose}
          >
            <XIcon size={14} />
          </Button>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col flex-1"
          >
            <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center p-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      Ask the AI assistant for help with your code.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map(message => (
                  <MessageComponent key={message.id} message={message} />
                ))
              )}
              
              {isLoading && (
                <div className="flex w-full justify-start">
                  <TypingIndicator />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-3 border-t border-gray-200">
              <div className="flex items-end space-x-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask the AI assistant..."
                  className="flex-1 min-h-[40px] max-h-[120px] resize-none border-gray-200 focus:border-black focus:ring-black"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-black text-white hover:bg-gray-800"
                  size="icon"
                >
                  <SendIcon size={16} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}