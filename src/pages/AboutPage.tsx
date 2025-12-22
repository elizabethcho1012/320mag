import React from 'react';

interface AboutPageProps {
  isDarkMode: boolean;
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ isDarkMode, onBack }) => {
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <button
          onClick={onBack}
          className={`mb-8 flex items-center gap-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
        >
          ← 돌아가기
        </button>

        <h1 className="text-4xl font-bold mb-8">회사소개</h1>

        <div className="space-y-12">
          <section>
            <h2 className="text-3xl font-serif mb-6">THIRD TWENTY</h2>
            <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              THIRD TWENTY(써드 트웬티)는 40-50대를 위한 프리미엄 라이프스타일 매거진입니다.
              '세 번째 20대'라는 의미로, 인생의 새로운 전성기를 맞이하는 중장년층에게
              영감과 정보를 제공합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">우리의 미션</h2>
            <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              "나이 들어도 충분히 섹시할 수 있다"는 철학 아래, 건강성, 활동성, 확실한 관리를 통해
              성숙한 아름다움과 삶의 질을 추구합니다. 40-50대가 자신감 있고 당당하게
              인생의 새로운 장을 펼칠 수 있도록 돕는 것이 우리의 목표입니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">콘텐츠 카테고리</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-2">패션 & 뷰티</h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  40-50대에 어울리는 스타일과 안티에이징 정보
                </p>
              </div>
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-2">여행 & 라이프스타일</h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  품격 있는 여행과 문화 체험
                </p>
              </div>
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-2">건강 & 운동</h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  성인병 예방과 건강한 노화를 위한 정보
                </p>
              </div>
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-2">글로벌 푸드</h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  세계 각국의 미식과 레스토랑 정보
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">회사 정보</h2>
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="space-y-2">
                <p><span className="font-semibold">상호명:</span> SENIOR LIFESTYLE MAGAZINE</p>
                <p><span className="font-semibold">웹사이트:</span> www.320.kr</p>
                <p><span className="font-semibold">이메일:</span> info@320.kr</p>
                <p><span className="font-semibold">설립:</span> 2024년</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
