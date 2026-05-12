"use client";

import { useState } from "react";
import { Target, Pencil, Save, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditableBusinessVerificationProps {
  profile: any;
}

export default function EditableBusinessVerification({ profile }: EditableBusinessVerificationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    gstin: profile?.gstin || "",
    udyamReg: profile?.udyamReg || "",
    pan: profile?.pan || "",
    entityType: profile?.entityType || "Proprietorship",
  });
  const router = useRouter();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          ...formData,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");
      
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 group relative">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-brand-600 flex items-center gap-2">
            <Target className="text-brand-600" size={24} />
            Business Verification & IDs
          </h2>
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
            title="Edit Section"
          >
            <Pencil size={20} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">GSTIN</p>
            <p className="font-bold text-slate-900">{profile?.gstin || "Not provided"}</p>
          </div>
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Udyam Registration</p>
            <p className="font-bold text-slate-900">{profile?.udyamReg || "Not provided"}</p>
          </div>
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PAN Card</p>
            <p className="font-bold text-slate-900">{profile?.pan || "Not provided"}</p>
          </div>
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entity Type</p>
            <p className="font-bold text-slate-900">{profile?.entityType || "Proprietorship"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[32px] border-2 border-brand-600/20 shadow-xl shadow-brand-600/5 transition-all">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-brand-600 flex items-center gap-2">
          <Target className="text-brand-600" size={24} />
          Editing Business IDs
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditing(false)}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50"
          >
            <X size={20} />
          </button>
          <button 
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-brand-600 text-white font-black text-xs rounded-xl hover:bg-brand-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GSTIN</label>
          <input 
            type="text"
            value={formData.gstin}
            onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
            placeholder="Enter GSTIN"
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-600 outline-none transition-all font-bold text-slate-900"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Udyam Registration</label>
          <input 
            type="text"
            value={formData.udyamReg}
            onChange={(e) => setFormData({ ...formData, udyamReg: e.target.value })}
            placeholder="Enter Udyam Reg #"
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-600 outline-none transition-all font-bold text-slate-900"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PAN Card</label>
          <input 
            type="text"
            value={formData.pan}
            onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
            placeholder="Enter PAN #"
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-600 outline-none transition-all font-bold text-slate-900"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Type</label>
          <select 
            value={formData.entityType}
            onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-600 outline-none transition-all font-bold text-slate-900 appearance-none"
          >
            <option value="Proprietorship">Proprietorship</option>
            <option value="Partnership">Partnership</option>
            <option value="LLP">LLP</option>
            <option value="Private Limited">Private Limited</option>
            <option value="Public Limited">Public Limited</option>
            <option value="Trust/Society">Trust/Society</option>
          </select>
        </div>
      </div>
    </div>
  );
}
