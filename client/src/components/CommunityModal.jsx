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
  const [followed, setFollowed] = useState({});

  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const replyInputRefs = useRef({});

  // Prevent scroll behind modal
  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;

    // Calculate scrollbar width
    const scrollbarWidth = window.innerWidth - document.body.clientWidth;

    // Apply scroll lock WITHOUT shifting layout
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

  const toggleExpandComment = (id) =>
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleExpandReply = (id) =>
    setExpandedReplies((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleReplyInput = (commentId) => {
    setReplyingTo(commentId === replyingTo ? null : commentId);

    setTimeout(() => {
      replyInputRefs.current[commentId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 150);
  };

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

  const handleDeleteReply = async (commentId, replyId) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/comments/reply/${commentId}/${replyId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) return;

      refreshComments();
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleToggleFollow = async (username) => {
    try {
      const res = await fetch(`${BACKEND_URL}/users/follow/${username}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to follow/unfollow");

      setFollowed((prev) => ({
        ...prev,
        [username]: !prev[username],
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#fbebff] w-11/12 md:w-4/5 lg:w-3/4 max-h-[90vh] p-0 rounded-xl shadow-2xl overflow-y-auto relative">
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b bg-[#fbebff] sticky top-0 z-50">
          <h3 className="text-3xl font-bold text-[#310a49]">Comments</h3>
          <button onClick={onClose}>
            <X className="w-10 h-10 text-[#fbebff] bg-[#37377B] rounded-full p-1 hover:bg-blue-700" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {comments.map((c) => {
            const hasLiked = c.likes.includes(userId);
            const isOwnComment = c.user?._id === userId;

            const commentTrim = trimText(c.text, 200);
            const isCommentExpanded = expandedComments[c._id];

            const username = c.user?.username || c.user?.name;

            return (
              <div
                key={c._id}
                className="bg-white border rounded-2xl p-4 shadow-md"
              >
                {/* USER ROW */}
                <div className="flex items-center gap-2">
                  {/* Profile Picture */}
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

                  {/* Username */}
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
                <div className="text-gray-700 mt-2 mb-2 break-words whitespace-pre-wrap">
                  <p>
                    {isCommentExpanded ? commentTrim.full : commentTrim.short}

                    {commentTrim.trimmed && (
                      <button
                        onClick={() => toggleExpandComment(c._id)}
                        className="text-[#9156F1] ml-2 text-sm font-semibold"
                      >
                        {isCommentExpanded ? "View less" : "View more"}
                      </button>
                    )}
                  </p>
                </div>

                {/* BUTTONS */}
                <div className="flex items-center gap-5 text-sm mb-2">
                  <button
                    className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                      hasLiked
                        ? "bg-[#9156F1] text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                    onClick={() => handleLikeComment(c._id)}
                  >
                    <ThumbsUp className="w-4 h-4" /> {c.likes.length}
                  </button>

                  <button
                    className="text-gray-500 hover:text-blue-600"
                    onClick={() => toggleReplyInput(c._id)}
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
                      const isOwnReply = r.user?._id === userId;

                      const replyTrim = trimText(r.text, 150);
                      const isReplyExpanded = expandedReplies[r._id];

                      const replyUsername = r.user?.username || r.user?.name;

                      return (
                        <div
                          key={r._id}
                          className="bg-[#fbebff]/60 p-3 rounded-lg text-sm shadow-md break-words"
                        >
                          {/* Reply User + Follow */}
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

                            {/* FOLLOW BUTTON FOR REPLIES */}
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

                          {/* REPLY TEXT */}
                          <div className="mt-1 break-words whitespace-pre-wrap">
                            <p>
                              {isReplyExpanded
                                ? replyTrim.full
                                : replyTrim.short}

                              {replyTrim.trimmed && (
                                <button
                                  onClick={() => toggleExpandReply(r._id)}
                                  className="text-[#9156F1] ml-1 text-xs font-semibold"
                                >
                                  {isReplyExpanded ? "View less" : "View more"}
                                </button>
                              )}
                            </p>
                          </div>

                          {/* DELETE REPLY */}
                          {isOwnReply && (
                            <button
                              className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 mt-2"
                              onClick={() => handleDeleteReply(c._id, r._id)}
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
                  <div
                    ref={(el) => (replyInputRefs.current[c._id] = el)}
                    className="ml-6 mt-2 flex items-center gap-2"
                  >
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) =>
                          setReplyText(e.target.value.slice(0, MAX_CHAR))
                        }
                        className="w-full border rounded-lg p-2 pr-14 text-sm focus:ring-2 focus:ring-[#9156F1]"
                      />

                      <span className="absolute right-2 bottom-1 text-[10px] text-gray-400 bg-white px-1">
                        {replyText.length} / {MAX_CHAR}
                      </span>
                    </div>

                    <button
                      onClick={() => handleReplySubmit(c._id)}
                      className="bg-[#9156F1] text-white px-4 py-2 rounded-lg hover:bg-[#7a3be0]"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add comment */}
          {!districtPage && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) =>
                  setNewComment(e.target.value.slice(0, MAX_CHAR))
                }
                className="flex-grow min-w-[200px] border border-[#9156F1] rounded-lg p-2 focus:ring-2 focus:ring-[#9156F1]"
              />

              <button
                onClick={handleAddComment}
                className="bg-[#9156F1] text-white px-4 py-2 rounded-lg hover:bg-[#7a3be0]"
              >
                <SendIconAdd className="w-5 h-5" />
              </button>

              <div className="w-full mt-1 text-right text-xs text-gray-400">
                {newComment.length} / {MAX_CHAR}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityModal;
