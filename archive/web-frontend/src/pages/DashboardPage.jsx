import { useSelector } from 'react-redux';

export default function DashboardPage() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">
          Welcome, {user?.name || 'User'}!
        </h1>
        <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl p-8 shadow-lg">
          <p className="text-neutral-600">
            Role: <span className="font-semibold text-neutral-900">{user?.role || 'Unknown'}</span>
          </p>
          <p className="text-neutral-500 mt-4">Dashboard content coming soon...</p>
        </div>
      </div>
    </div>
  );
}
