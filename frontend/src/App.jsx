import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000';
const Logo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 280 220" className="shrink-0">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9333ea" />
        <stop offset="100%" stopColor="#6d28d9" />
      </linearGradient>
    </defs>
    <rect x="60" y="30" width="160" height="160" rx="40" fill="url(#logoGrad)" />
    <path d="M140 62 c26 0 46 20 46 45 c0 34 -46 68 -46 68 c0 0 -46 -34 -46 -68 c0 -25 20 -45 46 -45 z" fill="white" />
    <circle cx="140" cy="107" r="16" fill="url(#logoGrad)" />
    <circle cx="176" cy="152" r="15" fill="#22c55e" />
    <path d="M169 152 l5 5 l9 -10" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CATEGORY_LABELS = {
  garbage: 'Garbage Issue',
  water: 'Water Issue',
  road: 'Road Issue',
  electricity: 'Electricity Issue',
  other: 'General Issue',
};

function App() {
  const [problemText, setProblemText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [problems, setProblems] = useState([]);
  const [helpersCount, setHelpersCount] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('feed');
  const [error, setError] = useState('');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sahayak_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    fetchProblems();
    fetchLeaderboard();
    if (user) fetchProfile(user.id);
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/problems`);
      setProblems(res.data);

      const counts = {};
      await Promise.all(
        res.data.map(async (p) => {
          try {
            const countRes = await axios.get(`${API_URL}/api/problems/${p.id}/helpers`);
            counts[p.id] = countRes.data.count;
          } catch (err) {
            counts[p.id] = 0;
          }
        })
      );
      setHelpersCount(counts);
    } catch (err) {
      console.error('Problems fetch nahi hue:', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/leaderboard`);
      setLeaderboard(res.data);
    } catch (err) {
      console.error('Leaderboard fetch nahi hui:', err);
    }
  };

  const fetchProfile = async (userId) => {
    try {
      const res = await axios.get(`${API_URL}/api/profile/${userId || user.id}`);
      setProfile(res.data);
    } catch (err) {
      console.error('Profile fetch nahi hui:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problemText.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await axios.post(`${API_URL}/api/analyze`, { problemText });
      setResult(res.data);
      setProblemText('');
      fetchProblems();
    } catch (err) {
      setError('Kuch gadbad ho gayi, dobara try kar');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const endpoint = authMode === 'signup' ? '/api/signup' : '/api/login';
      const body = authMode === 'signup'
        ? { email: authEmail, password: authPassword, name: authName }
        : { email: authEmail, password: authPassword };

      const res = await axios.post(`${API_URL}${endpoint}`, body);
      const loggedInUser = res.data.user;

      setUser(loggedInUser);
      localStorage.setItem('sahayak_user', JSON.stringify(loggedInUser));
      fetchProfile(loggedInUser.id);
      setAuthEmail('');
      setAuthPassword('');
      setAuthName('');
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Kuch gadbad ho gayi');
      console.error(err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('sahayak_user');
  };

  const handleHelp = async (problemId) => {
    try {
      await axios.post(`${API_URL}/api/problems/${problemId}/help`, { userId: user.id });
      fetchProblems();
    } catch (err) {
      alert(err.response?.data?.error || 'Help karne mein dikkat aayi');
      console.error(err);
    }
  };

  const priorityStyles = (priority) => {
    if (priority === 'high') return 'bg-red-50 text-red-700 border-red-200';
    if (priority === 'medium') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-green-50 text-green-700 border-green-200';
  };

  const priorityDot = (priority) => {
    if (priority === 'high') return 'bg-red-500';
    if (priority === 'medium') return 'bg-amber-500';
    return 'bg-green-500';
  };

  const categoryLabel = (category) => CATEGORY_LABELS[category] || 'General Issue';

  // ---------- LOGIN / SIGNUP SCREEN ----------
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-2">
  <Logo size={56} />
</div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sahayak AI</h1>
            <p className="text-gray-500 text-sm mt-1">
              {authMode === 'signup' ? 'Naya Account Banao' : 'Wapas Aane Ka Swagat Hai'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-3">
            {authMode === 'signup' && (
              <input
                type="text"
                placeholder="Naam"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              required
            />

            {authError && <p className="text-red-500 text-sm">{authError}</p>}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 active:scale-[0.97] transition-all duration-200 shadow-md shadow-purple-200 disabled:opacity-60"
            >
              {authLoading ? 'Ruko...' : (authMode === 'signup' ? 'Signup Karo' : 'Login Karo')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            {authMode === 'signup' ? 'Pehle se account hai? ' : 'Naya user ho? '}
            <span
              onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
              className="text-purple-600 font-medium cursor-pointer hover:underline"
            >
              {authMode === 'signup' ? 'Login Karo' : 'Signup Karo'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // ---------- MAIN APP ----------
  const totalHelpers = Object.values(helpersCount).reduce((a, b) => a + b, 0);
  const citiesCovered = new Set(problems.map((p) => p.category)).size;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={70} />
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight tracking-tight">Sahayak AI</h1>
              <p className="text-xs text-gray-400">Smart Local Problem Solver</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              👋 {user.user_metadata?.name || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 active:scale-95 transition-all duration-150"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Impact Section */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <p className="text-2xl font-bold text-purple-600">{problems.length}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">Problems Reported</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <p className="text-2xl font-bold text-green-600">{totalHelpers}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">Active Helpers</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <p className="text-2xl font-bold text-amber-600">{citiesCovered}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">Categories Covered</p>
          </div>
        </div>

        {/* Submit Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Naya Problem Report Karo</label>
          <textarea
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
            placeholder="Apni problem yaha likho... jaise: 'Yaha garbage hai 3 din se'"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-3 px-6 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 active:scale-[0.97] transition-all duration-200 shadow-md shadow-purple-200 disabled:opacity-60"
          >
            {loading ? '🤖 AI Analyze Kar Raha Hai...' : '🚀 Submit Karo'}
          </button>
        </form>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {result && (
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 mb-6 animate-[fadeIn_0.3s_ease-in-out]">
            <p className="text-xs font-bold text-purple-700 mb-2 uppercase tracking-wide">🤖 AI Analysis Complete</p>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${priorityStyles(result.priority)} mb-2`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityDot(result.priority)}`}></span>
              {categoryLabel(result.category)} • Priority: {result.priority}
            </span>
            <p className="text-sm text-gray-600 mt-2">{result.reasoning}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setView('feed')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              view === 'feed' ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            📋 Feed
          </button>
          <button
            onClick={() => setView('leaderboard')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              view === 'leaderboard' ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            🏆 Leaderboard
          </button>
          <button
            onClick={() => setView('profile')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              view === 'profile' ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            👤 Profile
          </button>
        </div>

        {/* Feed */}
        {view === 'feed' && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Community Feed</h2>
            {problems.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-gray-500 text-sm font-medium">Abhi tak koi problem submit nahi hui.</p>
                <p className="text-gray-400 text-xs mt-1">Sabse pehle apni problem report karo!</p>
              </div>
            )}
            {problems.map((p) => (
              <div
                key={p.id}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:scale-[1.02] hover:border-purple-100 transition-all duration-300 cursor-pointer"
              >
                <p className="text-gray-900 font-semibold mb-3 leading-snug">{p.problem_text}</p>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100">
                    🤖 AI Detected: {categoryLabel(p.category)}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${priorityStyles(p.priority)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${priorityDot(p.priority)}`}></span>
                    Priority: {p.priority}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-4 font-medium">
                  🙋 {helpersCount[p.id] || 0} {helpersCount[p.id] === 1 ? 'logo' : 'logo'} ne help ki hai
                </p>

                <button
                  onClick={(e) => { e.stopPropagation(); handleHelp(p.id); }}
                  className="px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 active:scale-[0.97] transition-all duration-200 shadow-sm shadow-green-100"
                >
                  🙋 Main Help Karunga
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Leaderboard */}
        {view === 'leaderboard' && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">🏆 Top Helpers</h2>
            {leaderboard.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                <p className="text-3xl mb-2">🏆</p>
                <p className="text-gray-500 text-sm font-medium">Abhi tak koi points nahi hai.</p>
                <p className="text-gray-400 text-xs mt-1">Help karke sabse pehle leaderboard mein aao!</p>
              </div>
            )}
            {leaderboard.map((u, index) => (
              <div
                key={u.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md hover:scale-[1.01] transition-all duration-200"
              >
                <span className={`text-lg font-bold w-9 h-9 flex items-center justify-center rounded-full ${
                  index === 0 ? 'bg-amber-100 text-amber-700' : index === 1 ? 'bg-gray-100 text-gray-600' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-purple-50 text-purple-600'
                }`}>
                  {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-500 font-medium">{u.points} points • {u.problems_solved} problems solve kiye</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Profile */}
        {view === 'profile' && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">👤 Mera Profile</h2>
            {!profile && (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <p className="text-gray-400 text-sm">Loading...</p>
              </div>
            )}
            {profile && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-2xl font-bold text-purple-600">
                    {profile.name?.[0]?.toUpperCase() || '👤'}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{profile.name}</p>
                    <p className="text-gray-500 text-sm">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-8 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{profile.points}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{profile.problems_solved}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Problems Solve Kiye</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;