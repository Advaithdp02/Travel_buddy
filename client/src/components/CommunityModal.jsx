import React, { useState, useEffect, useRef } from "react";
import { SendIconAdd } from "./Icons";
import { ThumbsUp, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const MAX_CHAR = 2000;

const trimText = (text, limit) => {
  if (!text) return { short: "", full: "", trimmed: false };
  if (text.length <= limit) return { short: text, full: text, trimmed: false };

  return {
    short: text.slice(0, limit) + "...",
    full: text,
    trimmed: true,
  };
};

export const CommunityModal = ({
  isOpen,
  onClose,
  comments,
  refreshComments,
  districtPage,
}) => {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [expandedComments, setExpandedComments] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});
  const [following, setFollowing] = useState([]);
  const [followed, setFollowed] = useState({});

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const replyInputRefs = useRef({});

  /* FETCH FOLLOWING */
  useEffect(() => {
    if (!isOpen || !token) return;

    const loadFollowing = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        const user = data.user ?? data;
        setFollowing(user.following || []);
      } catch (err) {
        console.error("failed to load following:", err);
      }
    };

    loadFollowing();
  }, [isOpen]);

  useEffect(() => {
    const map = {};
    following.forEach((f) => {
      const uname = f.username || f.name;
      if (uname) map[uname] = true;
    });
    setFollowed(map);
  }, [following]);

  const handleToggleFollow = async (username) => {
    try {
      const res = await fetch(`${BACKEND_URL}/users/follow/${username}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Follow failed");

      setFollowed((p) => ({
        ...p,
        [username]: !p[username],
      }));
    } catch (err) {
      console.error(err);
    }
  };

  /* BODY LOCK */
  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.body.clientWidth;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      const storedY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.paddingRight = "";
      window.scrollTo(0, parseInt(storedY || "0") * -1);
    };
  }, [isOpen]);

  /* EXPANDERS */
  const toggleExpandComment = (id) =>
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleExpandReply = (id) =>
    setExpandedReplies((prev) => ({ ...prev, [id]: !prev[id] }));

  /* REPLY INPUT */
  const toggleReplyInput = (commentId) => {
    setReplyingTo(commentId === replyingTo ? null : commentId);

    setTimeout(() => {
      replyInputRefs.current[commentId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 150);
  };

  /* SUBMIT REPLY */
  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim()) return;
    if (!token) return alert("You must be logged in");

    const replyVal = replyText.trim();
    setReplyText("");
    setReplyingTo(null);

    try {
      const res = await fetch(`${BACKEND_URL}/comments/reply/${commentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: replyVal }),
      });

      if (!res.ok) throw new Error("Failed to reply");
      refreshComments();
    } catch (err) {
      console.error(err);
    }
  };

  /* LIKE */
  const handleLikeComment = async (commentId) => {
    if (!userId) return alert("You must be logged in");
    try {
      await fetch(`${BACKEND_URL}/comments/like/${commentId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      refreshComments();
    } catch (err) {
      console.error(err);
    }
  };

  /* DELETE COMMENT */
  const handleDeleteComment = async (commentId) => {
    if (!token) return alert("You must be logged in");
    if (!confirm("Delete this comment?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      refreshComments();
    } catch (err) {
      console.error(err);
    }
  };

  /* DELETE REPLY */
  const handleDeleteReply = async (commentId, replyId) => {
    try {
      await fetch(`${BACKEND_URL}/comments/reply/${commentId}/${replyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      refreshComments();
    } catch (err) {
      console.error(err);
    }
  };

  /* ADD COMMENT */
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!token) return alert("You must be logged in");

    const textVal = newComment.trim();
    setNewComment("");

    const locationId = localStorage.getItem("location_id");

    try {
      const res = await fetch(`${BACKEND_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ location: locationId, text: textVal }),
      });

      if (!res.ok) throw new Error("Failed to add comment");
      refreshComments();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* MAIN WRAPPER */}
      <div className="bg-[#fbebff]/90 backdrop-blur-sm w-11/12 md:w-4/5 lg:w-3/4 h-[90vh] p-0 rounded-xl shadow-2xl flex flex-col relative overflow-hidden">
        {/* 🌟 BACKGROUND TRAVEL VECTOR ART */}
        <div className="pointer-events-none absolute inset-0 opacity-10 select-none">
          {/* Airplane */}
          <svg
            className="absolute top-6 right-10 w-40"
            viewBox="0 0 100 100"
            fill="#9156F1"
          >
            <path d="M4 55 L90 10 L95 20 L40 60 L95 75 L90 90 Z" />
          </svg>

          {/* Mountains */}
          <svg
            className="absolute bottom-0 left-0 w-1/2"
            viewBox="0 0 200 100"
            fill="#9156F1"
          >
            <path d="M0 100 L50 20 L100 100 Z" opacity="0.4" />
            <path d="M80 100 L140 10 L200 100 Z" opacity="0.3" />
          </svg>

          {/* Cloud */}
          <svg
            className="absolute top-24 left-10 w-32"
            viewBox="0 0 64 64"
            fill="#9156F1"
          >
            <path d="M20 50c-8 0-14-5-14-12 0-5 4-10 9-11 1-8 8-14 16-14 9 0 17 7 17 16 6 1 10 6 10 12 0 7-6 12-14 12H20z" />
          </svg>

          {/* Location Pin */}
          <svg
            className="absolute bottom-10 right-8 w-16"
            viewBox="0 0 24 24"
            fill="#9156F1"
          >
            <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z" />
          </svg>
        </div>
        {/* END BACKGROUND */}

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b bg-[#fbebff] relative z-10">
          <h3 className="text-3xl font-bold text-[#310a49]">Comments</h3>
          <button onClick={onClose}>
            <X className="w-10 h-10 text-[#fbebff] bg-[#37377B] rounded-full p-1 hover:bg-blue-700" />
          </button>
        </div>

        {/* COMMENT LIST */}
        <div className="p-4 space-y-4 overflow-y-auto flex-grow relative z-10">
          {comments.map((c) => {
            const username = c.user?.username || c.user?.name;
            const hasLiked = c.likes.includes(userId);
            const commentTrim = trimText(c.text, 200);
            const isCommentExpanded = expandedComments[c._id];
            const isOwnComment = c.user?._id === userId;

            return (
              <div
                key={c._id}
                className="bg-white border rounded-2xl p-4 shadow-md"
              >
                {/* USER */}
                <div className="flex items-center gap-2">
                  {c.user?.profilePic && (
                    <img
                      src={c.user.profilePic}
                      className="w-8 h-8 rounded-full shadow-sm cursor-pointer"
                      onClick={() => {
                        onClose();
                        navigate(`/profile/${username}`);
                      }}
                    />
                  )}

                  <p
                    className="font-semibold cursor-pointer hover:text-[#9156F1]"
                    onClick={() => {
                      onClose();
                      navigate(`/profile/${username}`);
                    }}
                  >
                    {c.user?.name}
                  </p>

                  {/* FOLLOW BUTTON */}
                  {userId !== c.user?._id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFollow(username);
                      }}
                      className={`ml-2 text-xs px-2 py-1 rounded-full ${
                        followed[username]
                          ? "bg-gray-300 text-gray-700"
                          : "bg-[#9156F1] text-white"
                      }`}
                    >
                      {followed[username] ? "Following" : "Follow"}
                    </button>
                  )}
                </div>

                {/* COMMENT TEXT */}
                <p className="text-gray-700 mt-2 mb-2 whitespace-pre-wrap">
                  {isCommentExpanded ? commentTrim.full : commentTrim.short}
                  {commentTrim.trimmed && (
                    <button
                      onClick={() =>
                        setExpandedComments((p) => ({
                          ...p,
                          [c._id]: !p[c._id],
                        }))
                      }
                      className="text-[#9156F1] ml-2 text-sm font-semibold"
                    >
                      {isCommentExpanded ? "View less" : "View more"}
                    </button>
                  )}
                </p>

                {/* ACTIONS */}
                <div className="flex items-center gap-5 text-sm mb-2">
                  <button
                    onClick={() => handleLikeComment(c._id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                      hasLiked
                        ? "bg-[#9156F1] text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" /> {c.likes.length}
                  </button>

                  <button
                    className="text-gray-500 hover:text-blue-600"
                    onClick={() => setReplyingTo(c._id)}
                  >
                    Reply
                  </button>

                  {isOwnComment && (
                    <button
                      onClick={() => handleDeleteComment(c._id)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  )}
                </div>

                {/* REPLIES */}
                {c.replies?.length > 0 && (
                  <div className="ml-6 mt-3 space-y-2">
                    {c.replies.map((r) => {
                      const replyUsername = r.user?.username || r.user?.name;
                      const isOwnReply = r.user?._id === userId;
                      const replyTrim = trimText(r.text, 150);
                      const isReplyExpanded = expandedReplies[r._id];

                      return (
                        <div
                          key={r._id}
                          className="bg-[#fbebff]/60 p-3 rounded-lg text-sm shadow-md"
                        >
                          <div className="flex items-center gap-2">
                            <p
                              className="font-semibold cursor-pointer hover:text-[#9156F1]"
                              onClick={() => {
                                onClose();
                                navigate(`/profile/${replyUsername}`);
                              }}
                            >
                              {r.user?.name}
                            </p>

                            {userId !== r.user?._id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFollow(replyUsername);
                                }}
                                className={`ml-1 text-xs px-2 py-1 rounded-full ${
                                  followed[replyUsername]
                                    ? "bg-gray-300 text-gray-700"
                                    : "bg-[#9156F1] text-white"
                                }`}
                              >
                                {followed[replyUsername]
                                  ? "Following"
                                  : "Follow"}
                              </button>
                            )}
                          </div>

                          <p className="mt-1 whitespace-pre-wrap">
                            {isReplyExpanded ? replyTrim.full : replyTrim.short}
                            {replyTrim.trimmed && (
                              <button
                                onClick={() =>
                                  setExpandedReplies((p) => ({
                                    ...p,
                                    [r._id]: !p[r._id],
                                  }))
                                }
                                className="text-[#9156F1] ml-1 text-xs font-semibold"
                              >
                                {isReplyExpanded ? "View less" : "View more"}
                              </button>
                            )}
                          </p>

                          {isOwnReply && (
                            <button
                              onClick={() => handleDeleteReply(c._id, r._id)}
                              className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 mt-2"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* REPLY INPUT */}
                {replyingTo === c._id && (
                  <div className="ml-6 mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) =>
                        setReplyText(e.target.value.slice(0, MAX_CHAR))
                      }
                      className="w-full border rounded-lg p-2 text-sm"
                    />
                    <button
                      onClick={() => handleReplySubmit(c._id)}
                      className="bg-[#9156F1] text-white px-4 py-2 rounded-lg"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ADD COMMENT */}
        {!districtPage && (
          <div className="p-4 border-t bg-[#fbebff] sticky bottom-0 relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) =>
                  setNewComment(e.target.value.slice(0, MAX_CHAR))
                }
                className="flex-grow min-w-[200px] border border-[#9156F1] rounded-lg p-2"
              />

              <button
                onClick={handleAddComment}
                className="bg-[#9156F1] text-white px-4 py-2 rounded-lg"
              >
                <SendIconAdd className="w-5 h-5" />
              </button>

              <div className="w-full text-right text-xs text-gray-400">
                {newComment.length} / {MAX_CHAR}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
