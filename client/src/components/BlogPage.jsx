import React from 'react';
import { Header } from './Header';

export const BlogPage = ({ currentPage, navigate }) => {
  const newsArticles = [
    {
      img: 'https://picsum.photos/seed/news1/600/400',
      author: 'Lewis Bennett',
      date: 'Oct 08 2024',
      title: 'Exploring New Destinations: Top 5 Emerging Travel Spots for 2024"',
      excerpt: 'As travel resumes to pre-pandemic levels, new and exciting destinations are making waves across the globe. In 2024, some under-the-radar places are becoming the next hot spots for travelers seeking something unique...',
      featured: true,
    },
    {
      img: 'https://picsum.photos/seed/news2/300/200',
      author: 'Lewis Bennett',
      date: 'Oct 08 2024',
      title: "Discover the Magic of Travel: Upcoming Events You Can't Miss in 2024",
    },
    {
      img: 'https://picsum.photos/seed/news3/300/200',
      author: 'Lewis Bennett',
      date: 'Oct 08 2024',
      title: 'Plan Ahead: Best Time to Visit Southeast Asia in 2024"',
    },
    {
      img: 'https://picsum.photos/seed/news4/300/200',
      author: 'Lewis Bennett',
      date: 'Oct 08 2024',
      title: 'Experience the Future of Travel: Key Events Shaping the Industry in 2024',
    },
    {
      img: 'https://picsum.photos/seed/news5/300/200',
      author: 'Jane Doe',
      date: 'Oct 07 2024',
      title: 'Sustainable Travel: How to Be a Responsible Tourist',
    },
    {
      img: 'https://picsum.photos/seed/news6/300/200',
      author: 'John Smith',
      date: 'Oct 06 2024',
      title: "A Foodie's Guide to Culinary Adventures Around the World",
    },
  ];

  const featuredArticle = newsArticles[0];
  const otherArticles = newsArticles.slice(1);

  return (
    <>
      <Header currentPage={currentPage} navigate={navigate} />

      {/* Hero Section */}
      <section
        className="relative h-[40vh] bg-cover bg-center text-white flex items-center justify-center"
        style={{ backgroundImage: "url('https://picsum.photos/seed/blog-hero/1600/900')" }}
      >
        <div className="absolute inset-0 bg-brand-dark/60"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold">Our Blog</h1>
          <p className="text-xl mt-4">News, events, and stories from the world of travel.</p>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20 px-8">
        <div className="container mx-auto">
          {/* Featured Article */}
          <div className="mb-16">
            <div className="grid lg:grid-cols-2 gap-8 items-center bg-brand-light-purple p-8 rounded-xl">
              <div>
                <p className="text-brand-yellow font-semibold text-lg">Featured Story</p>
                <h2 className="text-4xl font-bold text-brand-dark my-2">{featuredArticle.title}</h2>
                <div className="flex items-center text-sm text-brand-gray space-x-4 my-4">
                  <span>By <b>{featuredArticle.author}</b></span>
                  <span>{featuredArticle.date}</span>
                </div>
                <p className="text-brand-gray mb-6">{featuredArticle.excerpt}</p>
                <button className="bg-brand-dark text-white font-semibold py-3 px-8 rounded-lg hover:bg-brand-dark/90">READ MORE</button>
              </div>
              <img src={featuredArticle.img} alt={featuredArticle.title} className="w-full h-96 object-cover rounded-lg" />
            </div>
          </div>

          {/* Other Articles */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-brand-dark">More To Explore</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherArticles.map((article, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                <img src={article.img} alt={article.title} className="w-full h-56 object-cover" />
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center text-xs text-brand-gray space-x-2 mb-2">
                    <span>{article.author}</span>
                    <span>&bull;</span>
                    <span>{article.date}</span>
                  </div>
                  <h3 className="font-bold text-brand-dark leading-tight text-lg mb-4 flex-grow">{article.title}</h3>
                  <button className="mt-auto bg-brand-dark text-white font-semibold py-2 px-4 text-sm rounded-md hover:bg-brand-dark/90 w-full">READ MORE</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
