import { useState, useEffect } from 'react';
import { supabase, Job, Application } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, LogOut, Plus, Users, Eye } from 'lucide-react';
import JobForm from './JobForm';
import ApplicationsView from './ApplicationsView';

export default function HRDashboard() {
  const { profile, signOut } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [view, setView] = useState<'jobs' | 'applications'>('jobs');
  const [applicationCounts, setApplicationCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('posted_by', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);

      if (data) {
        const counts: Record<string, number> = {};
        for (const job of data) {
          const { count } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', job.id);
          counts[job.id] = count || 0;
        }
        setApplicationCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobSuccess = () => {
    setShowJobForm(false);
    setSelectedJob(null);
    fetchJobs();
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    try {
      const { error } = await supabase.from('jobs').delete().eq('id', jobId);
      if (error) throw error;
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-green-100 text-green-800',
      closed: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
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
              <h1 className="text-xl font-bold text-gray-900">HR Management Portal</h1>
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
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setView('jobs')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                view === 'jobs'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              My Job Postings
            </button>
            <button
              onClick={() => setView('applications')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                view === 'applications'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Applications
            </button>
          </div>

          {view === 'jobs' && (
            <button
              onClick={() => setShowJobForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Post New Job
            </button>
          )}
        </div>

        {view === 'jobs' ? (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Job Postings</h2>
              <p className="text-gray-600 mt-1">{jobs.length} total postings</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">You haven't posted any jobs yet</p>
                <button
                  onClick={() => setShowJobForm(true)}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Post Your First Job
                </button>
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
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          {applicationCounts[job.id] || 0} Applications
                        </span>
                      </div>
                      <div className="text-gray-600 text-sm">
                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setShowJobForm(true);
                        }}
                        className="px-4 py-2 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="px-4 py-2 border-2 border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <ApplicationsView />
        )}
      </div>

      {showJobForm && (
        <JobForm
          job={selectedJob}
          onClose={() => {
            setShowJobForm(false);
            setSelectedJob(null);
          }}
          onSuccess={handleJobSuccess}
        />
      )}
    </div>
  );
}
