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
  
  return (
    <div className="card border-t-4 border-primary-100">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Mastery</span>
      </div>
      <div className="w-full bg-surface-200 rounded-full h-4 mb-3">
        <motion.div 
          className={`h-4 rounded-full ${classes.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <div className="text-sm text-gray-600 font-medium">
        {value} of {maxValue} ({percentage}%)
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color = 'primary' }) => {
  const classes = getColorClasses(color);

  return (
    <motion.div 
      className="card flex items-center gap-4 border-l-4 border-primary-100"
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.2 }}
    >
      <div className={`flex-shrink-0 h-12 w-12 rounded-2xl ${classes.iconBg} flex items-center justify-center ring-1 ring-black/5`}>
        <span className={classes.iconText}>{icon}</span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 leading-tight">{value}</h3>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user, authAxios, updateProfile } = useContext(AuthContext);
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(user?.preferredCountry || 'India');
  const [isUpdatingCountry, setIsUpdatingCountry] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
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
  
  // Re-fetch dashboard data whenever the user navigates to this page, or country changes
  useEffect(() => {
    fetchDashboardData(selectedCountry);
  }, [fetchDashboardData, selectedCountry, location.key, refreshKey]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-700 mb-3">
            Constitutional learning
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Your learning journey</h1>
          <p className="text-sm text-gray-600 mt-1">Track progress, revisit rights and duties, and keep building civic understanding.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-primary-600 transition-colors shadow-sm"
            title="Refresh dashboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <select 
            className="input text-sm"
            value={selectedCountry}
            onChange={handleCountryChange}
            disabled={isUpdatingCountry}
          >
            <option value="India">India</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
          </select>
        </div>
      </div>
      
      {dashboardData && (
        <>
          <div className="card overflow-hidden border-primary-100 bg-gradient-to-br from-primary-50 via-white to-surface-200">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-700 border border-secondary-100">
                  Learn your rights. Understand your duties.
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                    {user?.name ? `Welcome back, ${user.name}` : 'Welcome back'}
                  </h2>
                  <p className="mt-2 text-gray-600 text-base leading-7">
                    Constitutional learning works best when progress feels visible, purposeful, and rewarding.
                    Each topic, quiz, and achievement brings you closer to becoming a more informed citizen.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm">
                  <p className="text-sm font-medium text-primary-700">Civic learning reminder</p>
                  <p className="mt-1 text-gray-700">
                    "A constitution is not a mere lawyers' document, it is a vehicle of life and its spirit is always the spirit of the age."
                  </p>
                </div>
              </div>

              <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[28rem]">
                <div className="rounded-2xl border border-primary-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Current progress</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{dashboardData.stats.overallProgress}%</p>
                  <p className="text-sm text-gray-600">Overall constitutional mastery</p>
                </div>
                <div className="rounded-2xl border border-secondary-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Topics completed</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{dashboardData.stats.completedTopics}/{dashboardData.stats.totalTopics}</p>
                  <p className="text-sm text-gray-600">Across the selected country</p>
                </div>
                <div className="rounded-2xl border border-success-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Average quiz score</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{dashboardData.stats.averageQuizScore}%</p>
                  <p className="text-sm text-gray-600">Knowledge retention checkpoint</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Badges earned</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{dashboardData.stats.totalBadges}</p>
                  <p className="text-sm text-gray-600">Rewards for consistent practice</p>
                </div>
              </div>
            </div>
          </div>

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
          
          {/* Recent activity and progress */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Topic progress */}
            <div className="lg:col-span-2 card space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900">Topic Progress</h2>
                <Link to="/topics" className="text-sm text-primary-600 hover:text-primary-700">
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
                  <div className="text-center py-8 text-gray-600">
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
              
              <div className="space-y-4">
                {dashboardData.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-3 border-b border-gray-200">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.completed 
                          ? `Completed an activity in ${activity.topicTitle}` 
                          : `Started an activity in ${activity.topicTitle}`}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(activity.date).toLocaleDateString()}
                        {activity.score > 0 && ` • Score: ${activity.score}%`}
                      </p>
                    </div>
                  </div>
                ))}
                
                {dashboardData.recentActivities.length === 0 && (
                  <div className="text-center py-4 text-gray-600">
                    <p>No recent activities</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Continue learning section */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
              <Link to="/topics" className="text-sm text-primary-600 hover:text-primary-700">
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
                      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                    >
                      <Link to={`/topics/${item.topicId}`}>
                        <h3 className="font-medium text-gray-900 mb-2">{item.topicTitle}</h3>
                        <div className="w-full bg-surface-200 rounded-full h-2 mb-2">
                          <div 
                            className="h-2 rounded-full bg-primary-500"
                            style={{ width: `${item.completionPercentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{item.completionPercentage}% complete</span>
                          <span>Continue</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <p>Start exploring topics to begin your learning journey!</p>
                <div className="mt-4">
                  <Link to="/topics" className="btn btn-primary">
                    Start Learning
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard; 
