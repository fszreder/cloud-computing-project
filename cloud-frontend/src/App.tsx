import ClientList from './components/ClientList';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-blue-200 shadow-lg">
              C
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800">
              Cloud<span className="text-blue-600">CRM</span>
            </span>
          </div>
          <div className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase tracking-widest">
            v2.0 Opus Magnum
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
        <ClientList />
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
