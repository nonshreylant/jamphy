"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import ImageCropperModal from "./ImageCropperModal";

export default function EditProfileModal({ onClose }) {
  const { data: session, update } = useSession();
  const fileInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [croppingImage, setCroppingImage] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    image: "",
    dob: "",
    college: "",
    year: "",
    course: "",
    showStreakPublicly: true,
    showStatsPublicly: true,
    showHeatmapPublicly: true,
    showActivityPublicly: true,
    showSubjectsPublicly: true,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setFormData({
              name: data.user.name || "",
              username: data.user.username || "",
              image: data.user.image || "",
              dob: data.user.dob || "",
              college: data.user.college || "",
              year: data.user.year || "",
              course: data.user.course || "",
              showStreakPublicly: data.user.showStreakPublicly !== false,
              showStatsPublicly: data.user.showStatsPublicly !== false,
              showHeatmapPublicly: data.user.showHeatmapPublicly !== false,
              showActivityPublicly: data.user.showActivityPublicly !== false,
              showSubjectsPublicly: data.user.showSubjectsPublicly !== false,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCroppingImage(event.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input to allow re-uploading the same file
  };

  const handleCropComplete = (croppedBase64) => {
    setFormData((prev) => ({ ...prev, image: croppedBase64 }));
    setCroppingImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        await update();
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setTimeout(() => onClose(), 1000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update profile." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xl">
        <div className="bg-black/20 border border-white/5 w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col backdrop-blur-xl">
          <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-xl font-light tracking-widest uppercase text-white">Edit Profile</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border border-white/10 border-t-white rounded-full animate-spin"></div>
            </div>
          ) : (
            <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">
              {message.text && (
                <div className={`p-4 rounded-xl border ${message.type === "success" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                  {message.text}
                </div>
              )}

              {/* Profile Picture */}
              <div className="pb-8 border-b border-zinc-800/50">
                <label className="block text-xs font-light tracking-widest uppercase text-zinc-500 mb-4">Profile Picture</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {formData.image ? (
                    <Image src={formData.image} alt="Profile" width={80} height={80} className="rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-2xl font-light text-white">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap gap-4 items-center mt-2">
                      {[1, 2, 3, 4].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, image: `/avatars/avatar${num}.png` }))}
                          className={`w-10 h-10 rounded-full overflow-hidden border transition ${formData.image === `/avatars/avatar${num}.png` ? 'border-white' : 'border-transparent hover:border-zinc-500'}`}
                        >
                          <Image src={`/avatars/avatar${num}.png`} alt={`Preset ${num}`} width={40} height={40} className="object-cover" />
                        </button>
                      ))}
                      
                      <div className="w-[1px] h-6 bg-zinc-800 mx-2 hidden sm:block"></div>
                      
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-light tracking-widest uppercase text-zinc-400 hover:text-white transition border-b border-transparent hover:border-white pb-1">
                        Upload Custom
                      </button>
                      
                      {formData.image && (
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, image: "" }))} className="text-xs font-light tracking-widest uppercase text-zinc-500 hover:text-white transition border-b border-transparent hover:border-white pb-1 ml-4">
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div>
                  <label className="block text-xs font-light tracking-widest uppercase text-zinc-500 mb-2">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-transparent border-b border-zinc-800 px-4 py-2 text-white outline-none focus:border-white transition-colors font-light" />
                </div>
                <div>
                  <label className="block text-xs font-light tracking-widest uppercase text-zinc-500 mb-2">Username</label>
                  <div className="flex border-b border-zinc-800 focus-within:border-white transition-colors">
                    <span className="flex items-center justify-center pl-4 pr-2 text-zinc-500 font-light">@</span>
                    <input type="text" name="username" value={formData.username} onChange={(e) => setFormData(p => ({ ...p, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '') }))} required className="w-full bg-transparent px-3 py-2 text-white outline-none font-light" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-light tracking-widest uppercase text-zinc-500 mb-2">Date of Birth</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-transparent border-b border-zinc-800 px-4 py-2 text-white outline-none focus:border-white transition-colors font-light [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-xs font-light tracking-widest uppercase text-zinc-500 mb-2">College / University</label>
                  <input type="text" name="college" value={formData.college} onChange={handleChange} required className="w-full bg-transparent border-b border-zinc-800 px-4 py-2 text-white outline-none focus:border-white transition-colors font-light" />
                </div>
                <div>
                  <label className="block text-xs font-light tracking-widest uppercase text-zinc-500 mb-2">Current Year</label>
                  <select name="year" value={formData.year} onChange={handleChange} required className="w-full bg-transparent border-b border-zinc-800 px-4 py-2.5 text-white outline-none focus:border-white transition-colors font-light appearance-none">
                    <option value="" className="bg-black text-white">Select Year</option>
                    <option value="1st Year" className="bg-black text-white">1st Year</option>
                    <option value="2nd Year" className="bg-black text-white">2nd Year</option>
                    <option value="3rd Year" className="bg-black text-white">3rd Year</option>
                    <option value="4th Year" className="bg-black text-white">4th Year</option>
                    <option value="Graduated" className="bg-black text-white">Graduated</option>
                    <option value="Other" className="bg-black text-white">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-light tracking-widest uppercase text-zinc-500 mb-2">Course Pursuing</label>
                  <input type="text" name="course" value={formData.course} onChange={handleChange} className="w-full bg-transparent border-b border-zinc-800 px-4 py-2 text-white outline-none focus:border-white transition-colors font-light" />
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="pt-8 border-t border-zinc-800/50 space-y-6">
                <div>
                  <h3 className="text-sm font-light tracking-widest uppercase text-zinc-400 mb-1">Privacy</h3>
                  <p className="text-xs text-zinc-500 font-light">Toggle what is visible on your public profile.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      name="showStreakPublicly" 
                      checked={formData.showStreakPublicly} 
                      onChange={(e) => setFormData(p => ({ ...p, showStreakPublicly: e.target.checked }))}
                      className="w-4 h-4 rounded border-zinc-800 bg-transparent text-white focus:ring-0 focus:ring-offset-0 transition-colors" 
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-light text-zinc-400 group-hover:text-white transition">Show Streak</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      name="showStatsPublicly" 
                      checked={formData.showStatsPublicly} 
                      onChange={(e) => setFormData(p => ({ ...p, showStatsPublicly: e.target.checked }))}
                      className="w-4 h-4 rounded border-zinc-800 bg-transparent text-white focus:ring-0 focus:ring-offset-0 transition-colors" 
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-light text-zinc-400 group-hover:text-white transition">Show Stats</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      name="showHeatmapPublicly" 
                      checked={formData.showHeatmapPublicly} 
                      onChange={(e) => setFormData(p => ({ ...p, showHeatmapPublicly: e.target.checked }))}
                      className="w-4 h-4 rounded border-zinc-800 bg-transparent text-white focus:ring-0 focus:ring-offset-0 transition-colors" 
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-light text-zinc-400 group-hover:text-white transition">Show Calendar</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      name="showActivityPublicly" 
                      checked={formData.showActivityPublicly} 
                      onChange={(e) => setFormData(p => ({ ...p, showActivityPublicly: e.target.checked }))}
                      className="w-4 h-4 rounded border-zinc-800 bg-transparent text-white focus:ring-0 focus:ring-offset-0 transition-colors" 
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-light text-zinc-400 group-hover:text-white transition">Show Activity</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      name="showSubjectsPublicly" 
                      checked={formData.showSubjectsPublicly} 
                      onChange={(e) => setFormData(p => ({ ...p, showSubjectsPublicly: e.target.checked }))}
                      className="w-4 h-4 rounded border-zinc-800 bg-transparent text-white focus:ring-0 focus:ring-offset-0 transition-colors" 
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-light text-zinc-400 group-hover:text-white transition">Show Subjects</span>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="p-6 flex justify-end gap-6 mt-4 border-t border-white/5">
          <button onClick={onClose} type="button" className="text-sm font-light tracking-widest text-zinc-500 uppercase hover:text-white transition border-b border-transparent hover:border-white pb-1">
            Cancel
          </button>
          <button type="submit" form="edit-profile-form" disabled={isSaving || isLoading} className="text-sm font-light tracking-widest text-zinc-300 uppercase hover:text-white transition border-b border-transparent hover:border-white pb-1 disabled:opacity-50">
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
    
    {croppingImage && (
      <ImageCropperModal
        imageSrc={croppingImage}
        onCropComplete={handleCropComplete}
        onCancel={() => setCroppingImage(null)}
      />
    )}
  </>
  );
}
