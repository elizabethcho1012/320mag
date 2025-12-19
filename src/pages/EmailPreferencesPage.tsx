import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { emailService } from '../services/emailService';
import { useToast } from '../hooks/use-toast';
import { Mail, Bell, Calendar, Mic, TrendingUp } from 'lucide-react';

interface EmailPreferencesPageProps {
  isDarkMode: boolean;
  onBack: () => void;
}

const EmailPreferencesPage = ({ isDarkMode, onBack }: EmailPreferencesPageProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [preferences, setPreferences] = useState({
    new_articles: true,
    weekly_digest: true,
    events: true,
    challenges: true,
    marketing: false,
  });

  useEffect(() => {
    loadPreferences();
  }, [profile]);

  const loadPreferences = async () => {
    if (!profile?.id) return;

    try {
      const prefs = await emailService.getPreferences(profile.id);
      if (prefs) {
        setPreferences({
          new_articles: prefs.new_articles ?? true,
          weekly_digest: prefs.weekly_digest ?? true,
          events: prefs.events ?? true,
          challenges: prefs.challenges ?? true,
          marketing: prefs.marketing ?? false,
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile?.id) return;

    setSaving(true);

    try {
      const result = await emailService.updatePreferences(profile.id, preferences);

      if (result.success) {
        toast({
          title: '설정 저장 완료',
          description: '이메일 알림 설정이 저장되었습니다.',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: '저장 실패',
        description: error.message || '설정 저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button onClick={onBack} variant="ghost" className="mb-6">
          ← 뒤로 가기
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              이메일 알림 설정
            </CardTitle>
            <CardDescription>
              받고 싶은 이메일 알림을 선택하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* New Articles */}
            <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border">
              <div className="flex items-start space-x-4 flex-1">
                <Bell className="h-5 w-5 mt-0.5 text-purple-600" />
                <div className="flex-1">
                  <Label htmlFor="new_articles" className="text-base font-medium cursor-pointer">
                    새 기사 알림
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    새로운 기사가 발행될 때 이메일로 알림을 받습니다
                  </p>
                </div>
              </div>
              <Switch
                id="new_articles"
                checked={preferences.new_articles}
                onCheckedChange={() => handleToggle('new_articles')}
              />
            </div>

            {/* Weekly Digest */}
            <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border">
              <div className="flex items-start space-x-4 flex-1">
                <TrendingUp className="h-5 w-5 mt-0.5 text-purple-600" />
                <div className="flex-1">
                  <Label htmlFor="weekly_digest" className="text-base font-medium cursor-pointer">
                    주간 다이제스트
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    매주 인기 기사와 트렌드를 정리한 다이제스트를 받습니다
                  </p>
                </div>
              </div>
              <Switch
                id="weekly_digest"
                checked={preferences.weekly_digest}
                onCheckedChange={() => handleToggle('weekly_digest')}
              />
            </div>

            {/* Events */}
            <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border">
              <div className="flex items-start space-x-4 flex-1">
                <Calendar className="h-5 w-5 mt-0.5 text-purple-600" />
                <div className="flex-1">
                  <Label htmlFor="events" className="text-base font-medium cursor-pointer">
                    이벤트 알림
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    새로운 이벤트 등록 확인 및 리마인더를 받습니다
                  </p>
                </div>
              </div>
              <Switch
                id="events"
                checked={preferences.events}
                onCheckedChange={() => handleToggle('events')}
              />
            </div>

            {/* Challenges */}
            <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border">
              <div className="flex items-start space-x-4 flex-1">
                <Mic className="h-5 w-5 mt-0.5 text-purple-600" />
                <div className="flex-1">
                  <Label htmlFor="challenges" className="text-base font-medium cursor-pointer">
                    챌린지 알림
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    새로운 챌린지와 참여 확인 알림을 받습니다
                  </p>
                </div>
              </div>
              <Switch
                id="challenges"
                checked={preferences.challenges}
                onCheckedChange={() => handleToggle('challenges')}
              />
            </div>

            {/* Marketing */}
            <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border">
              <div className="flex items-start space-x-4 flex-1">
                <Mail className="h-5 w-5 mt-0.5 text-purple-600" />
                <div className="flex-1">
                  <Label htmlFor="marketing" className="text-base font-medium cursor-pointer">
                    마케팅 이메일
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    프로모션, 이벤트, 특별 혜택 등의 마케팅 이메일을 받습니다
                  </p>
                </div>
              </div>
              <Switch
                id="marketing"
                checked={preferences.marketing}
                onCheckedChange={() => handleToggle('marketing')}
              />
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full"
              >
                {saving ? '저장 중...' : '설정 저장'}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              언제든지 설정을 변경할 수 있습니다. 모든 이메일 하단의 '수신 거부' 링크를 통해서도 설정할 수 있습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailPreferencesPage;
