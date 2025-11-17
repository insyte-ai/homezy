'use client';

import { useState } from 'react';
import { MessageSquare, Search, Send, Paperclip, AlertCircle } from 'lucide-react';

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  // Mock data - TODO: Replace with real API calls
  const conversations = [
    {
      id: '1',
      homeownerName: 'Ahmed K.',
      lastMessage: 'When can you start the project?',
      timestamp: '2 hours ago',
      unread: true,
      leadTitle: 'Kitchen Renovation',
    },
    {
      id: '2',
      homeownerName: 'Sarah M.',
      lastMessage: 'Thanks for the quote!',
      timestamp: '1 day ago',
      unread: false,
      leadTitle: 'Bathroom Remodeling',
    },
  ];

  const messages = selectedConversation
    ? [
        {
          id: '1',
          senderId: 'homeowner',
          text: 'Hi, I saw your quote for my kitchen renovation. Can we discuss the timeline?',
          timestamp: '10:30 AM',
        },
        {
          id: '2',
          senderId: 'pro',
          text: 'Of course! I can start next week. The project will take approximately 3-4 weeks.',
          timestamp: '10:45 AM',
        },
        {
          id: '3',
          senderId: 'homeowner',
          text: 'When can you start the project?',
          timestamp: '11:00 AM',
        },
      ]
    : [];

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    // TODO: Send message via API
    console.log('Sending message:', messageText);
    setMessageText('');
  };

  return (
    <div className="flex h-[calc(100vh-140px)]">
      {/* Conversations List */}
      <div className="w-full md:w-96 border-r border-gray-200 bg-white flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No conversations yet
              </h3>
              <p className="text-gray-600 text-sm">
                Start claiming leads to connect with homeowners
              </p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition text-left ${
                  selectedConversation === conversation.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-semibold text-gray-900">
                    {conversation.homeownerName}
                  </h4>
                  <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{conversation.leadTitle}</p>
                <p
                  className={`text-sm ${
                    conversation.unread ? 'font-medium text-gray-900' : 'text-gray-600'
                  } truncate`}
                >
                  {conversation.lastMessage}
                </p>
                {conversation.unread && (
                  <div className="mt-2">
                    <span className="inline-block w-2 h-2 bg-primary-600 rounded-full"></span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message Thread */}
      <div className="flex-1 bg-gray-50 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Thread Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900">
                {conversations.find((c) => c.id === selectedConversation)?.homeownerName}
              </h3>
              <p className="text-sm text-gray-600">
                {conversations.find((c) => c.id === selectedConversation)?.leadTitle}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === 'pro' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === 'pro'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.senderId === 'pro' ? 'text-primary-100' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end gap-2">
                <button className="p-2 text-gray-600 hover:text-gray-900 transition">
                  <Paperclip className="h-5 w-5" />
                </button>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  rows={3}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift + Enter for new line
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-600 text-sm">
                Choose a conversation from the list to view messages
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
