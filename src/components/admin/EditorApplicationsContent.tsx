import React, { useState, useEffect } from 'react';
import { supabaseAny as supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface EditorApplicationsContentProps {
  isDarkMode: boolean;
}

interface EditorApplication {
  id: string;
  user_id: string;
  creator_id: string | null;
  application_text: string;
  writing_samples: string | null;
  experience: string | null;
  specialty: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  profiles: {
    email: string;
    username: string;
    display_name: string | null;
  };
  creators: {
    name: string;
  } | null;
}

const EditorApplicationsContent: React.FC<EditorApplicationsContentProps> = ({ isDarkMode }) => {
  const { profile } = useAuth();
  const [applications, setApplications] = useState<EditorApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedApplication, setSelectedApplication] = useState<EditorApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const subtextClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  // 신청 목록 로드
  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('editor_applications')
        .select(`
          *,
          profiles(email, username, display_name),
          creators(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('신청 목록 로드 오류:', error);
      alert('신청 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  // 필터링
  const filteredApplications = applications.filter(app => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

  // 신청 승인
  const handleApprove = async (applicationId: string) => {
    if (!confirm('이 신청을 승인하시겠습니까? 승인 시 사용자는 에디터 권한을 받게 됩니다.')) {
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('editor_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: profile?.id,
          admin_notes: adminNotes || null,
        })
        .eq('id', applicationId);

      if (error) throw error;

      alert('신청이 승인되었습니다. 사용자에게 에디터 권한이 부여되었습니다.');
      setSelectedApplication(null);
      setAdminNotes('');
      await loadApplications();
    } catch (error: any) {
      console.error('승인 처리 오류:', error);
      alert(`승인 처리 실패: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 신청 거절
  const handleReject = async (applicationId: string) => {
    if (!confirm('이 신청을 거절하시겠습니까?')) {
      return;
    }

    if (!adminNotes.trim()) {
      alert('거절 사유를 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('editor_applications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: profile?.id,
          admin_notes: adminNotes,
        })
        .eq('id', applicationId);

      if (error) throw error;

      alert('신청이 거절되었습니다.');
      setSelectedApplication(null);
      setAdminNotes('');
      await loadApplications();
    } catch (error: any) {
      console.error('거절 처리 오류:', error);
      alert(`거절 처리 실패: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 상태 뱃지 색상
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '대기 중';
      case 'approved': return '승인됨';
      case 'rejected': return '거절됨';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-2xl font-bold ${textClass}`}>에디터 신청 관리</h2>
          <p className={`text-sm ${subtextClass} mt-1`}>
            크리에이터들의 에디터 신청을 검토하고 승인/거절하세요
          </p>
        </div>
        <button
          onClick={loadApplications}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          새로고침
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`${cardClass} rounded-lg border p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${subtextClass}`}>전체 신청</p>
              <p className={`text-2xl font-bold ${textClass}`}>{applications.length}</p>
            </div>
            <div className="text-3xl">📝</div>
          </div>
        </div>
        <div className={`${cardClass} rounded-lg border p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${subtextClass}`}>대기 중</p>
              <p className={`text-2xl font-bold text-yellow-600`}>
                {applications.filter(a => a.status === 'pending').length}
              </p>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
        </div>
        <div className={`${cardClass} rounded-lg border p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${subtextClass}`}>승인됨</p>
              <p className={`text-2xl font-bold text-green-600`}>
                {applications.filter(a => a.status === 'approved').length}
              </p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
        <div className={`${cardClass} rounded-lg border p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${subtextClass}`}>거절됨</p>
              <p className={`text-2xl font-bold text-red-600`}>
                {applications.filter(a => a.status === 'rejected').length}
              </p>
            </div>
            <div className="text-3xl">❌</div>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className={`${cardClass} rounded-lg border p-4 mb-6`}>
        <div className="flex items-center gap-4">
          <span className={`text-sm font-medium ${textClass}`}>필터:</span>
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-purple-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? '전체' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 신청 목록 */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className={`${cardClass} rounded-lg border p-8 text-center`}>
            <p className={subtextClass}>
              {filterStatus === 'all'
                ? '아직 에디터 신청이 없습니다.'
                : `${getStatusLabel(filterStatus)} 신청이 없습니다.`}
            </p>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <div
              key={application.id}
              className={`${cardClass} rounded-lg border p-6 hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-lg font-semibold ${textClass}`}>
                      {application.profiles?.display_name || application.profiles?.username}
                    </h3>
                    <span className={`text-xs px-3 py-1 rounded-full ${getStatusBadge(application.status)}`}>
                      {getStatusLabel(application.status)}
                    </span>
                    {application.specialty && (
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {application.specialty}
                      </span>
                    )}
                  </div>

                  <p className={`text-sm ${subtextClass} mb-1`}>
                    이메일: {application.profiles?.email}
                  </p>

                  {application.creators && (
                    <p className={`text-sm ${subtextClass} mb-3`}>
                      희망 크리에이터: {application.creators.name}
                    </p>
                  )}

                  <p className={`text-sm ${textClass} mb-3`}>
                    <span className="font-medium">지원 동기:</span> {application.application_text}
                  </p>

                  {application.experience && (
                    <p className={`text-sm ${textClass} mb-2`}>
                      <span className="font-medium">경력:</span> {application.experience}
                    </p>
                  )}

                  {application.writing_samples && (
                    <div className="mb-3">
                      <p className={`text-sm font-medium ${textClass} mb-1`}>글 샘플:</p>
                      <div className={`text-sm ${subtextClass} whitespace-pre-wrap`}>
                        {application.writing_samples}
                      </div>
                    </div>
                  )}

                  {application.admin_notes && (
                    <div className={`mt-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <p className={`text-sm font-medium ${textClass} mb-1`}>관리자 노트:</p>
                      <p className={`text-sm ${subtextClass}`}>{application.admin_notes}</p>
                    </div>
                  )}

                  <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-3 flex gap-4`}>
                    <span>신청일: {formatDate(application.created_at)}</span>
                    {application.reviewed_at && (
                      <span>검토일: {formatDate(application.reviewed_at)}</span>
                    )}
                  </div>
                </div>

                {application.status === 'pending' && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedApplication(application);
                        setAdminNotes(application.admin_notes || '');
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      검토하기
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 검토 모달 */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardClass} rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>
            <div className={`sticky top-0 ${cardClass} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-6 z-10`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${textClass}`}>에디터 신청 검토</h3>
                <button
                  onClick={() => {
                    setSelectedApplication(null);
                    setAdminNotes('');
                  }}
                  className={`${subtextClass} hover:${textClass} transition-colors`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className={`text-lg font-semibold ${textClass}`}>
                  {selectedApplication.profiles?.display_name || selectedApplication.profiles?.username}
                </p>
                <p className={`text-sm ${subtextClass}`}>{selectedApplication.profiles?.email}</p>
              </div>

              {selectedApplication.specialty && (
                <div>
                  <p className={`text-sm font-medium ${textClass} mb-1`}>전문 분야</p>
                  <p className={`text-sm ${subtextClass}`}>{selectedApplication.specialty}</p>
                </div>
              )}

              <div>
                <p className={`text-sm font-medium ${textClass} mb-1`}>지원 동기</p>
                <p className={`text-sm ${subtextClass}`}>{selectedApplication.application_text}</p>
              </div>

              {selectedApplication.experience && (
                <div>
                  <p className={`text-sm font-medium ${textClass} mb-1`}>경력</p>
                  <p className={`text-sm ${subtextClass}`}>{selectedApplication.experience}</p>
                </div>
              )}

              {selectedApplication.writing_samples && (
                <div>
                  <p className={`text-sm font-medium ${textClass} mb-1`}>글 샘플</p>
                  <p className={`text-sm ${subtextClass} whitespace-pre-wrap`}>{selectedApplication.writing_samples}</p>
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-2`}>
                  관리자 노트 {selectedApplication.status === 'pending' && '(거절 시 필수)'}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className={`w-full px-4 py-3 border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]`}
                  placeholder="검토 의견을 입력하세요..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setSelectedApplication(null);
                    setAdminNotes('');
                  }}
                  disabled={isProcessing}
                  className={`flex-1 px-6 py-3 border ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  } ${textClass} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50`}
                >
                  취소
                </button>
                <button
                  onClick={() => handleReject(selectedApplication.id)}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? '처리 중...' : '거절'}
                </button>
                <button
                  onClick={() => handleApprove(selectedApplication.id)}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? '처리 중...' : '승인'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorApplicationsContent;
