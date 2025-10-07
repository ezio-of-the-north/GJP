import { useState, useEffect } from 'react';
import { supabase, Job, Application } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, LogOut, Plus, Users, Eye, TrendingUp, CheckCircle2, Clock, XCircle, FileText, BarChart3 } from 'lucide-react';
import JobForm from './JobForm';
import ApplicationsView from './ApplicationsView';

export default function HRDashboard() {
  const { profile, signOut } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allApplications, setAllApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [view, setView] = useState<'jobs' | 'applications'>('jobs');
  const [applicationCounts, setApplicationCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchJobs();
    fetchAllApplications();
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

  const fetchAllApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*, jobs!inner(*)')
        .eq('jobs.posted_by', profile?.id);

      if (error) throw error;
      setAllApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
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

  const stats = {
    totalJobs: jobs.length,
    openJobs: jobs.filter(job => job.status === 'open').length,
    totalApplications: allApplications.length,
    pending: allApplications.filter(app => app.status === 'pending').length,
    reviewing: allApplications.filter(app => app.status === 'reviewing' || app.status === 'shortlisted').length,
    accepted: allApplications.filter(app => app.status === 'accepted').length,
    rejected: allApplications.filter(app => app.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <img src="/MGB LOGO.png" alt="MGB Logo" className="h-14 w-14" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">MGB HR Portal</h1>
                <p className="text-xs text-gray-600">Mines and Geosciences Bureau - Region 2</p>
              </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="w-8 h-8 opacity-80" />
              <BarChart3 className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalJobs}</div>
            <div className="text-green-100 text-sm">Total Job Postings</div>
            <div className="mt-2 text-xs text-green-200">{stats.openJobs} currently open</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalApplications}</div>
            <div className="text-emerald-100 text-sm">Total Applications</div>
            <div className="mt-2 text-xs text-emerald-200">{stats.pending} awaiting review</div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 opacity-80" />
              <FileText className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.reviewing}</div>
            <div className="text-amber-100 text-sm">Under Review</div>
            <div className="mt-2 text-xs text-amber-200">Reviewing & shortlisted</div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.accepted}</div>
            <div className="text-green-100 text-sm">Offers Accepted</div>
            <div className="mt-2 text-xs text-green-200">
              {stats.totalApplications > 0 ? Math.round((stats.accepted / stats.totalApplications) * 100) : 0}% success rate
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setView('jobs')}
              className={`px-6 py-3 rounded-lg font-semibold transition shadow-sm ${
                view === 'jobs'
                  ? 'bg-green-600 text-white shadow-green-200'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              My Job Postings
            </button>
            <button
              onClick={() => setView('applications')}
              className={`px-6 py-3 rounded-lg font-semibold transition shadow-sm ${
                view === 'applications'
                  ? 'bg-green-600 text-white shadow-green-200'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Applications
            </button>
          </div>

          {view === 'jobs' && (
            <button
              onClick={() => setShowJobForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg"
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
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">You haven't posted any jobs yet</p>
                <button
                  onClick={() => setShowJobForm(true)}
                  className="text-green-600 hover:text-green-700 font-semibold"
                >
                  Post Your First Job
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-green-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="p-3 bg-green-50 rounded-lg">
                            <Briefcase className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                            <p className="text-green-600 font-semibold">{job.department}</p>
                          </div>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm ${getStatusColor(job.status)}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2 leading-relaxed">{job.description}</p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Users className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-900">{applicationCounts[job.id] || 0}</div>
                            <div className="text-xs text-gray-600">Applications</div>
                          </div>
                        </div>
                        <div className="h-12 w-px bg-gray-300"></div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="text-sm font-semibold">
                              {new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="text-xs text-gray-600">Deadline</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setShowJobForm(true);
                        }}
                        className="flex-1 px-4 py-2.5 border-2 border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="flex-1 px-4 py-2.5 border-2 border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition"
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
