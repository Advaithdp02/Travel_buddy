import React from "react";
import { useNavigate } from "react-router-dom";

export const Header = ({ variant = "light" }) => {
  const navigate = useNavigate();
  const isLight = variant === "light";
  const textColor = isLight ? "text-brand-dark" : "text-white";

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

  if (pathname === "/") {
    logoClasses += " h-[165px] top-[-48px]";
  } else if (pathname.includes("/profile")) {
    logoClasses += " h-[115px] top-[-40px]";
  } else {
    logoClasses += " h-[149px] top-[-60px]";
  }


  return (
    <header className="w-full top-0 left-0 z-50 bg-[#fbebff] py-4 px-6 md:px-16 ">
  <div className="flex justify-end items-center w-full max-w-[1250px] mx-auto h-[40px] relative">
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
              className={`${buttonHover} w-[100px] text-white h-[40px] bg-[#9156F1] rounded-full font-semibold shadow-md flex items-center justify-center text-[13px] transition-transform hover:scale-105`}
            >
              Profile
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="w-[100px] h-[40px] bg-[#9156F1] rounded-full text-white font-roboto font-normal text-[13px] leading-[15px] flex items-center justify-center shadow-md transition-transform hover:scale-105"
            >
              LOGIN
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
