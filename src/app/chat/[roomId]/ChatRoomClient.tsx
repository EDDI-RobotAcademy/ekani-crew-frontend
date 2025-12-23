'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getChatWebSocketUrl, ChatWebSocketResponse } from '@/lib/api';

interface Message {
  id: string;
  senderId: string;
  content: string;
  isMine: boolean;
  timestamp: Date;
}

interface ChatRoomClientProps {
  roomId: string;
}

export default function ChatRoomClient({ roomId }: ChatRoomClientProps) {
  const router = useRouter();
  const { isLoggedIn, user, loading } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 로그인 체크
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [loading, isLoggedIn, router]);

  // WebSocket 연결
  useEffect(() => {
    if (!user?.id || !roomId) return;

    const wsUrl = getChatWebSocketUrl(roomId);
    console.log('WebSocket 연결 시도:', wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket 연결됨');
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const data: ChatWebSocketResponse = JSON.parse(event.data);
        const newMessage: Message = {
          id: data.message_id,
          senderId: data.sender_id,
          content: data.content,
          isMine: data.sender_id === user.id,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
      } catch (err) {
        console.error('메시지 파싱 실패:', err);
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket 에러:', event);
      setError('채팅 연결에 문제가 발생했습니다.');
      setIsConnecting(false);
    };

    ws.onclose = () => {
      console.log('WebSocket 연결 종료');
      setIsConnected(false);
      setIsConnecting(false);
    };

    return () => {
      ws.close();
    };
  }, [user?.id, roomId]);

  const handleSend = () => {
    if (!input.trim() || !wsRef.current || !user?.id) return;

    const message = {
      sender_id: user.id,
      content: input.trim(),
    };

    wsRef.current.send(JSON.stringify(message));
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-lg flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        {/* 채팅방 헤더 */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/chat')}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="font-bold text-gray-800">채팅방</h1>
              <p className="text-xs text-gray-500">Room: {roomId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-gray-400'
              }`}
            ></span>
            <span className="text-sm text-gray-500">
              {isConnecting ? '연결 중...' : isConnected ? '연결됨' : '연결 끊김'}
            </span>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg text-center text-sm">
              {error}
            </div>
          )}

          {messages.length === 0 && !error && (
            <div className="text-center text-gray-400 py-12">
              <p className="text-4xl mb-4">👋</p>
              <p>대화를 시작해보세요!</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                  msg.isMine
                    ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.isMine ? 'text-white/70' : 'text-gray-400'
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              disabled={!isConnected}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:border-purple-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!isConnected || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-2xl font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}