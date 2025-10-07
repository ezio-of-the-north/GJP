import { useState, useEffect } from 'react';
import { supabase, Document } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Upload, Trash2, File, Award, FileType, Folder } from 'lucide-react';

export default function DocumentsView() {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    file_url: '',
    file_type: 'resume' as 'resume' | 'certificate' | 'cover_letter' | 'other',
    file_size: 0,
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const { error } = await supabase.from('documents').insert({
        user_id: profile?.id,
        name: formData.name,
        file_url: formData.file_url,
        file_type: formData.file_type,
        file_size: formData.file_size,
      });

      if (error) throw error;

      setFormData({
        name: '',
        file_url: '',
        file_type: 'resume',
        file_size: 0,
      });
      setShowUploadForm(false);
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to add document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'resume':
        return <FileText className="w-8 h-8 text-green-600" />;
      case 'certificate':
        return <Award className="w-8 h-8 text-green-600" />;
      case 'cover_letter':
        return <File className="w-8 h-8 text-purple-600" />;
      default:
        return <Folder className="w-8 h-8 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      resume: 'bg-green-100 text-green-800',
      certificate: 'bg-green-100 text-green-800',
      cover_letter: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Documents</h2>
          <p className="text-gray-600 mt-1">{documents.length} documents stored</p>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          <Upload className="w-5 h-5" />
          Add Document
        </button>
      </div>

      {showUploadForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Document</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Document Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  placeholder="e.g., Resume 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Document Type *
                </label>
                <select
                  value={formData.file_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      file_type: e.target.value as 'resume' | 'certificate' | 'cover_letter' | 'other',
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                >
                  <option value="resume">Resume</option>
                  <option value="certificate">Certificate</option>
                  <option value="cover_letter">Cover Letter</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                File URL *
              </label>
              <input
                type="url"
                required
                value={formData.file_url}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="https://example.com/your-document.pdf"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter the URL where your document is hosted (Google Drive, Dropbox, etc.)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                File Size (KB)
              </label>
              <input
                type="number"
                value={formData.file_size}
                onChange={(e) =>
                  setFormData({ ...formData, file_size: parseInt(e.target.value) || 0 })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="Optional - e.g., 1024"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false);
                  setFormData({
                    name: '',
                    file_url: '',
                    file_type: 'resume',
                    file_size: 0,
                  });
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Adding...' : 'Add Document'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No documents uploaded yet</p>
          <button
            onClick={() => setShowUploadForm(true)}
            className="text-green-600 hover:text-green-700 font-semibold"
          >
            Add Your First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-green-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  {getFileIcon(doc.file_type)}
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                  title="Delete document"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <h3 className="font-bold text-gray-900 mb-3 truncate text-lg" title={doc.name}>
                {doc.name}
              </h3>

              <div className="space-y-3 mb-4">
                <span
                  className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${getTypeColor(
                    doc.file_type
                  )}`}
                >
                  {doc.file_type.charAt(0).toUpperCase() + doc.file_type.slice(1).replace('_', ' ')}
                </span>

                <div className="flex items-center justify-between text-sm">
                  {doc.file_size > 0 && (
                    <span className="text-gray-600 font-medium">{formatFileSize(doc.file_size)}</span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full text-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-sm hover:shadow-md"
              >
                View Document
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
