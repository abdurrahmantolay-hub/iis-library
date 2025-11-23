
import React from 'react';
import { NewsArticle } from '../types';

interface SchoolNewsProps {
    news: NewsArticle[];
}

const SchoolNews: React.FC<SchoolNewsProps> = ({ news }) => {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-text-primary tracking-tight sm:text-5xl">School News & Events</h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-text-secondary">
          Stay up-to-date with the latest happenings at Istanbul International School.
        </p>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
        {news.map((article) => (
          <div key={article.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 flex flex-col hover:shadow-xl">
            <div className="relative">
              <img className="h-56 w-full object-cover" src={article.imageUrl} alt={article.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-4">
                <p className="text-sm text-white/90">{article.date}</p>
                <h2 className="text-xl font-bold text-white leading-tight">{article.title}</h2>
              </div>
            </div>
            <div className="p-6 flex-grow">
              <p className="text-text-secondary line-clamp-3">{article.excerpt}</p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100">
               <button className="text-sm font-semibold text-primary hover:text-accent transition-colors">
                Read More &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchoolNews;
