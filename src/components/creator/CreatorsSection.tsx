import React from 'react';
import CreatorCard from './CreatorCard';
import { creators } from '../../data/creators';

interface CreatorsSectionProps {
  isDarkMode: boolean;
}

const CreatorsSection: React.FC<CreatorsSectionProps> = ({ isDarkMode }) => {
  return (
    <section className="mb-16">
      <div className="flex items-center mb-8">
        <h2 className={`text-2xl font-bold tracking-widest ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
            style={{ fontFamily: 'Didot, "Bodoni MT", "Noto Serif Display", "URW Palladio L", P052, Sylfaen, serif' }}>
          CREATORS
        </h2>
        <div className={`flex-1 h-px ml-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {creators.map((creator) => (
          <CreatorCard key={creator.id} creator={creator} isDarkMode={isDarkMode} />
        ))}
      </div>
    </section>
  );
};

export default CreatorsSection;