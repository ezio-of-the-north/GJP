import { useState, useEffect } from 'react';
import { supabase, Application } from '../lib/supabase';
import { FileText, User, Mail, Phone, Calendar } from 'lucide-react';

export default function ApplicationsView() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs(title, department, location),
          profiles(full_name, email, phone)
        `)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;
      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
    }
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

  const filteredApplications =
    filter === 'all'
      ? applications
      : applications.filter((app) => app.status === filter);

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Applications</h2>
          <p className="text-gray-600 mt-1">
            {filteredApplications.length} applications
          </p>
        </div>

        <div className="flex gap-2">
          {['all', 'pending', 'reviewing', 'shortlisted', 'accepted', 'rejected'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {filter === 'all'
              ? 'No applications received yet'
              : `No ${filter} applications`}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredApplications.map((application) => (
            <div
              key={application.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {application.jobs.title}
                  </h3>
                  <p className="text-blue-600 font-semibold mb-2">
                    {application.jobs.department}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    application.status
                  )}`}
                >
                  {application.status.charAt(0).toUpperCase() +
                    application.status.slice(1)}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold">{application.profiles.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{application.profiles.email}</span>
                  </div>
                  {application.profiles.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{application.profiles.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      Applied: {new Date(application.applied_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Cover Letter:</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {application.cover_letter}
                </p>
              </div>

              <div className="flex gap-2">
                <select
                  value={application.status}
                  onChange={(e) =>
                    updateApplicationStatus(application.id, e.target.value)
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-medium text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
