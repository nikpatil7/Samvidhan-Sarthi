import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ConstitutionalTopicCard = ({ topic }) => {
  const categoryStyles = {
    'Fundamental Rights': 'border-primary-500 bg-primary-50 text-primary-700',
    'Directive Principles': 'border-secondary-500 bg-secondary-50 text-secondary-700',
    'Federal Structure': 'border-success-500 bg-success-50 text-success-700',
    'Constitutional Bodies': 'border-primary-600 bg-primary-50 text-primary-700',
    'Amendments': 'border-secondary-600 bg-secondary-50 text-secondary-700',
    'Emergency Provisions': 'border-success-600 bg-success-50 text-success-700',
    'Historical': 'border-secondary-400 bg-secondary-50 text-secondary-700',
    'Judiciary': 'border-primary-600 bg-primary-50 text-primary-700',
    'default': 'border-gray-200 bg-surface-200 text-gray-700'
  };

  const categoryAccent = {
    'Fundamental Rights': 'bg-primary-500',
    'Directive Principles': 'bg-secondary-500',
    'Federal Structure': 'bg-success-500',
    'Constitutional Bodies': 'bg-primary-600',
    'Amendments': 'bg-secondary-600',
    'Emergency Provisions': 'bg-success-600',
    'Historical': 'bg-secondary-400',
    'Judiciary': 'bg-primary-700',
    'default': 'bg-gray-400'
  };

  const difficultyStyles = {
    Beginner: 'bg-success-50 text-success-700 border-success-100',
    Intermediate: 'bg-secondary-50 text-secondary-700 border-secondary-100',
    Advanced: 'bg-primary-50 text-primary-700 border-primary-100',
  };

  // Get an icon/emoji for the topic based on category
  const getTopicIcon = () => {
    const icons = {
      'Fundamental Rights': '\u2696\ufe0f',
      'Directive Principles': '\ud83d\udcdc',
      'Federal Structure': '\ud83c\udfe9',
      'Constitutional Bodies': '\ud83c\udfdb\ufe0f',
      'Amendments': '\u270f\ufe0f',
      'Emergency Provisions': '\ud83d\udea8',
      'Historical': '\ud83d\udcc5',
      'Judiciary': '\ud83d\udd28',
      'Preamble': '\ud83d\udcd6',
      'Governance': '\ud83c\udfe2',
      'Elections': '\ud83d\uddf3\ufe0f',
      'default': '\ud83d\udcd8'
    };
    return icons[topic.category] || icons.default;
  };

  return (
    <motion.div 
      className="h-full"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Link 
        to={`/topics/${topic.customId || topic._id}`} 
        className="block h-full"
      >
        <div 
          className="card h-full flex flex-col overflow-hidden border border-gray-200 bg-white shadow-sm transition-shadow"
        >
          <div className={`h-1 w-full ${categoryAccent[topic.category] || categoryAccent.default}`} />
          <div className="p-5 flex-grow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl" role="img" aria-label={topic.category || 'topic'}>{getTopicIcon()}</span>
                <h3 className="text-lg font-semibold text-gray-900">{topic.title}</h3>
              </div>
              {topic.difficulty && (
                <span className={`text-xs px-2 py-1 rounded-full border ${difficultyStyles[topic.difficulty] || difficultyStyles.Beginner}`}>
                  {topic.difficulty}
                </span>
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {topic.description}
            </p>

            <div className="mb-4 rounded-xl border border-gray-200 bg-surface-200 px-3 py-2 text-xs font-medium text-gray-600">
              Learn the constitutional idea behind {topic.category || 'this topic'}.
            </div>
            
            <div className="mt-auto pt-3">
              <div className="flex flex-wrap gap-2">
                {topic.category && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryStyles[topic.category] || categoryStyles.default}`}>
                    {topic.category}
                  </span>
                )}
                {topic.country && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-200 text-gray-600 border border-gray-200">
                    {topic.country}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="px-5 py-3 border-t border-gray-200 flex justify-between items-center bg-surface-200/70">
            <div className="flex items-center text-sm text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {topic.contentCount || 0} lessons
            </div>
            
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ConstitutionalTopicCard; 