import { useState, useEffect } from 'react';
import { supabase, Job, Application } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, Calendar, MapPin, DollarSign, LogOut, FileText, Clock, Folder } from 'lucide-react';
import ApplicationModal from './ApplicationModal';
import DocumentsView from './DocumentsView';

export default function ApplicantDashboard() {
  const { profile, signOut } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [view, setView] = useState<'jobs' | 'applications' | 'documents'>('jobs');

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .gte('deadline', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*, jobs(*)')
        .eq('applicant_id', profile?.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const hasApplied = (jobId: string) => {
    return applications.some(app => app.job_id === jobId);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewing: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      accepted: 'bg-emerald-100 text-emerald-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Government Job Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {profile?.full_name}</span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setView('jobs')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              view === 'jobs'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Browse Jobs
          </button>
          <button
            onClick={() => setView('applications')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              view === 'applications'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            My Applications
          </button>
          <button
            onClick={() => setView('documents')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              view === 'documents'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Folder className="w-5 h-5" />
            My Documents
          </button>
        </div>

        {view === 'jobs' ? (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Positions</h2>
              <p className="text-gray-600 mt-1">{jobs.length} open positions</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No open positions available at the moment</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                        <p className="text-blue-600 font-semibold">{job.department}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {job.employment_type}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm">{job.salary_range}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          Deadline: {new Date(job.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                        disabled={hasApplied(job.id)}
                      >
                        {hasApplied(job.id) ? 'Already Applied' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : view === 'applications' ? (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
              <p className="text-gray-600 mt-1">{applications.length} total applications</p>
            </div>

            {applications.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">You haven't applied to any jobs yet</p>
                <button
                  onClick={() => setView('jobs')}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Browse Available Jobs
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {applications.map((application: any) => (
                  <div
                    key={application.id}
                    className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {application.jobs.title}
                        </h3>
                        <p className="text-blue-600 font-semibold">{application.jobs.department}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          Applied: {new Date(application.applied_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{application.jobs.location}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Cover Letter:</p>
                      <p className="text-sm text-gray-600 line-clamp-3">{application.cover_letter}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <DocumentsView />
        )}
      </div>

      {selectedJob && (
        <ApplicationModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSuccess={() => {
            setSelectedJob(null);
            fetchApplications();
          }}
        />
      )}
    </div>
  );
}
