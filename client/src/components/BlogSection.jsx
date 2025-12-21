import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { YellowCalendar, YellowPerson } from "./Icons";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/blogs`);
        setBlogs(res.data || []);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
        setError("Failed to load blogs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) return <p className="text-center py-10">Loading blogs...</p>;
  if (error) return <p className="text-center py-10 text-red-500">{error}</p>;
  if (blogs.length === 0)
    return <p className="text-center py-10">No blogs found.</p>;

  const [mainBlog, ...smallBlogs] = blogs;

  return (
    <section
      id="blog"
      className="w-full py-16 flex flex-col items-center md:pl-[0px] md:pr-[0px] pl-[15px] pr-[15px] "
    >
      <h3 className="font-schoolbell  text-[#9156F1] text-[30px] mb-2">
        News and Events
      </h3>
      <h2 className="font-poppins text-[40px] text-[#310a49] leading-[50px] mb-10">
        Latest Around The Globe
      </h2>

      <div className="w-[90%] max-w-[1200px] flex lg:flex-row flex-col gap-8 h-[600px]">
        {mainBlog && (
          <div className="w-full lg:w-1/2 border border-[#E2DFDF] bg-white rounded-[14px] overflow-hidden">
            <img
              src={mainBlog.image}
              alt={mainBlog.title}
              className="w-full h-[276px] object-cover"
            />
            <div className="p-5">
              <div className="flex items-center gap-4 text-[#6D6969] text-[12px] mb-3">
                <span className="flex items-center gap-1 text-[#9156F1]">
                  <YellowPerson /> {mainBlog.author?.name || "Unknown"}
                </span>
                <span className="flex items-center gap-1 text-[#9156F1]">
                  <YellowCalendar />{" "}
                  {new Date(mainBlog.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-poppins text-[23px] text-[#310a49] mb-2">
                {mainBlog.title}
              </h3>
              <p className="text-[#310a49] text-[12px] leading-[18px] mb-4">
                {mainBlog.content.slice(0, 150)}...
              </p>
              <hr className="border-[#E2DFDF] my-3" />
              <button
                className="bg-[#fbebff] text-[#310a49] shadow-md text-[13px] px-5 py-2 rounded-full"
                onClick={() => navigate(`/blogs/${mainBlog.slug}`)}
              >
                READ MORE
              </button>
            </div>
          </div>
        )}

        <div className="w-full lg:w-1/2 flex flex-col gap-5 min-h-0">
          <div className="flex-1 overflow-y-auto pr-3 hide-scrollbar">
            {smallBlogs.map((blog) => (
              <article
                key={blog._id}
                className="flex border border-[#E2DFDF] rounded-[14px] overflow-hidden bg-white mb-4"
              >
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-[179px] h-[175px] object-cover flex-shrink-0"
                />
                <div className="flex flex-col justify-between p-5 flex-1">
                  <div>
                    <div className="flex items-center gap-4 text-[#6D6969] text-[12px] mb-2">
                      <span className="flex items-center gap-1 text-[#9156F1]">
                        <YellowPerson /> {blog.author?.name || "Unknown"}
                      </span>
                      <span className="flex items-center gap-1 text-[#9156F1]">
                        <YellowCalendar />{" "}
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-poppins text-[18px] text-[#141313] leading-[24px] mb-3">
                      {blog.title}
                    </h4>
                    <hr className="border-[#E2DFDF] mb-3" />
                  </div>
                  <button
                    className="bg-[#fbebff] text-[#310a49] shadow-md text-[13px] px-5 py-2 rounded-full self-end"
                    onClick={() => navigate(`/blogs/${blog.slug}`)}
                  >
                    READ MORE
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
