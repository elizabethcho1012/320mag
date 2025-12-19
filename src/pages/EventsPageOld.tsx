import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

interface EventsPageProps {
  isDarkMode: boolean;
  highContrast: boolean;
}

// 이벤트 클럽 타입 정의
interface EventClub {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  memberCount: number;
  nextEvent?: {
    date: string;
    title: string;
    location: string;
  };
}

// 개별 이벤트 타입 정의
interface Event {
  id: string;
  clubId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  momenters: string[]; // 모멘터 이름들
  tags: string[];
  image?: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

const EventsPage: React.FC<EventsPageProps> = ({ isDarkMode, highContrast }) => {
  const [selectedClub, setSelectedClub] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'clubs' | 'events'>('clubs');

  // 이벤트 클럽 데이터
  const eventClubs: EventClub[] = [
    {
      id: 'book',
      name: '북클럽',
      description: '함께 읽고 나누는 지혜의 시간',
      color: 'bg-emerald-500',
      icon: '📚',
      memberCount: 24,
      nextEvent: {
        date: '2025.09.20',
        title: '김영하 작가와의 만남',
        location: '강남 북카페'
      }
    },
    {
      id: 'photo',
      name: '포토클럽',
      description: '일상의 아름다움을 담는 렌즈',
      color: 'bg-blue-500',
      icon: '📷',
      memberCount: 18,
      nextEvent: {
        date: '2025.09.22',
        title: '한강 가을 출사',
        location: '반포한강공원'
      }
    },
    {
      id: 'speech',
      name: '스피치클럽',
      description: '자신감 있는 소통과 표현력',
      color: 'bg-orange-500',
      icon: '🎤',
      memberCount: 15,
      nextEvent: {
        date: '2025.09.25',
        title: 'TED 스타일 발표 연습',
        location: '서초 스피치센터'
      }
    },
    {
      id: 'beauty',
      name: '뷰티클럽',
      description: '나답게 빛나는 아름다움 찾기',
      color: 'bg-pink-500',
      icon: '💄',
      memberCount: 31,
      nextEvent: {
        date: '2025.09.18',
        title: '가을 메이크업 트렌드',
        location: '압구정 뷰티살롱'
      }
    },
    {
      id: 'trip',
      name: '트립클럽',
      description: '새로운 경험과 추억 만들기',
      color: 'bg-purple-500',
      icon: '✈️',
      memberCount: 27,
      nextEvent: {
        date: '2025.10.05',
        title: '제주도 힐링 여행',
        location: '제주도 서귀포'
      }
    },
    {
      id: 'coding',
      name: '코딩클럽',
      description: '디지털 시대의 새로운 언어 배우기',
      color: 'bg-indigo-500',
      icon: '💻',
      memberCount: 12,
      nextEvent: {
        date: '2025.09.23',
        title: 'AI와 함께하는 코딩',
        location: '강남 테크센터'
      }
    }
  ];

  // 예시 이벤트 데이터
  const upcomingEvents: Event[] = [
    {
      id: 'event1',
      clubId: 'beauty',
      title: '가을 메이크업 트렌드 워크샵',
      description: '전문 메이크업 아티스트와 함께하는 실습형 클래스',
      date: '2025-09-18',
      time: '14:00',
      location: '압구정 뷰티살롱',
      maxParticipants: 15,
      currentParticipants: 12,
      momenters: ['김수진', '박하나'],
      tags: ['메이크업', '트렌드', '실습'],
      status: 'upcoming',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop'
    },
    {
      id: 'event2',
      clubId: 'book',
      title: '김영하 작가와의 만남',
      description: '베스트셀러 작가와의 특별한 북토크 시간',
      date: '2025-09-20',
      time: '19:00',
      location: '강남 북카페',
      maxParticipants: 30,
      currentParticipants: 24,
      momenters: ['이민수', '정예린'],
      tags: ['북토크', '작가만남', '문학'],
      status: 'upcoming',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop'
    }
  ];

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  return (
    <div className={`${bgClass} min-h-screen transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold mb-4 tracking-widest ${textClass}`}
              style={{ fontFamily: 'Didot, "Bodoni MT", "Noto Serif Display", "URW Palladio L", P052, Sylfaen, serif' }}>
            EVENTS
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            함께 성장하고 즐기는 써드트웬티 커뮤니티 이벤트
          </p>
          <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 max-w-3xl mx-auto">
            <p className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-700'} flex items-center justify-center gap-2`}>
              <span className="text-lg">📸</span>
              <strong>특별 혜택:</strong> 모든 이벤트에 전문 '모멘터'가 동행하여 여러분의 특별한 순간을 촬영해드립니다!
            </p>
          </div>
        </div>

        {/* 뷰 모드 토글 */}
        <div className="flex justify-center mb-8">
          <div className={`inline-flex rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-1`}>
            <button
              onClick={() => setViewMode('clubs')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'clubs'
                  ? 'bg-purple-600 text-white'
                  : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              클럽 소개
            </button>
            <button
              onClick={() => setViewMode('events')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'events'
                  ? 'bg-purple-600 text-white'
                  : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              예정 이벤트
            </button>
          </div>
        </div>

        {/* 클럽 소개 뷰 */}
        {viewMode === 'clubs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {eventClubs.map((club) => (
              <div key={club.id} className={`${cardClass} rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}>
                <div className={`${club.color} h-32 flex items-center justify-center text-4xl`}>
                  {club.icon}
                </div>
                <div className="p-6">
                  <h3 className={`text-base font-bold mb-2 ${textClass}`}>{club.name}</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                    {club.description}
                  </p>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                    <p>멤버 {club.memberCount}명</p>
                  </div>
                  {club.nextEvent && (
                    <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} mb-1`}>
                        다음 이벤트
                      </p>
                      <p className={`text-sm font-medium ${textClass}`}>{club.nextEvent.title}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {club.nextEvent.date} • {club.nextEvent.location}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 예정 이벤트 뷰 */}
        {viewMode === 'events' && (
          <div className="space-y-6">
            {upcomingEvents.map((event) => {
              const club = eventClubs.find(c => c.id === event.clubId);
              return (
                <div key={event.id} className={`${cardClass} rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}>
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <img
                        src={event.image || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop'}
                        alt={event.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-2/3 p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`${club?.color} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                          {club?.name}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          event.status === 'upcoming' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''
                        }`}>
                          모집중
                        </span>
                      </div>
                      
                      <h3 className={`text-xl font-bold mb-2 ${textClass}`}>{event.title}</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                        {event.description}
                      </p>
                      
                      <div className={`grid grid-cols-2 gap-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                        <div>
                          <p className="font-medium">📅 일시</p>
                          <p>{new Date(event.date).toLocaleDateString('ko-KR')} {event.time}</p>
                        </div>
                        <div>
                          <p className="font-medium">📍 장소</p>
                          <p>{event.location}</p>
                        </div>
                        <div>
                          <p className="font-medium">👥 참가자</p>
                          <p>{event.currentParticipants}/{event.maxParticipants}명</p>
                        </div>
                        <div>
                          <p className="font-medium">📸 모멘터</p>
                          <p>{event.momenters.join(', ')}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {event.tags.map((tag, index) => (
                          <span key={index} className={`px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                        참가 신청하기
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 새 클럽 제안 섹션 */}
        <div className={`${cardClass} rounded-xl border shadow-lg p-8 text-center mt-12`}>
          <h3 className={`text-xl font-bold mb-4 ${textClass}`}>새로운 클럽을 제안해주세요!</h3>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
            함께하고 싶은 활동이나 관심사가 있다면 언제든 제안해주세요. 
            충분한 관심이 모이면 새로운 클럽이 생성됩니다.
          </p>
          <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
            클럽 제안하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;