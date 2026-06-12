import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile, logout, error, setError, authAxios } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    name: user?.name || '',
    preferredCountry: user?.preferredCountry || 'India',
    profilePicture: user?.profilePicture || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Static assets (avatars) are served from the server root, not under /api
  const SERVER_URL = (process.env.REACT_APP_SERVER_URL ||
    (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, ''));

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
    
    // Clear global error and success message
    setError(null);
    setUpdateSuccess(false);
  };

  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    
    // Clear error for this field when user types
    if (passwordErrors[name]) {
      setPasswordErrors({ ...passwordErrors, [name]: '' });
    }
    
    // Clear global error and success message
    setError(null);
    setPasswordSuccess(false);
  };

  // Validate profile form
  const validateProfileForm = () => {
    const errors = {};
    
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate password form
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (validateProfileForm()) {
      try {
        await updateProfile(formData);
        setIsEditing(false);
        setUpdateSuccess(true);
      } catch (err) {
        // Error is already set in the context
        console.error('Profile update error:', err);
      }
    }
  };

  // Handle password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (validatePasswordForm()) {
      try {
        await authAxios.put('/users/change-password', {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        });
        setIsChangingPassword(false);
        setPasswordSuccess(true);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to change password';
        setError(message);
        console.error('Password change error:', err);
      }
    }
  };

  // Helper to get user initials for avatar
  const getUserInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    } else if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Get avatar URL
  const getAvatarUrl = () => {
    if (user?.profilePicture) {
      // If it's already a full URL, use as-is; otherwise prepend API base
      if (user.profilePicture.startsWith('http')) return user.profilePicture;
      return `${SERVER_URL}${user.profilePicture}`;
    }
    return null;
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (PNG, JPEG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2MB');
      return;
    }

    setUploadingAvatar(true);
    setError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await authAxios.post('/users/upload-avatar', {
            image: reader.result
          });
          // Update the user context with new profile picture
          await updateProfile({ profilePicture: res.data.profilePicture });
          setUpdateSuccess(true);
        } catch (err) {
          const message = err.response?.data?.message || 'Failed to upload avatar';
          setError(message);
        } finally {
          setUploadingAvatar(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read image file');
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to upload avatar');
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
      
      {error && (
        <motion.div 
          className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded relative" 
          role="alert"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="block sm:inline">{error}</span>
        </motion.div>
      )}
      
      {updateSuccess && (
        <motion.div 
          className="bg-green-900/30 border border-green-800 text-green-300 px-4 py-3 rounded relative" 
          role="alert"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="block sm:inline">Profile updated successfully!</span>
        </motion.div>
      )}
      
      {passwordSuccess && (
        <motion.div 
          className="bg-green-900/30 border border-green-800 text-green-300 px-4 py-3 rounded relative" 
          role="alert"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="block sm:inline">Password changed successfully!</span>
        </motion.div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column - User info */}
        <div className="md:col-span-1">
          <div className="card flex flex-col items-center py-8">
            {/* Avatar with upload */}
            <div className="relative group mb-4">
              {getAvatarUrl() ? (
                <img
                  src={getAvatarUrl()}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover border-2 border-primary-600"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 text-4xl font-medium shadow-sm border border-primary-100">
                  {getUserInitials()}
                </div>
              )}
              
              {/* Upload overlay */}
              <label
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200"
                title="Change profile picture"
              >
                {uploadingAvatar ? (
                  <svg className="animate-spin h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </label>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900">{user?.name || user?.username}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-xs text-gray-500 mt-1">Hover avatar to change photo</p>
            
            <div className="mt-6">
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="btn btn-outline"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        
        {/* Right column - Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile form */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
              
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-primary-500 hover:text-primary-400"
                >
                  Edit
                </button>
              )}
            </div>
            
            <form onSubmit={handleProfileSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-1">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    className={`input w-full ${formErrors.username ? 'border-red-500' : ''}`}
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  {formErrors.username && (
                    <p className="mt-1 text-sm text-red-400">{formErrors.username}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="input w-full"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <label htmlFor="preferredCountry" className="block text-sm font-medium text-gray-600 mb-1">
                    Preferred Country
                  </label>
                  <select
                    id="preferredCountry"
                    name="preferredCountry"
                    className="input w-full"
                    value={formData.preferredCountry}
                    onChange={handleChange}
                    disabled={!isEditing}
                  >
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                  </select>
                </div>
              </div>
              
              {isEditing && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        username: user?.username || '',
                        name: user?.name || '',
                        preferredCountry: user?.preferredCountry || 'India',
                        profilePicture: user?.profilePicture || ''
                      });
                      setFormErrors({});
                    }}
                    className="btn border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
          
          {/* Password form */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
              
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="text-primary-500 hover:text-primary-400"
                >
                  Change
                </button>
              )}
            </div>
            
            {isChangingPassword ? (
              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-600 mb-1">
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      className={`input w-full ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
                      placeholder="Current Password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-400">{passwordErrors.currentPassword}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-600 mb-1">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      className={`input w-full ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                      placeholder="New Password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-400">{passwordErrors.newPassword}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      className={`input w-full ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
                      placeholder="Confirm New Password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-400">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setPasswordErrors({});
                    }}
                    className="btn border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-gray-600">
                We recommend using a strong password that you don't use elsewhere.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 