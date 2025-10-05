import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Header = ({ variant = 'light' }) => {
  const navigate = useNavigate(); 
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const isLight = variant === 'light';
  const textColor = isLight ? 'text-brand-dark' : 'text-white';
  const buttonBg = isLight ? 'bg-brand-dark text-white' : 'bg-white text-brand-dark';
  const buttonHover = isLight ? 'hover:bg-brand-dark/90' : 'hover:bg-gray-200';
  
  const links = [
    { name: 'Home', page: '/' },
    { name: 'About US', page: '/about' },
    { name: 'Services', page: '/services' },
    { name: 'Blog', page: '/blog' },
    { name: 'Contact Us', page: '/contact' },
  ];
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loggedIn === "true");
  }, []);
  return (
    <header className={`absolute top-0 left-0 right-0 z-10 py-6 px-4 sm:px-8 md:px-16 lg:px-24`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <span
            className={`text-3xl font-bold ${textColor} cursor-pointer`}
            onClick={() => navigate('/')} // Navigate to home
            aria-label="Go to homepage"
          >
            RE&LE
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          {links.map((link) => (
            <a
              key={link.page}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate(link.page); // Navigate to the route
              }}
              className={`${textColor} ${
                window.location.pathname === link.page
                  ? 'text-brand-yellow font-bold'
                  : 'hover:text-brand-yellow'
              } transition-colors`}
              aria-current={window.location.pathname === link.page ? 'page' : undefined}
            >
              {link.name}
            </a>
          ))}
        </nav>
        {isLoggedIn ? (
          <button
           className={`${buttonBg} ${buttonHover} font-semibold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105`}
            onClick={() => {
              navigate('/profile');
            }}
            >Profile</button>
          ) : (
        <button
          onClick={() => navigate('/login')} // Navigate to login
          className={`${buttonBg} ${buttonHover} font-semibold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105`}
        >
          LOGIN
        </button>
          )}
      </div>
    </header>
  );
};
