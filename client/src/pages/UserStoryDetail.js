
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const UserStoryDetail = () => {
  const { id } = useParams();

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStory();
  }, [id]);

  const fetchStory = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/user-stories/${id}`
      );

      if (response.data.success) {
        setStory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching story:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content) => {
    if (!content) return null;

    const sections = content
      .split('\n')
      .filter(line => line.trim() !== '');

    return sections.map((line, index) => {
      const headingKeywords = [
        'Problem Faced',
        'How Constitutional Awareness Helped',
        'Outcome',
        'Impact',
        'Constitutional Principle',
        'Key Challenge',
        'Action Taken'
      ];

      const isHeading = headingKeywords.includes(line.trim());

      if (isHeading) {
        return (
          <h2
            key={index}
            className="text-2xl font-bold text-primary-400 mt-8 mb-3"
          >
            {line}
          </h2>
        );
      }

      return (
        <p
          key={index}
          className="text-gray-300 text-lg leading-8 mb-4"
        >
          {line}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="card p-8 text-center">
        <div className="text-white text-lg">
          Loading story...
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="card p-8 text-center">
        <div className="text-red-400 text-lg">
          Story not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">

      <Link
        to="/user-stories"
        className="inline-flex items-center text-primary-500 hover:text-primary-400 mb-8 text-sm font-medium"
      >
        ← Back to User Stories
      </Link>

      <div className="card overflow-hidden">

        {/* Hero Section */}
        <div className="p-8 border-b border-dark-200">

          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-primary-900/20 text-primary-400 mb-5">
            {story.category}
          </span>

          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            {story.title}
          </h1>

          <p className="text-lg text-gray-400">
            By {story.author}
          </p>

        </div>

        {/* Story Body */}
        <div className="p-8">
          {renderContent(story.content)}
        </div>

      </div>

    </div>
  );
};

export default UserStoryDetail;

