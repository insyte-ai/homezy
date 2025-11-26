'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Search, Archive, Filter } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
  getConversations,
  connectMessagingSocket,
  disconnectMessagingSocket,
  onMessageNotification,
  setOnline,
  type Conversation,
} from '@/lib/services/messages';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [totalUnread, setTotalUnread] = useState(0);

  // Get access token from localStorage
  const getAccessToken = () => {
    return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  };

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const response = await getConversations({
          status: statusFilter,
          limit: 50,
        });

        setConversations(response.data.conversations);
        setTotalUnread(response.data.totalUnread);
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [statusFilter]);

  // Setup Socket.io connection
  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) return;

    const socket = connectMessagingSocket(accessToken);
    setOnline();

    // Listen for new message notifications
    const unsubscribe = onMessageNotification((data) => {
      // Refresh conversations when new message arrives
      getConversations({ status: statusFilter, limit: 50 }).then((response) => {
        setConversations(response.data.conversations);
        setTotalUnread(response.data.totalUnread);
      });
    });

    return () => {
      unsubscribe();
      disconnectMessagingSocket();
    };
  }, [statusFilter]);

  // Get other participant based on user role
  const getOtherParticipant = (conversation: Conversation) => {
    if (user?.role === 'homeowner') {
      return conversation.participants.professionalId;
    }
    return conversation.participants.homeownerId;
  };

  // Get unread count for current user
  const getUnreadCount = (conversation: Conversation) => {
    if (user?.role === 'homeowner') {
      return conversation.unreadCount.homeowner;
    }
    return conversation.unreadCount.professional;
  };

  // Filter conversations by search query
  const filteredConversations = conversations.filter((conversation) => {
    const otherParticipant = getOtherParticipant(conversation);
    const participantName = (otherParticipant as any).businessName
      ? (otherParticipant as any).businessName
      : `${otherParticipant.firstName} ${otherParticipant.lastName}`;

    const lastMessageContent = conversation.lastMessage?.content || '';

    return (
      participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMessageContent.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1">
              Chat with {user?.role === 'homeowner' ? 'professionals' : 'homeowners'}
            </p>
          </div>
          {totalUnread > 0 && (
            <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium">
              {totalUnread} unread
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'active' | 'archived' | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {/* Conversations List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No conversations found' : 'No messages yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : user?.role === 'homeowner'
              ? 'Start a conversation by requesting quotes from professionals'
              : 'Conversations will appear here when homeowners contact you'}
          </p>
          {!searchQuery && user?.role === 'homeowner' && (
            <button
              onClick={() => router.push('/dashboard/professionals')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Professionals
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
          {filteredConversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation);
            const unreadCount = getUnreadCount(conversation);
            const participantName = (otherParticipant as any).businessName
              ? (otherParticipant as any).businessName
              : `${otherParticipant.firstName} ${otherParticipant.lastName}`;

            return (
              <div
                key={conversation._id}
                onClick={() => router.push(`/dashboard/messages/${conversation._id}`)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  unreadCount > 0 ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {otherParticipant.profilePhoto ? (
                      <img
                        src={otherParticipant.profilePhoto}
                        alt={participantName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {participantName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3
                          className={`font-medium ${
                            unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {participantName}
                        </h3>
                        {conversation.relatedLead && (
                          <p className="text-sm text-gray-500">
                            Re: {conversation.relatedLead.title}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(conversation.lastMessage.sentAt), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                        {unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full min-w-[1.5rem] text-center">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {conversation.lastMessage && (
                      <p
                        className={`text-sm line-clamp-2 ${
                          unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'
                        }`}
                      >
                        {conversation.lastMessage.senderId === user?._id && 'You: '}
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
