import { useState, useEffect } from 'react';
import { supabase, Job, Application, Document } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, Calendar, MapPin, DollarSign, LogOut, FileText, Clock, Folder, Search, Filter, TrendingUp, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import ApplicationModal from './ApplicationModal';
import DocumentsView from './DocumentsView';

export default function ApplicantDashboard() {
  const { profile, signOut } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [view, setView] = useState<'jobs' | 'applications' | 'documents'>('jobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchJobs();
    fetchApplications();
    fetchDocuments();
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

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', profile?.id);

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
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

  const departments = Array.from(new Set(jobs.map(job => job.department)));

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || job.department === filterDepartment;
    const matchesType = filterType === 'all' || job.employment_type === filterType;
    return matchesSearch && matchesDepartment && matchesType;
  });

  const stats = {
    totalApplications: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    reviewing: applications.filter(app => app.status === 'reviewing' || app.status === 'shortlisted').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalApplications}</div>
            <div className="text-blue-100 text-sm">Total Applications</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 opacity-80" />
              <AlertCircle className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.pending}</div>
            <div className="text-yellow-100 text-sm">Pending Review</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.accepted}</div>
            <div className="text-green-100 text-sm">Accepted</div>
          </div>

          <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Folder className="w-8 h-8 opacity-80" />
              <FileText className="w-5 h-5 opacity-60" />
            </div>
            <div className="text-3xl font-bold mb-1">{documents.length}</div>
            <div className="text-slate-200 text-sm">Documents Stored</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setView('jobs')}
            className={`px-6 py-3 rounded-lg font-semibold transition shadow-sm ${
              view === 'jobs'
                ? 'bg-blue-600 text-white shadow-blue-200'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Browse Jobs
          </button>
          <button
            onClick={() => setView('applications')}
            className={`px-6 py-3 rounded-lg font-semibold transition shadow-sm ${
              view === 'applications'
                ? 'bg-blue-600 text-white shadow-blue-200'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            My Applications
          </button>
          <button
            onClick={() => setView('documents')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition shadow-sm ${
              view === 'documents'
                ? 'bg-blue-600 text-white shadow-blue-200'
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
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Available Positions</h2>
                  <p className="text-gray-600 mt-1">{filteredJobs.length} positions found</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="all">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {jobs.length === 0 ? 'No open positions available at the moment' : 'No jobs match your search criteria'}
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <Briefcase className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                            <p className="text-blue-600 font-semibold">{job.department}</p>
                          </div>
                        </div>
                      </div>
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-medium shadow-sm">
                        {job.employment_type}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2 leading-relaxed">{job.description}</p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="w-5 h-5 text-gray-500" />
                          <span className="text-sm font-medium">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <DollarSign className="w-5 h-5 text-gray-500" />
                          <span className="text-sm font-medium">{job.salary_range}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <span className="text-sm font-medium">
                            {new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-all duration-200 ${
                          hasApplied(job.id)
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg'
                        }`}
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
