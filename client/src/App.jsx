import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "./components/HomePage";
import { AboutPage } from "./components/AboutPage";
import { DestinationPage } from "./components/DestinationPage";
import { BlogPage } from "./components/BlogPage";
import { ContactPage } from "./components/ContactPage";
import { Footer } from "./components/Footer";
import  { Login }  from "./components/Login";
import { Registration } from "./components/Registration"; 
import "./App.css"; 
import { Profile } from "./components/Profile";
import { ProfilePublic } from "./components/ProfilePublic";


const App = () => {
  

  return (
    <Router>
      
      <div className="app-container">
         
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/:id" element={<DestinationPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:username" element={<ProfilePublic />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
