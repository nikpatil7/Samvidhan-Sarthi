import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserStoryCard from '../components/UserStoryCard';

const UserStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(
        'http://localhost:5000/api/user-stories'
      );

      console.log('Stories API Response:', response.data);

      if (response.data.success) {
        setStories(response.data.data || []);
      } else {
        setError('Failed to load stories');
      }
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="card p-8 text-center">
          <div className="text-white text-lg">
            Loading User Stories...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Page Header */}

      <div>
        <h1 className="text-4xl font-bold text-white mb-3">
          User Stories
        </h1>

        <p className="text-lg text-gray-400 max-w-4xl">
          Explore inspiring stories that demonstrate how constitutional rights,
          democratic values, and civic awareness can empower citizens and bring
          meaningful change to society.
        </p>
      </div>

      {/* Story Count */}

      <div className="card p-5">
        <div className="text-3xl font-bold text-primary-500">
          {stories.length}
        </div>

        <div className="text-gray-400 mt-1">
          Stories Available
        </div>
      </div>

      {/* Error State */}

      {error && (
        <div className="card p-6 border border-red-500/30">
          <p className="text-red-400">
            {error}
          </p>
        </div>
      )}

      {/* Empty State */}

      {!loading && !error && stories.length === 0 && (
        <div className="card p-10 text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            No Stories Available
          </h2>

          <p className="text-gray-400">
            User stories will appear here once they are added.
          </p>
        </div>
      )}

      {/* Stories Grid */}

      {stories.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-white mb-6">
            Featured Stories
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {stories.map((story) => (
              <UserStoryCard
                key={story._id}
                story={story}
              />
            ))}
          </div>
        </div>
      )}

<div className="card p-4 border-l-4 border-primary-500">
  <p className="text-sm text-gray-400 leading-relaxed">
    <span className="font-semibold text-primary-400">
      Educational Disclaimer:
    </span>{' '}
    These stories are educational case studies inspired by constitutional
    principles, civic participation initiatives, and real-world governance
    scenarios. They are designed to help learners understand the practical
    impact of constitutional rights, duties, and democratic values in everyday
    life.
  </p>
</div>

    </div>
  );
};

export default UserStories;