import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConstitutionSpiralGame = ({ gameData, onComplete, isCompleted, score, onPlayAgain }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [details, setDetails] = useState(null);
  const [progress, setProgress] = useState(0);
  const [exploredItems, setExploredItems] = useState([]);
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Calculate container size based on screen
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate progress
  useEffect(() => {
    if (gameData && gameData.levels) {
      const totalItems = gameData.levels.reduce((acc, level) => acc + level.items.length, 0);
      const progressPercentage = (exploredItems.length / totalItems) * 100;
      setProgress(progressPercentage);

      // If all items are explored, complete the game
      if (progressPercentage >= 100 && !isCompleted) {
        onComplete(100);
      }
    }
  }, [exploredItems, gameData, onComplete, isCompleted]);

  // Handle level selection
  const handleLevelSelect = (level, index) => {
    setSelectedLevel(index);
    setSelectedItem(null);
    setDetails(null);
  };

  // Handle item selection
  const handleItemSelect = (item, levelIndex) => {
    // Mark item as explored if not already
    if (!exploredItems.includes(`${levelIndex}-${item}`)) {
      setExploredItems([...exploredItems, `${levelIndex}-${item}`]);
    }

    setSelectedItem(item);

    // Set details based on the selected item
    // In a real application, these would come from a database
    const detailsMap = {
      // Level 0
      "Preamble": {
        title: "Preamble",
        content: "The Preamble declares India to be a sovereign, socialist, secular, democratic republic. It secures to all citizens justice, liberty, equality and fraternity.",
        facts: ["The Preamble was amended once by the 42nd Amendment (1976)", "Words 'socialist', 'secular', and 'integrity' were added in 1976"]
      },
      "History": {
        title: "Constitutional History",
        content: "The Constitution was drafted by the Constituent Assembly between 1946 and 1949. It was adopted on 26 November 1949 and came into effect on 26 January 1950.",
        facts: ["The drafting took 2 years, 11 months and 17 days", "Dr. B.R. Ambedkar was the Chairman of the Drafting Committee"]
      },
      "Features": {
        title: "Key Features",
        content: "The Indian Constitution is the longest written constitution of any sovereign country in the world. It contains 395 articles in 22 parts, 12 schedules, and 105 amendments.",
        facts: ["It is a mixture of federalism and unitary features", "Inspired by constitutions from many countries including UK, USA, Ireland, etc."]
      },

      // Level 1
      "Parts I-VIII": {
        title: "Parts I-VIII",
        content: "These parts cover Union & Territory, Citizenship, Fundamental Rights, Directive Principles, Fundamental Duties, Union Government, and State Government.",
        facts: ["Part III on Fundamental Rights is often called the soul of the Constitution", "Part IV contains non-justiciable Directive Principles"]
      },
      "Parts IX-XV": {
        title: "Parts IX-XV",
        content: "These parts cover Panchayats, Municipalities, Cooperative Societies, Scheduled & Tribal Areas, Center-State Relations, Finance, and Trade & Commerce.",
        facts: ["Part IX was added by the 73rd Amendment (1992)", "Part IX-A was added by the 74th Amendment (1992)"]
      },
      "Parts XVI-XXII": {
        title: "Parts XVI-XXII",
        content: "These parts cover Special Provisions for certain classes, Official Language, Emergency Provisions, Amendments, Temporary Provisions, and more.",
        facts: ["Part XVIII covers three types of emergencies", "Part XX (Article 368) deals with the power to amend the Constitution"]
      },

      // Level 2
      "Schedules 1-4": {
        title: "Schedules 1-4",
        content: "Schedule 1: Names of States and Union Territories. Schedule 2: Salaries of officials. Schedule 3: Forms of Oaths. Schedule 4: Allocation of seats in Rajya Sabha.",
        facts: ["First Schedule has been amended multiple times to reflect changes in states", "Second Schedule covers salaries of the President, Governors, Judges, etc."]
      },
      "Schedules 5-8": {
        title: "Schedules 5-8",
        content: "Schedule 5: Scheduled Areas administration. Schedule 6: Tribal areas administration. Schedule 7: Division of powers (Union, State, Concurrent Lists). Schedule 8: Official languages.",
        facts: ["Seventh Schedule contains three lists: Union, State, and Concurrent", "Eighth Schedule lists 22 official languages"]
      },
      "Schedules 9-12": {
        title: "Schedules 9-12",
        content: "Schedule 9: Laws immune from judicial review. Schedule 10: Anti-defection provisions. Schedule 11: Panchayat powers. Schedule 12: Municipality powers.",
        facts: ["Ninth Schedule was added by the First Amendment in 1951", "Tenth Schedule contains provisions for disqualification on grounds of defection"]
      },

      // Level 3
      "1st-42nd": {
        title: "Amendments 1-42",
        content: "Key amendments include the 1st (Added Ninth Schedule), 7th (Reorganization of states), 24th & 25th (Parliament's amending powers), and 42nd (Comprehensive changes during Emergency).",
        facts: ["42nd Amendment (1976) is known as 'Mini-Constitution'", "It made the most extensive changes to the Constitution"]
      },
      "43rd-86th": {
        title: "Amendments 43-86",
        content: "Key amendments include the 44th (Restored Supreme Court powers), 73rd & 74th (Local governments), 86th (Right to Education).",
        facts: ["73rd & 74th Amendments (1992) gave constitutional status to local governments", "86th Amendment (2002) made education a fundamental right"]
      },
      "87th-105th": {
        title: "Amendments 87-105",
        content: "Recent amendments include the 101st (GST), 102nd (National Commission for Backward Classes), and 103rd (10% reservation for Economically Weaker Sections).",
        facts: ["101st Amendment (2016) introduced Goods and Services Tax", "103rd Amendment (2019) provided for 10% reservation for economically weaker sections"]
      },

      // Level 4
      "Basic Structure": {
        title: "Basic Structure Doctrine",
        content: "This doctrine, established in the Kesavananda Bharati case (1973), holds that Parliament cannot amend the basic structure or framework of the Constitution.",
        facts: ["It is a judicial innovation not explicitly mentioned in the Constitution", "Parliament can amend but not destroy the basic structure"]
      },
      "Judicial Review": {
        title: "Judicial Review",
        content: "The power of the courts to examine the constitutionality of legislative acts and executive orders. It's a check to ensure they don't violate the Constitution.",
        facts: ["Derived from Articles 13, 32, 226 and 227", "Supreme Court can strike down laws that violate fundamental rights"]
      },
      "Landmark Cases": {
        title: "Landmark Cases",
        content: "Key cases include Kesavananda Bharati v. State of Kerala, Golaknath v. State of Punjab, Maneka Gandhi v. Union of India, and Minerva Mills v. Union of India.",
        facts: ["Kesavananda Bharati case (1973) established the Basic Structure doctrine", "Maneka Gandhi case (1978) expanded the scope of Article 21"]
      }
    };

    setDetails(detailsMap[item] || {
      title: item,
      content: "Detailed information about this topic will be available soon.",
      facts: ["This is a part of the Indian Constitution", "Explore more to learn about this topic"]
    });
  };

  // Get the right visualization size based on container
  const getVisualizationSize = () => {
    if (!containerSize.width || !containerSize.height) return 120;

    const smallerDimension = Math.min(containerSize.width, containerSize.height) * 0.9;
    const maxLevels = gameData?.levels?.length || 5;

    return Math.max(70, smallerDimension / Math.max(3.2, maxLevels + 0.3));
  };

  const spiralBaseSize = getVisualizationSize();

  // Prepare data if empty
  const preparedGameData = {
    centerTitle: gameData?.centerTitle || "Indian Constitution",
    levels: gameData?.levels || []
  };
  const selectedLevelData = selectedLevel !== null ? preparedGameData.levels[selectedLevel] : null;
  const selectedLevelCount = selectedLevelData?.items?.length || 0;

  return (
    <div className="space-y-6 h-full">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Constitution Spiral Explorer</h2>
          <p className="text-gray-400 max-w-3xl">Explore the Constitution in a layered spiral. Choose a ring to reveal its themes, then tap topics to unlock clear explanations and quick facts.</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="inline-flex items-center bg-dark-300 px-3 py-2 rounded-full">
            <div className="text-sm text-gray-300 mr-2">Explored</div>
            <div className="text-sm font-medium text-primary-400">{Math.round(progress)}%</div>
          </div>
          <div className="inline-flex items-center bg-dark-300 px-3 py-2 rounded-full">
            <div className="text-sm text-gray-300 mr-2">Selected</div>
            <div className="text-sm font-medium text-white">{selectedLevel !== null ? `L${selectedLevel}` : '--'}</div>
          </div>
          <div className="inline-flex items-center bg-dark-300 px-3 py-2 rounded-full">
            <div className="text-sm text-gray-300 mr-2">Topics</div>
            <div className="text-sm font-medium text-white">{selectedLevel !== null ? selectedLevelCount : preparedGameData.levels.reduce((acc, level) => acc + (level.items?.length || 0), 0)}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 h-full lg:grid-cols-[2.1fr_1fr]">
        {/* Spiral visualization */}
        <div className="w-full">
          <div className="bg-dark-200 rounded-lg p-4 h-full flex flex-col">
            <div ref={containerRef}
              className="flex-grow relative"
              style={{
                minHeight: '620px',
                overflow: 'hidden'
              }}>
              {/* Center */}
              <motion.div
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
              >
                <motion.div
                  className="bg-primary-600 rounded-full flex items-center justify-center text-white font-medium text-center p-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: Math.max(60, spiralBaseSize * 0.3),
                    height: Math.max(60, spiralBaseSize * 0.3),
                    fontSize: Math.max(10, spiralBaseSize * 0.08)
                  }}
                >
                  {preparedGameData.centerTitle}
                </motion.div>
              </motion.div>

              {/* Levels */}
              {preparedGameData.levels.map((level, index) => (
                <motion.div
                  key={index}
                  className="absolute left-1/2 top-1/2 w-full h-full transform -translate-x-1/2 -translate-y-1/2"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + (index * 0.1), duration: 0.5 }}
                >
                  <motion.div
                    className={`relative rounded-full border-2 ${selectedLevel === index ? 'border-primary-500' : 'border-gray-700'
                      }`}
                    style={{
                      width: `${(index + 1) * spiralBaseSize}px`,
                      height: `${(index + 1) * spiralBaseSize}px`,
                      left: `calc(50% - ${((index + 1) * spiralBaseSize) / 2}px)`,
                      top: `calc(50% - ${((index + 1) * spiralBaseSize) / 2}px)`,
                    }}
                    onClick={() => handleLevelSelect(level, index)}
                    whileHover={{ borderColor: level.color }}
                  >
                    {/* Level title */}
                    <div
                      className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-dark-200 px-2 py-0.5 rounded-full"
                      style={{
                        color: level.color,
                        fontSize: Math.max(10, Math.min(14, spiralBaseSize * 0.1)),
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {level.title}
                    </div>

                    {/* Items around this level */}
                    {level.items && level.items.map((item, itemIndex) => {
                      const totalItems = level.items.length;
                      const angle = (itemIndex * (360 / totalItems)) * (Math.PI / 180);
                      const radius = ((index + 1) * spiralBaseSize) / 2;

                      const isExplored = exploredItems.includes(`${index}-${item}`);
                      const itemSize = Math.max(40, Math.min(60, spiralBaseSize * 0.45));

                      return (
                        <motion.div
                          key={item}
                          className={`absolute rounded-lg p-2 text-center font-medium cursor-pointer ${selectedItem === item
                            ? 'text-white shadow-glow'
                            : isExplored
                              ? 'text-white'
                              : 'text-gray-400'
                            }`}
                          style={{
                            left: `calc(50% + ${Math.cos(angle) * radius}px - ${itemSize / 2}px)`,
                            top: `calc(50% + ${Math.sin(angle) * radius}px - ${itemSize / 2}px)`,
                            backgroundColor: selectedItem === item ? level.color : isExplored ? `${level.color}90` : 'rgba(30, 30, 35, 0.8)',
                            width: `${itemSize}px`,
                            height: `${itemSize}px`,
                            fontSize: Math.max(8, Math.min(12, spiralBaseSize * 0.08)),
                            zIndex: selectedItem === item ? 40 : 30,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: selectedItem === item ? `0 0 15px ${level.color}` : 'none'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemSelect(item, index);
                          }}
                          whileHover={{ scale: 1.1, boxShadow: `0 0 10px ${level.color}` }}
                          whileTap={{ scale: 0.98 }}
                          animate={{
                            backgroundColor: selectedItem === item ? level.color : isExplored ? `${level.color}90` : 'rgba(30, 30, 35, 0.8)',
                            boxShadow: selectedItem === item ? `0 0 15px ${level.color}` : 'none'
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {item}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </motion.div>
              ))}
            </div>

            <div className="mt-3 text-center">
              <div className="flex items-center justify-center gap-2 bg-dark-300 py-2 px-4 rounded-lg text-gray-300 text-sm inline-block">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Click on rings to navigate, then tap topics to explore details</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details panel */}
        <div className="w-full ">
          <div className="bg-dark-200 rounded-lg p-4 h-full w-full">
            <AnimatePresence mode="wait">
              {details ? (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col"
                >
                  <div className="mb-6">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-xs font-semibold mb-3">
                      CONSTITUTIONAL TOPIC
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-3">
                      {details.title}
                    </h2>

                    <div className="h-1 w-20 bg-primary-500 rounded-full"></div>
                  </div>

                  <div className="space-y-5 flex-grow overflow-y-auto pr-2">

                    <div className="bg-dark-300 rounded-2xl p-5">
                      <h3 className="text-primary-400 font-bold mb-3">
                        📖 Overview
                      </h3>

                      <p className="text-gray-300 leading-relaxed">
                        {details.content}
                      </p>
                    </div>

                    <div className="bg-dark-300 rounded-2xl p-5">
                      <h3 className="text-green-400 font-bold mb-3">
                        🎯 Why It Matters
                      </h3>

                      <div className="space-y-2 text-gray-300">
                        <div>✓ Important constitutional concept</div>
                        <div>✓ Frequently asked in exams and interviews</div>
                        <div>✓ Helps understand governance and citizenship</div>
                      </div>
                    </div>

                    <div className="bg-dark-300 rounded-2xl p-5">
                      <h3 className="text-yellow-400 font-bold mb-3">
                        ⚡ Quick Facts
                      </h3>

                      <div className="space-y-3">
                        {details.facts.map((fact, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3"
                          >
                            <div className="w-2 h-2 rounded-full bg-primary-500 mt-2"></div>

                            <div className="text-gray-300">
                              {fact}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-primary-500/10 to-primary-700/10 border border-primary-500/30 rounded-2xl p-5">
                      <h3 className="text-primary-300 font-bold mb-2">
                        🏛 Constitution Insight
                      </h3>

                      <p className="text-gray-300 italic">
                        Understanding this topic strengthens constitutional
                        literacy and helps citizens better understand their
                        rights, duties and democratic institutions.
                      </p>
                    </div>

                  </div>

                  <div className="mt-5">
                    <motion.button
                      className="w-full py-3 bg-primary-600 hover:bg-primary-700 rounded-xl text-white font-medium"
                      onClick={() => {
                        setSelectedItem(null);
                        setDetails(null);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Explore Another Topic
                    </motion.button>
                  </div>
                </motion.div>
              ) : selectedLevel !== null ? (
                <motion.div
                  key="level-overview"
                  className="h-full flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="mb-6">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-xs font-semibold mb-3">
                      LEVEL OVERVIEW
                    </div>

                    <h2 className="text-3xl font-bold text-white">
                      {selectedLevelData?.title}
                    </h2>

                    <p className="text-gray-400 mt-3">
                      Explore the constitutional concepts available in this level.
                    </p>
                  </div>

                  <div className="space-y-3 overflow-y-auto">
                    {selectedLevelData?.items?.map((topic) => {
                      const isExplored =
                        exploredItems.includes(`${selectedLevel}-${topic}`);

                      return (
                        <motion.button
                          key={topic}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full text-left rounded-2xl p-4 border transition ${isExplored
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-gray-700 bg-dark-300'
                            }`}
                          onClick={() =>
                            handleItemSelect(topic, selectedLevel)
                          }
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium">
                              {topic}
                            </span>

                            <span
                              className={`text-xs px-3 py-1 rounded-full ${isExplored
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-700 text-gray-300'
                                }`}
                            >
                              {isExplored
                                ? 'Explored'
                                : 'Explore'}
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-state"
                  className="h-full flex flex-col justify-center items-center text-center px-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-6xl mb-5">
                    🏛
                  </div>

                  <h2 className="text-3xl font-bold text-white mb-4">
                    Explore the Constitution
                  </h2>

                  <p className="text-gray-400 leading-relaxed max-w-md">
                    Select any ring from the Constitution Spiral to discover
                    important constitutional concepts, historical context,
                    amendments, landmark cases and key facts.
                  </p>

                  <div className="mt-8 bg-dark-300 rounded-2xl p-5 max-w-md">
                    <div className="text-primary-400 font-semibold mb-2">
                      💡 Learning Tip
                    </div>

                    <p className="text-gray-300 text-sm">
                      Start from the inner rings and gradually move outward
                      to understand the Constitution from basics to advanced
                      concepts.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-dark-200 h-3 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        ></motion.div>
      </div>
    </div>
  );
};

// Add CSS for ensuring the spiral visualization works properly
const styleSheet = `
  .shadow-glow {
    box-shadow: 0 0 15px rgba(66, 153, 225, 0.6);
  }
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
  .backface-hidden {
    backface-visibility: hidden;
  }
  .transform-style-preserve-3d {
    transform-style: preserve-3d;
  }
`;

// Inject CSS (only once)
if (typeof document !== 'undefined') {
  if (!document.getElementById('spiral-game-styles')) {
    const style = document.createElement('style');
    style.id = 'spiral-game-styles';
    style.innerHTML = styleSheet;
    document.head.appendChild(style);
  }
}

export default ConstitutionSpiralGame;