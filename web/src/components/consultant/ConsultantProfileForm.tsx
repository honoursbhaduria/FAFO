"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

interface ConsultantProfileFormState {
  title: string;
  specialization: string;
  experience: string;
  qualification: string;
  licenseNumber: string;
  bio: string;
  location: string;
  phone: string;
  website: string;
  hourlyRate: string;
  resumeUrl: string;
}

const emptyState: ConsultantProfileFormState = {
  title: "Chartered Accountant",
  specialization: "",
  experience: "0",
  qualification: "",
  licenseNumber: "",
  bio: "",
  location: "",
  phone: "",
  website: "",
  hourlyRate: "₹999/session",
  resumeUrl: "",
};

export default function ConsultantProfileForm() {
  const [form, setForm] = useState<ConsultantProfileFormState>(emptyState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/consultant/profile")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!data) return;
        setForm({
          title: data.title || emptyState.title,
          specialization: Array.isArray(data.specialization) ? data.specialization.join(", ") : "",
          experience: String(data.experience ?? "0"),
          qualification: data.qualification || "",
          licenseNumber: data.licenseNumber || "",
          bio: data.bio || "",
          location: data.location || "",
          phone: data.phone || "",
          website: data.website || "",
          hourlyRate: data.hourlyRate || emptyState.hourlyRate,
          resumeUrl: data.resumeUrl || "",
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const updateField = (key: keyof ConsultantProfileFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const payload = {
      ...form,
      specialization: form.specialization
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      experience: parseInt(form.experience, 10) || 0,
    };

    const res = await fetch("/api/consultant/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setIsSaving(false);
    if (!res.ok) {
      const err = await res.json();
      setMessage(err.error || "Failed to save profile");
      return;
    }

    setMessage("Profile updated successfully.");
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-slate-500 font-bold">
        <Loader2 size={18} className="animate-spin" />
        Loading profile...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {message && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-600">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</label>
          <input
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-brand-600 outline-none font-medium"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience (Years)</label>
          <input
            value={form.experience}
            onChange={(e) => updateField("experience", e.target.value)}
            className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-brand-600 outline-none font-medium"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">License Number</label>
          <input
            value={form.licenseNumber}
            onChange={(e) => updateField("licenseNumber", e.target.value)}
            required
            className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-brand-600 outline-none font-medium"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qualification</label>
          <input
            value={form.qualification}
            onChange={(e) => updateField("qualification", e.target.value)}
            required
            className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-brand-600 outline-none font-medium"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specializations (comma separated)</label>
          <input
            value={form.specialization}
            onChange={(e) => updateField("specialization", e.target.value)}
            className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-brand-600 outline-none font-medium"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hourly Rate</label>
          <input
            value={form.hourlyRate}
            onChange={(e) => updateField("hourlyRate", e.target.value)}
            className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-brand-600 outline-none font-medium"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
          <input
            value={form.location}
            onChange={(e) => updateField("location", e.target.value)}
            className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-brand-600 outline-none font-medium"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-brand-600 outline-none font-medium"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Website</label>
          <input
            value={form.website}
            onChange={(e) => updateField("website", e.target.value)}
            className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-brand-600 outline-none font-medium"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resume URL (optional)</label>
          <input
            value={form.resumeUrl}
            onChange={(e) => updateField("resumeUrl", e.target.value)}
            className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-brand-600 outline-none font-medium"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Professional Bio</label>
        <textarea
          value={form.bio}
          onChange={(e) => updateField("bio", e.target.value)}
          rows={5}
          className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-brand-600 outline-none font-medium"
        />
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl font-black hover:bg-brand-600 transition-all disabled:opacity-60"
      >
        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        Save Profile
      </button>
    </form>
  );
}
