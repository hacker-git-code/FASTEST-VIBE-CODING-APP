import { useRef, useEffect } from 'react';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';
import { ChatState } from '@/lib/types';

interface MessageListProps {
  chatState: ChatState;
}

export function MessageList({ chatState }: MessageListProps) {
  const { messages, isLoading } = chatState;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Welcome to AI Aid</h2>
            <p className="text-gray-600">
              Ask me anything, and I'll do my best to assist you.
            </p>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <Message key={message.id} message={message} />
        ))
      )}
      
      {isLoading && (
        <div className="flex w-full justify-start mb-4">
          <TypingIndicator />
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}