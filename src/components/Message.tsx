import { cn } from '@/lib/utils';
import { Message as MessageType, MessageRole } from '@/lib/types';
import { motion } from 'framer-motion';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] px-4 py-3 rounded-lg',
          isUser ? 'bg-black text-white rounded-tr-none' : 'bg-gray-100 text-black rounded-tl-none'
        )}
      >
        <p className="text-sm sm:text-base leading-relaxed">{message.content}</p>
        <div className={cn(
          'text-xs mt-1 text-right',
          isUser ? 'text-gray-400' : 'text-gray-500'
        )}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}