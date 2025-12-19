// 푸시 알림 관리 서비스
// FCM을 사용한 개인화된 푸시 알림 발송

import { supabase } from '@/lib/supabase';
import type { PushSettings } from '@/types/ai-editor';

interface SendNotificationParams {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

interface ScheduledNotification {
  editorId: string;
  articleId: string;
  title: string;
  body: string;
  scheduledTime: Date;
}

/**
 * 사용자의 푸시 알림 설정 조회
 */
export async function getUserPushSettings(userId: string): Promise<PushSettings | null> {
  try {
    const { data, error } = await supabase
      .from('push_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting push settings:', error);
    return null;
  }
}

/**
 * 푸시 알림 설정 업데이트
 */
export async function updatePushSettings(
  userId: string,
  settings: Partial<PushSettings>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('push_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating push settings:', error);
    throw error;
  }
}

/**
 * FCM 토큰 저장
 */
export async function saveFCMToken(userId: string, token: string): Promise<void> {
  await updatePushSettings(userId, { fcm_token: token });
}

/**
 * 조용한 시간인지 확인
 */
function isQuietHours(settings: PushSettings): boolean {
  if (!settings.quiet_hours_start || !settings.quiet_hours_end) {
    return false;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [startHour, startMin] = settings.quiet_hours_start.split(':').map(Number);
  const [endHour, endMin] = settings.quiet_hours_end.split(':').map(Number);

  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;

  if (startTime < endTime) {
    return currentTime >= startTime && currentTime < endTime;
  } else {
    // 자정을 넘어가는 경우 (예: 21:00 ~ 07:00)
    return currentTime >= startTime || currentTime < endTime;
  }
}

/**
 * 단일 사용자에게 푸시 알림 발송
 */
export async function sendPushNotification(params: SendNotificationParams): Promise<boolean> {
  try {
    const settings = await getUserPushSettings(params.userId);

    if (!settings || !settings.is_enabled || !settings.fcm_token) {
      console.log(`Push disabled for user ${params.userId}`);
      return false;
    }

    // 조용한 시간 체크
    if (isQuietHours(settings)) {
      console.log(`Quiet hours for user ${params.userId}`);
      return false;
    }

    // FCM API 호출 (서버사이드 또는 Firebase Admin SDK 필요)
    // 실제 구현시 백엔드 API 엔드포인트 필요
    const response = await fetch('/api/send-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: settings.fcm_token,
        notification: {
          title: params.title,
          body: params.body,
          image: params.imageUrl,
        },
        data: params.data,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

/**
 * 새 아티클 발행 시 구독자들에게 알림
 */
export async function notifyNewArticle(
  articleId: string,
  editorId: string,
  title: string,
  excerpt: string
): Promise<void> {
  try {
    // 해당 에디터를 구독한 사용자들 조회
    const { data: subscribers, error } = await supabase
      .from('push_settings')
      .select('user_id, fcm_token')
      .contains('subscribed_editors', [editorId])
      .eq('is_enabled', true);

    if (error) throw error;

    // 각 구독자에게 알림 발송
    for (const subscriber of subscribers || []) {
      await sendPushNotification({
        userId: subscriber.user_id,
        title,
        body: excerpt,
        data: {
          type: 'new_article',
          article_id: articleId,
          editor_id: editorId,
        },
      });
    }

    console.log(`Sent notifications to ${subscribers?.length || 0} subscribers`);
  } catch (error) {
    console.error('Error notifying new article:', error);
  }
}

/**
 * 챌린지 댓글 알림
 */
export async function notifyChallengeReply(
  challengeOwnerId: string,
  commenterName: string,
  comment: string
): Promise<void> {
  await sendPushNotification({
    userId: challengeOwnerId,
    title: `${commenterName}님이 댓글을 남겼습니다`,
    body: comment,
    data: {
      type: 'challenge_reply',
    },
  });
}

/**
 * 챌린지 좋아요 알림
 */
export async function notifyChallengeLike(
  challengeOwnerId: string,
  likerName: string
): Promise<void> {
  await sendPushNotification({
    userId: challengeOwnerId,
    title: '좋아요를 받았습니다',
    body: `${likerName}님이 회원님의 생각에 공감했습니다`,
    data: {
      type: 'challenge_like',
    },
  });
}

/**
 * 일일 알림 스케줄 (10개 에디터, 2시간 간격)
 */
export function generateDailyNotificationSchedule(): ScheduledNotification[] {
  const editors = [
    { id: 'fashion-sophia', name: '소피아', category: '패션' },
    { id: 'beauty-jane', name: '제인', category: '뷰티' },
    { id: 'culture-martin', name: '마틴', category: '컬처' },
    { id: 'lifestyle-clara', name: '클라라', category: '라이프스타일' },
    { id: 'senior-henry', name: '헨리', category: '시니어시장' },
    { id: 'finance-david', name: '데이비드', category: '금융' },
    { id: 'global-naomi', name: '나오미', category: '글로벌트렌드' },
    { id: 'food-antoine', name: '앙투안', category: '푸드' },
    { id: 'housing-emily', name: '에밀리', category: '하우징' },
    { id: 'medical-dr-lee', name: '닥터 리', category: '의료' },
  ];

  const schedule: ScheduledNotification[] = [];
  const startHour = 8; // 오전 8시 시작

  editors.forEach((editor, index) => {
    const scheduledTime = new Date();
    scheduledTime.setHours(startHour + index * 2, 0, 0, 0);

    schedule.push({
      editorId: editor.id,
      articleId: '', // 실제 아티클 ID로 교체
      title: `${editor.name}의 ${editor.category} 스토리`,
      body: '오늘의 새로운 이야기를 확인해보세요',
      scheduledTime,
    });
  });

  return schedule;
}

/**
 * 주간 다이제스트 발송
 */
export async function sendWeeklyDigest(userId: string): Promise<void> {
  try {
    const settings = await getUserPushSettings(userId);

    if (!settings || !settings.weekly_digest) {
      return;
    }

    // 이번 주 인기 아티클 조회
    const { data: topArticles, error } = await supabase
      .from('articles')
      .select('title, excerpt, view_count')
      .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('view_count', { ascending: false })
      .limit(5);

    if (error) throw error;

    const digest = topArticles?.map((a, i) => `${i + 1}. ${a.title}`).join('\n') || '';

    await sendPushNotification({
      userId,
      title: '📰 이번 주 인기 스토리',
      body: digest,
      data: {
        type: 'weekly_digest',
      },
    });
  } catch (error) {
    console.error('Error sending weekly digest:', error);
  }
}
