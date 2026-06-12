import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';
import ConstitutionalTopicCard from '../components/ConstitutionalTopicCard';
import { Link } from 'react-router-dom';

// Define the level structure
const levels = [
  {
    id: 'level0',
    name: 'Level 0: Introduction',
    description: 'Get started with the basics of Indian Constitution'
  },
  {
    id: 'level1',
    name: 'Level 1: Basic Structure',
    description: 'Explore the 25 parts of the Indian Constitution'
  },
  {
    id: 'level2',
    name: 'Level 2: Schedules',
    description: 'Learn about the 12 schedules of the Constitution'
  },
  {
    id: 'level3',
    name: 'Level 3: Amendments',
    description: 'Study significant amendments to the Constitution'
  },
  {
    id: 'level4',
    name: 'Level 4: Advanced',
    description: 'Dive into advanced constitutional concepts and doctrines'
  }
];

// Level-to-customId prefix mapping
const levelPrefixMap = {
  level0: 'l0-',
  level1: 'l1-',
  level2: 'l2-',
  level3: 'l3-',
  level4: 'l4-'
};

const ConstitutionalTopics = () => {
  const { authAxios } = useContext(AuthContext);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('level0');
  const [filters, setFilters] = useState({
    country: 'India', // Default to India
    category: '',
    difficulty: ''
  });

  // Fetch topics from the API
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all topics for the selected country from the real API
        const response = await authAxios.get(`/content/topics/${encodeURIComponent(filters.country)}`);
        let allTopics = response.data || [];
        
        // Also fetch content counts per topic
        const topicsWithCounts = await Promise.all(
          allTopics.map(async (topic) => {
            try {
              const contentRes = await authAxios.get(`/content/topics/${topic._id}/content`);
              return { ...topic, contentCount: contentRes.data?.length || 0 };
            } catch {
              return { ...topic, contentCount: 0 };
            }
          })
        );
        
        // Filter by selected level using customId prefix
        const prefix = levelPrefixMap[selectedLevel];
        let filteredTopics = topicsWithCounts.filter(topic => {
          if (topic.customId && prefix) {
            return topic.customId.startsWith(prefix);
          }
          return false;
        });
        
        // Apply category filter
        if (filters.category) {
          filteredTopics = filteredTopics.filter(t => 
            t.category?.toLowerCase() === filters.category.toLowerCase()
          );
        }
        
        // Apply difficulty filter
        if (filters.difficulty) {
          filteredTopics = filteredTopics.filter(t => 
            t.difficulty?.toLowerCase() === filters.difficulty.toLowerCase()
          );
        }
        
        // Sort by order
        filteredTopics.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        setTopics(filteredTopics);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError('Failed to load constitutional topics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopics();
  }, [authAxios, filters, selectedLevel]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Handle level selection
  const handleLevelChange = (levelId) => {
    setSelectedLevel(levelId);
  };

  // Get unique values for filter options
  const getUniqueFilterValues = (key) => {
    return [...new Set(topics.map(topic => topic[key]))].filter(Boolean);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Indian Constitution</h1>
          <p className="text-gray-400 mt-1">Explore the structure and principles of the Indian Constitution</p>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <Link 
            to="/constitution/games" 
            className="px-4 py-2 flex items-center bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Play Games
          </Link>
          
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="input bg-dark-200 text-white py-2 pl-3 pr-8"
          >
            <option value="">All Categories</option>
            {getUniqueFilterValues('category').map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            name="difficulty"
            value={filters.difficulty}
            onChange={handleFilterChange}
            className="input bg-dark-200 text-white py-2 pl-3 pr-8"
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>
      
      {/* Level selection */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => handleLevelChange(level.id)}
            className={`p-3 rounded-lg text-left transition ${
              selectedLevel === level.id
                ? 'bg-primary-600 text-white'
                : 'bg-dark-200 text-gray-300 hover:bg-dark-100'
            }`}
          >
            <h3 className="font-medium">{level.name}</h3>
            <p className="text-xs mt-1 opacity-80">{level.description}</p>
          </button>
        ))}
      </div>
      
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          {topics.length === 0 ? (
            <div className="card py-12">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-300 mb-2">No topics found</h3>
                <p className="text-gray-400">Try changing your filters or check back later for new content.</p>
              </div>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {topics.map(topic => (
                <motion.div 
                  key={topic._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <ConstitutionalTopicCard topic={topic} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      )}
      
    </div>
  );
};

export default ConstitutionalTopics; 
