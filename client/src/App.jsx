import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css"; 

import { Header } from "./components/Header";
import { Home }from "./components/Home";

const App = () => {
  
 
  return (
    <Router>
      <Header />
      
      
      <div className="app-container">
        <Home/>
        
         
         
        {/* <main>
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
        <Footer /> */}
      </div>
    </Router>
  );
};

export default App;
