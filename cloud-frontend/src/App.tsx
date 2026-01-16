import ClientList from './components/ClientList';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-6">Service Management</h1>
      <ClientList />
    </div>
  );
}
