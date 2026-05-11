import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HelpCircle, Bell, ChevronDown, Menu, X as CloseIcon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import '../pages/Profile.css';

const Navbar = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const logout = auth?.logout;
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Find work', path: '/dashboard', hasChevron: true },
    { name: 'Deliver work', path: '/freelancer-dashboard', hasChevron: true },
    { name: 'Manage Finances', path: '/manage-finances', hasChevron: true },
    { name: 'Messages', path: '/messages', hasChevron: false },
    { name: 'Profile', path: '/profile', hasChevron: false },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900 px-4 sm:px-10 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-10">
          <h2 className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-primary">S</span>kill
            <span className="text-primary">B</span>ridge
          </h2>
          
          {/* Desktop Links */}
          <ul className="hidden lg:flex items-center gap-8 list-none m-0 p-0">
            {navLinks.map((link) => (
              <li 
                key={link.name}
                className={`flex items-center gap-1 text-[15px] font-medium cursor-pointer transition-colors duration-200 ${
                  location.pathname === link.path ? 'text-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary'
                }`}
                onClick={() => navigate(link.path)}
              >
                {link.name} {link.hasChevron && <ChevronDown size={16} />}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-5">
            <HelpCircle className="text-gray-600 dark:text-gray-400 cursor-pointer hover:text-primary transition-colors" size={22} />
            <Bell className="text-gray-600 dark:text-gray-400 cursor-pointer hover:text-primary transition-colors" size={22} />
          </div>

          <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogout}>
            <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <ChevronDown size={16} className="text-gray-500 hidden sm:block" />
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 text-gray-600 dark:text-gray-400"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <ul className="flex flex-col p-6 gap-4 list-none">
            {navLinks.map((link) => (
              <li 
                key={link.name}
                className={`text-lg font-semibold py-2 ${
                  location.pathname === link.path ? 'text-primary' : 'text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => {
                  navigate(link.path);
                  setIsMobileMenuOpen(false);
                }}
              >
                {link.name}
              </li>
            ))}
            <li className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex gap-6">
               <HelpCircle className="text-gray-500" />
               <Bell className="text-gray-500" />
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
