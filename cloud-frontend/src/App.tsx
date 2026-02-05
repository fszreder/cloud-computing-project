/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import ClientList from './components/ClientList';
import { Toaster } from 'react-hot-toast';

const BACKEND_URL =
  'https://cloud-backend-fs-enfyewhphxfjaad8.francecentral-01.azurewebsites.net';
const FRONTEND_URL = 'https://cloudfrontendfs.z28.web.core.windows.net';

export default function App() {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/.auth/me`, {
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Not authenticated');

        const data = await res.json();
        if (data && data[0]) {
          setUser(data[0].user_id);
          console.log('Zalogowany jako:', data[0].user_id);
        }
      } catch (err) {
        console.log('Użytkownik niezalogowany lub brak sesji');
        setUser(null);
      }
    };
    checkUser();
  }, []);

  const handleLogin = () => {
    const redirectUrl = encodeURIComponent(FRONTEND_URL);
    window.location.href = `${BACKEND_URL}/.auth/login/github?post_login_redirect_url=${redirectUrl}`;
  };

  const handleLogout = () => {
    const redirectTarget = encodeURIComponent(FRONTEND_URL);
    window.location.href = `${BACKEND_URL}/.auth/logout?post_logout_redirect_uri=${redirectTarget}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-blue-200 shadow-lg">
              C
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800">
              CloudClient<span className="text-blue-600">PRO</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {user}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-tighter"
                >
                  Wyloguj
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                Zaloguj przez GitHub
              </button>
            )}
            <div className="text-[10px] font-medium text-slate-300 bg-slate-50 border border-slate-100 px-2 py-1 rounded uppercase tracking-widest hidden sm:block">
              v2.0 Opus Magnum
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Panel Zarządzania
          </h1>
          <p className="text-slate-500 font-medium">
            Monitoruj bazę klientów i zarządzaj dokumentacją w chmurze Azure.
          </p>
        </div>

        {user ? (
          <ClientList />
        ) : (
          <div className="bg-blue-50 border border-blue-100 p-8 rounded-2xl text-center shadow-inner">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                ></path>
              </svg>
            </div>
            <h2 className="text-blue-900 font-bold text-xl mb-2">
              Dostęp ograniczony
            </h2>
            <p className="text-blue-700 mb-6 max-w-md mx-auto">
              Tożsamość użytkownika musi zostać zweryfikowana przez GitHub
              OAuth, aby uzyskać dostęp do zasobów chmurowych.
            </p>
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            >
              Uwierzytelnij przez GitHub
            </button>
          </div>
        )}
      </main>

      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          className: 'rounded-xl border border-slate-100 shadow-xl font-medium',
          duration: 4000,
        }}
      />
    </div>
  );
}
