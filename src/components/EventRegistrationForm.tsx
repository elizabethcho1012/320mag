import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { X } from 'lucide-react';

interface EventRegistrationFormProps {
  eventId: string;
  eventTitle: string;
  maxParticipants: number;
  currentParticipants: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const EventRegistrationForm = ({
  eventId,
  eventTitle,
  maxParticipants,
  currentParticipants,
  onClose,
  onSuccess,
}: EventRegistrationFormProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: profile?.username || '',
    email: profile?.email || '',
    phone: '',
    notes: '',
    dietary_restrictions: '',
    emergency_contact: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) {
      toast({
        title: '로그인 필요',
        description: '이벤트에 참가하려면 로그인이 필요합니다.',
        variant: 'destructive',
      });
      return;
    }

    // Check if event is full
    if (currentParticipants >= maxParticipants) {
      toast({
        title: '마감된 이벤트',
        description: '이미 모든 자리가 찼습니다.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if already registered
      const { data: existingRegistration } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', profile.id)
        .single();

      if (existingRegistration) {
        toast({
          title: '이미 등록됨',
          description: '이미 이 이벤트에 등록하셨습니다.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Register for event
      const { error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: profile.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          notes: formData.notes,
          dietary_restrictions: formData.dietary_restrictions,
          emergency_contact: formData.emergency_contact,
          status: 'registered',
        });

      if (error) throw error;

      toast({
        title: '등록 완료',
        description: '이벤트 등록이 완료되었습니다!',
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: '등록 실패',
        description: error.message || '이벤트 등록 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{eventTitle} 참가 신청</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                참가 정보를 입력해주세요
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="홍길동"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일 *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="example@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">연락처 *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="010-1234-5678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact">비상 연락처</Label>
                <Input
                  id="emergency_contact"
                  type="tel"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  placeholder="010-9876-5432"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietary_restrictions">식이 제한사항 (알러지 등)</Label>
                <Input
                  id="dietary_restrictions"
                  value={formData.dietary_restrictions}
                  onChange={(e) => setFormData({ ...formData, dietary_restrictions: e.target.value })}
                  placeholder="땅콩 알러지"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">특이사항 및 요청사항</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="참가에 필요한 추가 정보나 요청사항을 입력해주세요"
                  rows={4}
                />
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>참가 정원:</strong> {currentParticipants}/{maxParticipants}명
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                등록 후 참가 확인 이메일이 발송됩니다.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || currentParticipants >= maxParticipants}
              >
                {isSubmitting ? '등록 중...' : '참가 신청'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
