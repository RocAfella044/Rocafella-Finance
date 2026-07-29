import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();
  const saved = localStorage.getItem('rocfin_user');
  const user = saved ? JSON.parse(saved) : null;

  const handleLogout = () => {
    localStorage.removeItem('rocfin_user');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-gray-100">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3zm0 2c-3.314 0-6 1.343-6 4v1h12v-1c0-2.657-2.686-4-6-4z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">Rocfin</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email || 'User'}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-500">Welcome back, {user?.email || 'User'}!</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'Total Revenue', value: '$45,231', change: '+12.5%', positive: true },
              { label: 'Active Users', value: '2,345', change: '+5.2%', positive: true },
              { label: 'Pending Tasks', value: '18', change: '-3.1%', positive: false },
            ].map((stat) => (
              <div key={stat.label} className="p-5 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`mt-1 text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}