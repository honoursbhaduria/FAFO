import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  FileText, 
  Upload, 
  Search, 
  MoreVertical, 
  Download, 
  Trash2, 
  Eye,
  Filter
} from "lucide-react";

export default function DocumentVaultPage() {
  const documents = [
    { id: 1, name: "PAN_Card_Business.pdf", type: "Identity", date: "Oct 01, 2024", size: "1.2 MB" },
    { id: 2, name: "GST_Certificate_2024.pdf", type: "Tax", date: "Sep 25, 2024", size: "2.4 MB" },
    { id: 3, name: "Udyam_Registration.pdf", type: "Registration", date: "Aug 12, 2024", size: "0.8 MB" },
    { id: 4, name: "Partnership_Deed.pdf", type: "Legal", date: "Jan 05, 2024", size: "4.5 MB" },
    { id: 5, name: "Rent_Agreement.pdf", type: "Address Proof", date: "Jul 20, 2024", size: "3.1 MB" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Document Vault</h1>
            <p className="text-slate-500 mt-1">Securely store and manage your business compliance documents.</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
            <Upload size={20} />
            Upload Document
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search documents..." 
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-all">
              <Filter size={18} />
              Filter
            </button>
            <select className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 outline-none transition-all">
              <option>All Types</option>
              <option>Identity</option>
              <option>Tax</option>
              <option>Registration</option>
            </select>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Document Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Uploaded On</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                          <FileText size={20} />
                        </div>
                        <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {doc.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {doc.size}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Download size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {documents.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={40} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No documents found</h3>
              <p className="text-slate-500">Upload your first document to get started.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
