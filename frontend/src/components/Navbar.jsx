import React, { useState, useEffect } from 'react';
import { LogOut, Video, Plus, Menu, X, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();
  
  // Check for token and role in localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    setIsLoggedIn(!!token);
    setIsAdmin(role === 'admin');
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowProfileDropdown(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate('/');
    setShowProfileDropdown(false);
  };
  
  const handleCreateClick = () => {
    navigate('/create');
    setShowProfileDropdown(false);
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    setShowProfileDropdown(!showProfileDropdown);
  };
  
  const navigateToProfile = () => {
    navigate('/Profile');
    setShowProfileDropdown(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-700 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left - Website Name and Logo */}
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 cursor-pointer" 
              onClick={() => navigate('/dashboard')}
            >
              <h1 className="text-2xl font-bold text-white flex items-center">
                <Video className="w-6 h-6 mr-2 text-blue-300" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-100 font-extrabold">
                  EduTech
                </span>
              </h1>
            </div>
          </div>
          
          {/* Right - Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                {/* Show Create button only for non-admin users */}
                {!isAdmin && (
                  <button 
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-medium rounded-lg hover:from-green-500 hover:to-emerald-600 transition-all duration-300 shadow-md transform hover:scale-105"
                    onClick={handleCreateClick}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create
                  </button>
                )}
                
                {/* Profile Icon */}
                <div className="relative">
                  <button 
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all flex items-center justify-center"
                    onClick={handleProfileClick}
                  >
                    <User className="w-5 h-5 text-white" />
                  </button>
                  
                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                      <button 
                        className="w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left flex items-center"
                        onClick={navigateToProfile}
                      >
                        <User className="w-4 h-4 mr-2 text-gray-500" />
                        Profile
                      </button>
                      <button 
                        className="w-full px-4 py-2 text-red-600 hover:bg-gray-100 text-left flex items-center"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 mr-2 text-red-500" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button 
                  className="px-5 py-2 text-white font-medium hover:bg-white/10 rounded-lg transition-all"
                  onClick={() => navigate('/signin')}
                >
                  Sign In
                </button>
                <button 
                  className="px-5 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-medium rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all shadow-md transform hover:scale-105"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-indigo-800/90 backdrop-blur-sm shadow-inner px-2 pt-2 pb-4 rounded-b-lg">
          <div className="px-2 pt-2 pb-3 space-y-3">
            {/* Mobile Auth Buttons */}
            <div className="space-y-2">
              {isLoggedIn ? (
                <>
                  {/* Profile Option */}
                  <button 
                    className="flex items-center w-full px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => {
                      navigate('/profile');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </button>
                
                  {/* Show Create button only for non-admin users */}
                  {!isAdmin && (
                    <button 
                      className="flex items-center w-full px-4 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-medium rounded-lg hover:from-green-500 hover:to-emerald-600 transition-colors"
                      onClick={() => {
                        handleCreateClick();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create
                    </button>
                  )}
                  <button 
                    className="flex items-center w-full px-4 py-3 bg-gradient-to-r from-red-400 to-red-500 text-white font-medium rounded-lg hover:from-red-500 hover:to-red-600 transition-colors"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="w-full px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => {
                      navigate('/signin');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </button>
                  <button 
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-medium rounded-lg hover:from-blue-500 hover:to-blue-600 transition-colors"
                    onClick={() => {
                      navigate('/signup');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;