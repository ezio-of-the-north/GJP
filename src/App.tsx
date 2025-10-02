import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import ApplicantDashboard from './components/ApplicantDashboard';
import HRDashboard from './components/HRDashboard';

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Auth />;
  }

  return profile.role === 'hr' ? <HRDashboard /> : <ApplicantDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
