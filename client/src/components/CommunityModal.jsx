import React, { useState, useEffect } from "react";
import { SendIconAdd } from "./Icons";
import { ThumbsUp, Trash2,X } from "lucide-react";

import { useNavigate } from "react-router-dom";



const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const CommunityModal = ({
  isOpen,
  onClose,
  activeTab,
  comments,
  contributions,
  refreshComments,
  refreshContributions,
  districtPage,
}) => {
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState([]);
  const [localContributions, setLocalContributions] = useState([]);
  const [contribComments, setContribComments] = useState({});
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const navigate = useNavigate();
  const [dataChanged, setDataChanged] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Sync props to local state
  useEffect(() => setLocalComments(comments), [comments]);
  useEffect(() => setLocalContributions(contributions), [contributions]);
  const toggleReplyInput = (commentId) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
  };

  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim()) return;
    if (!token) return alert("You must be logged in");

    // Create temporary reply for instant UI update
    const tempReply = {
      _id: `temp-${Date.now()}`,
      text: replyText.trim(),
      user: { _id: userId, name: "You" },
      likes: [],
      createdAt: new Date().toISOString(),
    };

    // Optimistically update UI
    setLocalComments((prev) =>
      prev.map((c) =>
        c._id === commentId
          ? { ...c, replies: [...(c.replies || []), tempReply] }
          : c
      )
    );

    setReplyText("");
    setReplyingTo(null);

    try {
      const res = await fetch(`${BACKEND_URL}/comments/reply/${commentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: replyText.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to post reply");

      // trigger refresh like handleAddComment
      setDataChanged(true);
    } catch (err) {
      console.error(err);
      alert(err.message);

      // rollback optimistic reply
      setLocalComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? {
                ...c,
                replies: (c.replies || []).filter(
                  (r) => r._id !== tempReply._id
                ),
              }
            : c
        )
      );
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!token) return alert("You must be logged in");
    const confirmDelete = confirm(
      "Are you sure you want to delete this comment?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${BACKEND_URL}/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to delete comment");
      refreshComments?.();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };
  const handleDeleteContributionComment = async (contribId, commentId) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/contributions/${contribId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.ok) {
        setContribComments((prev) => ({
          ...prev,
          [contribId]: prev[contribId].filter((com) => com._id !== commentId),
        }));
      } else {
        const data = await res.json();
        console.error("Failed to delete comment:", data.message);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Fetch all comments for a contribution
  const fetchContributionComments = async (contribId) => {
    if (!contribId) return;
    try {
      const res = await fetch(
        `${BACKEND_URL}/contributions/${contribId}/comments`
      );
      const data = await res.json();
      if (res.ok) {
        setContribComments((prev) => ({
          ...prev,
          [contribId]: data || [],
        }));
      } else {
        console.error(data.message || "Failed to fetch contribution comments");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch comments for all contributions
  useEffect(() => {
    localContributions.forEach((c) => {
      if (c?._id) fetchContributionComments(c._id);
    });
  }, [localContributions]);

  if (!isOpen) return null;

  // --- General comments ---
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const locationId = localStorage.getItem("location_id");
    if (!token) return alert("You must be logged in");

    const tempComment = {
      _id: `temp-${Date.now()}`,
      text: newComment.trim(),
      user: { _id: userId, name: "You" },
      likes: [],
      createdAt: new Date().toISOString(),
    };

    setLocalComments((prev) => [tempComment, ...prev]);
    setNewComment("");

    try {
      const res = await fetch(`${BACKEND_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ location: locationId, text: newComment.trim() }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      setDataChanged(true); // <-- trigger refresh
    } catch (err) {
      console.error(err);
      alert(err.message);
      setLocalComments((prev) => prev.filter((c) => c._id !== tempComment._id));
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!userId) return alert("You must be logged in");

    // Optimistic UI update
    const updated = localComments.map((c) => {
      if (c._id === commentId) {
        const hasLiked = c.likes.includes(userId);
        return {
          ...c,
          likes: hasLiked
            ? c.likes.filter((id) => id !== userId)
            : [...c.likes, userId],
        };
      }
      return c;
    });
    setLocalComments(updated);

    try {
      const res = await fetch(`${BACKEND_URL}/comments/like/${commentId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to like/unlike");
      }
    } catch (err) {
      console.error(err);
      refreshComments?.();
    }
  };

  // --- Contributions ---
  const handleLikeContribution = async (contribId) => {
    if (!userId) return alert("You must be logged in");

    const updated = localContributions.map((c) => {
      if (c._id === contribId) {
        const hasLiked = c.likes.some((id) => id.toString() === userId);
        return {
          ...c,
          likes: hasLiked
            ? c.likes.filter((id) => id !== userId)
            : [...c.likes, userId],
        };
      }
      return c;
    });
    setLocalContributions(updated);

    try {
      const res = await fetch(
        `${BACKEND_URL}/contributions/${contribId}/like`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to like/unlike");
      }
    } catch (err) {
      console.error(err);
      refreshContributions?.();
    }
  };

  const handleAddContributionComment = async (contribId, text) => {
    if (!text.trim()) return;
    if (!token) return alert("You must be logged in");

    try {
      const res = await fetch(
        `${BACKEND_URL}/contributions/${contribId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add comment");

      fetchContributionComments(contribId);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleLikeContributionComment = async (contribId, commentId) => {
    if (!userId) return alert("You must be logged in");

    // Optimistic UI update
    const updatedComments = (contribComments[contribId] || []).map((c) => {
      if (c._id === commentId) {
        const hasLiked = c.likes.some((id) => id.toString() === userId);
        return {
          ...c,
          likes: hasLiked
            ? c.likes.filter((id) => id !== userId)
            : [...c.likes, userId],
        };
      }
      return c;
    });
    setContribComments((prev) => ({ ...prev, [contribId]: updatedComments }));

    try {
      const res = await fetch(
        `${BACKEND_URL}/contributions/${contribId}/comments/like/${commentId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to like/unlike");
      }
    } catch (err) {
      console.error(err);
      fetchContributionComments(contribId); // rollback
    }
  };

const handleDeleteReply = async (commentId, replyId) => {
  try {
    const res = await fetch(
      `${BACKEND_URL}/comments/reply/${commentId}/${replyId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // include if protected route
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Error deleting reply:", data.message);
      return;
    }

    // 🧠 Update UI after deletion
    setLocalComments((prev) =>
      prev.map((comment) =>
        comment._id === commentId
          ? {
              ...comment,
              replies: comment.replies.filter((reply) => reply._id !== replyId),
            }
          : comment
      )
    );
  } catch (err) {
    console.error("❌ Error deleting reply:", err);
  }
};




  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#fbebff] w-11/12 md:w-4/5 lg:w-3/4  p-8 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-3xl font-bold text-[#310a49]">
            {activeTab === "comments" ? "Comments" : "Contributions"}
          </h3>
          <button onClick={onClose}>
            <X className="w-10 h-10 text-[#fbebff] bg-[#37377B] rounded-full p-1 cursor-pointer hover:bg-blue-700 transition" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto">
          {activeTab === "comments" ? (
            <>
              {/* Comments */}
              <div className="space-y-4 mb-4">
  {localComments.map((c) => {
    const hasLiked = c.likes.includes(userId);
    const isOwnComment = c.user?._id === userId;

    return (
      <div
        key={c._id}
        className="bg-white border rounded-2xl p-4 shadow-md"
      >
        {/* 🧍 User Info */}
        <div className="flex items-center justify-between mb-2">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() =>
              navigate(`/profile/${c.user?.username || c.user?.name}`)
            }
          >
            {c.user?.profilePic && (
              <img
                src={c.user.profilePic}
                alt={c.user.username || c.user.name}
                className="w-8 h-8 rounded-full shadow-sm"
              />
            )}
            <p className="font-semibold hover:text-[#9156F1] transition">
              {c.user?.name || "Unknown"}
            </p>
          </div>
        </div>

        {/* 💬 Comment Text */}
        <p className="text-gray-700 mb-2">{c.text}</p>

        {/* ❤️ Like / Reply / Delete Buttons */}
        <div className="flex items-center gap-3 text-sm">
          {/* Like Button */}
          <button
            className={`flex items-center gap-1 px-2 py-1 rounded-full ${
              hasLiked
                ? "bg-[#9156F1]/90 text-white"
                : "bg-gray-100 text-gray-500"
            }`}
            onClick={() => handleLikeComment(c._id)}
          >
            <ThumbsUp className="w-4 h-4" />
            {c.likes.length}
          </button>

          {/* Reply Button */}
          <button
            className="text-gray-500 hover:text-blue-600 font-medium"
            onClick={() => toggleReplyInput(c._id)}
          >
            Reply
          </button>

          {/* 🗑 Delete Button for own comment */}
          {isOwnComment && (
            <button
              onClick={() => handleDeleteComment(c._id)}
              className="text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
              title="Delete comment"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>

        {/* 💬 Replies */}
        {c.replies && c.replies.length > 0 && (
          <div className="ml-6 mt-3 space-y-2">
            {c.replies.map((r) => {
              const isOwnReply = r.user?._id === userId;
              return (
                <div
                  key={r._id}
                  className="bg-[#fbebff]/60 p-3 rounded-lg text-sm shadow-md relative"
                >
                  {/* 🧍‍♂️ Reply Header */}
                  <div className="flex justify-between items-start">
                    <p
                      className="font-semibold hover:text-[#9156F1] cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/profile/${r.user?.username || r.user?.name}`
                        )
                      }
                    >
                      {r.user?.name || "Unknown"}
                    </p>

                    {/* 🗑 Delete icon for own replies (top-right) */}
                    {isOwnReply && (
                      <button
                        onClick={() => handleDeleteReply(c._id, r._id)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Delete reply"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="mt-1">{r.text}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* 📝 Reply Input */}
{replyingTo === c._id && (
  <div className="ml-6 mt-2 flex items-center gap-2 flex-wrap sm:flex-nowrap w-full max-w-[95%]">
    <input
      type="text"
      placeholder="Write a reply..."
      value={replyText}
      onChange={(e) => setReplyText(e.target.value)}
      className="flex-grow border rounded-lg p-2 text-sm w-[70%] min-w-[200px] focus:outline-none focus:ring-2 focus:ring-[#9156F1] transition"
    />
    <button
      onClick={() => handleReplySubmit(c._id)}
      className="bg-[#9156F1] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#7a3be0] transition whitespace-nowrap"
    >
      Send
    </button>
  </div>
)}


      </div>
    );
  })}
</div>

              {districtPage ? (
                <></>
              ) : (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-grow border border-[#9156F1] rounded-lg p-2"
                  />
                  <button
                    onClick={handleAddComment}
                    className="bg-[#9156F1] flex items-center justify-center w-[25%] md:w-[5%] text-white items-center text-center font-semibold px-4 rounded-lg"
                  >
                    <SendIconAdd className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Contributions */}
              <div className="space-y-4">
                {localContributions.map((c) => {
                  const isOwnComment = c.user?._id === userId;
                  const hasLiked = c.likes.includes(userId);
                  const images = [c.coverImage, ...c.images];
                  const commentsList = contribComments[c._id] || [];
                  return (
                    <div
                      key={c._id}
                      className="bg-white border rounded-2xl p-4 shadow-lg"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {c.user.profilePic && (
                          <img
                            src={c.user.profilePic}
                            alt={c.user.username}
                            className="w-8 h-8 rounded-full shadow-sm"
                          />
                        )}
                        <p
                          className="font-semibold cursor-pointer hover:text-[#9156F1]"
                          onClick={() =>
                            navigate(
                              `/profile/${c.user?.username || c.user?.name}`
                            )
                          }
                        >
                          {c.user.name}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-gray-700 mb-2">{c.description}</p>

                      {/* Horizontal images */}
                      <div className="flex gap-2 overflow-x-auto mb-2">
                        {images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`contribution-${idx}`}
                            className="h-32 w-auto rounded-xl flex-shrink-0 shadow-md"
                          />
                        ))}
                      </div>

                      {/* Ratings */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {Object.entries(c.ratings).map(([key, value]) => (
                          <span
                            key={key}
                            className="px-2 py-1 bg-yellow-100 text-yellow-800 font-semibold rounded-full text-sm"
                          >
                            {key}: {value}/5
                          </span>
                        ))}
                      </div>

                      {/* Facilities */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {c.facilities.map((f, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-800 font-semibold rounded-full text-sm"
                          >
                            {f}
                          </span>
                        ))}
                      </div>

                      {/* Other info */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {c.bestTimeToVisit && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 font-semibold rounded-full text-sm">
                            Best Time: {c.bestTimeToVisit}
                          </span>
                        )}
                        {c.accessibility && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 font-semibold rounded-full text-sm">
                            Accessibility: {c.accessibility}
                          </span>
                        )}
                        {c.familyFriendly && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 font-semibold rounded-full text-sm">
                            Family Friendly
                          </span>
                        )}
                        {c.petFriendly && (
                          <span className="px-2 py-1 bg-pink-100 text-pink-800 font-semibold rounded-full text-sm">
                            Pet Friendly
                          </span>
                        )}
                        {c.activities.length > 0 && (
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 font-semibold rounded-full text-sm">
                            Activities: {c.activities.join(", ")}
                          </span>
                        )}
                      </div>

                      {/* Like + comments bubble */}
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                            hasLiked
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                          onClick={() => handleLikeContribution(c._id)}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          {c.likes.length}
                        </button>
                        <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full font-semibold text-sm">
                          {commentsList.length} comments
                        </span>
                      </div>

                      {/* Scrollable comments */}
                      <div className="max-h-40 overflow-y-auto ml-4 space-y-2">
                        {commentsList.map((com) => {
                          const liked = com.likes.includes(userId);
                          return (
                            <div
                              key={com._id}
                              className="bg-white p-2 rounded-xl shadow-sm flex justify-between items-start"
                            >
                              <div>
                                <p
                                  className="font-semibold text-sm cursor-pointer hover:text-[#9156F1]"
                                  onClick={() =>
                                    navigate(
                                      `/profile/${
                                        c.user?.username || c.user?.name
                                      }`
                                    )
                                  }
                                >
                                  {com.user?.name || "Unknown"}
                                </p>
                                <p className="text-gray-600 text-sm">
                                  {com.text}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  className={`flex items-center gap-1 text-sm ${
                                    com.likes.includes(userId)
                                      ? "text-blue-600 font-semibold"
                                      : "text-gray-500"
                                  }`}
                                  onClick={() =>
                                    handleLikeContributionComment(
                                      c._id,
                                      com._id
                                    )
                                  }
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                  {com.likes.length}
                                </button>

                                {/* 🗑️ Show delete icon if comment belongs to logged in user */}
                                {com.user?._id === userId && (
                                  <button
                                    className="text-red-500 hover:text-red-700 text-sm"
                                    onClick={() =>
                                      handleDeleteContributionComment(
                                        c._id,
                                        com._id
                                      )
                                    }
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {/* Add comment input for contribution */}
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            className="flex-grow border rounded-lg p-2"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddContributionComment(
                                  c._id,
                                  e.target.value
                                );
                                e.target.value = "";
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityModal;
