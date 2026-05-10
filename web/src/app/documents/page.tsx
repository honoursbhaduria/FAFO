"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  FileText, 
  Upload, 
  Search, 
  Download, 
  Trash2, 
  Eye,
  Filter,
  Loader2,
  X,
  FileUp,
  CheckCircle2
} from "lucide-react";

import { DocViewerRenderers } from "@cyntler/react-doc-viewer";

// Dynamically import DocViewer component to avoid SSR issues
const DocViewer = dynamic(() => import("@cyntler/react-doc-viewer"), { ssr: false });

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  createdAt: string;
  extractedData: any;
}

export default function DocumentVaultPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState("Identity");

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("type", uploadType);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setIsModalOpen(false);
        setUploadFile(null);
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    
    try {
      const res = await fetch(`/api/documents?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDocuments(documents.filter(d => d.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All Types" || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-brand-600">Document Vault</h1>
            <p className="text-slate-500 mt-1">Securely store and manage your business compliance documents.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white font-black rounded-2xl shadow-xl shadow-brand-100 hover:bg-brand-600 transition-all active:scale-95"
          >
            <Upload size={20} />
            Upload Document
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-600 outline-none transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm appearance-none outline-none focus:ring-2 focus:ring-brand-600"
              >
                <option>All Types</option>
                <option>Identity</option>
                <option>Tax</option>
                <option>Registration</option>
                <option>Legal</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Name</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Uploaded On</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Size</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-6 h-16 bg-slate-50/50"></td>
                    </tr>
                  ))
                ) : filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center shrink-0">
                          <FileText size={24} />
                        </div>
                        <span className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate max-w-[200px]">
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-full">
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-400">
                      {doc.extractedData?.size || "N/A"}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setPreviewDoc(doc)}
                          className="p-3 text-slate-300 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                        >
                          <Eye size={20} />
                        </button>
                        <button 
                          onClick={() => deleteDocument(doc.id)}
                          className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filteredDocs.length === 0 && (
            <div className="py-32 text-center">
              <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                <FileText size={48} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No documents found</h3>
              <p className="text-slate-500 max-w-xs mx-auto">
                {searchQuery || selectedType !== "All Types" 
                  ? "Try adjusting your filters to find what you're looking for." 
                  : "Upload your first business document to get started."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 md:p-10">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setPreviewDoc(null)} />
          <div className="relative bg-white w-full h-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-white/10">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-xl font-black text-brand-600 truncate max-w-[300px]">{previewDoc.name}</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{previewDoc.type}</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-3 bg-slate-50 text-slate-600 hover:bg-brand-50 hover:text-brand-600 rounded-2xl transition-all">
                  <Download size={20} />
                </button>
                <button onClick={() => setPreviewDoc(null)} className="p-3 bg-slate-50 text-slate-400 hover:text-brand-600 rounded-2xl transition-all">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-50 overflow-auto">
              <DocViewer 
                documents={[{ 
                  uri: typeof window !== 'undefined' ? `${window.location.origin}${previewDoc.url}` : previewDoc.url, 
                  fileName: previewDoc.name 
                }]} 
                pluginRenderers={DocViewerRenderers} 
                style={{ height: '100%' }}
                config={{
                  header: {
                    disableHeader: true,
                    disableFileName: true,
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-brand-600">Upload Document</h2>
                <p className="text-sm text-slate-500 font-medium">Add a new document to your vault.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-brand-600 rounded-2xl transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-8 space-y-6">
              <div 
                className={`relative border-4 border-dashed rounded-[32px] p-12 text-center transition-all ${
                  uploadFile ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100 hover:border-brand-100 hover:bg-brand-50/30'
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) setUploadFile(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  onChange={(e) => e.target.files?.[0] && setUploadFile(e.target.files[0])}
                />
                <div className="flex flex-col items-center">
                  {uploadFile ? (
                    <>
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                        <CheckCircle2 size={32} />
                      </div>
                      <p className="font-bold text-slate-900 mb-1">{uploadFile.name}</p>
                      <p className="text-xs text-emerald-600 font-black uppercase">File Ready to Upload</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-4">
                        <FileUp size={32} />
                      </div>
                      <p className="font-bold text-slate-900 mb-1">Click or drag file to upload</p>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">PDF, PNG, JPG up to 10MB</p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Document Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Identity", "Tax", "Registration", "Legal", "Other"].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setUploadType(type)}
                      className={`px-4 py-3 rounded-2xl text-xs font-black transition-all border ${
                        uploadType === type 
                          ? "bg-brand-600 border-brand-600 text-white shadow-xl shadow-brand-100" 
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!uploadFile || uploading}
                className="w-full py-5 bg-brand-600 text-white rounded-[24px] font-black text-lg hover:bg-brand-600 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-brand-100"
              >
                {uploading ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={24} />
                    Finalize Upload
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
