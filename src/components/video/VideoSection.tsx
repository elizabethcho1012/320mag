import React from 'react';
import VideoCard from './VideoCard';

interface VideoSectionProps {
  isDarkMode: boolean;
}

const VideoSection: React.FC<VideoSectionProps> = ({ isDarkMode }) => {
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  
  const videos = [
    {
      id: 1,
      title: "50대의 새로운 시작, 김영희 스타일리스트와의 대화",
      category: "INTERVIEW",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      title: "시니어를 위한 5분 메이크업 루틴",
      category: "TUTORIAL",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      title: "인생 2막, 새로운 도전을 시작한 사람들",
      category: "STORY",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"
    }
  ];

  return (
    <section className="mb-16">
      <div className="flex items-center mb-8">
        <h2 className={`text-2xl font-bold tracking-widest ${textClass}`}
            style={{ fontFamily: 'Didot, "Bodoni MT", "Noto Serif Display", "URW Palladio L", P052, Sylfaen, serif' }}>
          VIDEO
        </h2>
        <div className={`flex-1 h-px ml-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} isDarkMode={isDarkMode} />
        ))}
      </div>
    </section>
  );
};

export default VideoSection;