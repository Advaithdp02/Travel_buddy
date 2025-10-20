import React, { useState } from "react";
import { ClimateIcon, UserIcon } from "./Icons"; // replace with your icon imports

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const CommunityModal = ({ isOpen, onClose, activeTab, comments, contributions }) => {
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const locationId = localStorage.getItem("location_id");
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to add a comment.");
      return;
    }

    
    try {
      setLoading(true);

      const res = await fetch(`${BACKEND_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          location: locationId,
          text: newComment.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to post comment");
      }

      const data = await res.json();
      console.log("✅ Comment added:", data);
      alert("Comment added!");
      

    } catch (err) {
      console.error("❌ Error adding comment:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
    setNewComment("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-11/12 md:w-2/3 lg:w-1/2 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold">{activeTab === "comments" ? "Comments" : "Contributions"}</h3>
          <button onClick={onClose}><ClimateIcon className="w-5 h-5 text-gray-600" /></button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {activeTab === "comments" ? (
            <>
              <div className="space-y-4 mb-4">
                {comments.map((c, idx) => (
                  <div key={idx} className="border p-3 rounded-lg shadow-sm bg-gray-50">
                    <p className="font-semibold">{c.user}</p>
                    <p className="text-gray-600">{c.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-grow border rounded-lg p-2"
                />
                <button
                  onClick={handleAddComment}
                  className="bg-brand-yellow text-brand-dark font-semibold px-4 rounded-lg"
                >
                  Add
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                {contributions.map((c, idx) => (
                  <div key={idx} className="border p-4 rounded-lg shadow-sm flex justify-between items-start bg-gray-50">
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-6 h-6 text-gray-600" />
                      <div>
                        <p className="font-semibold">{c.user}</p>
                        <p className="text-gray-600 text-sm">{c.title}: {c.detail}</p>
                      </div>
                    </div>
                    <button className="bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-lg">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityModal;