import React from "react";
import { useNavigate } from "react-router-dom";

export const Header = ({ variant = "light" }) => {
  const navigate = useNavigate();
  const isLight = variant === "light";
  const textColor = isLight ? "text-brand-dark" : "text-white";
  const buttonBg = isLight ? "bg-brand-dark text-white" : "bg-white text-brand-dark";
  const buttonHover = isLight ? "hover:bg-brand-dark/90" : "hover:bg-gray-200";
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  const links = [
    { name: "Home", page: "/" },
    { name: "About Us", page: "#aboutUs" },
    { name: "Services", page: "#services" },
    { name: "Blog", page: "#blog" },
    { name: "Contact Us", page: "/contact" },
  ];

  const handleLinkClick = (page) => {
    if (page.startsWith("#")) {
      const sectionId = page.substring(1);
      if (window.location.pathname !== "/") {
        navigate("/"); // go home first
        // wait for navigation, then scroll
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 300);
      } else {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(page);
    }
  };

  return (
    <header className="w-full top-0 left-0 z-50 bg-transparent py-4 px-6 pb-0 md:px-16">
      <div className="flex justify-between items-center w-full max-w-[1250px] mx-auto h-[40px]">
        {/* Logo */}
        <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate("/")}>
          <img
            src="/LOGO.png"
            alt="logo"
            className="w-[125.69px] h-[27.49px] relative top-[2px]"
          />
        </div>

        <div className="flex flex-rows gap-10 items-center">
          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8 font-['Baloo 2'] font-medium text-[14px] leading-[22px] gap-2 text-[#1D1D51]">
            {links.map((link) => (
              <button
                key={link.page}
                onClick={() => handleLinkClick(link.page)}
                className={`${textColor} ${
                  window.location.pathname === link.page
                    ? "text-[#F2B024] font-bold"
                    : "hover:text-[#F2B024]"
                } transition-colors`}
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Login / Profile Button */}
          {isLoggedIn ? (
            <button
              onClick={() => navigate("/profile")}
              className={`${buttonBg} ${buttonHover} w-[100px] h-[40px] rounded-full font-semibold shadow-md flex items-center justify-center text-[13px] transition-transform hover:scale-105`}
            >
              Profile
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="w-[100px] h-[40px] bg-[#1D1D51] rounded-full text-white font-roboto font-normal text-[13px] leading-[15px] flex items-center justify-center shadow-md transition-transform hover:scale-105"
            >
              LOGIN
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
