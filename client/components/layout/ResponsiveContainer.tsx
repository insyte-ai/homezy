'use client';

import { useChatPanelStore } from '@/store/chatPanelStore';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveContainer({ children, className = '' }: ResponsiveContainerProps) {
  const { isOpen: isChatPanelOpen } = useChatPanelStore();

  return (
    <div className={`transition-all duration-300 ${isChatPanelOpen ? 'lg:pr-[450px]' : 'lg:pr-0'} ${className}`}>
      {children}
    </div>
  );
}
