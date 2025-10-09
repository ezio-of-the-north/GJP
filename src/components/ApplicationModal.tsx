import { useState, useEffect } from 'react';
import { supabase, Job, Document, REQUIRED_DOCUMENTS, DocumentType } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { X, Send, Upload, FileText, CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ApplicationModalProps = {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPE = 'application/pdf';

export default function ApplicationModal({ job, onClose, onSuccess }: ApplicationModalProps) {
  const { profile } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<DocumentType | null>(null);
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<Map<DocumentType, Document>>(new Map());

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

      const docMap = new Map<DocumentType, Document>();
      data?.forEach(doc => {
        if (!docMap.has(doc.file_type)) {
          docMap.set(doc.file_type, doc);
        }
      });
      setUploadedDocs(docMap);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.type !== ALLOWED_FILE_TYPE) {
      return 'Only PDF files are allowed';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must not exceed 10 MB';
    }
    const nameParts = file.name.split('.');
    if (nameParts.length < 2 || nameParts[nameParts.length - 1].toLowerCase() !== 'pdf') {
      return 'File must have .pdf extension';
    }
    return null;
  };

  const handleFileUpload = async (docType: DocumentType, file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setUploadingDoc(docType);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;

        const { data, error: uploadError } = await supabase
          .from('documents')
          .insert({
            user_id: profile?.id,
            name: file.name,
            file_url: base64Data,
            file_type: docType,
            file_size: file.size,
            mime_type: file.type,
            document_category: 'application'
          })
          .select()
          .single();

        if (uploadError) throw uploadError;

        setUploadedDocs(prev => new Map(prev).set(docType, data));
        await fetchDocuments();
        setError('');
      };

      reader.onerror = () => {
        throw new Error('Failed to read file');
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(null);
    }
  };

  const checkIfComplete = (): boolean => {
    const requiredDocs = REQUIRED_DOCUMENTS.filter(doc => doc.required);
    return requiredDocs.every(doc => uploadedDocs.has(doc.type)) && coverLetter.length >= 50;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!checkIfComplete()) {
      setError('Please upload all required documents and complete the cover letter before submitting');
      return;
    }

    setLoading(true);

    try {
      const documentIds = Array.from(uploadedDocs.values()).map(doc => doc.id);

      const { error: appError } = await supabase.from('applications').insert({
        job_id: job.id,
        applicant_id: profile?.id,
        cover_letter: coverLetter,
        document_ids: documentIds,
        is_complete: true,
        submitted_at: new Date().toISOString(),
        status: 'pending'
      });

      if (appError) throw appError;
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const isComplete = checkIfComplete();
  const requiredDocsCount = REQUIRED_DOCUMENTS.filter(doc => doc.required).length;
  const uploadedRequiredCount = REQUIRED_DOCUMENTS.filter(doc => doc.required && uploadedDocs.has(doc.type)).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex justify-between items-start rounded-t-2xl z-10">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">Submit Your Application</h2>
            <p className="text-green-100 text-sm">All fields marked with * are required</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
            <h3 className="font-bold text-lg text-gray-900 mb-2">{job.title}</h3>
            <p className="text-green-600 font-semibold mb-2">{job.department}</p>
            <p className="text-gray-700 text-sm">{job.description}</p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 mb-2">Upload Requirements:</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Accepted file type: <strong>PDF only</strong></li>
                  <li>• Maximum file size: <strong>10 MB per document</strong></li>
                  <li>• Filename format: <strong>Lastname_Firstname_DocumentName.pdf</strong></li>
                  <li>• All required documents must be uploaded before submission</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cover Letter / Application Letter *
              </label>
              <textarea
                required
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
                placeholder="Dear Hiring Manager,&#10;&#10;I am writing to express my interest in the position of [Position Title]. Please indicate the plantilla number and your preferred place of assignment.&#10;&#10;[Your qualifications and reasons for applying...]"
                minLength={50}
              />
              <p className="text-sm text-gray-500 mt-2">
                Minimum 50 characters ({coverLetter.length}/50)
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Required Documents</h3>
                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {uploadedRequiredCount} / {requiredDocsCount} uploaded
                </span>
              </div>

              <div className="space-y-3">
                {REQUIRED_DOCUMENTS.map((docInfo) => {
                  const uploaded = uploadedDocs.get(docInfo.type);
                  const isUploading = uploadingDoc === docInfo.type;

                  return (
                    <div
                      key={docInfo.type}
                      className={`border-2 rounded-lg p-4 transition ${
                        uploaded
                          ? 'border-green-200 bg-green-50'
                          : docInfo.required
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {uploaded ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          ) : docInfo.required ? (
                            <AlertCircle className="w-6 h-6 text-red-600" />
                          ) : (
                            <FileText className="w-6 h-6 text-gray-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {docInfo.label}
                                {docInfo.required && (
                                  <span className="text-red-600 ml-1">*</span>
                                )}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">{docInfo.description}</p>
                            </div>
                          </div>

                          {uploaded ? (
                            <div className="bg-white rounded-lg p-3 border border-green-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-medium text-gray-900 truncate">
                                    {uploaded.name}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {(uploaded.file_size / 1024 / 1024).toFixed(2)} MB
                                </span>
                              </div>
                            </div>
                          ) : (
                            <label className="block">
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleFileUpload(docInfo.type, file);
                                  }
                                }}
                                disabled={isUploading}
                                className="hidden"
                              />
                              <div className="flex items-center gap-2 bg-white border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:border-green-500 hover:bg-green-50 transition">
                                <Upload className="w-5 h-5 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                  {isUploading ? 'Uploading...' : 'Click to upload PDF'}
                                </span>
                              </div>
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {!isComplete && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Application Incomplete</p>
                    <p>Please upload all required documents and complete your cover letter to submit your application.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Note:</strong> By submitting this application, you confirm that:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• All information provided is true and accurate</li>
                <li>• All uploaded documents are authentic and certified true copies</li>
                <li>• You will receive a confirmation email at <strong>{profile?.email}</strong></li>
                <li>• You can check your application status in the Applications page</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !isComplete}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400"
              >
                <Send className="w-5 h-5" />
                {loading ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
