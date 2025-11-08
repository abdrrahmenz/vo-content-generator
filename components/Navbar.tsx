import React, { useState } from 'react';
import { SparklesIcon, InformationCircleIcon } from './icons';

interface NavbarProps {
    currentPage: string;
    onNavigate: (page: string) => void;
    onAboutClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onAboutClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinkClasses = (page: string) => {
    const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
    if (currentPage === page) {
      return `${baseClasses} bg-slate-700 text-white`;
    }
    return `${baseClasses} text-slate-300 hover:bg-slate-800 hover:text-white`;
  };

  const mobileNavLinkClasses = (page: string) => {
    const baseClasses = "block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors";
     if (currentPage === page) {
      return `${baseClasses} bg-slate-700 text-white`;
    }
    return `${baseClasses} text-slate-300 hover:bg-slate-800 hover:text-white`;
  }

  const handleMobileNavClick = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  }

  const handleMobileAboutClick = () => {
    onAboutClick();
    setIsMobileMenuOpen(false);
  }
  
  return (
    <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <div className="-ml-2 mr-2 flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                className="bg-slate-800 inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
                <SparklesIcon className="h-8 w-8 text-indigo-400" />
                <span className="text-xl font-bold text-white">
                    Content Generator
                </span>
            </div>
          </div>
          <div className="flex items-center">
            {/* Desktop Menu */}
            <nav className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <button
                  onClick={() => onNavigate('hook')}
                  className={navLinkClasses('hook')}
                  aria-current={currentPage === 'hook' ? 'page' : undefined}
                >
                  Hook
                </button>
                <button
                  onClick={() => onNavigate('script')}
                  className={navLinkClasses('script')}
                  aria-current={currentPage === 'script' ? 'page' : undefined}
                >
                  Script
                </button>
                <button
                  onClick={() => onNavigate('speech')}
                  className={navLinkClasses('speech')}
                  aria-current={currentPage === 'speech' ? 'page' : undefined}
                >
                  Speech
                </button>
                <button
                  onClick={onAboutClick}
                  className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800"
                  aria-label="About this application"
                  title="About this application"
                >
                  <InformationCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button
              onClick={() => handleMobileNavClick('hook')}
              className={mobileNavLinkClasses('hook')}
              aria-current={currentPage === 'hook' ? 'page' : undefined}
            >
              Hook
            </button>
            <button
              onClick={() => handleMobileNavClick('script')}
              className={mobileNavLinkClasses('script')}
              aria-current={currentPage === 'script' ? 'page' : undefined}
            >
              Script
            </button>
             <button
              onClick={() => handleMobileNavClick('speech')}
              className={mobileNavLinkClasses('speech')}
              aria-current={currentPage === 'speech' ? 'page' : undefined}
            >
              Speech
            </button>
            <button
              onClick={handleMobileAboutClick}
              className={`${mobileNavLinkClasses('about')} flex items-center gap-3`}
            >
              <InformationCircleIcon className="h-6 w-6" />
              <span>About</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;