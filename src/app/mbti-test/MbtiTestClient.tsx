'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { startMbtiTest, checkAuthStatus } from '@/lib/api';

interface Message {
  role: 'USER' | 'ASSISTANT';
  content: string;
}

export default function MbtiTestClient() {
  const router = useRouter();
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const checkUser = async () => {
      try {
        const status = await checkAuthStatus();
        if (status.logged_in && status.user_id) {
          setUserId(status.user_id);
        }
      } catch {
        // 로그인 상태가 아니면 무시
      }
    };
    checkUser();
  }, []);

  const handleStart = async () => {
    if (!userId) {
      setError('로그인이 필요합니다.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await startMbtiTest(userId);
      setSessionId(response.session_id);
      setCurrentQuestion(response.first_question);
      setMessages([{ role: 'ASSISTANT', content: response.first_question }]);
      setIsStarted(true);
    } catch (err: any) {
      setError(err.message || 'MBTI 테스트 시작 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userAnswer = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'USER', content: userAnswer }]);
    setIsLoading(true);
    setError('');

    // TODO: 백엔드에 답변 제출 API가 구현되면 여기에 연동
    // 현재는 답변만 표시하고 다음 질문을 기다립니다
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: 'ASSISTANT', content: '답변 감사합니다! (다음 질문 API 연동 예정)' }
      ]);
      setIsLoading(false);
    }, 500);
  };

  if (!isStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
          <div className="text-6xl mb-6">🧠</div>
          <h1 className="text-2xl font-bold text-purple-500 mb-4">MBTI 테스트 시작하기</h1>
          <p className="text-gray-500 mb-8">
            AI와의 대화를 통해 당신의 MBTI를 알아보세요.
            <br />
            자연스러운 질문에 솔직하게 답변해주시면 됩니다!
          </p>
          {!userId && (
            <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 rounded-lg">
              로그인 후 테스트를 진행할 수 있습니다.
              <button
                onClick={() => router.push('/login')}
                className="ml-2 underline hover:text-yellow-900"
              >
                로그인하기
              </button>
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          <button
            onClick={handleStart}
            disabled={isLoading || !userId}
            className="cursor-pointer px-8 py-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '시작 중...' : '테스트 시작하기'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-400 to-pink-400 text-white p-4">
          <h1 className="font-bold">MBTI 테스트</h1>
          <p className="text-sm text-white/80">질문에 솔직하게 답변해주세요</p>
        </div>

        {/* 메시지 영역 */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  msg.role === 'USER'
                    ? 'bg-purple-400 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-700 rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-gray-100 text-gray-700 rounded-bl-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 입력 영역 */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="답변을 입력해주세요..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-purple-400 text-white rounded-full font-medium hover:bg-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '전송 중...' : '전송'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
