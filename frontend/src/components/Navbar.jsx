import React, { useState, useEffect } from 'react';
import { LogOut, Video, Plus, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  
  // Check for token and role in localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    setIsLoggedIn(!!token);
    setIsAdmin(role === 'admin');
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate('/');
  };
  
  const handleCreateClick = () => {
    navigate('/create');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left - Website Name and Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-white flex items-center">
                <Video className="w-6 h-6 mr-2" />
                EduTech
              </h1>
            </div>
          </div>
          
          {/* Right - Authentication Buttons (hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                {/* Show Create button only for non-admin users */}
                {!isAdmin && (
                  <button 
                    className="flex items-center px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors shadow-md"
                    onClick={handleCreateClick}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create
                  </button>
                )}
                <button 
                  className="flex items-center px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors shadow-md"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  className="px-4 py-2 text-white font-medium hover:bg-blue-800 rounded-lg transition-colors"
                  onClick={() => navigate('/signin')}
                >
                  Sign In
                </button>
                <button 
                  className="px-4 py-2 bg-white text-blue-700 font-medium rounded-lg hover:bg-gray-100 transition-colors shadow-md"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </button>
              </>
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
        <div className="md:hidden bg-blue-800 shadow-inner px-2 pt-2 pb-4">
          <div className="px-2 pt-2 pb-3 space-y-3">
            {/* Mobile Auth Buttons */}
            <div className="space-y-2">
              {isLoggedIn ? (
                <>
                  {/* Show Create button only for non-admin users */}
                  {!isAdmin && (
                    <button 
                      className="flex items-center w-full px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors"
                      onClick={handleCreateClick}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create
                    </button>
                  )}
                  <button 
                    className="flex items-center w-full px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="w-full px-4 py-2 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors"
                    onClick={() => navigate('/signin')}
                  >
                    Sign In
                  </button>
                  <button 
                    className="w-full px-4 py-2 bg-white text-blue-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => navigate('/signup')}
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