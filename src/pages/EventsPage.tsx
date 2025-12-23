import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { EventRegistrationForm } from '../components/EventRegistrationForm';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

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
  participant_count?: number;
  user_registered?: boolean;
}

interface EventsPageProps {
  isDarkMode: boolean;
  highContrast: boolean;
}

const EventsPage = ({ isDarkMode, highContrast }: EventsPageProps) => {
  const { profile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [profile]);

  const loadEvents = async () => {
    try {
      // Fetch upcoming events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .order('start_date', { ascending: true });

      if (eventsError) throw eventsError;

      // Fetch participant counts
      const eventIds = eventsData?.map(e => e.id) || [];
      const participantCounts: Record<string, number> = {};

      for (const eventId of eventIds) {
        const { count } = await supabase
          .from('event_participants')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', eventId);

        participantCounts[eventId] = count || 0;
      }

      // Check user registrations
      let userRegistrations: string[] = [];
      if (profile?.id) {
        const { data: registrationsData } = await supabase
          .from('event_participants')
          .select('event_id')
          .eq('user_id', profile.id);

        userRegistrations = registrationsData?.map(r => r.event_id) || [];
      }

      // Merge data
      const enrichedEvents = eventsData?.map(event => ({
        ...event,
        participant_count: participantCounts[event.id] || 0,
        user_registered: userRegistrations.includes(event.id),
      })) || [];

      setEvents(enrichedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (event: Event) => {
    if (!profile) {
      alert('로그인이 필요합니다');
      return;
    }
    setSelectedEvent(event);
    setShowRegistrationForm(true);
  };

  const handleRegistrationSuccess = () => {
    loadEvents();
    setShowRegistrationForm(false);
    setSelectedEvent(null);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const isEventFull = (event: Event): boolean => {
    return (event.participant_count || 0) >= event.max_participants;
  };

  const isPastEvent = (dateString: string): boolean => {
    return new Date(dateString) < new Date();
  };

  const upcomingEvents = events.filter(e => !isPastEvent(e.event_date));
  const pastEvents = events.filter(e => isPastEvent(e.event_date));

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className={`text-4xl font-bold mb-4 tracking-widest ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
            style={{ fontFamily: 'Didot, "Bodoni MT", "Noto Serif Display", serif' }}
          >
            EVENTS
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            함께 성장하고 즐기는 써드트웬티 커뮤니티 이벤트
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="upcoming">
              예정 이벤트 ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              지난 이벤트 ({pastEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingEvents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">현재 예정된 이벤트가 없습니다</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => {
                  const isFull = isEventFull(event);

                  return (
                    <Card
                      key={event.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      {event.image_url && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          {event.user_registered && (
                            <Badge variant="secondary">등록 완료</Badge>
                          )}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {event.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4" />
                          {formatDate(event.event_date)}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-2 h-4 w-4" />
                          {event.event_time}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-2 h-4 w-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="mr-2 h-4 w-4" />
                          {event.participant_count}/{event.max_participants}명
                          {!isFull && (
                            <span className="ml-2 text-xs">
                              ({event.max_participants - (event.participant_count || 0)}석 남음)
                            </span>
                          )}
                        </div>

                        <Button
                          className="w-full mt-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRegisterClick(event);
                          }}
                          disabled={isFull || event.user_registered}
                        >
                          {event.user_registered
                            ? '등록 완료'
                            : isFull
                            ? '마감되었습니다'
                            : '참가 신청'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            {pastEvents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">지난 이벤트가 없습니다</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden opacity-75">
                    {event.image_url && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <Badge variant="outline">종료</Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {event.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        {formatDate(event.event_date)}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                        {event.participant_count}명 참여
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Event Detail Modal */}
        {selectedEvent && !showRegistrationForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedEvent.title}</CardTitle>
                    <CardDescription className="mt-2">{selectedEvent.description}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedEvent(null)}
                  >
                    <span className="text-2xl">&times;</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedEvent.image_url && (
                  <img
                    src={selectedEvent.image_url}
                    alt={selectedEvent.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">날짜</p>
                      <p className="font-semibold">{formatDate(selectedEvent.event_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">시간</p>
                      <p className="font-semibold">{selectedEvent.event_time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">장소</p>
                      <p className="font-semibold">{selectedEvent.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">참가 인원</p>
                      <p className="font-semibold">
                        {selectedEvent.participant_count}/{selectedEvent.max_participants}명
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleRegisterClick(selectedEvent)}
                  disabled={isEventFull(selectedEvent) || selectedEvent.user_registered}
                >
                  {selectedEvent.user_registered
                    ? '등록 완료'
                    : isEventFull(selectedEvent)
                    ? '마감되었습니다'
                    : '참가 신청하기'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Registration Form Modal */}
        {showRegistrationForm && selectedEvent && (
          <EventRegistrationForm
            eventId={selectedEvent.id}
            eventTitle={selectedEvent.title}
            maxParticipants={selectedEvent.max_participants}
            currentParticipants={selectedEvent.participant_count || 0}
            onClose={() => {
              setShowRegistrationForm(false);
              setSelectedEvent(null);
            }}
            onSuccess={handleRegistrationSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default EventsPage;
