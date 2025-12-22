import React from 'react';

interface PrivacyPageProps {
  isDarkMode: boolean;
  onBack: () => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ isDarkMode, onBack }) => {
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <button
          onClick={onBack}
          className={`mb-8 flex items-center gap-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
        >
          ← 돌아가기
        </button>

        <h1 className="text-4xl font-bold mb-4">개인정보 처리방침</h1>
        <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>시행일자: 2024년 12월 20일</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. 개인정보의 수집 및 이용 목적</h2>
            <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              THIRD TWENTY(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다.
              처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
              이용 목적이 변경되는 경우에는 개인정보 보호법에 따라 별도의 동의를 받는 등
              필요한 조치를 이행할 예정입니다.
            </p>
            <ul className={`mt-4 space-y-2 list-disc list-inside ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>회원 가입 및 관리</li>
              <li>콘텐츠 제공 및 맞춤형 서비스 제공</li>
              <li>구독 결제 및 정산</li>
              <li>고객 문의 및 불만 처리</li>
              <li>서비스 개선 및 통계 분석</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. 수집하는 개인정보 항목</h2>
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className="font-semibold mb-2">필수 항목</h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                이메일, 비밀번호, 이름, 생년월일
              </p>
            </div>
            <div className={`p-6 rounded-lg mt-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className="font-semibold mb-2">선택 항목</h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                전화번호, 관심 카테고리, 프로필 사진
              </p>
            </div>
            <div className={`p-6 rounded-lg mt-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className="font-semibold mb-2">자동 수집 항목</h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                IP 주소, 쿠키, 방문 일시, 서비스 이용 기록, 기기 정보
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. 개인정보의 보유 및 이용 기간</h2>
            <p className={`leading-relaxed mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에
              동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <ul className={`space-y-2 list-disc list-inside ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우 해당 수사·조사 종료 시까지)</li>
              <li>소비자 불만 또는 분쟁처리 기록: 3년 (전자상거래법)</li>
              <li>결제 및 재화 공급 기록: 5년 (전자상거래법)</li>
              <li>접속 로그 기록: 3개월 (통신비밀보호법)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. 개인정보의 제3자 제공</h2>
            <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              회사는 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및
              제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. 개인정보의 파기 절차 및 방법</h2>
            <p className={`leading-relaxed mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
              지체없이 해당 개인정보를 파기합니다.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-2">전자적 파일</h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  복구 및 재생되지 않도록 안전하게 삭제
                </p>
              </div>
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-2">종이 문서</h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  분쇄기로 분쇄하거나 소각
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. 정보주체의 권리·의무 및 행사방법</h2>
            <p className={`leading-relaxed mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
            </p>
            <ul className={`space-y-2 list-disc list-inside ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>
          </section>

          <section className={`p-8 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
            <h2 className="text-2xl font-semibold mb-4">7. 개인정보 보호책임자</h2>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한
              정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="space-y-2">
              <p><span className="font-semibold">개인정보 보호책임자:</span> 개인정보보호팀</p>
              <p><span className="font-semibold">이메일:</span> <a href="mailto:privacy@320.kr" className="text-purple-600 hover:underline">privacy@320.kr</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. 개인정보 처리방침의 변경</h2>
            <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              이 개인정보 처리방침은 2024년 12월 20일부터 적용되며, 법령 및 방침에 따른 변경내용의
              추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
