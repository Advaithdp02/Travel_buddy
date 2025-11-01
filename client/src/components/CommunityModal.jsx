import React, { useState, useEffect } from "react";
import { ClimateIcon } from "./Icons";
import { ThumbsUp } from "lucide-react";
import { X } from "lucide-react";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const CommunityModal = ({
  isOpen,
  onClose,
  activeTab,
  comments,
  contributions,
  refreshComments,
  refreshContributions,
  districtPage
}) => {
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState([]);
  const [localContributions, setLocalContributions] = useState([]);
  const [contribComments, setContribComments] = useState({}); // { contribId: [comments] }
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
const [replyText, setReplyText] = useState("");



  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Sync props to local state
  useEffect(() => setLocalComments(comments), [comments]);
  useEffect(() => setLocalContributions(contributions), [contributions]);
  const toggleReplyInput = (commentId) => {
  setReplyingTo(replyingTo === commentId ? null : commentId);
};

const handleReplySubmit = async (commentId) => {
  if (!replyText.trim()) return;
  if (!token) return alert("You must be logged in");

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

    setReplyText("");
    setReplyingTo(null);
    refreshComments?.(); // refresh comment list
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

  // Fetch all comments for a contribution
  const fetchContributionComments = async (contribId) => {
    if (!contribId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/contributions/${contribId}/comments`);
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

    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ location: locationId, text: newComment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to post comment");
      setNewComment("");
      refreshComments?.();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
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
      const res = await fetch(`${BACKEND_URL}/contributions/${contribId}/like`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const res = await fetch(`${BACKEND_URL}/contributions/${contribId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
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
     const res=await fetch(`${BACKEND_URL}/contributions/${contribId}/comments/like/${commentId}`, {
  method: "PUT",
  headers: { Authorization: `Bearer ${token}` },
});
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to like/unlike");
      }
    } catch (err) {
      console.error(err);
      fetchContributionComments(contribId); // rollback
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-11/12 md:w-4/5 lg:w-3/4 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold">
            {activeTab === "comments" ? "Comments" : "Contributions"}
          </h3>
          <button onClick={onClose}>
            <X className="w-10 h-10 text-yellow-400 bg-[#37377B] rounded-full p-1 cursor-pointer hover:bg-blue-700 transition" /> 
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {activeTab === "comments" ? (
            <>
              {/* Comments */}
              <div className="space-y-4 mb-4">
                {localComments.map((c) => {
                  const hasLiked = c.likes.includes(userId);
                  return (
                    <div
                      key={c._id}
                      className="bg-white border rounded-2xl p-4 shadow-md"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {c.user?.profilePic && (
                          <img
                            src={c.user.profilePic}
                            alt={c.user.username || c.user.name}
                            className="w-8 h-8 rounded-full shadow-sm"
                          />
                        )}
                        <p className="font-semibold">{c.user?.name || "Unknown"}</p>
                      </div>
                      <p className="text-gray-700 mb-2">{c.text}</p>
                      <div className="flex items-center gap-3 text-sm">
  {/* Like Button */}
  <button
    className={`flex items-center gap-1 px-2 py-1 rounded-full ${
      hasLiked ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
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
</div>
{c.replies && c.replies.length > 0 && (
  <div className="ml-6 mt-2 space-y-1">
    {c.replies.map((r) => (
      <div key={r._id} className="bg-gray-50 p-2 rounded-lg text-sm">
        <p className="font-semibold">{r.user?.name || "Unknown"}</p>
        <p>{r.text}</p>
      </div>
    ))}
  </div>
)}


{/* Reply Input (shown conditionally) */}
{replyingTo === c._id && (
  <div className="ml-6 mt-2 flex gap-2">
    <input
      type="text"
      placeholder="Write a reply..."
      value={replyText}
      onChange={(e) => setReplyText(e.target.value)}
      className="flex-grow border rounded-lg p-2 text-sm"
    />
    <button
      onClick={() => handleReplySubmit(c._id)}
      className="bg-brand-yellow text-brand-dark font-semibold px-3 rounded-lg"
    >
      Send
    </button>
  </div>
)}

                    </div>
                  );
                })}
              </div>

              
                {districtPage?<></>:<div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-grow border rounded-lg p-2"
                /><button
                  onClick={handleAddComment}
                  className="bg-brand-yellow text-brand-dark font-semibold px-4 rounded-lg"
                >
                  Add
                </button></div>}
                
              
            </>
          ) : (
            <>
              {/* Contributions */}
              <div className="space-y-4">
                {localContributions.map((c) => {
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
                        <p className="font-semibold">{c.user.name}</p>
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
                            hasLiked ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
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
                            <div key={com._id} className="bg-white p-2 rounded-xl shadow-sm flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-sm">{com.user?.name || "Unknown"}</p>
                                <p className="text-gray-600 text-sm">{com.text}</p>
                              </div>
                              <button
                                className={`flex items-center gap-1 text-sm ${
                                  liked ? "text-blue-600 font-semibold" : "text-gray-500"
                                }`}
                                onClick={() => handleLikeContributionComment(c._id, com._id)}
                              >
                                <ThumbsUp className="w-4 h-4" />
                                {com.likes.length}
                              </button>
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
                                handleAddContributionComment(c._id, e.target.value);
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
