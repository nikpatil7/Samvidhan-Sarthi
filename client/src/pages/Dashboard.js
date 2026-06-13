import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';

// Components
const colorClasses = {
  primary: {
    bar: 'bg-primary-600',
    iconBg: 'bg-primary-600/20',
    iconText: 'text-primary-500'
  },
  secondary: {
    bar: 'bg-secondary-600',
    iconBg: 'bg-secondary-600/20',
    iconText: 'text-secondary-500'
  },
  green: {
    bar: 'bg-green-600',
    iconBg: 'bg-green-600/20',
    iconText: 'text-green-500'
  },
  yellow: {
    bar: 'bg-yellow-600',
    iconBg: 'bg-yellow-600/20',
    iconText: 'text-yellow-500'
  }
};

const getColorClasses = (color) => colorClasses[color] || colorClasses.primary;

const ProgressCard = ({ title, value, maxValue, color = 'primary' }) => {
  const percentage = Math.min(100, Math.round((value / maxValue) * 100)) || 0;
  const classes = getColorClasses(color);
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div 
      className="card cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <h3 className="text-lg font-medium text-gray-200 mb-2">{title}</h3>
      <div className="w-full bg-dark-200 rounded-full h-4 mb-2">
        <motion.div 
          className={`h-4 rounded-full ${classes.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          whileHover={{ backgroundColor: isHovered ? classes.bar.replace('600', '500') : classes.bar }}
        />
      </div>
      <motion.div 
        className="text-sm text-gray-400"
        animate={{ opacity: isHovered ? 1 : 0.8 }}
      >
        {value} of {maxValue} ({percentage}%)
      </motion.div>
    </motion.div>
  );
};

const StatCard = ({ title, value, icon, color = 'primary' }) => {
  const classes = getColorClasses(color);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      className="card flex items-center cursor-pointer"
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div 
        className={`flex-shrink-0 h-12 w-12 rounded-lg ${classes.iconBg} flex items-center justify-center mr-4`}
        animate={{ rotate: isHovered ? 360 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className={classes.iconText}>{icon}</span>
      </motion.div>
      <div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <motion.h3 
          className="text-xl font-semibold text-white"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {value}
        </motion.h3>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user, authAxios, updateProfile } = useContext(AuthContext);
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(user?.preferredCountry || 'India');
  const [isUpdatingCountry, setIsUpdatingCountry] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const fetchDashboardData = useCallback(async (country) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAxios.get(`/users/dashboard?country=${encodeURIComponent(country)}`);
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  const fetchAnalyticsData = useCallback(async (country) => {
    try {
      const response = await authAxios.get(`/users/analytics?country=${encodeURIComponent(country)}`);
      setAnalyticsData(response.data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      // Don't set error for analytics - it's optional
    }
  }, [authAxios]);
  
  // Re-fetch dashboard data whenever the user navigates to this page, or country changes
  useEffect(() => {
    fetchDashboardData(selectedCountry);
    fetchAnalyticsData(selectedCountry);
  }, [fetchDashboardData, fetchAnalyticsData, selectedCountry, location.key, refreshKey]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }
  
  const handleCountryChange = async (e) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);

    try {
      setIsUpdatingCountry(true);
      await updateProfile({ preferredCountry: newCountry });
      // Dashboard data will be re-fetched automatically via useEffect dependency on selectedCountry
    } catch (err) {
      console.error('Error updating preferred country:', err);
    } finally {
      setIsUpdatingCountry(false);
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    handleRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <motion.h1 
            className="text-3xl font-bold text-white"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Dashboard
          </motion.h1>
          <motion.p 
            className="text-sm text-gray-400 mt-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Track your learning progress and recent activity.
          </motion.p>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={handleRefreshClick}
            className="p-2 rounded-lg bg-dark-200 hover:bg-dark-100 text-gray-400 hover:text-white transition-colors"
            title="Refresh dashboard"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </motion.button>
          <motion.select 
            className="input bg-dark-200 text-sm"
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            value={selectedCountry}
            onChange={handleCountryChange}
            disabled={isUpdatingCountry}
          >
            <option value="India">India</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
          </motion.select>
        </div>
      </div>
      
      {dashboardData && (
        <>
          {/* Stats overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Overall Progress" 
              value={`${dashboardData.stats.overallProgress}%`} 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              } 
            />
            
            <StatCard 
              title="Topics Completed" 
              value={`${dashboardData.stats.completedTopics}/${dashboardData.stats.totalTopics}`} 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              } 
              color="secondary"
            />
            
            <StatCard 
              title="Average Quiz Score" 
              value={`${dashboardData.stats.averageQuizScore}%`} 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              } 
              color="green"
            />
            
            <StatCard 
              title="Badges Earned" 
              value={dashboardData.stats.totalBadges} 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              } 
              color="yellow"
            />
          </div>
          
          {/* Experiential Learning Analytics */}
          {analyticsData && (
            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-white mb-4">Experiential Learning Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Scenario Performance" 
                  value={`${analyticsData.scenarioPerformance.averageScore}%`} 
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  } 
                  color="primary"
                />
                <StatCard 
                  title="Application Questions" 
                  value={`${analyticsData.applicationQuestionPerformance.averageScore}%`} 
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  } 
                  color="secondary"
                />
                <StatCard 
                  title="Learning Improvement" 
                  value={`${analyticsData.learningImprovement.averageImprovement > 0 ? '+' : ''}${analyticsData.learningImprovement.averageImprovement}%`} 
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  } 
                  color={analyticsData.learningImprovement.averageImprovement >= 0 ? 'green' : 'yellow'}
                />
                <StatCard 
                  title="Module Steps Completed" 
                  value={Object.values(analyticsData.moduleStepProgress).reduce((a, b) => a + b, 0)} 
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  } 
                  color="primary"
                />
              </div>
            </motion.div>
          )}
          
          {/* Enhanced Analytics Details */}
          {analyticsData && (
            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-xl font-bold text-white mb-4">Detailed Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scenario Score Distribution */}
                <div className="bg-dark-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-3">Scenario Score Distribution</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Excellent (90%+)</span>
                      <span className="text-green-400">{analyticsData.scenarioPerformance.scoreDistribution?.excellent || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Good (75%+)</span>
                      <span className="text-blue-400">{analyticsData.scenarioPerformance.scoreDistribution?.good || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Average (60%+)</span>
                      <span className="text-yellow-400">{analyticsData.scenarioPerformance.scoreDistribution?.average || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Needs Improvement</span>
                      <span className="text-red-400">{analyticsData.scenarioPerformance.scoreDistribution?.needsImprovement || 0}</span>
                    </div>
                  </div>
                </div>
                
                {/* Engagement Metrics */}
                <div className="bg-dark-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-3">Engagement by Content Type</h3>
                  <div className="space-y-2">
                    {Object.entries(analyticsData.engagementMetrics?.mostEngagingContentTypes || {}).map(([type, count]) => (
                      <div key={type} className="flex justify-between text-sm">
                        <span className="text-gray-400 capitalize">{type}</span>
                        <span className="text-primary-400">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Topic Mastery Analysis */}
                {analyticsData.topicMasteryAnalysis && (
                  <div className="bg-dark-200 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-3">Topic Mastery Analysis</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Average Mastery</p>
                        <p className="text-2xl font-bold text-primary-500">{analyticsData.topicMasteryAnalysis.averageMastery}%</p>
                      </div>
                      {analyticsData.topicMasteryAnalysis.strongestTopics.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Strongest Topics</p>
                          {analyticsData.topicMasteryAnalysis.strongestTopics.slice(0, 2).map((topic, idx) => (
                            <p key={idx} className="text-sm text-green-400">{topic.topic}: {topic.mastery}%</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Learning Style */}
                {analyticsData.personalizedInsights?.learningStyle && (
                  <div className="bg-dark-200 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-3">Your Learning Style</h3>
                    <p className="text-lg text-primary-400">{analyticsData.personalizedInsights.learningStyle}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Personalized Insights */}
          {analyticsData?.personalizedInsights && (
            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-xl font-bold text-white mb-4">Personalized Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Strengths */}
                {analyticsData.personalizedInsights.strengths.length > 0 && (
                  <div className="bg-green-900/20 p-4 rounded-lg border border-green-700">
                    <h3 className="font-semibold text-green-400 mb-2">Strengths</h3>
                    <ul className="space-y-1">
                      {analyticsData.personalizedInsights.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-gray-300">• {strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Areas for Improvement */}
                {analyticsData.personalizedInsights.areasForImprovement.length > 0 && (
                  <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-700">
                    <h3 className="font-semibold text-yellow-400 mb-2">Areas for Improvement</h3>
                    <ul className="space-y-1">
                      {analyticsData.personalizedInsights.areasForImprovement.map((area, idx) => (
                        <li key={idx} className="text-sm text-gray-300">• {area}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Recommended Next Steps */}
                {analyticsData.personalizedInsights.recommendedNextSteps.length > 0 && (
                  <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700">
                    <h3 className="font-semibold text-blue-400 mb-2">Recommended Next Steps</h3>
                    <ul className="space-y-1">
                      {analyticsData.personalizedInsights.recommendedNextSteps.map((step, idx) => (
                        <li key={idx} className="text-sm text-gray-300">• {step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Topic Mastery Display */}
          {dashboardData.progress.length > 0 && (
            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="text-xl font-bold text-white mb-4">Topic Mastery Scores</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.progress.slice(0, 6).map((item) => (
                  <div key={item.topicId} className="bg-dark-200 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-100 mb-2 truncate">{item.topicTitle}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Mastery</span>
                      <span className="text-lg font-semibold text-primary-500">
                        {item.topicMastery !== undefined && item.topicMastery !== null ? `${item.topicMastery}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-dark-300 rounded-full h-2 mt-2">
                      <div 
                        className="h-2 rounded-full bg-primary-600"
                        style={{ width: `${item.topicMastery || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Recent activity and progress */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {/* Topic progress */}
            <div className="lg:col-span-2 card space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-white">Topic Progress</h2>
                <Link to="/topics" className="text-sm text-primary-500 hover:text-primary-400">
                  View all topics
                </Link>
              </div>
              
              <div className="space-y-4">
                {dashboardData.progress.slice(0, 3).map((item) => (
                  <motion.div 
                    key={item.topicId}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link to={`/topics/${item.topicId}`}>
                      <ProgressCard 
                        title={item.topicTitle} 
                        value={item.completionPercentage} 
                        maxValue={100} 
                      />
                    </Link>
                  </motion.div>
                ))}
                
                {dashboardData.progress.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>No topics started yet. Explore topics to begin learning!</p>
                    <div className="mt-4">
                      <Link to="/topics" className="btn btn-primary">
                        Explore Topics
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Recent activities */}
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
              
              <div className="space-y-4">
                {dashboardData.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-3 border-b border-dark-200">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-600/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {activity.completed 
                          ? `Completed an activity in ${activity.topicTitle}` 
                          : `Started an activity in ${activity.topicTitle}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(activity.date).toLocaleDateString()}
                        {activity.score > 0 && ` • Score: ${activity.score}%`}
                      </p>
                    </div>
                  </div>
                ))}
                
                {dashboardData.recentActivities.length === 0 && (
                  <div className="text-center py-4 text-gray-400">
                    <p>No recent activities</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Continue learning section */}
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Continue Learning</h2>
              <Link to="/topics" className="text-sm text-primary-500 hover:text-primary-400">
                View all topics
              </Link>
            </div>
            
            {dashboardData.progress.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.progress
                  .filter(item => item.completionPercentage > 0 && item.completionPercentage < 100)
                  .slice(0, 3)
                  .map((item) => (
                    <motion.div 
                      key={item.topicId}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="bg-dark-200 p-4 rounded-lg"
                    >
                      <Link to={`/topics/${item.topicId}`}>
                        <h3 className="font-medium text-gray-100 mb-2">{item.topicTitle}</h3>
                        <div className="w-full bg-dark-300 rounded-full h-2 mb-2">
                          <div 
                            className="h-2 rounded-full bg-primary-600"
                            style={{ width: `${item.completionPercentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{item.completionPercentage}% complete</span>
                          <span>Continue</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>Start exploring topics to begin your learning journey!</p>
                <div className="mt-4">
                  <Link to="/topics" className="btn btn-primary">
                    Start Learning
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default Dashboard; 
