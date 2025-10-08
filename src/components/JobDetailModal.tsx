import { X, MapPin, Banknote, Calendar, Briefcase, FileText, Clock, Building2 } from 'lucide-react';
import { Job } from '../lib/supabase';

type JobDetailModalProps = {
  job: Job;
  onClose: () => void;
  onApplyClick: () => void;
};

export default function JobDetailModal({ job, onClose, onApplyClick }: JobDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex justify-between items-start rounded-t-2xl">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{job.title}</h2>
                <p className="text-green-100 text-lg">{job.department}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Building2 className="w-5 h-5 text-green-600" />
                <span className="text-xs font-medium">Type</span>
              </div>
              <p className="font-semibold text-gray-900">{job.employment_type}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <span className="text-xs font-medium">Location</span>
              </div>
              <p className="font-semibold text-gray-900">{job.location}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Banknote className="w-5 h-5 text-green-600" />
                <span className="text-xs font-medium">Salary Range</span>
              </div>
              <p className="font-semibold text-gray-900">₱{job.salary_range}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="text-xs font-medium">Deadline</span>
              </div>
              <p className="font-semibold text-gray-900">
                {new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Job Description</h3>
              </div>
              <div className="bg-green-50 rounded-lg p-6 border border-green-100">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Requirements & Qualifications</h3>
              </div>
              <div className="bg-green-50 rounded-lg p-6 border border-green-100">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {job.requirements}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                How to Apply
              </h4>
              <p className="text-gray-700 mb-4">
                To apply for this position, you need to sign in to your account or create a new account on our career portal. Once logged in, you can submit your application with your resume and cover letter.
              </p>
              <button
                onClick={onApplyClick}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-lg transition shadow-md hover:shadow-lg text-lg"
              >
                Sign In to Apply
              </button>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
