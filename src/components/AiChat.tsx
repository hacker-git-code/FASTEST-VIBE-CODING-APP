import { useState, useCallback } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatState, Message } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

// Simulated AI responses - in a real app, these would be API calls
const mockResponses = [
  "I'm here to help! What would you like to know?",
  "That's an interesting question. Let me think about it...",
  "Here's what I found based on your question.",
  "I can assist with that. Here are some options to consider.",
  "Would you like me to explain that in more detail?",
];

export function AiChat() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
  });

  // Simulates getting a response from an AI
  const getAiResponse = useCallback((userMessage: string) => {
    // In a real implementation, this would be an API call
    return new Promise<string>((resolve) => {
      const randomIndex = Math.floor(Math.random() * mockResponses.length);
      const response = mockResponses[randomIndex];
      // Simulate network delay
      setTimeout(() => resolve(response), 1500);
    });
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
    }));

    try {
      // Get AI response
      const responseText = await getAiResponse(content);

      // Add AI message
      const aiMessage: Message = {
        id: uuidv4(),
        content: responseText,
        role: 'assistant',
        timestamp: new Date(),
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error getting AI response:', error);
      setChatState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [getAiResponse]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white"
    >
      <div className="p-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-semibold">AI Aid</h1>
        <p className="text-sm text-gray-600">Your personal AI assistant</p>
      </div>
      
      <MessageList chatState={chatState} />
      
      <MessageInput 
        onSendMessage={handleSendMessage} 
        disabled={chatState.isLoading} 
      />
    </motion.div>
  );
}