import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Users, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';

interface Challenge {
  id: string;
  title: string;
  description: string;
  instructions: string;
  start_date: string;
  end_date: string;
  max_duration: number;
  status: string;
  participant_count?: number;
  user_participated?: boolean;
}

interface ChallengesPageProps {
  isDarkMode: boolean;
}

const ChallengesPage = ({ isDarkMode }: ChallengesPageProps) => {
  const { profile } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, [profile]);

  const loadChallenges = async () => {
    try {
      // Fetch active challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .in('status', ['active', 'ended'])
        .order('start_date', { ascending: false });

      if (challengesError) throw challengesError;

      // Fetch participation counts
      const { data: participationCounts, error: countsError } = await supabase
        .from('challenge_participations')
        .select('challenge_id, count')
        .group('challenge_id');

      if (countsError) console.error('Error fetching counts:', countsError);

      // Fetch user's participations
      let userParticipations: string[] = [];
      if (profile?.id) {
        const { data: userParticipationsData, error: userError } = await supabase
          .from('challenge_participations')
          .select('challenge_id')
          .eq('user_id', profile.id);

        if (userError) console.error('Error fetching user participations:', userError);
        else {
          userParticipations = userParticipationsData?.map(p => p.challenge_id) || [];
        }
      }

      // Merge data
      const enrichedChallenges = challengesData?.map(challenge => ({
        ...challenge,
        participant_count: participationCounts?.find(pc => pc.challenge_id === challenge.id)?.count || 0,
        user_participated: userParticipations.includes(challenge.id),
      })) || [];

      setChallenges(enrichedChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSuccess = () => {
    loadChallenges();
    setSelectedChallenge(null);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isActive = (challenge: Challenge): boolean => {
    const now = new Date();
    const start = new Date(challenge.start_date);
    const end = new Date(challenge.end_date);
    return challenge.status === 'active' && now >= start && now <= end;
  };

  const activeChallenges = challenges.filter(c => isActive(c));
  const endedChallenges = challenges.filter(c => c.status === 'ended' || !isActive(c));

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">음성 챌린지</h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            당신의 이야기를 음성으로 공유해보세요
          </p>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">
              진행 중 ({activeChallenges.length})
            </TabsTrigger>
            <TabsTrigger value="ended">
              종료됨 ({endedChallenges.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {activeChallenges.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  진행 중인 챌린지가 없습니다
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeChallenges.map((challenge) => (
                  <Card
                    key={challenge.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedChallenge(challenge)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle>{challenge.title}</CardTitle>
                        {challenge.user_participated && (
                          <Badge variant="secondary">참여 완료</Badge>
                        )}
                      </div>
                      <CardDescription>{challenge.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4" />
                          {formatDate(challenge.end_date)}까지
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="mr-2 h-4 w-4" />
                          최대 {challenge.max_duration}초
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Users className="mr-2 h-4 w-4" />
                          {challenge.participant_count}명 참여
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ended" className="space-y-6">
            {endedChallenges.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  종료된 챌린지가 없습니다
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {endedChallenges.map((challenge) => (
                  <Card key={challenge.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle>{challenge.title}</CardTitle>
                        <Badge variant="outline">종료</Badge>
                      </div>
                      <CardDescription>{challenge.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Users className="mr-2 h-4 w-4" />
                          {challenge.participant_count}명 참여
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Challenge Detail Modal */}
        {selectedChallenge && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedChallenge.title}</h2>
                    <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {selectedChallenge.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">참여 방법</h3>
                    <pre className={`whitespace-pre-wrap text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {selectedChallenge.instructions}
                    </pre>
                  </div>

                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-lg font-semibold">챌린지 참여 기능</p>
                      <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedChallenge.user_participated
                          ? '이미 참여하셨습니다! 감사합니다.'
                          : '챌린지 참여 기능은 준비 중입니다.'}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengesPage;
