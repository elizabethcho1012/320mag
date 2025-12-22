import React from 'react';

interface AdvertisePageProps {
  isDarkMode: boolean;
  onBack: () => void;
}

const AdvertisePage: React.FC<AdvertisePageProps> = ({ isDarkMode, onBack }) => {
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <button
          onClick={onBack}
          className={`mb-8 flex items-center gap-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
        >
          ← 돌아가기
        </button>

        <h1 className="text-4xl font-bold mb-8">광고/제휴 문의</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">함께 성장할 파트너를 찾습니다</h2>
            <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              THIRD TWENTY는 40-50대 중장년층을 타겟으로 하는 프리미엄 라이프스타일 매거진입니다.
              경제력과 구매력을 갖춘 성숙한 독자층에게 귀사의 브랜드를 효과적으로 전달하세요.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">광고 상품</h2>
            <div className="space-y-4">
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className="font-semibold text-lg mb-2">디스플레이 광고</h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  메인 페이지, 카테고리 페이지, 기사 상단/하단 배너 광고
                </p>
              </div>
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className="font-semibold text-lg mb-2">네이티브 광고</h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  콘텐츠와 자연스럽게 어우러지는 브랜디드 콘텐츠 제작
                </p>
              </div>
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className="font-semibold text-lg mb-2">이벤트 협찬</h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  오프라인 이벤트 및 체험단 프로그램 협찬
                </p>
              </div>
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className="font-semibold text-lg mb-2">뉴스레터 광고</h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  구독자 대상 이메일 뉴스레터 광고 삽입
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">타겟 독자층</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className={`p-6 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
                <div className="text-3xl font-bold text-purple-600 mb-2">40-50대</div>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>주요 연령층</p>
              </div>
              <div className={`p-6 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
                <div className="text-3xl font-bold text-purple-600 mb-2">높은 구매력</div>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>경제적 여유</p>
              </div>
              <div className={`p-6 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
                <div className="text-3xl font-bold text-purple-600 mb-2">프리미엄</div>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>품질 중시</p>
              </div>
            </div>
          </section>

          <section className={`p-8 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
            <h2 className="text-2xl font-semibold mb-4">제휴 문의</h2>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              광고 및 제휴에 대한 문의사항이 있으시면 아래 연락처로 편하게 연락주세요.
            </p>
            <div className="space-y-2">
              <p><span className="font-semibold">이메일:</span> <a href="mailto:ad@320.kr" className="text-purple-600 hover:underline">ad@320.kr</a></p>
              <p><span className="font-semibold">담당자:</span> 광고사업팀</p>
              <p><span className="font-semibold">응답 시간:</span> 영업일 기준 1-2일 이내</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdvertisePage;
