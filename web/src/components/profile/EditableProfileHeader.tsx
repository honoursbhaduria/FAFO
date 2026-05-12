"use client";

import { useState, useRef } from "react";
import { Mail, MapPin, Camera, Save, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface EditableProfileHeaderProps {
  user: {
    name: string | null;
    email: string;
    profileImage: string | null;
  };
  profile: any;
}

export default function EditableProfileHeader({ user, profile }: EditableProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [previewImage, setPreviewImage] = useState<string | null>(user.profileImage);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const response = await fetch("/api/profile/header", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to update profile");
      
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating profile header:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user.name || "");
    setPreviewImage(user.profileImage);
    setSelectedFile(null);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-[40px] border border-slate-100 relative group transition-all duration-500">
      {/* Profile Photo */}
      <div className="relative">
        <div className="w-32 h-32 bg-brand-50 rounded-3xl flex items-center justify-center text-brand-600 text-4xl font-black border-4 border-white overflow-hidden shadow-lg">
          {previewImage ? (
            <img 
              src={previewImage} 
              alt={name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{name ? name.substring(0, 2).toUpperCase() : "YB"}</span>
          )}
        </div>
        
        {isEditing && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 p-2.5 bg-brand-600 text-white rounded-xl shadow-xl hover:bg-brand-700 transition-all active:scale-95 border-2 border-white"
          >
            <Camera size={18} />
          </button>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />
      </div>

      <div className="flex-1 text-center md:text-left">
        {isEditing ? (
          <div className="space-y-4 max-w-md mx-auto md:mx-0">
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="text-3xl font-black text-brand-600 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 w-full focus:bg-white focus:ring-2 focus:ring-brand-600 outline-none transition-all"
              autoFocus
            />
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400 font-bold text-sm">
              <div className="flex items-center gap-1.5">
                <Mail size={16} className="text-brand-600" />
                {user.email}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-brand-600" />
                {profile?.state || "Location Not Set"}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-black text-brand-600 leading-tight">{name || "Your Name"}</h1>
              {profile?.isStartup && (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Startup India</span>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400 font-bold text-sm">
              <div className="flex items-center gap-1.5">
                <Mail size={16} className="text-brand-600" />
                {user.email}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-brand-600" />
                {profile?.state || "Location Not Set"}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3">
        {isEditing ? (
          <>
            <button 
              onClick={handleCancel}
              disabled={isLoading}
              className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
            >
              <X size={20} />
            </button>
            <button 
              onClick={handleSave}
              disabled={isLoading}
              className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              Save
            </button>
          </>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-8 py-4 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 transition-all active:scale-95 shadow-md shadow-brand-600/20"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
