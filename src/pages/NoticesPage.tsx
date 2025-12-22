import React from 'react';

interface NoticesPageProps {
  isDarkMode: boolean;
  onBack: () => void;
}

const NoticesPage: React.FC<NoticesPageProps> = ({ isDarkMode, onBack }) => {
  const notices = [
    {
      id: 1,
      title: 'THIRD TWENTY 프리미엄 멤버십 출시',
      date: '2024.12.20',
      content: '40-50대를 위한 프리미엄 라이프스타일 매거진 THIRD TWENTY가 정식 출시되었습니다. 프리미엄 멤버십을 통해 모든 콘텐츠를 광고 없이 즐기실 수 있습니다.',
      isImportant: true
    },
    {
      id: 2,
      title: '개인정보 처리방침 개정 안내',
      date: '2024.12.20',
      content: '개인정보 처리방침이 개정되어 2024년 12월 20일부터 시행됩니다. 변경된 내용을 확인해 주시기 바랍니다.',
      isImportant: true
    },
    {
      id: 3,
      title: '정기 구독 서비스 안내',
      date: '2024.12.20',
      content: '월간 및 연간 구독 서비스가 시작되었습니다. 연간 구독 시 20% 할인 혜택을 제공합니다.',
      isImportant: false
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <button
          onClick={onBack}
          className={`mb-8 flex items-center gap-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
        >
          ← 돌아가기
        </button>

        <h1 className="text-4xl font-bold mb-8">공지사항</h1>

        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`p-6 rounded-lg border ${
                isDarkMode
                  ? notice.isImportant
                    ? 'bg-purple-900/20 border-purple-600'
                    : 'bg-gray-800 border-gray-700'
                  : notice.isImportant
                    ? 'bg-purple-50 border-purple-200'
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {notice.isImportant && (
                    <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">
                      중요
                    </span>
                  )}
                  <h2 className="text-xl font-semibold">{notice.title}</h2>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {notice.date}
                </span>
              </div>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                {notice.content}
              </p>
            </div>
          ))}
        </div>

        <div className={`mt-8 p-6 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            공지사항은 지속적으로 업데이트됩니다. 중요한 공지사항은 이메일로도 발송됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoticesPage;
