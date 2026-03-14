import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShieldCheck, AlertCircle, Building2, CheckCircle2, XCircle } from 'lucide-react';
import axios from 'axios';

export const VerificationPage = () => {
  const [formData, setFormData] = React.useState({ type: 'Aadhaar Card', number: '', name: '' });
  const [result, setResult] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await axios.post('/api/verify', formData);
      setResult(res.data);
    } catch (err) {
      setError('Verification service unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
            <Building2 className="h-8 w-8 text-blue-800" />
          </div>
          <h1 className="text-3xl font-bold text-blue-900">Third-Party Verification</h1>
          <p className="text-gray-500 mt-2">Securely verify identity documents without full data exposure</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Verification Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
          >
            <h2 className="text-xl font-bold text-blue-900 mb-6 flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Verification Request
            </h2>
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Document Type</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Aadhaar Card</option>
                  <option>PAN Card</option>
                  <option>College ID</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Document Number</label>
                <input 
                  type="text"
                  required
                  value={formData.number}
                  onChange={e => setFormData({ ...formData, number: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name (Optional)</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="As per document"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Run Verification'}
              </button>
            </form>
          </motion.div>

          {/* Result Display */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-8 rounded-3xl shadow-xl border-2 ${
                    result.status === 'VERIFIED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-gray-900">Verification Result</h3>
                    {result.status === 'VERIFIED' ? (
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    ) : (
                      <XCircle className="h-10 w-10 text-red-600" />
                    )}
                  </div>

                  {result.status === 'VERIFIED' ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-green-100">
                        <span className="text-gray-500 font-medium">Status</span>
                        <span className="text-green-700 font-bold px-3 py-1 bg-green-100 rounded-full">VERIFIED</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Name</span>
                          <span className="text-gray-900 font-bold">{result.data.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Document Type</span>
                          <span className="text-gray-900 font-bold">{result.data.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Document Number</span>
                          <span className="text-gray-900 font-mono font-bold">{result.data.number}</span>
                        </div>
                        <div className="flex justify-between pt-4 border-t border-green-100">
                          <span className="text-gray-500">Verified On</span>
                          <span className="text-gray-900 text-sm">{new Date(result.data.verifiedAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start space-x-3">
                        <ShieldCheck className="h-5 w-5 text-blue-800 mt-0.5" />
                        <p className="text-xs text-blue-800 leading-relaxed">
                          Privacy Filter Applied: Sensitive fields like address and full document image have been masked.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                      <p className="text-red-800 font-bold text-lg mb-2">NOT MATCHED</p>
                      <p className="text-red-600 text-sm">No document found matching the provided details in our secure vault.</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-200 text-center"
                >
                  <ShieldCheck className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">Enter document details to run verification</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
