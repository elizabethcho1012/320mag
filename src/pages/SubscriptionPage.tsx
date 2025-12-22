import React from 'react';

interface SubscriptionPageProps {
  isDarkMode: boolean;
  onBack: () => void;
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ isDarkMode, onBack }) => {
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <button
          onClick={onBack}
          className={`mb-8 flex items-center gap-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
        >
          ← 돌아가기
        </button>

        <h1 className="text-4xl font-bold mb-8">정기구독</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">THIRD TWENTY 프리미엄 멤버십</h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              40-50대를 위한 프리미엄 라이프스타일 매거진 THIRD TWENTY의 모든 콘텐츠를 무제한으로 즐기세요.
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-6">
            <div className={`p-8 rounded-lg border-2 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className="text-xl font-semibold mb-2">월간 구독</h3>
              <p className="text-3xl font-bold mb-4">₩9,900<span className="text-lg font-normal">/월</span></p>
              <ul className={`space-y-2 mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>✓ 모든 프리미엄 콘텐츠 무제한 열람</li>
                <li>✓ 광고 없는 쾌적한 읽기 환경</li>
                <li>✓ 프리미엄 이벤트 우선 참여</li>
                <li>✓ 월간 뉴스레터 발송</li>
              </ul>
              <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors">
                월간 구독하기
              </button>
            </div>

            <div className={`p-8 rounded-lg border-2 border-purple-600 ${isDarkMode ? 'bg-gray-800' : 'bg-purple-50'} relative`}>
              <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                20% 할인
              </div>
              <h3 className="text-xl font-semibold mb-2">연간 구독</h3>
              <p className="text-3xl font-bold mb-1">₩94,900<span className="text-lg font-normal">/년</span></p>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                (월 ₩7,900 상당)
              </p>
              <ul className={`space-y-2 mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>✓ 모든 프리미엄 콘텐츠 무제한 열람</li>
                <li>✓ 광고 없는 쾌적한 읽기 환경</li>
                <li>✓ 프리미엄 이벤트 우선 참여</li>
                <li>✓ 월간 뉴스레터 발송</li>
                <li>✓ 연간 특별 기획 콘텐츠 제공</li>
                <li>✓ 오프라인 이벤트 초대권</li>
              </ul>
              <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors">
                연간 구독하기 (20% 할인)
              </button>
            </div>
          </section>

          <section className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h3 className="text-xl font-semibold mb-4">자주 묻는 질문</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Q. 구독은 언제든 해지할 수 있나요?</h4>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  A. 네, 마이페이지에서 언제든지 구독을 해지하실 수 있습니다. 해지 시점까지의 기간은 정상적으로 이용 가능합니다.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Q. 결제 수단은 무엇이 있나요?</h4>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  A. 신용카드, 체크카드, 카카오페이, 네이버페이 등 다양한 결제 수단을 지원합니다.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Q. 환불 정책은 어떻게 되나요?</h4>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  A. 구독 시작 후 7일 이내, 콘텐츠를 3개 미만 열람한 경우 전액 환불이 가능합니다.
                </p>
              </div>
            </div>
          </section>

          <section className="text-center">
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              문의사항이 있으시면 <a href="mailto:subscribe@320.kr" className="text-purple-600 hover:underline">subscribe@320.kr</a>로 연락주세요.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
