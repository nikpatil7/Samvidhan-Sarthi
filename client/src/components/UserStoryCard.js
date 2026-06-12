
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const UserStoryCard = ({ story }) => {

  const getCategoryColor = () => {
    const colors = {
      'Right to Information': '#3498db',
      'Right to Education': '#2ecc71',
      'Freedom of Speech': '#9b59b6',
      'Right to Equality': '#f39c12',
      'Environmental Protection': '#16a085',
      'Women Empowerment': '#e91e63',
      'Local Governance': '#f97316',
      'Voting Rights': '#8b5cf6',
      'Good Governance': '#06b6d4',
      'Education Rights': '#22c55e',
      'default': '#3498db'
    };

    return colors[story.category] || colors.default;
  };

  const getStoryIcon = () => {
    const icons = {
      'Right to Information': '📄',
      'Right to Education': '🎓',
      'Freedom of Speech': '🗣️',
      'Right to Equality': '⚖️',
      'Environmental Protection': '🌱',
      'Women Empowerment': '👩',
      'Local Governance': '🏛️',
      'Voting Rights': '🗳️',
      'Good Governance': '📋',
      'Education Rights': '📚',
      'default': '📖'
    };

    return icons[story.category] || icons.default;
  };

  const truncateContent = (text, maxLength = 120) => {
    if (!text) return '';

    const cleanedText = text
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return cleanedText.length > maxLength
      ? cleanedText.substring(0, maxLength) + '...'
      : cleanedText;
  };

  return (
    <motion.div
      className="h-full"
      whileHover={{
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <Link
        to={`/user-stories/${story._id}`}
        className="block h-full"
      >
        <div
          className="card h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg"
          style={{
            borderTop: `4px solid ${getCategoryColor()}`
          }}
        >
          <div className="p-5 flex-grow">

            {/* Category Badge */}
            <div className="mb-4">
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: `${getCategoryColor()}20`,
                  color: getCategoryColor()
                }}
              >
                <span>{getStoryIcon()}</span>
                {story.category}
              </span>
            </div>

            {/* Story Title */}
            <h3 className="text-xl font-bold text-white leading-snug mb-3">
              {story.title}
            </h3>

            {/* Author */}
            <p className="text-sm text-primary-400 font-medium mb-4">
              {story.author}
            </p>

            {/* Preview */}
            <p className="text-gray-400 text-sm leading-6">
              {truncateContent(story.content)}
            </p>

          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-dark-200 flex justify-between items-center">

            <span className="text-sm font-medium text-primary-400">
              Read Story
            </span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>

          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default UserStoryCard;

