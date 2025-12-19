import React from 'react';

interface Creator {
  id: number;
  name: string;
  profession: string;
  age: number;
  experience: string;
  specialty: string;
  image: string;
  bio: string;
  articles: number;
  followers: string;
  verified: boolean;
}

interface CreatorCardProps {
  creator: Creator;
  isDarkMode: boolean;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator, isDarkMode }) => {
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-200';
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subtextClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className={`${cardClass} rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer text-center`}>
      <h3 className={`text-xl font-bold mb-2 ${textClass} flex items-center justify-center gap-2`}>
        {creator.name}
        {creator.verified && (
          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
      </h3>
      <p className="text-purple-600 font-medium mb-1">{creator.profession}</p>
      <p className={`text-sm mb-4 ${subtextClass}`}>{creator.experience} • {creator.age}세</p>
      
      <div className="mb-4">
        <span className={`inline-block text-xs px-3 py-1 rounded-full ${
          isDarkMode 
            ? 'bg-purple-900 text-purple-200' 
            : 'bg-purple-100 text-purple-800'
        }`}>
          {creator.specialty}
        </span>
      </div>
      
      <p className={`text-sm leading-relaxed mb-4 ${subtextClass}`}>{creator.bio}</p>
      
      <div className={`flex justify-between text-sm border-t pt-4 ${subtextClass} ${
        isDarkMode ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <span>아티클 {creator.articles}개</span>
        <span>팔로워 {creator.followers}</span>
      </div>
    </div>
  );
};

export default CreatorCard;