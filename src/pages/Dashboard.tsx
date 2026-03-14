import React from 'react';
import { motion } from 'motion/react';
import { Plus, FileText, Trash2, ShieldCheck, Clock, Download, Search } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const Dashboard = () => {
  const { user, token } = useAuthStore();
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showUpload, setShowUpload] = React.useState(false);
  const [uploadData, setUploadData] = React.useState({ type: 'Aadhaar Card', number: '', file: null as File | null });

  const fetchDocs = async () => {
    try {
      const res = await axios.get('/api/documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.file) return;

    const formData = new FormData();
    formData.append('type', uploadData.type);
    formData.append('number', uploadData.number);
    formData.append('file', uploadData.file);

    try {
      await axios.post('/api/documents/upload', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setShowUpload(false);
      setUploadData({ type: 'Aadhaar Card', number: '', file: null });
      fetchDocs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await axios.delete(`/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDocs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Welcome, {user?.name}</h1>
          <p className="text-gray-500">Manage your secure digital documents</p>
        </div>
        <button 
          onClick={() => setShowUpload(true)}
          className="bg-blue-800 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus className="h-5 w-5" />
          <span>Upload New</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <FileText className="text-blue-800 h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-blue-900">{documents.length}</span>
          </div>
          <p className="text-gray-500 font-medium">Total Documents</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-green-600 h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-green-600">
              {documents.filter(d => d.status === 'Verified').length}
            </span>
          </div>
          <p className="text-gray-500 font-medium">Verified Docs</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="text-amber-600 h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-amber-600">
              {documents.filter(d => d.status === 'Pending').length}
            </span>
          </div>
          <p className="text-gray-500 font-medium">Pending Review</p>
        </div>
      </div>

      {/* Document List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl"></div>)
        ) : documents.length > 0 ? (
          documents.map((doc) => (
            <motion.div 
              key={doc.id}
              layoutId={doc.id.toString()}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                  <FileText className="text-blue-800 h-6 w-6" />
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  doc.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {doc.status}
                </div>
              </div>
              <h3 className="text-lg font-bold text-blue-900 mb-1">{doc.type}</h3>
              <p className="text-sm text-gray-500 mb-4">ID: {doc.number.replace(/.(?=.{4})/g, "*")}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-800 transition-colors">
                    <Download className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No documents uploaded yet</p>
            <button 
              onClick={() => setShowUpload(true)}
              className="mt-4 text-blue-800 font-bold hover:underline"
            >
              Upload your first document
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-900">Upload Document</h2>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Document Type</label>
                <select 
                  value={uploadData.type}
                  onChange={e => setUploadData({ ...uploadData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Aadhaar Card</option>
                  <option>PAN Card</option>
                  <option>College ID</option>
                  <option>Driving License</option>
                  <option>Marksheet</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Document Number</label>
                <input 
                  type="text"
                  required
                  value={uploadData.number}
                  onChange={e => setUploadData({ ...uploadData, number: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter number (e.g. Aadhaar/PAN)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select File</label>
                <input 
                  type="file"
                  required
                  onChange={e => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transition-all mt-4"
              >
                Upload & Secure
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
