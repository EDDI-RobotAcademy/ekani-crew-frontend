'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useState, useRef, useEffect } from 'react';
import ConfirmModal from '@/components/ConfirmModal';

export default function Header() {
  const { isLoggedIn, user, logout, loading } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const [showCommunityMenu, setShowCommunityMenu] = useState(false);
  const communityMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setShowLogout(true);
  };

  const handleConfirmLogout = async () => {
    await logout();
    setShowLogout(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (communityMenuRef.current && !communityMenuRef.current.contains(event.target as Node)) {
        setShowCommunityMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            눈치코치
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/mbti-test"
              className="px-3 py-1.5 text-gray-600 hover:text-indigo-600 text-sm font-medium transition"
            >
              MBTI검사
            </Link>
            <Link
              href="/convert"
              className="px-3 py-1.5 text-gray-600 hover:text-purple-600 text-sm font-medium transition"
            >
              변환
            </Link>

            {/* 커뮤니티 드롭다운 */}
            <div className="relative" ref={communityMenuRef}>
              <button
                onClick={() => setShowCommunityMenu(!showCommunityMenu)}
                className="px-3 py-1.5 text-gray-600 hover:text-pink-600 text-sm font-medium transition flex items-center gap-0.5"
              >
                커뮤니티
                <span className="text-[10px]">▾</span>
              </button>
              {showCommunityMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 overflow-hidden">
                  <Link
                    href="/community/posts"
                    onClick={() => setShowCommunityMenu(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition"
                  >
                    게시판
                  </Link>
                  <Link
                    href="/community/balance"
                    onClick={() => setShowCommunityMenu(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition"
                  >
                    밸런스게임
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/chat"
              className="px-3 py-1.5 text-gray-600 hover:text-rose-600 text-sm font-medium transition"
            >
              채팅
            </Link>

            <div className="w-px h-5 bg-gray-200 mx-2"></div>

            {loading ? (
              <div className="px-4 py-2 text-sm text-gray-400">로딩중...</div>
            ) : isLoggedIn ? (
              <>
                <Link
                  href="/mypage"
                  className="px-4 py-2 rounded-full border border-pink-300 text-black-600 text-sm font-medium transition hover:bg-pink-50"
                >
                  {user?.name || user?.email} 님
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-medium transition cursor-pointer"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-medium transition"
              >
                로그인
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
    <ConfirmModal
        open={showLogout}
        title="로그아웃"
        message="로그아웃 하시겠습니까?"
        confirmText="확인"
        cancelText="취소"
        onClose={() => setShowLogout(false)}
        onConfirm={handleConfirmLogout}
    />
    </>
  );
}