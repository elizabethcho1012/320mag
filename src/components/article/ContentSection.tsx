import React from 'react';
import ArticleCard from './ArticleCard';

interface Article {
  id: number;
  title: string;
  category: string;
  subcategory: string;
  author: string;
  image: string;
  excerpt: string;
  readTime: string;
  publishDate: string;
  featured: boolean;
  tags: string[];
}

interface ContentSectionProps {
  title: string;
  items: Article[];
  onArticleClick: (id: number) => void;
  isDarkMode: boolean;
}

const ContentSection: React.FC<ContentSectionProps> = ({ title, items, onArticleClick, isDarkMode }) => {
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  
  return (
    <section className="mb-16">
      <div className="flex items-center mb-8">
        <h2 className={`text-2xl font-bold tracking-widest ${textClass}`}
            style={{ fontFamily: 'Didot, "Bodoni MT", "Noto Serif Display", "URW Palladio L", P052, Sylfaen, serif' }}>
          {title}
        </h2>
        <div className={`flex-1 h-px ml-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.slice(0, 4).map((article) => (
          <ArticleCard 
            key={article.id} 
            article={article} 
            onArticleClick={onArticleClick}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    </section>
  );
};

export default ContentSection;