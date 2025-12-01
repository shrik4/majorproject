
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-white'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-campus-600 to-campus-800">Campus Connect</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
            <Link to="/student-upload" className={`nav-link ${isActive('/student-upload')}`}>Student Upload</Link>
            <Link to="/navigation" className={`nav-link ${isActive('/navigation')}`}>Campus Navigation</Link>
            <Link to="/chatbot" className={`nav-link ${isActive('/chatbot')}`}>Campus Assistant</Link>
            <Link to="/digital-notice-board" className={`nav-link ${isActive('/digital-notice-board')}`}>Notice Board</Link>

            <div className="pl-4 border-l border-gray-200 ml-4 flex items-center space-x-2">
              <Button
                onClick={() => navigate('/user-profile')}
                className="flex items-center justify-center w-10 h-10 p-0 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
              >
                <User size={18} />
              </Button>

            </div>
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <Button
              onClick={() => setIsOpen(!isOpen)}
              variant="ghost"
              size="icon"
              className="text-gray-700"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-white shadow-lg animate-fade-in">
          <div className="flex flex-col px-4 pt-2 pb-3 space-y-1 border-t">
            <Link
              to="/"
              className={`px-3 py-3 rounded-md text-base font-medium transition-colors ${isActive('/') ? 'text-primary bg-blue-50' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'}`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/student-upload"
              className={`px-3 py-3 rounded-md text-base font-medium transition-colors ${isActive('/student-upload') ? 'text-primary bg-blue-50' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'}`}
              onClick={() => setIsOpen(false)}
            >
              Student Upload
            </Link>
            <Link
              to="/navigation"
              className={`px-3 py-3 rounded-md text-base font-medium transition-colors ${isActive('/navigation') ? 'text-primary bg-blue-50' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'}`}
              onClick={() => setIsOpen(false)}
            >
              Campus Navigation
            </Link>
            <Link
              to="/digital-notice-board"
              className={`px-3 py-3 rounded-md text-base font-medium transition-colors ${isActive('/digital-notice-board') ? 'text-primary bg-blue-50' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'}`}
              onClick={() => setIsOpen(false)}
            >
              Notice Board
            </Link>

            <div className="pt-2 mt-2 border-t border-gray-100">
              <Button
                onClick={() => {
                  navigate('/user-profile');
                  setIsOpen(false);
                }}
                variant="ghost"
                className="w-full justify-start px-3 py-2 text-base font-medium text-gray-700 hover:text-primary flex items-center gap-2"
              >
                <User size={18} />
                <span>Profile</span>
              </Button>

            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
