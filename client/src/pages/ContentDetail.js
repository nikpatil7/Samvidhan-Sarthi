import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AuthContext } from '../contexts/AuthContext';

// Import game components
import QuizGame from '../components/ConstitutionalGames/QuizGame';
import MatchingGame from '../components/ConstitutionalGames/MatchingGame';
import ScenarioGame from '../components/ConstitutionalGames/ScenarioGame';
import TimelineGame from '../components/ConstitutionalGames/TimelineGame';
import SpiralGame from '../components/ConstitutionalGames/SpiralGame';

const ContentDetail = () => {
  const { contentId } = useParams();
  const { authAxios } = useContext(AuthContext);
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [topic, setTopic] = useState(null);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch content details
        const contentResponse = await authAxios.get(`/content/content/${contentId}`);
        setContent(contentResponse.data);
        
        // Fetch topic details for this content
        const topicResponse = await authAxios.get(`/content/topics/detail/${contentResponse.data.topic}`);
        setTopic(topicResponse.data);
        
        // If it's a quiz, initialize answer array
        if (contentResponse.data.type === 'quiz' && contentResponse.data.quiz?.questions) {
          setQuizAnswers(new Array(contentResponse.data.quiz.questions.length).fill(null));
        }
      } catch (err) {
        console.error('Error fetching content data:', err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };
    
    if (contentId) {
      fetchData();
    }
  }, [contentId, authAxios]);

  // Handle quiz answer selection
  const handleAnswerSelect = (questionIndex, optionIndex) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = optionIndex;
    setQuizAnswers(newAnswers);
  };

  // Go to next quiz question
  const handleNextQuestion = () => {
    if (currentQuizQuestion < content.quiz.questions.length - 1) {
      setCurrentQuizQuestion(currentQuizQuestion + 1);
    } else {
      // Calculate score
      calculateQuizScore();
    }
  };

  // Go to previous quiz question
  const handlePrevQuestion = () => {
    if (currentQuizQuestion > 0) {
      setCurrentQuizQuestion(currentQuizQuestion - 1);
    }
  };

  // Calculate quiz score and submit it
  const calculateQuizScore = async () => {
    const correctAnswers = content.quiz.questions.map((question, index) => {
      const selectedAnswerIndex = quizAnswers[index];
      
      if (selectedAnswerIndex === null) return false;
      
      return question.options[selectedAnswerIndex].isCorrect;
    });
    
    const correctCount = correctAnswers.filter(Boolean).length;
    const totalCount = content.quiz.questions.length;
    const score = Math.round((correctCount / totalCount) * 100);
    
    setQuizScore(score);
    setQuizCompleted(true);
    
    // Submit quiz score to API
    try {
      await authAxios.post('/content/track', {
        topicId: topic._id,
        contentId: content._id,
        type: 'quiz',
        score: score
      });
    } catch (err) {
      console.error('Error tracking quiz completion:', err);
    }
  };

  // Handle game completion
  const handleGameComplete = async (score) => {
    setGameScore(score);
    setGameCompleted(true);
    
    // Submit game score to API
    try {
      await authAxios.post('/content/track', {
        topicId: topic._id,
        contentId: content._id,
        type: 'game',
        score: score,
        completed: true
      });
    } catch (err) {
      console.error('Error tracking game completion:', err);
    }
  };

  // Mark lesson/article/video as completed
  const handleContentCompleted = async () => {
    try {
      await authAxios.post('/content/track', {
        topicId: topic._id,
        contentId: content._id,
        type: content.type,
        completed: true
      });
      
      // Navigate back to topic detail
      navigate(`/topics/${topic._id}`);
    } catch (err) {
      console.error('Error tracking content completion:', err);
    }
  };

  // Reset quiz
  const resetQuiz = () => {
    setQuizAnswers(new Array(content.quiz.questions.length).fill(null));
    setCurrentQuizQuestion(0);
    setQuizCompleted(false);
    setQuizScore(0);
  };

  // Reset game
  const resetGame = () => {
    setGameCompleted(false);
    setGameScore(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error || "Could not load the content"}</span>
      </div>
    );
  }

  // Function to render the appropriate game component
  const renderGameComponent = () => {
    if (!content.gameConfig || !content.gameConfig.type) {
      return (
        <div className="text-center text-gray-400 py-8">
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Game configuration not found</p>
            <p className="text-sm text-gray-500 mt-2">This game may not be properly configured yet.</p>
          </div>
        </div>
      );
    }

    const gameType = content.gameConfig.type;
    const gameConfig = content.gameConfig.config;

    switch (gameType) {
      case 'quiz':
        return (
          <QuizGame 
            quizData={gameConfig.questions || []} 
            onComplete={handleGameComplete} 
            isCompleted={gameCompleted}
            score={gameScore}
            onPlayAgain={resetGame}
          />
        );
      case 'matching':
        return (
          <MatchingGame 
            gameData={gameConfig.pairs || []} 
            onComplete={handleGameComplete} 
            isCompleted={gameCompleted}
            score={gameScore}
            onPlayAgain={resetGame}
          />
        );
      case 'scenario':
        return (
          <ScenarioGame 
            scenarioData={gameConfig.scenarios || []} 
            onComplete={handleGameComplete} 
            isCompleted={gameCompleted}
            score={gameScore}
            onPlayAgain={resetGame}
          />
        );
      case 'timeline':
        return (
          <TimelineGame 
            gameData={gameConfig.events || []} 
            onComplete={handleGameComplete} 
            isCompleted={gameCompleted}
            score={gameScore}
            onPlayAgain={resetGame}
          />
        );
      case 'spiral':
        return (
          <SpiralGame 
            gameData={gameConfig} 
            onComplete={handleGameComplete} 
            isCompleted={gameCompleted}
            score={gameScore}
            onPlayAgain={resetGame}
          />
        );
      default:
        return (
          <div className="text-center text-gray-400 py-8">
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>Unsupported game type: {gameType}</p>
              <p className="text-sm text-gray-500 mt-2">This game type is not currently supported.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      {topic && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-400">
          <Link to="/topics" className="hover:text-primary-400 font-medium">
            Topics
          </Link>
          <span className="text-gray-600">/</span>
          <Link to={`/topics/${topic._id}`} className="hover:text-primary-400 font-medium">
            {topic.title}
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-gray-200 font-semibold">
            {content.title}
          </span>
        </div>
      )}
      
      {/* Content title */}
      <div className="card">
        <h1 className="text-2xl font-bold text-white mb-2">{content.title}</h1>
        
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span className="inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {content.estimatedTime} min
          </span>
          
          <span className="inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
          </span>
          
          <span className="inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.585l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {content.points} points
          </span>
        </div>
      </div>
      
      {/* Content body */}
      <div className="card">
        {content.type === 'quiz' ? (
          <div className="space-y-6">
            {quizCompleted ? (
              // Quiz results
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center py-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Quiz Results</h2>
                  
                  <div className="inline-block h-40 w-40 rounded-full border-8 border-primary-500 p-3 mb-4">
                    <div className="h-full w-full rounded-full bg-primary-900/30 flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary-400">{quizScore}%</span>
                    </div>
                  </div>
                  
                  <p className="text-lg text-gray-300 mb-6">
                    {quizScore >= 70 
                      ? 'Great job! You\'ve passed the quiz.' 
                      : 'You need to score at least 70% to pass. Try again!'}
                  </p>
                  
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={resetQuiz}
                      className="btn btn-outline"
                    >
                      Retake Quiz
                    </button>
                    
                    <Link to={`/topics/${topic._id}`} className="btn btn-primary">
                      Back to Topic
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              // Quiz questions
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Question {currentQuizQuestion + 1} of {content.quiz.questions.length}</h2>
                  
                  <div className="bg-dark-200 h-2 rounded-full w-48">
                    <div 
                      className="bg-primary-500 h-2 rounded-full" 
                      style={{ width: `${((currentQuizQuestion + 1) / content.quiz.questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-dark-200 rounded-lg p-6">
                  <motion.div
                    key={`question-${currentQuizQuestion}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-medium text-white mb-4">
                      {content.quiz.questions[currentQuizQuestion].question}
                    </h3>
                    
                    <div className="space-y-3">
                      {content.quiz.questions[currentQuizQuestion].options.map((option, optionIndex) => (
                        <div 
                          key={optionIndex}
                          className={`p-4 rounded-lg border-2 cursor-pointer ${
                            quizAnswers[currentQuizQuestion] === optionIndex
                              ? 'border-primary-500 bg-primary-900/20'
                              : 'border-gray-700 hover:border-gray-500'
                          }`}
                          onClick={() => handleAnswerSelect(currentQuizQuestion, optionIndex)}
                        >
                          <div className="flex items-center">
                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                              quizAnswers[currentQuizQuestion] === optionIndex
                                ? 'border-primary-500'
                                : 'border-gray-600'
                            }`}>
                              {quizAnswers[currentQuizQuestion] === optionIndex && (
                                <div className="h-2 w-2 rounded-full bg-primary-500"></div>
                              )}
                            </div>
                            <span className="text-gray-200">{option.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={handlePrevQuestion}
                    className="btn btn-outline"
                    disabled={currentQuizQuestion === 0}
                  >
                    Previous
                  </button>
                  
                  <button
                    onClick={handleNextQuestion}
                    className="btn btn-primary"
                    disabled={quizAnswers[currentQuizQuestion] === null}
                  >
                    {currentQuizQuestion < content.quiz.questions.length - 1 ? 'Next' : 'Finish Quiz'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : content.type === 'game' ? (
          // Game content
          <div className="space-y-6">
            {/* Breadcrumb navigation */}
            {topic && (
              <div className="flex items-center text-sm text-gray-400">
                <Link to="/topics" className="hover:text-primary-500">
                  Topics
                </Link>
                <span className="mx-2">/</span>
                <Link to={`/topics/${topic._id}`} className="hover:text-primary-500">
                  {topic.title}
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-300">{content.title}</span>
              </div>
            )}
            
            {/* Game header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-white">{content.title}</h1>
                <p className="text-gray-400 mt-1">
                  <span className="bg-primary-900/30 text-primary-400 text-xs px-2 py-1 rounded-full uppercase">
                    Interactive Game
                  </span>
                  <span className="ml-2">·</span>
                  <span className="ml-2">{content.estimatedTime || '10'} min</span>
                  <span className="ml-2">·</span>
                  <span className="ml-2">{content.points || '50'} points</span>
                </p>
              </div>
              
              {gameCompleted && (
                <div className="flex items-center bg-green-900/30 border border-green-800 text-green-400 px-4 py-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Completed: {gameScore}%</span>
                </div>
              )}
            </div>
            
            {/* Game description */}
            {content.content && (
              <div className="bg-dark-200 rounded-xl p-5">
                <p className="text-gray-200 leading-relaxed">{content.content}</p>
              </div>
            )}
            
            {/* Game component */}
            <div className="mt-6">
              {renderGameComponent()}
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between pt-4 mt-6 border-t border-dark-200">
              <Link to={`/topics/${topic?._id}`} className="btn btn-secondary">
                Back to Topic
              </Link>
              
              {!gameCompleted && (
                <button 
                  onClick={handleContentCompleted} 
                  className="btn btn-primary"
                >
                  Mark as Complete
                </button>
              )}
            </div>
          </div>
        ) : content.type === 'video' ? (
          // Video content
          <div className="space-y-6">
            {/* Video player */}
            <div className="relative w-full bg-dark-200 rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
              {content.content && (content.content.includes('youtube.com') || content.content.includes('youtu.be')) ? (
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={content.content.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  title={content.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : content.content && (content.content.endsWith('.mp4') || content.content.endsWith('.webm') || content.content.endsWith('.ogg')) ? (
                <video 
                  className="absolute top-0 left-0 w-full h-full"
                  controls
                  controlsList="nodownload"
                >
                  <source src={content.content} type={`video/${content.content.split('.').pop()}`} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium">Video Content</p>
                  <div className="mt-4 prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between pt-4 border-t border-dark-200">
              <Link to={`/topics/${topic._id}`} className="btn btn-outline">
                Back to Topic
              </Link>
              
              <button
                onClick={handleContentCompleted}
                className="btn btn-primary"
              >
                Mark as Completed
              </button>
            </div>
          </div>
        ) : (
          // Other content types (lesson, article)
          <div className="space-y-6">
            {/* Learning Objectives */}
            {content.objectives && content.objectives.length > 0 && (
              <motion.div 
                className="bg-gradient-to-r from-primary-900/20 to-transparent border border-primary-500/30 rounded-lg p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-lg font-semibold text-primary-300 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2 1 1 0 100 2 1 1 0 000 2 1 1 0 000 2 1 1 0 000 2 1 1 0 100 2 1 1 0 000-2 1 1 0 010-2 2 2 0 002-2 1 1 0 100-2 1 1 0 000-2 2 2 0 00-2-2z" clipRule="evenodd" />
                  </svg>
                  Learning Objectives
                </h3>
                <ul className="space-y-2">
                  {content.objectives.map((objective, idx) => (
                    <li key={idx} className="flex items-start text-gray-200">
                      <span className="inline-block w-2 h-2 rounded-full bg-primary-400 mt-2 mr-3 flex-shrink-0"></span>
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Main Content */}
            <div className="prose prose-invert max-w-none leading-relaxed prose-headings:text-white prose-headings:font-semibold prose-headings:mt-8 prose-headings:mb-3 prose-h2:mt-9 prose-h3:mt-7 prose-p:mt-4 prose-li:mt-2 prose-li:text-gray-200 prose-p:text-gray-200 prose-strong:text-white prose-a:text-primary-400 prose-a:no-underline hover:prose-a:text-primary-300 prose-blockquote:border-primary-500/40 prose-blockquote:bg-dark-200/60 prose-blockquote:rounded-xl prose-blockquote:p-4 prose-blockquote:text-gray-200">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content.content}
              </ReactMarkdown>
            </div>

            {/* Key Points */}
            {content.keyPoints && content.keyPoints.length > 0 && (
              <motion.div 
                className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Key Points to Remember
                </h3>
                <ul className="space-y-2">
                  {content.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start text-gray-200">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mt-2 mr-3 flex-shrink-0"></span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Case Studies */}
            {content.caseStudies && content.caseStudies.length > 0 && (
              <motion.div 
                className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  Related Case Studies
                </h3>
                <ul className="space-y-2">
                  {content.caseStudies.map((caseStudy, idx) => (
                    <li key={idx} className="flex items-start text-gray-200">
                      <span className="inline-block text-amber-400 mr-3">📋</span>
                      <span>{caseStudy}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
            
            <div className="flex justify-between pt-4 border-t border-dark-200">
              <Link to={`/topics/${topic._id}`} className="btn btn-outline">
                Back to Topic
              </Link>
              
              <button
                onClick={handleContentCompleted}
                className="btn btn-primary"
              >
                Mark as Completed
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentDetail; 