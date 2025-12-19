import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { EventRegistrationForm } from '../components/EventRegistrationForm';
import { Calendar, MapPin, Users, Clock, ArrowLeft, User, Check } from 'lucide-react';
import QRCode from 'qrcode';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  max_participants: number;
  image_url?: string;
  status: string;
  created_at: string;
}

interface EventDetailPageProps {
  eventId: string;
  onBack: () => void;
  isDarkMode: boolean;
}

const EventDetailPage = ({ eventId, onBack, isDarkMode }: EventDetailPageProps) => {
  const { profile } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEventDetails();
  }, [eventId, profile]);

  const loadEventDetails = async () => {
    try {
      // Load event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      setEvent(eventData);

      // Load participant count
      const { count } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      setParticipantCount(count || 0);

      // Check if user is registered
      if (profile?.id) {
        const { data: registration } = await supabase
          .from('event_participants')
          .select('id, qr_code')
          .eq('event_id', eventId)
          .eq('user_id', profile.id)
          .single();

        if (registration) {
          setIsRegistered(true);

          // Generate QR code if registered
          if (registration.qr_code) {
            const qr = await QRCode.toDataURL(registration.qr_code);
            setQrCodeUrl(qr);
          }
        }
      }
    } catch (error) {
      console.error('Error loading event details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
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

  if (!event) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button onClick={onBack} variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로 가기
          </Button>
          <div className="text-center mt-8">이벤트를 찾을 수 없습니다</div>
        </div>
      </div>
    );
  }

  const isFull = participantCount >= event.max_participants;
  const spotsLeft = event.max_participants - participantCount;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button onClick={onBack} variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          이벤트 목록으로
        </Button>

        {/* Event Image */}
        {event.image_url && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Event Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-4xl font-bold">{event.title}</h1>
            <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
              {event.status === 'published' ? '모집 중' : '준비 중'}
            </Badge>
          </div>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {event.description}
          </p>
        </div>

        {/* Event Info Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">날짜</p>
                  <p className="font-semibold">{formatDate(event.event_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">시간</p>
                  <p className="font-semibold">{event.event_time}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">장소</p>
                  <p className="font-semibold">{event.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">참가 인원</p>
                  <p className="font-semibold">
                    {participantCount}/{event.max_participants}명
                    {!isFull && (
                      <span className="text-sm text-muted-foreground ml-2">
                        ({spotsLeft}석 남음)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registration Status / QR Code */}
        {isRegistered ? (
          <Card className="mb-8 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                    참가 신청 완료
                  </h3>
                  <p className="text-green-700 dark:text-green-300 mb-4">
                    이벤트 참가 신청이 완료되었습니다. 이벤트 당일 QR 코드를 보여주세요.
                  </p>
                  {qrCodeUrl && (
                    <div className="bg-white p-4 rounded-lg inline-block">
                      <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                      <p className="text-xs text-center text-gray-600 mt-2">출석 체크용 QR 코드</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <Button
                onClick={() => setShowRegistrationForm(true)}
                className="w-full"
                size="lg"
                disabled={isFull || event.status !== 'published'}
              >
                {isFull ? '마감되었습니다' : '참가 신청하기'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <EventRegistrationForm
          eventId={event.id}
          eventTitle={event.title}
          maxParticipants={event.max_participants}
          currentParticipants={participantCount}
          onClose={() => setShowRegistrationForm(false)}
          onSuccess={loadEventDetails}
        />
      )}
    </div>
  );
};

export default EventDetailPage;
