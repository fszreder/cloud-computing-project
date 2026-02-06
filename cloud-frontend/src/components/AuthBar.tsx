export default function AuthBar() {
  const handleLogin = () => {
    window.location.href = '/.auth/login/github';
  };

  const handleLogout = () => {
    window.location.href = '/.auth/logout';
  };

  return (
    <div className="flex gap-4 p-4 bg-slate-100 rounded-lg mb-6 items-center justify-between">
      <span className="text-sm font-medium text-slate-600">
        Panel Administracyjny (GitHub Auth)
      </span>
      <div className="flex gap-2">
        <button
          onClick={handleLogin}
          className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-slate-800 transition-colors"
        >
          Zaloguj przez GitHub
        </button>
        <button
          onClick={handleLogout}
          className="text-slate-500 hover:text-slate-800 text-sm"
        >
          Wyloguj
        </button>
      </div>
    </div>
  );
}
