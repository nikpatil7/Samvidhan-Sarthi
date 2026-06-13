import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import MatchingGame from '../components/ConstitutionalGames/MatchingGame';
import QuizGame from '../components/ConstitutionalGames/QuizGame';
import ScenarioGame from '../components/ConstitutionalGames/ScenarioGame';
import ConstitutionSpiralGame from '../components/ConstitutionalGames/SpiralGame';
import TimelineGame from '../components/ConstitutionalGames/TimelineGame';
import { AuthContext } from '../contexts/AuthContext';
import CardSortGame from '../components/ConstitutionalGames/CardSortGame';

const ConstitutionalGamePage = () => {
  const [selectedGame, setSelectedGame] = useState('spiral');
  const [selectedGameData, setSelectedGameData] = useState(null);
  const [showGameSelector, setShowGameSelector] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newAchievements, setNewAchievements] = useState(false);

  // Add state for game data
  const [quizGames, setQuizGames] = useState([]);
  const [scenarioGames, setScenarioGames] = useState([]);
  const [matchingGames, setMatchingGames] = useState([]);
  const [spiralGames, setSpiralGames] = useState([]);
  const [timelineGames, setTimelineGames] = useState([]);
  const [cardSortGames, setCardSortGames] = useState([]);

  // Add state for achievements
  const [achievements, setAchievements] = useState([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [badgeNotification, setBadgeNotification] = useState(null);

  // Get the authentication context for API calls
  const { authAxios } = useContext(AuthContext);

  // Fetch game data from the server
  useEffect(() => {
    const fetchGameData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all games of all types at once 
        const allGamesResponse = await authAxios.get('/content/games/all');

        if (allGamesResponse.data) {
          // Process quiz games
          if (allGamesResponse.data.quiz && allGamesResponse.data.quiz.data) {
            const quizResponse = await authAxios.get('/content/games/quiz');
            if (quizResponse.data && quizResponse.data.length > 0) {
              setQuizGames(quizResponse.data);
            } else {
              setQuizGames([{
                id: 'sample-quiz',
                title: 'Constitutional Quiz',
                description: 'Test your knowledge of the constitution',
                questions: sampleQuizGameData
              }]);
            }
          } else {
            setQuizGames([{
              id: 'sample-quiz',
              title: 'Constitutional Quiz',
              description: 'Test your knowledge of the constitution',
              questions: sampleQuizGameData
            }]);
          }

          // Process scenario games
          if (allGamesResponse.data.scenario && allGamesResponse.data.scenario.data) {
            // Query for additional scenarios
            const scenarioResponse = await authAxios.get('/content/games/scenario');
            if (scenarioResponse.data && scenarioResponse.data.length > 0) {
              setScenarioGames(scenarioResponse.data);
            } else {
              setScenarioGames([{
                id: 'sample-scenario',
                title: 'Constitutional Scenarios',
                description: 'Apply constitutional principles to real-world situations',
                scenarios: sampleScenarioGameData
              }]);
            }
          } else {
            setScenarioGames([{
              id: 'sample-scenario',
              title: 'Constitutional Scenarios',
              description: 'Apply constitutional principles to real-world situations',
              scenarios: sampleScenarioGameData
            }]);
          }

          // Process matching games
          if (allGamesResponse.data.matching && allGamesResponse.data.matching.data) {
            // Query for additional matching games
            const matchingResponse = await authAxios.get('/content/games/matching');
            if (matchingResponse.data && matchingResponse.data.length > 0) {
              setMatchingGames(matchingResponse.data.map(game => ({
                id: game.id,
                topicId: game.topicId,
                title: game.title,
                description: game.description,
                pairs: game.config?.pairs || sampleMatchingGameData
              })));
            } else {
              setMatchingGames([{
                id: 'sample-matching',
                title: 'Article Matching Game',
                description: 'Match constitutional articles with their definitions',
                pairs: sampleMatchingGameData
              }]);
            }
          } else {
            setMatchingGames([{
              id: 'sample-matching',
              title: 'Article Matching Game',
              description: 'Match constitutional articles with their definitions',
              pairs: sampleMatchingGameData
            }]);
          }

          // Process spiral games
          if (allGamesResponse.data.spiral && allGamesResponse.data.spiral.data) {
            // Query for additional spiral games
            const spiralResponse = await authAxios.get('/content/games/spiral');
            if (spiralResponse.data && spiralResponse.data.length > 0) {
              setSpiralGames(spiralResponse.data.map(game => ({
                id: game.id,
                topicId: game.topicId,
                title: game.title,
                description: game.description,
                config: game.config || sampleSpiralGameData
              })));
            } else {
              setSpiralGames([{
                id: 'sample-spiral',
                title: 'Constitution Structure Spiral',
                description: 'Explore the structure of the constitution',
                config: sampleSpiralGameData
              }]);
            }
          } else {
            setSpiralGames([{
              id: 'sample-spiral',
              title: 'Constitution Structure Spiral',
              description: 'Explore the structure of the constitution',
              config: sampleSpiralGameData
            }]);
          }

          // Process timeline games
          if (allGamesResponse.data.timeline && allGamesResponse.data.timeline.data) {
            // Query for additional timeline games
            const timelineResponse = await authAxios.get('/content/games/timeline');
            if (timelineResponse.data && timelineResponse.data.length > 0) {
              setTimelineGames(timelineResponse.data.map(game => ({
                id: game.id,
                topicId: game.topicId,
                title: game.title,
                description: game.description,
                events: game.config?.events || sampleTimelineGameData
              })));
            } else {
              setTimelineGames([{
                id: 'sample-timeline',
                title: 'Constitutional Timeline',
                description: 'Learn the timeline of constitutional events',
                events: sampleTimelineGameData
              }]);
            }
          } else {
            setTimelineGames([{
              id: 'sample-timeline',
              title: 'Constitutional Timeline',
              description: 'Learn the timeline of constitutional events',
              events: sampleTimelineGameData
            }]);
          }

          // Process card sort games
          // Process card sort games
          if (
            allGamesResponse.data['card-sort'] &&
            allGamesResponse.data['card-sort'].data
          ) {
            const cardSortResponse =
              await authAxios.get('/content/games/card-sort');

            if (
              cardSortResponse.data &&
              cardSortResponse.data.length > 0
            ) {
              setCardSortGames(
                cardSortResponse.data.map(game => ({
                  id: game.id,
                  topicId: game.topicId,
                  title: game.title,
                  description: game.description,
                  config: game.config
                }))
              );
            } else {
              setCardSortGames([
                {
                  id: 'sample-card-sort',
                  title:
                    'Fundamental Rights Classification Challenge',
                  description:
                    'Classify constitutional articles into the correct rights category',
                  config: sampleCardSortGameData
                }
              ]);
            }
          } else {
            setCardSortGames([
              {
                id: 'sample-card-sort',
                title:
                  'Fundamental Rights Classification Challenge',
                description:
                  'Classify constitutional articles into the correct rights category',
                config: sampleCardSortGameData
              }
            ]);
          }



        } else {
          // Fallback to sample data
          setQuizGames([{
            id: 'sample-quiz',
            title: 'Constitutional Quiz',
            description: 'Test your knowledge of the constitution',
            questions: sampleQuizGameData
          }]);

          setScenarioGames([{
            id: 'sample-scenario',
            title: 'Constitutional Scenarios',
            description: 'Apply constitutional principles to real-world situations',
            scenarios: sampleScenarioGameData
          }]);

          setMatchingGames([{
            id: 'sample-matching',
            title: 'Article Matching Game',
            description: 'Match constitutional articles with their definitions',
            pairs: sampleMatchingGameData
          }]);

          setSpiralGames([{
            id: 'sample-spiral',
            title: 'Constitution Structure Spiral',
            description: 'Explore the structure of the constitution',
            config: sampleSpiralGameData
          }]);

          setTimelineGames([{
            id: 'sample-timeline',
            title: 'Constitutional Timeline',
            description: 'Learn the timeline of constitutional events',
            events: sampleTimelineGameData
          }]);

          
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching game data:', err.message);
        setError('Failed to load game data. Please try again later.');
        setLoading(false);

        // Use sample data as fallback if server fails
        setQuizGames([{
          id: 'sample-quiz',
          title: 'Constitutional Quiz',
          description: 'Test your knowledge of the constitution',
          questions: sampleQuizGameData
        }]);

        setScenarioGames([{
          id: 'sample-scenario',
          title: 'Constitutional Scenarios',
          description: 'Apply constitutional principles to real-world situations',
          scenarios: sampleScenarioGameData
        }]);

        setMatchingGames([{
          id: 'sample-matching',
          title: 'Article Matching Game',
          description: 'Match constitutional articles with their definitions',
          pairs: sampleMatchingGameData
        }]);

        setSpiralGames([{
          id: 'sample-spiral',
          title: 'Constitution Structure Spiral',
          description: 'Explore the structure of the constitution',
          config: sampleSpiralGameData
        }]);

        setTimelineGames([{
          id: 'sample-timeline',
          title: 'Constitutional Timeline',
          description: 'Learn the timeline of constitutional events',
          events: sampleTimelineGameData
        }]);
        
        setCardSortGames([
          {
            id: 'sample-card-sort',
            title:
              'Fundamental Rights Classification Challenge',
            description:
              'Classify constitutional articles into the correct rights category',
            config: sampleCardSortGameData
          }
        ]);
      }
    };

    fetchGameData();
    // Fallback sample data is static; game data should be fetched only when the API client changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authAxios]);

  // Fetch user achievements
  useEffect(() => {
    const fetchAchievements = async () => {
      setAchievementsLoading(true);

      try {
        const response = await authAxios.get('/users/achievements');
        if (response.data && response.data.badges) {
          setAchievements(response.data.badges);
        }
        setAchievementsLoading(false);
      } catch (err) {
        console.error('Error fetching achievements:', err);
        setAchievementsLoading(false);
      }
    };

    fetchAchievements();
  }, [authAxios, newAchievements]);

  // Sample data as fallback
  const sampleMatchingGameData = [
    {
      term: 'Article 14',
      definition: 'Right to Equality - Equality before law and equal protection of laws'
    },
    {
      term: 'Article 19',
      definition: 'Right to Freedom - Speech, expression, assembly, association, movement, residence, and profession'
    },
    {
      term: 'Article 21',
      definition: 'Right to Life and Personal Liberty - No person shall be deprived of his life or personal liberty except according to procedure established by law'
    },
    {
      term: 'Article 32',
      definition: 'Right to Constitutional Remedies - Empowers citizens to approach the Supreme Court directly for enforcement of fundamental rights'
    },
    {
      term: 'Article 51A',
      definition: 'Fundamental Duties - List of duties that citizens are expected to abide by'
    },
    {
      term: 'Article 368',
      definition: 'Power of Parliament to amend the Constitution and procedure thereof'
    }
  ];

  // Sample data as fallback
  const sampleQuizGameData = [
    {
      question: 'Which article of the Indian Constitution abolishes untouchability?',
      options: [
        { text: 'Article 14', isCorrect: false },
        { text: 'Article 15', isCorrect: false },
        { text: 'Article 17', isCorrect: true },
        { text: 'Article 21', isCorrect: false }
      ]
    },
    {
      question: 'The concept of "Rule of Law" in the Indian Constitution was adopted from:',
      options: [
        { text: 'United States', isCorrect: false },
        { text: 'Britain', isCorrect: true },
        { text: 'Canada', isCorrect: false },
        { text: 'France', isCorrect: false }
      ]
    },
    {
      question: 'Which of the following is NOT a Fundamental Right guaranteed by the Indian Constitution?',
      options: [
        { text: 'Right to Freedom of Religion', isCorrect: false },
        { text: 'Right to Property', isCorrect: true },
        { text: 'Right against Exploitation', isCorrect: false },
        { text: 'Right to Constitutional Remedies', isCorrect: false }
      ]
    },
    {
      question: 'Who is known as the "Father of the Indian Constitution"?',
      options: [
        { text: 'Mahatma Gandhi', isCorrect: false },
        { text: 'Jawaharlal Nehru', isCorrect: false },
        { text: 'Dr. B.R. Ambedkar', isCorrect: true },
        { text: 'Sardar Vallabhbhai Patel', isCorrect: false }
      ]
    },
    {
      question: 'Which part of the Indian Constitution deals with Fundamental Rights?',
      options: [
        { text: 'Part II', isCorrect: false },
        { text: 'Part III', isCorrect: true },
        { text: 'Part IV', isCorrect: false },
        { text: 'Part V', isCorrect: false }
      ]
    }
  ];

  // Sample data as fallback
  const sampleScenarioGameData = [
    {
      title: 'Freedom of Speech and Expression',
      description: 'A student organization at a government-funded university wants to organize a peaceful protest criticizing certain government policies. The university administration denies permission, citing concerns about disturbing academic activities.',
      hint: 'Consider Article 19 and reasonable restrictions.',
      options: [
        {
          text: 'The university has a right to restrict any activities on its campus.',
          isCorrect: false,
          feedback: 'While educational institutions can regulate activities, a blanket ban on peaceful protests violates the fundamental right to freedom of speech and expression under Article 19(1)(a).'
        },
        {
          text: 'The students have an absolute right to protest anywhere and anytime they want.',
          isCorrect: false,
          feedback: 'The right to protest is subject to reasonable restrictions under Article 19(2), including public order and interests of the sovereignty and integrity of India.'
        },
        {
          text: 'The students have a right to peaceful protest, but it can be reasonably regulated in terms of time, place, and manner.',
          isCorrect: true,
          feedback: 'Correct! Article 19(1)(a) guarantees freedom of speech and expression, including the right to peaceful protest. However, reasonable restrictions can be imposed regarding the time, place, and manner to ensure it doesn\'t disrupt essential activities.'
        }
      ]
    },
    {
      title: 'Equality Before Law',
      description: 'A state government introduces a reservation policy providing 30% seats in government jobs for women. A male candidate challenges this policy as a violation of his right to equality.',
      hint: 'Think about Article 14 and Article 15(3) of the Constitution.',
      options: [
        {
          text: 'The policy is unconstitutional as it discriminates on the basis of gender.',
          isCorrect: false,
          feedback: 'While Article 14 guarantees equality before law, Article 15(3) specifically empowers the State to make special provisions for women and children, allowing for positive discrimination.'
        },
        {
          text: 'The policy is constitutional as Article 15(3) allows the State to make special provisions for women.',
          isCorrect: true,
          feedback: 'Correct! Article 15(3) explicitly empowers the State to make special provisions for women and children. This is an exception to the general rule of non-discrimination under Article 15(1).'
        },
        {
          text: 'The policy is constitutional but should be limited to 10% reservation.',
          isCorrect: false,
          feedback: 'There is no such specific limit in the Constitution for reservations under Article 15(3). The Supreme Court has generally discouraged reservations exceeding 50% in total, but this applies to the aggregate of all reservations.'
        }
      ]
    }
  ];

  // Sample data as fallback (Spiral game)
  const sampleSpiralGameData = {
    centerTitle: "Indian Constitution",
    levels: [
      {
        title: "Level 0: Introduction",
        items: ["Preamble", "History", "Features"],
        color: "#3498db"
      },
      {
        title: "Level 1: Basic Structure",
        items: ["Parts I-VIII", "Parts IX-XV", "Parts XVI-XXII"],
        color: "#2ecc71"
      },
      {
        title: "Level 2: Schedules",
        items: ["Schedules 1-4", "Schedules 5-8", "Schedules 9-12"],
        color: "#9b59b6"
      },
      {
        title: "Level 3: Amendments",
        items: ["1st-42nd", "43rd-86th", "87th-105th"],
        color: "#f39c12"
      },
      {
        title: "Level 4: Advanced",
        items: ["Basic Structure", "Judicial Review", "Landmark Cases"],
        color: "#e74c3c"
      }
    ]
  };

  // Sample data as fallback (Timeline game)
  const sampleTimelineGameData = [
    {
      year: 1946,
      event: "Formation of Constituent Assembly",
      details: "The Constituent Assembly was formed to draft a constitution for India"
    },
    {
      year: 1947,
      event: "Independence of India",
      details: "India gained independence from British rule on August 15"
    },
    {
      year: 1949,
      event: "Constitution Adoption",
      details: "The Constitution of India was adopted by the Constituent Assembly on November 26"
    },
    {
      year: 1950,
      event: "Constitution Implementation",
      details: "The Constitution of India came into effect on January 26, celebrated as Republic Day"
    },
    {
      year: 1976,
      event: "42nd Amendment",
      details: "Added the words 'secular' and 'socialist' to the Preamble"
    }
  ];

  const sampleCardSortGameData = {
    categories: [
      'Right to Equality',
      'Right to Freedom',
      'Right Against Exploitation',
      'Freedom of Religion',
      'Cultural & Educational Rights',
      'Constitutional Remedies'
    ],

    cards: [
      {
        text: 'Article 14',
        category: 'Right to Equality'
      },
      {
        text: 'Article 15',
        category: 'Right to Equality'
      },
      {
        text: 'Article 19',
        category: 'Right to Freedom'
      },
      {
        text: 'Article 21',
        category: 'Right to Freedom'
      },
      {
        text: 'Article 23',
        category: 'Right Against Exploitation'
      },
      {
        text: 'Article 24',
        category: 'Right Against Exploitation'
      },
      {
        text: 'Article 25',
        category: 'Freedom of Religion'
      },
      {
        text: 'Article 26',
        category: 'Freedom of Religion'
      },
      {
        text: 'Article 29',
        category: 'Cultural & Educational Rights'
      },
      {
        text: 'Article 30',
        category: 'Cultural & Educational Rights'
      },
      {
        text: 'Article 32',
        category: 'Constitutional Remedies'
      },
      {
        text: 'Right to move Supreme Court',
        category: 'Constitutional Remedies'
      }
    ]
  };

  const handleGameSelect = (gameType) => {
    setSelectedGame(gameType);
    setShowGameSelector(true);
    setSelectedGameData(null);
    setGameCompleted(false);
  };

  const handleSpecificGameSelect = (game) => {
    setSelectedGameData(game);
    setShowGameSelector(false);
    setGameCompleted(false);
  };

  const handleGameComplete = async (score) => {
    setGameScore(score);
    setGameCompleted(true);

    // Track game completion in progress via /content/track
    try {
      if (selectedGameData && selectedGameData.id && !String(selectedGameData.id).startsWith('sample-')) {
        await authAxios.post('/content/track', {
          topicId: selectedGameData.topicId || selectedGameData.id,
          contentId: String(selectedGameData.id),
          type: selectedGame === 'quiz' ? 'quiz' : 'game',
          score: score,
          completed: true
        });
      }
    } catch (error) {
      console.error('Error tracking game progress:', error);
    }

    // After game completion, check for new achievements
    try {
      const achieveRes = await authAxios.post('/users/process-achievements');
      setNewAchievements(prev => !prev); // Toggle to trigger re-fetch

      // Show notification if new badges were earned
      if (achieveRes.data && achieveRes.data.newBadges > 0) {
        setBadgeNotification({
          count: achieveRes.data.newBadges,
          message: achieveRes.data.newBadges === 1
            ? 'You earned a new badge!'
            : `You earned ${achieveRes.data.newBadges} new badges!`
        });
        // Auto-dismiss after 6 seconds
        setTimeout(() => setBadgeNotification(null), 6000);
      }
    } catch (error) {
      console.error('Error processing achievements:', error);
    }
  };

  const handlePlayAgain = () => {
    setGameCompleted(false);
    setGameScore(0);
  };

  const handleBackToGameList = () => {
    setShowGameSelector(true);
    setSelectedGameData(null);
    setGameCompleted(false);
  };

  // Get current games list based on selected game type
  const getCurrentGames = () => {
    switch (selectedGame) {
      case 'quiz':
        return quizGames;
      case 'scenario':
        return scenarioGames;
      case 'matching':
        return matchingGames;
      case 'spiral':
        return spiralGames;
      case 'timeline':
        return timelineGames;
      case 'card-sort':
        return cardSortGames;
      default:
        return [];
    }
  };

  // Get game data for the selected game
  const getGameData = () => {
    if (!selectedGameData) return null;

    switch (selectedGame) {
      case 'quiz':
        return selectedGameData.questions;
      case 'scenario':
        return selectedGameData.scenarios;
      case 'matching':
        return selectedGameData.pairs;
      case 'spiral':
        return selectedGameData.config;
      case 'timeline':
        return selectedGameData.events;
      case 'card-sort':
        return selectedGameData.config;
      default:
        return null;
    }
  };

  // Render the game component based on selected game type
  const renderGameComponent = () => {
    const gameData = getGameData();
    if (!gameData) return null;

    switch (selectedGame) {
      case 'matching':
        return (
          <MatchingGame
            gameData={gameData}
            onComplete={handleGameComplete}
            isCompleted={gameCompleted}
            score={gameScore}
            onPlayAgain={handlePlayAgain}
          />
        );

      case 'quiz':
        return (
          <QuizGame
            quizData={gameData}
            onComplete={handleGameComplete}
            isCompleted={gameCompleted}
            score={gameScore}
            onPlayAgain={handlePlayAgain}
          />
        );

      case 'scenario':
        return (
          <ScenarioGame
            scenarioData={gameData}
            onComplete={handleGameComplete}
            isCompleted={gameCompleted}
            score={gameScore}
            onPlayAgain={handlePlayAgain}
          />
        );

      case 'spiral':
        return (
          <ConstitutionSpiralGame
            gameData={gameData}
            onComplete={handleGameComplete}
            isCompleted={gameCompleted}
            score={gameScore}
            onPlayAgain={handlePlayAgain}
          />
        );

      case 'timeline':
        return (
          <TimelineGame
            gameData={gameData}
            onComplete={handleGameComplete}
            isCompleted={gameCompleted}
            score={gameScore}
            onPlayAgain={handlePlayAgain}
          />
        );
      case 'card-sort':
        return (
          <CardSortGame
            gameData={gameData}
            onComplete={handleGameComplete}
            isCompleted={gameCompleted}
            score={gameScore}
            onPlayAgain={handlePlayAgain}
          />
        );

      default:
        return null;
    }
  };

  // Get the game type title
  const getGameTypeTitle = () => {
    switch (selectedGame) {
      case 'quiz':
        return 'Quizzes';
      case 'scenario':
        return 'Constitutional Scenarios';
      case 'matching':
        return 'Matching Games';
      case 'spiral':
        return 'Spiral Visualizations';
      case 'timeline':
        return 'Timeline Games';
      case 'card-sort':
        return 'Classification Games';
      default:
        return 'Games';
    }
  };

  // Helper function to get badge icon
  const getBadgeIcon = (badgeName) => {
    switch (badgeName) {
      case 'Quiz Master':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'Constitution Defender':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'Preamble Scholar':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'Rights Expert':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        );
      case 'Amendment Tracker':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        );
      case 'Perfect Score':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case 'Fast Learner':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'Constitutional Expert':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
    }
  };

  // Helper function to get badge color based on rarity
  const getBadgeColor = (rarity, earned) => {
    if (!earned) return 'bg-dark-200 text-gray-400';

    switch (rarity) {
      case 'common':
        return 'bg-green-900/30 border-2 border-green-500 text-green-400';
      case 'uncommon':
        return 'bg-blue-900/30 border-2 border-blue-500 text-blue-400';
      case 'rare':
        return 'bg-purple-900/30 border-2 border-purple-500 text-purple-400';
      case 'epic':
        return 'bg-yellow-900/30 border-2 border-yellow-500 text-yellow-400';
      case 'legendary':
        return 'bg-red-900/30 border-2 border-red-500 text-red-400';
      default:
        return 'bg-dark-200 text-gray-400';
    }
  };

  // Game type definitions
  const gameTypes = [
    {
      id: 'spiral',
      title: 'Constitution Spiral',
      description: 'Explore the structure of the Indian Constitution through an interactive spiral',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      id: 'scenario',
      title: 'Constitutional Scenarios',
      description: 'Apply constitutional principles to real-world scenarios',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'quiz',
      title: 'Constitutional Quiz',
      description: 'Test your knowledge about the Indian Constitution',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'matching',
      title: 'Article Matching',
      description: 'Match constitutional articles with their descriptions',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      )
    },
    {
      id: 'timeline',
      title: 'Constitutional Timeline',
      description: 'Arrange key events in Indian constitutional history in chronological order',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'card-sort',
      title: 'Fundamental Rights Classification',
      description:
        'Classify constitutional articles into their correct rights category',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-2h6v2m-6-6h6m-6-4h6"
          />
        </svg>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-900/20 border border-red-800 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-2">Error Loading Games</h2>
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Badge notification toast */}
      {badgeNotification && (
        <motion.div
          className="fixed top-6 right-6 z-50 bg-gradient-to-r from-yellow-600 to-amber-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          <div className="flex-shrink-0 bg-yellow-500/30 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-lg">{badgeNotification.message}</p>
            <p className="text-yellow-100 text-sm">Check your achievements below!</p>
          </div>
          <button
            onClick={() => setBadgeNotification(null)}
            className="ml-2 text-yellow-200 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Constitutional Learning Games</h1>
          <p className="text-gray-400 mt-1">Interactive games to test and improve your constitutional knowledge</p>
        </div>
      </div>

      {/* Game selection section */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {gameTypes.map(game => (
          <button
            key={game.id}
            onClick={() => handleGameSelect(game.id)}
            className={`p-4 rounded-lg flex flex-col items-center transition ${selectedGame === game.id
                ? 'bg-primary-600 text-white'
                : 'bg-dark-200 text-gray-300 hover:bg-dark-100'
              }`}
          >
            <div className={`p-3 rounded-full mb-2 ${selectedGame === game.id ? 'bg-primary-700' : 'bg-dark-300'
              }`}>
              {game.icon}
            </div>
            <h3 className="font-medium text-center">{game.title}</h3>
            <p className="text-xs mt-2 text-center opacity-80">{game.description}</p>
          </button>
        ))}
      </div>

      {/* Game display area */}
      <motion.div
        className="card p-5"
        key={selectedGame + (showGameSelector ? 'selector' : 'game') + (selectedGameData ? selectedGameData.id : '')}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {showGameSelector ? (
          // Show game selection cards
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{getGameTypeTitle()}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getCurrentGames().map((game) => (
                <motion.div
                  key={game.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleSpecificGameSelect(game)}
                  className="bg-dark-200 p-4 rounded-lg cursor-pointer hover:bg-dark-100"
                >
                  <h3 className="font-medium text-gray-100 mb-2">{game.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{game.description}</p>
                  <div className="flex justify-end">
                    <span className="text-primary-500 text-sm">Play</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          // Show the actual game
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{selectedGameData?.title}</h2>
              <button
                onClick={handleBackToGameList}
                className="text-sm text-primary-500 hover:text-primary-400"
              >
                Back to {getGameTypeTitle()}
              </button>
            </div>
            {renderGameComponent()}
          </div>
        )}
      </motion.div>

      {/* Game completion card */}
      {gameCompleted && (
        <motion.div
          className="card p-5 bg-gradient-to-r from-primary-600 to-primary-800"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-yellow-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <h3 className="text-2xl font-bold text-white mb-2">Game Completed!</h3>
            <p className="text-white/80 mb-6">Your score: {gameScore.toFixed(2)}%</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handlePlayAgain}
                className="px-5 py-2.5 bg-white text-primary-600 font-medium rounded-lg hover:bg-white/90 transition"
              >
                Play Again
              </button>
              <button
                onClick={handleBackToGameList}
                className="px-5 py-2.5 bg-primary-700 text-white font-medium rounded-lg hover:bg-primary-800 transition"
              >
                Try Another Game
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Game badges and achievements */}
      <div className="card p-5">
        <h2 className="text-xl font-bold text-white mb-4">Your Achievements</h2>

        {achievementsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {achievements.length > 0 ? (
              achievements.map(badge => (
                <div key={badge.id} className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${getBadgeColor(badge.rarity, badge.earned)}`}>
                    {getBadgeIcon(badge.name)}
                  </div>
                  <span className={`text-sm ${badge.earned ? 'text-white' : 'text-gray-400'}`}>{badge.name}</span>
                  {badge.earned && (
                    <span className="text-xs text-gray-500 mt-1">Earned</span>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-6">
                <p className="text-gray-400">Complete games to earn achievements!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConstitutionalGamePage; 
