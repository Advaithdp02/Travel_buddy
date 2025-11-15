import React, { useState, useEffect } from "react";
import { SendIconAdd } from "./Icons";
import { ThumbsUp, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const CommunityModal = ({
  isOpen,
  onClose,
  activeTab,
  comments,
  refreshComments,
  districtPage,
}) => {
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [dataChanged, setDataChanged] = useState(false);

  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Disable/enable scroll
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Sync comments
  useEffect(() => setLocalComments(comments), [comments]);

  const toggleReplyInput = (commentId) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
  };

  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim()) return;
    if (!token) return alert("You must be logged in");

    // Temporary reply
    const tempReply = {
      _id: `temp-${Date.now()}`,
      text: replyText.trim(),
      user: { _id: userId, name: "You" },
      likes: [],
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI
    setLocalComments((prev) =>
      prev.map((c) =>
        c._id === commentId
          ? { ...c, replies: [...(c.replies || []), tempReply] }
          : c
      )
    );

    const replyTextValue = replyText.trim();
    setReplyText("");
    setReplyingTo(null);

    try {
      const res = await fetch(`${BACKEND_URL}/comments/reply/${commentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: replyTextValue }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to post reply");

      setDataChanged(true);
    } catch (err) {
      console.error(err);

      // Rollback
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

      alert(err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!token) return alert("You must be logged in");

    if (!confirm("Are you sure you want to delete this comment?")) return;

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

  const handleDeleteReply = async (commentId, replyId) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/comments/reply/${commentId}/${replyId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (!res.ok) return console.error(data.message);

      // Remove reply from UI
      setLocalComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? {
                ...c,
                replies: c.replies.filter((r) => r._id !== replyId),
              }
            : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!token) return alert("You must be logged in");

    const locationId = localStorage.getItem("location_id");

    const tempComment = {
      _id: `temp-${Date.now()}`,
      text: newComment.trim(),
      user: { _id: userId, name: "You" },
      likes: [],
      createdAt: new Date().toISOString(),
    };

    setLocalComments((prev) => [tempComment, ...prev]);
    const newCommentVal = newComment.trim();
    setNewComment("");

    try {
      const res = await fetch(`${BACKEND_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ location: locationId, text: newCommentVal }),
      });

      if (!res.ok) throw new Error("Failed to post comment");

      setDataChanged(true);
    } catch (err) {
      console.error(err);
      alert(err.message);

      setLocalComments((prev) =>
        prev.filter((c) => c._id !== tempComment._id)
      );
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!userId) return alert("You must be logged in");

    // Optimistic UI
    setLocalComments((prev) =>
      prev.map((c) =>
        c._id === commentId
          ? {
              ...c,
              likes: c.likes.includes(userId)
                ? c.likes.filter((id) => id !== userId)
                : [...c.likes, userId],
            }
          : c
      )
    );

    try {
      const res = await fetch(
        `${BACKEND_URL}/comments/like/${commentId}`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Failed to like");
    } catch (err) {
      console.error(err);
      refreshComments?.();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#fbebff] w-11/12 md:w-4/5 lg:w-3/4 max-h-[90vh] p-6 rounded-xl shadow-2xl overflow-y-auto relative">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-3xl font-bold text-[#310a49]">Comments</h3>
          <button onClick={onClose}>
            <X className="w-10 h-10 text-[#fbebff] bg-[#37377B] rounded-full p-1 hover:bg-blue-700" />
          </button>
        </div>

        {/* Comments */}
        <div className="p-4 overflow-y-auto">
          <div className="space-y-4 mb-4">
            {localComments.map((c) => {
              const hasLiked = c.likes.includes(userId);
              const isOwnComment = c.user?._id === userId;

              return (
                <div key={c._id} className="bg-white border rounded-2xl p-4 shadow-md">
                  
                  {/* User */}
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() =>
                      navigate(`/profile/${c.user?.username || c.user?.name}`)
                    }
                  >
                    {c.user?.profilePic && (
                      <img
                        src={c.user.profilePic}
                        className="w-8 h-8 rounded-full shadow-sm"
                      />
                    )}
                    <p className="font-semibold hover:text-[#9156F1]">
                      {c.user?.name}
                    </p>
                  </div>

                  {/* Text */}
                  <p className="text-gray-700 mt-2 mb-2">{c.text}</p>

                  {/* Buttons */}
                  <div className="flex items-center gap-3 text-sm">
                    <button
                      className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                        hasLiked ? "bg-[#9156F1]/90 text-white" : "bg-gray-100 text-gray-500"
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

                  {/* Replies */}
                  {c.replies?.length > 0 && (
                    <div className="ml-6 mt-3 space-y-2">
                      {c.replies.map((r) => {
                        const isOwnReply = r.user?._id === userId;

                        return (
                          <div key={r._id} className="bg-[#fbebff]/60 p-3 rounded-lg text-sm shadow-md">
                            <div className="flex justify-between">
                              <p
                                className="font-semibold cursor-pointer hover:text-[#9156F1]"
                                onClick={() =>
                                  navigate(`/profile/${r.user?.username || r.user?.name}`)
                                }
                              >
                                {r.user?.name}
                              </p>

                              {isOwnReply && (
                                <button
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteReply(c._id, r._id)}
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

                  {/* Reply Input */}
                  {replyingTo === c._id && (
                    <div className="ml-6 mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-grow border rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#9156F1]"
                      />
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
          </div>

          {/* Add comment input */}
          {!districtPage && (
            <div className="flex items-center gap-2 mt-3">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-grow border border-[#9156F1] rounded-lg p-2 focus:ring-2 focus:ring-[#9156F1]"
              />
              <button
                onClick={handleAddComment}
                className="bg-[#9156F1] text-white px-4 py-2 rounded-lg hover:bg-[#7a3be0]"
              >
                <SendIconAdd className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityModal;
