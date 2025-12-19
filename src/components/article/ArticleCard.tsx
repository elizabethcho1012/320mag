import React from 'react';

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

interface ArticleCardProps {
  article: Article;
  onArticleClick: (id: number) => void;
  isDarkMode: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onArticleClick, isDarkMode }) => {
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  
  return (
    <div className="cursor-pointer group" onClick={() => onArticleClick(article.id)}>
      <img 
        src={article.image}
        alt={article.title}
        className="w-full h-48 object-cover mb-3 group-hover:opacity-90 transition-opacity"
      />
      <span className="text-xs text-purple-600 uppercase tracking-wide font-medium mb-1 block">
        {article.subcategory}
      </span>
      <h3 className={`text-sm font-bold leading-tight group-hover:text-purple-600 transition-colors ${textClass}`}>
        {article.title}
      </h3>
    </div>
  );
};

export default ArticleCard;