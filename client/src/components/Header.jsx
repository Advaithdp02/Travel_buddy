import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


export const MobileMenu = ({ links, isLoggedIn }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (page) => {
    if (page.startsWith("#")) {
      const sectionId = page.substring(1);
      if (window.location.pathname !== "/") {
        navigate("/");
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
    setMobileMenuOpen(false); // close modal after click
  };

  return (
    <div className="md:hidden flex items-center">
      {/* Hamburger Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="flex flex-col justify-between w-6 h-5"
      >
        <span className="block h-0.5 w-full bg-black"></span>
        <span className="block h-0.5 w-full bg-black"></span>
        <span className="block h-0.5 w-full bg-black"></span>
      </button>

      {/* Mobile Modal Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-4/5 rounded-lg p-6 flex flex-col items-center space-y-6 relative">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-black font-bold text-xl"
              onClick={() => setMobileMenuOpen(false)}
            >
              ×
            </button>

            {/* Navigation Links */}
            {links.map((link) => (
              <button
                key={link.page}
                onClick={() => handleLinkClick(link.page)}
                className="text-[#1D1D51] font-medium hover:text-[#9156F1] text-lg"
              >
                {link.name}
              </button>
            ))}

            {/* Login / Profile Button */}
            {!isLoggedIn && (
              <button
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-[#9156F1] text-white  rounded-full py-3 font-semibold"
              >
                LOGIN
              </button>
            )}

            {isLoggedIn && (
              <button
                onClick={() => {
                  navigate("/profile");
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-[#9156F1] text-white  rounded-full py-3 font-semibold"
              >
                Profile
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


export const Header = ({ variant = "light" }) => {
  const navigate = useNavigate();
  const isLight = variant === "light";
  const textColor = isLight ? "text-brand-dark" : "text-white";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
  const isProfilePage = window.location.pathname.includes("/profile");
  const pathname = location.pathname;
  let logoClasses = "absolute left-0 flex-shrink-0 cursor-pointer bg-white rounded-bl-[20px] rounded-br-[20px] overflow-visible inline-block shadow-md";

  if (pathname === "/"|| pathname.includes("/contact")|| pathname.includes("/login")|| pathname.includes("/register")) {
    logoClasses += " h-[150px] md:h-[165px] top-[-48px]";
  } else if (pathname.includes("/profile")) {
    logoClasses += " h-[111px] md:h-[115px] top-[-40px]";
  }else if(pathname.includes("/admin")){
     logoClasses += " h-[140px] top-[-50px] md:h-[140px] md:top-[-60px] left-[70px]";
  }
  else {
    logoClasses += " h-[147px] top-[-50px] md:h-[149px] md:top-[-60px]";
  }


  return (
    <header className="w-full top-0 left-0 z-50 bg-[#fbebff] py-4 px-6 md:px-16 ">
  <div className="flex justify-end  gap-2items-center w-full max-w-[1250px] mx-auto h-[40px] relative">
    {/* Logo */}
    <div
      className={logoClasses}
      onClick={() => navigate("/")}
    >
      <img
        src="/LOGO.png"
        alt="logo"
        className={`${isProfilePage? "w-[145px] h-auto block":"w-[195px] h-auto block"}   cursor-pointer`}
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
                    ? "text-[#9156F1] font-bold"
                    : "hover:text-[#9156F1]"
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
              className={`${buttonHover} w-[100px] text-white md:mr-0 mr-[20px] h-[40px] bg-[#9156F1] rounded-full font-semibold shadow-md flex items-center justify-center text-[13px] transition-transform hover:scale-105`}
            >
              Profile
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="w-[100px] h-[40px] bg-[#9156F1] md:mr-0 mr-[20px] rounded-full text-white font-roboto font-normal text-[13px] leading-[15px] flex items-center justify-center shadow-md transition-transform hover:scale-105"
            >
              LOGIN
            </button>
          )}
        </div>
        <MobileMenu links={links} isLoggedIn={isLoggedIn} />
      </div>
          
    </header>
  );
};
