import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TypingText from '../components/TypingText';
import { AuthContext } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const { login, user, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
    
    // Clear any existing errors when component mounts
    setError(null);
  }, [user, navigate, setError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await login(formData, rememberMe);
        navigate('/');
      } catch (err) {
        // Error is already set in the context
        console.error('Login error:', err);
      }
    }
  };

  const featureContainer = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const featureItem = {
    hidden: { opacity: 0, x: -16 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'anticipate' } }
  };

  return (
    <div className="min-h-screen bg-dark-400 px-4 sm:px-6 lg:px-10">
      <div className="min-h-screen max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-16 items-center">
        <motion.div
          className="relative space-y-8 overflow-hidden rounded-2xl p-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-60"
            style={{
              backgroundImage:
                'radial-gradient(circle at top, rgba(14,116,144,0.35), transparent 55%), radial-gradient(circle at 30% 80%, rgba(59,130,246,0.25), transparent 55%)'
            }}
            animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
            transition={{ duration: 24, ease: 'easeOut', repeat: Infinity, repeatType: 'mirror' }}
          />

          <motion.span
            className="absolute -top-10 -left-10 h-28 w-28 rounded-full bg-primary-500/20 blur-2xl"
            animate={{ y: [0, 18, 0] }}
            transition={{ duration: 12, ease: 'easeInOut', repeat: Infinity }}
          />
          <motion.span
            className="absolute bottom-4 right-4 h-20 w-20 rounded-full bg-cyan-400/20 blur-2xl"
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 10, ease: 'easeInOut', repeat: Infinity }}
          />

          <div className="relative space-y-7 px-3 sm:px-5 py-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-300 border border-primary-500/30 text-xs font-semibold uppercase tracking-widest">
              Gamified Constitutional Learning
            </div>
            <motion.h1
              className="text-4xl sm:text-5xl font-extrabold text-white leading-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            >
              <TypingText
                as="span"
                text="Samvidhan Sarathi"
                typingSpeed={70}
                initialDelay={200}
                pauseDuration={3000}
                deletingSpeed={40}
                loop={true}
                showCursor={true}
                hideCursorWhileTyping={false}
                cursorClassName="bg-primary-300"
                className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-300 via-primary-400 to-primary-500 drop-shadow-[0_0_18px_rgba(59,130,246,0.45)]"
              />
              <motion.span
                className="block text-primary-200/90 mt-2 text-2xl sm:text-3xl"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.22, ease: 'easeOut' }}
              >
                Empowering Citizens through <span className="text-cyan-200">Constitution</span> Knowledge
              </motion.span>
            </motion.h1>
            <motion.p
              className="text-lg text-gray-300 max-w-xl leading-relaxed"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.28, ease: 'easeOut' }}
            >
              Learn the Constitution in simple language, understand your <span className="text-cyan-200">Rights</span>, and practice real-life civic decisions through guided, gamified learning.
            </motion.p>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-8"
              variants={featureContainer}
              initial="hidden"
              animate="show"
            >
              <motion.div
                variants={featureItem}
                whileHover={{ scale: 1.03, boxShadow: '0 0 18px rgba(56,189,248,0.25)' }}
                className="p-6 rounded-2xl bg-dark-300/80 border border-dark-200"
              >
                <div className="h-8 w-8 rounded-full border border-primary-400/40 bg-primary-500/10 flex items-center justify-center text-primary-300">
                  📘
                </div>
                <p className="mt-4 text-white font-semibold">Learn in Simple Language</p>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">Citizen-friendly explanations of Articles and Duties.</p>
              </motion.div>
              <motion.div
                variants={featureItem}
                whileHover={{ scale: 1.03, boxShadow: '0 0 18px rgba(56,189,248,0.25)' }}
                className="p-6 rounded-2xl bg-dark-300/80 border border-dark-200"
              >
                <div className="h-8 w-8 rounded-full border border-primary-400/40 bg-primary-500/10 flex items-center justify-center text-primary-300">
                  🎮
                </div>
                <p className="mt-4 text-white font-semibold">Play Civic Scenarios</p>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">Solve real-life situations with guided choices.</p>
              </motion.div>
              <motion.div
                variants={featureItem}
                whileHover={{ scale: 1.03, boxShadow: '0 0 18px rgba(56,189,248,0.25)' }}
                className="p-6 rounded-2xl bg-dark-300/80 border border-dark-200"
              >
                <div className="h-8 w-8 rounded-full border border-primary-400/40 bg-primary-500/10 flex items-center justify-center text-primary-300">
                  🏆
                </div>
                <p className="mt-4 text-white font-semibold">Track Progress</p>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">Earn levels and badges as you grow.</p>
              </motion.div>
            </motion.div>

            <motion.p
              className="text-sm text-gray-400"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3.2, ease: 'easeInOut', repeat: Infinity }}
            >
              Built to strengthen constitutional awareness among Indian citizens.
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          className="max-w-lg w-full space-y-8 p-10 bg-dark-300 rounded-2xl shadow-xl justify-self-end"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
              Login to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Or{' '}
              <Link to="/register" className="font-medium text-primary-500 hover:text-primary-400">
                register a new account
              </Link>
            </p>
          </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`input w-full ${formErrors.email ? 'border-red-500' : ''}`}
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className={`input w-full ${formErrors.password ? 'border-red-500' : ''}`}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
              Remember me
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="btn btn-primary w-full flex justify-center py-3"
            >
              Sign in
            </button>
          </div>
        </form>
        
        </motion.div>
      </div>
    </div>
  );
};

export default Login; 