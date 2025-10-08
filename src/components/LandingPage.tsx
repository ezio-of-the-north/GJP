import { useState, useEffect } from 'react';
import { supabase, Job } from '../lib/supabase';
import { Briefcase, MapPin, Calendar, Banknote, Search, Shield, Users, Award, ChevronRight, LogIn, Heart, Laptop, GraduationCap, Building } from 'lucide-react';
import JobDetailModal from './JobDetailModal';

type LandingPageProps = {
  onLoginClick: () => void;
};

export default function LandingPage({ onLoginClick }: LandingPageProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchJobs();
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

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <img src="/MGB LOGO.png" alt="MGB Logo" className="h-16 w-16" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mines and Geosciences Bureau</h1>
                <p className="text-sm text-gray-600">Region 2 - Career Opportunities</p>
              </div>
            </div>
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg2MHY2MEgzNnptMCAwaDYwdjYwSDM2em0wIDBoNjB2NjBIMzZ6bTAgMGg2MHY2MEgzNnptMCAwaDYwdjYwSDM2em0wIDBoNjB2NjBIMzZ6bTAgMGg2MHY2MEgzNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-semibold">Official MGB Region 2 Portal</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Build Your Career with MGB
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto mb-8">
              Join us in promoting sustainable mineral resources development and advancing geological studies for socio-economic progress
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                Government Benefits & Security
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                Career Advancement Opportunities
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                Serve the Filipino People
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="p-3 bg-white/20 rounded-lg w-fit mb-4">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Diverse Opportunities</h3>
              <p className="text-green-100">
                From geoscience research to administrative roles, find your perfect fit
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="p-3 bg-white/20 rounded-lg w-fit mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Make an Impact</h3>
              <p className="text-green-100">
                Contribute to sustainable development and environmental protection
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="p-3 bg-white/20 rounded-lg w-fit mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Join Our Team</h3>
              <p className="text-green-100">
                Be part of a dedicated team serving the nation with scientific excellence
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">About MGB Region 2</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The Mines and Geosciences Bureau is the primary government agency under the Department of Environment and Natural Resources (DENR) responsible for the conservation, management, development, and proper use of the country's mineral resources.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To promote sustainable mineral resources development through the formulation and implementation of policies, programs, and projects that ensure responsible mining practices, geological hazard mitigation, and environmental protection for the benefit of the Filipino people.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                A minerals industry that is not only prosperous but also socially, economically, and environmentally sustainable, contributing to poverty alleviation and the general economic well-being of the nation while serving as the leading geoscience authority.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Building className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Government Benefits</h4>
              <p className="text-sm text-gray-600">Full GSIS coverage, Pag-IBIG, PhilHealth, and other government mandated benefits</p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Job Security</h4>
              <p className="text-sm text-gray-600">Stable employment with the Philippine government and clear career progression paths</p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <GraduationCap className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Training & Development</h4>
              <p className="text-sm text-gray-600">Access to professional development programs, seminars, and skills enhancement training</p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Laptop className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Modern Facilities</h4>
              <p className="text-sm text-gray-600">Work with state-of-the-art equipment and technology for geoscience research and development</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Current Job Openings</h2>
          <p className="text-gray-600 mb-6">Explore available positions and start your journey with MGB Region 2</p>

          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by position, department, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-lg"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="text-gray-600 mt-4">Loading opportunities...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {jobs.length === 0 ? 'No Open Positions' : 'No Results Found'}
            </h3>
            <p className="text-gray-600">
              {jobs.length === 0
                ? 'Please check back later for new opportunities'
                : 'Try adjusting your search criteria'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border-2 border-gray-100 hover:border-green-200 cursor-pointer"
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <Briefcase className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h3>
                        <p className="text-green-600 font-semibold text-lg">{job.department}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-sm font-medium shadow-sm">
                      {job.employment_type}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-6 line-clamp-2 leading-relaxed text-lg">
                  {job.description}
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Banknote className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium">₱{job.salary_range}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium">
                        Deadline: {new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-8 rounded-lg transition shadow-md hover:shadow-lg">
                  View Details
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/MGB LOGO.png" alt="MGB Logo" className="h-12 w-12" />
                <div>
                  <h3 className="font-bold">MGB Region 2</h3>
                  <p className="text-sm text-gray-400">Cagayan Valley</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Promoting sustainable mineral resources development and advancing geological studies for the nation.
              </p>
              <p className="text-gray-400 text-xs">
                Under the Department of Environment and Natural Resources (DENR)
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://region2.mgb.gov.ph/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">MGB Region 2 Website</a></li>
                <li><a href="https://mgb.gov.ph/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">MGB National</a></li>
                <li><a href="https://denr.gov.ph/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">DENR Official Site</a></li>
                <li><button onClick={onLoginClick} className="hover:text-white transition">Career Portal Login</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Information</h4>
              <div className="text-gray-400 text-sm space-y-2">
                <p className="font-medium text-white">Mines and Geosciences Bureau</p>
                <p>Regional Office No. 2</p>
                <p>Cagayan Valley Region</p>
                <p className="mt-3 text-xs">
                  Serving the provinces of Batanes, Cagayan, Isabela, Nueva Vizcaya, and Quirino
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="text-center text-sm text-gray-400 space-y-2">
              <p className="font-medium text-white">Republic of the Philippines</p>
              <p>&copy; 2025 Mines and Geosciences Bureau - Region 2. All rights reserved.</p>
              <p className="text-xs">An attached agency of the Department of Environment and Natural Resources</p>
            </div>
          </div>
        </div>
      </footer>

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApplyClick={onLoginClick}
        />
      )}
    </div>
  );
}
