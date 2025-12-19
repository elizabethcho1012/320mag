import React from 'react';

interface Video {
  id: number;
  title: string;
  category: string;
  image: string;
}

interface VideoCardProps {
  video: Video;
  isDarkMode: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, isDarkMode }) => {
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  
  return (
    <div className="cursor-pointer group">
      <div className="relative">
        <img 
          src={video.image}
          alt={video.title}
          className="w-full h-48 object-cover mb-3 group-hover:opacity-90 transition-opacity rounded-lg"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white bg-opacity-90 rounded-full p-3 group-hover:bg-opacity-100 transition-all">
            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>
      <span className="text-xs text-purple-600 uppercase tracking-wide font-medium mb-1 block">
        {video.category}
      </span>
      <h3 className={`text-sm font-bold leading-tight group-hover:text-purple-600 transition-colors ${textClass}`}>
        {video.title}
      </h3>
    </div>
  );
};

export default VideoCard;