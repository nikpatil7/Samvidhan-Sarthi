import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const defaultColors = ['#054187', '#FF9933', '#138808', '#04356F', '#E67F00', '#0F6D06', '#7DAEFF'];

const ConstitutionMap = ({ country = 'India' }) => {
  const [hoveredSection, setHoveredSection] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('level0');
  const [expandedView, setExpandedView] = useState(false);
  const { authAxios } = useContext(AuthContext);
  const [topicsByLevel, setTopicsByLevel] = useState({});
  const [loadingTopics, setLoadingTopics] = useState(true);

  // Fetch real topics from API
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoadingTopics(true);
        const response = await authAxios.get(`/content/topics/${encodeURIComponent(country)}`);
        const allTopics = response.data || [];
        
        // Group topics by level prefix
        const grouped = { level0: [], level1: [], level2: [], level3: [], level4: [] };
        allTopics.forEach((topic) => {
          const cid = topic.customId || '';
          let level = null;
          if (cid.startsWith('l0-')) level = 'level0';
          else if (cid.startsWith('l1-')) level = 'level1';
          else if (cid.startsWith('l2-')) level = 'level2';
          else if (cid.startsWith('l3-')) level = 'level3';
          else if (cid.startsWith('l4-')) level = 'level4';
          
          if (level) {
            grouped[level].push({
              id: topic.customId,
              title: topic.title,
              color: topic.color || defaultColors[grouped[level].length % defaultColors.length],
              linkId: topic.customId
            });
          }
        });
        
        setTopicsByLevel(grouped);
      } catch (err) {
        console.error('Error fetching topics for map:', err);
      } finally {
        setLoadingTopics(false);
      }
    };
    fetchTopics();
  }, [authAxios, country]);

  // Get sections for current level
  const getCurrentSections = () => {
    return topicsByLevel[selectedLevel] || [];
  };

  // Level definitions
  const levels = [
    { id: 'level0', title: 'Introduction', icon: '📚', tone: 'primary' },
    { id: 'level1', title: 'Basic Structure', icon: '🏛️', tone: 'secondary' },
    { id: 'level2', title: 'Schedules', icon: '📜', tone: 'success' },
    { id: 'level3', title: 'Amendments', icon: '✏️', tone: 'primary' },
    { id: 'level4', title: 'Advanced', icon: '🔍', tone: 'secondary' }
  ];

  const levelToneStyles = {
    primary: { selected: 'bg-primary-50 text-primary-700 border-primary-200 shadow-sm', idle: 'bg-white text-gray-700 border-gray-200' },
    secondary: { selected: 'bg-secondary-50 text-secondary-700 border-secondary-200 shadow-sm', idle: 'bg-white text-gray-700 border-gray-200' },
    success: { selected: 'bg-success-50 text-success-700 border-success-200 shadow-sm', idle: 'bg-white text-gray-700 border-gray-200' }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const sectionVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0px 10px 24px rgba(5, 65, 135, 0.10)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };

  // Mode toggle
  const toggleExpandedView = () => {
    setExpandedView(!expandedView);
  };

  // Get positions for interactive map in expanded view
  const getSectionPosition = (index, total) => {
    if (!expandedView) return {};
    
    const radius = Math.min(window.innerWidth, 800) * 0.35; // Responsive radius
    const angle = (index / total) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    return {
      position: 'absolute',
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`,
      transform: 'translate(-50%, -50%)',
      zIndex: 2
    };
  };

  return (
    <div className="relative py-8">
      {/* Mode Switch */}
      <div className="absolute top-0 right-0 m-4">
        <button 
          onClick={toggleExpandedView}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg flex items-center gap-2 hover:bg-primary-600 transition-colors shadow-sm"
        >
          {expandedView ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2H5v-2h10zm0-4v2H5V9h10z" clipRule="evenodd" />
              </svg>
              List View
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
              </svg>
              Interactive Map
            </>
          )}
        </button>
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto mb-6 max-w-3xl text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {country} Constitution Map
          </h1>
          <p className="text-gray-600">Use the map to discover how constitutional ideas connect across levels and topics.</p>
        </div>
        
        {/* Level Navigation */}
        <motion.div 
          className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {levels.map((level) => (
            <motion.button
              key={level.id}
              variants={itemVariants}
              onClick={() => setSelectedLevel(level.id)}
              className={`px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                selectedLevel === level.id
                  ? (levelToneStyles[level.tone]?.selected || levelToneStyles.primary.selected)
                  : (levelToneStyles[level.tone]?.idle || levelToneStyles.primary.idle)
              }`}
            >
              <span className="text-xl">{level.icon}</span>
              <span>{level.title}</span>
            </motion.button>
          ))}
        </motion.div>

        {loadingTopics && (
          <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        )}

        {/* Constitution Sections */}
        {!loadingTopics && expandedView ? (
          // Interactive Map View with Radial Layout
          <div className="relative flex justify-center items-center" style={{ height: '600px' }}>
            {/* Center Element */}
            <motion.div 
              className="absolute z-10 rounded-full w-24 h-24 flex items-center justify-center text-white font-bold text-lg shadow-md border-4 border-white"
              style={{ background: 'linear-gradient(135deg, #054187 0%, #FF9933 100%)' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            >
              {country}
            </motion.div>
            
            {/* Connecting Lines */}
            <svg className="absolute w-full h-full" style={{ zIndex: 1 }}>
              {getCurrentSections().map((section, index) => (
                <motion.line 
                  key={`line-${section.id}`}
                  x1="50%" 
                  y1="50%" 
                  x2={`calc(50% + ${Math.cos((index / getCurrentSections().length) * Math.PI * 2) * (Math.min(window.innerWidth, 800) * 0.35)}px)`}
                  y2={`calc(50% + ${Math.sin((index / getCurrentSections().length) * Math.PI * 2) * (Math.min(window.innerWidth, 800) * 0.35)}px)`}
                  stroke={section.color}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredSection === section.id || !hoveredSection ? 0.6 : 0.1 }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </svg>
            
            {/* Section Nodes */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="w-full h-full"
            >
              {getCurrentSections().map((section, index) => (
                <motion.div
                  key={section.id}
                  style={getSectionPosition(index, getCurrentSections().length)}
                  variants={sectionVariants}
                  whileHover="hover"
                  onHoverStart={() => setHoveredSection(section.id)}
                  onHoverEnd={() => setHoveredSection(null)}
                >
                  <Link to={`/topics/${section.linkId}`}>
                    <motion.div 
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-md cursor-pointer border-4 border-white"
                      style={{ backgroundColor: section.color }}
                    >
                      <div className="absolute whitespace-nowrap px-3 py-1 bg-white text-gray-700 rounded-lg text-sm font-medium pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 shadow-sm">
                        {section.title}
                      </div>
                      <span className="text-white font-semibold text-center text-xs md:text-sm px-2">
                        {section.title.split(':')[0]}
                      </span>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ) : !loadingTopics ? (
          // List View with cards
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {getCurrentSections().map((section) => (
              <motion.div
                key={section.id}
                variants={itemVariants}
                whileHover={{
                  y: -5,
                  transition: { type: "spring", stiffness: 300 }
                }}
              >
                <Link to={`/topics/${section.linkId}`} className="block h-full">
                  <div className="bg-white rounded-lg overflow-hidden h-full group hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm">
                    <div className="h-2" style={{ backgroundColor: section.color }}></div>
                    <div className="p-6">
                      <h3 className="text-gray-900 text-lg font-medium mb-2">{section.title}</h3>
                      <div className="flex justify-end mt-4">
                        <div className="flex items-center text-primary-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                          Explore
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : null}
        
        {/* Level Information */}
        <motion.div 
          className="mt-12 bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {levels.find(l => l.id === selectedLevel)?.title} Level
          </h2>
          <p className="text-gray-600">
            {selectedLevel === 'level0' && "The foundational aspects of the Constitution, including its history, key features, and the Preamble."}
            {selectedLevel === 'level1' && "The core structure of the Constitution, divided into Parts that cover fundamental rights, directive principles, and governmental organization."}
            {selectedLevel === 'level2' && "The supporting Schedules of the Constitution that provide detailed information on various administrative and legal matters."}
            {selectedLevel === 'level3' && "Key amendments that have shaped and evolved the Constitution over time."}
            {selectedLevel === 'level4' && "Advanced constitutional concepts, doctrines, and interpretations developed by the judiciary."}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ConstitutionMap; 
