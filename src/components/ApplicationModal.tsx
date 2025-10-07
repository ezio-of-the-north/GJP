import { useState, useEffect } from 'react';
import { supabase, Job, Document } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { X, Send, FileText, Award, File, Folder } from 'lucide-react';

type ApplicationModalProps = {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ApplicationModal({ job, onClose, onSuccess }: ApplicationModalProps) {
  const { profile } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

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
    }
  };

  const toggleDocument = (docId: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'resume':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'certificate':
        return <Award className="w-5 h-5 text-green-600" />;
      case 'cover_letter':
        return <File className="w-5 h-5 text-purple-600" />;
      default:
        return <Folder className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.from('applications').insert({
        job_id: job.id,
        applicant_id: profile?.id,
        cover_letter: coverLetter,
        document_ids: selectedDocuments,
      });

      if (error) throw error;
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Apply for Position</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-lg text-gray-900 mb-2">{job.title}</h3>
            <p className="text-green-600 font-semibold mb-2">{job.department}</p>
            <p className="text-gray-700 text-sm">{job.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cover Letter *
              </label>
              <textarea
                required
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
                placeholder="Tell us why you're the perfect candidate for this position..."
                minLength={50}
              />
              <p className="text-sm text-gray-500 mt-2">
                Minimum 50 characters ({coverLetter.length}/50)
              </p>
            </div>

            {documents.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Attach Documents (Optional)
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {documents.map((doc) => (
                    <label
                      key={doc.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(doc.id)}
                        onChange={() => toggleDocument(doc.id)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                      />
                      {getFileIcon(doc.file_type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {doc.file_type.charAt(0).toUpperCase() + doc.file_type.slice(1)}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedDocuments.length} document(s) selected
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || coverLetter.length < 50}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
