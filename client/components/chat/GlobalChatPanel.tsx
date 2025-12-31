'use client';

import { useState } from 'react';
import { MessageCircle, ChevronRight, X } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { useChatPanelStore } from '@/store/chatPanelStore';
import { useAuthStore } from '@/store/authStore';

export function GlobalChatPanel() {
  const { isOpen, toggle } = useChatPanelStore();
  const { user } = useAuthStore();
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Only show chat panel for homeowners and unauthenticated users (guests)
  // Hide for admins and professionals
  if (user && (user.role === 'admin' || user.role === 'pro')) {
    return null;
  }

  return (
    <>
      {/* Desktop Panel */}
      <div
        className={`hidden xl:block fixed top-0 right-0 h-screen transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-48px)]'
        }`}
        style={{ width: '40vw', minWidth: '400px' }}
      >
      {/* Collapse/Expand Toggle */}
      <button
        onClick={toggle}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white border-0 rounded-l-lg px-3 py-6 shadow-lg transition-all hover:shadow-xl group"
        aria-label={isOpen ? 'Close chat panel' : 'Open chat panel'}
      >
        {isOpen ? (
          <ChevronRight className="h-5 w-5" />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <MessageCircle className="h-6 w-6" />
            <div className="flex flex-col gap-0.5">
              {['H', 'O', 'M', 'E'].map((letter, i) => (
                <span key={i} className="text-xs font-bold leading-none">
                  {letter}
                </span>
              ))}
              <div className="h-2" />
              {['G', 'P', 'T'].map((letter, i) => (
                <span key={i} className="text-xs font-bold leading-none">
                  {letter}
                </span>
              ))}
            </div>
          </div>
        )}
      </button>

      {/* Chat Panel */}
      <div className="h-full bg-white border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 rounded-full p-2">
              <MessageCircle className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Home GPT
              </h3>
              <p className="text-xs text-gray-500">
                AI Home Improvement Assistant
              </p>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden bg-gray-50">
          <ChatInterface />
        </div>
      </div>
    </div>

      {/* Mobile/Tablet Chat Overlay */}
      {showMobileChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 xl:hidden">
          <div className="bg-white h-[100dvh] flex flex-col">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Home GPT Assistant
                </h3>
                <p className="text-sm text-white/90 mt-1">
                  Ask me anything about your home improvement project
                </p>
              </div>
              <button
                onClick={() => setShowMobileChat(false)}
                className="bg-white/20 rounded-full p-2 hover:bg-white/30"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <ChatInterface />
            </div>
          </div>
        </div>
      )}

      {/* Mobile/Tablet Chat FAB */}
      {!showMobileChat && (
        <button
          onClick={() => setShowMobileChat(true)}
          className="xl:hidden fixed bottom-6 right-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full pl-4 pr-5 py-3 shadow-xl hover:from-primary-600 hover:to-primary-700 hover:shadow-2xl transition-all z-[60] flex items-center gap-2"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="font-semibold text-sm">Home GPT</span>
        </button>
      )}
    </>
  );
}
