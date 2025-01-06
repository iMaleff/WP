import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import supabase from '@/utils/supabase';
import { HomePage } from '@/pages/HomePage';
import { Auth } from '@/components/Auth';
import { Layout } from '@/components/Layout';
import { Loading } from '@/components/ui/loading';
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  // Проверяем сессию пользователя
  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    }
  });

  if (isLoading) return <Loading />;

  return (
    <ErrorBoundary>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route 
            path="/login" 
            element={session ? <Navigate to="/" /> : <Auth />} 
          />
          <Route element={<Layout />}>
            <Route 
              path="/" 
              element={session ? <HomePage /> : <Navigate to="/login" />} 
            />
          </Route>
          {/* Редирект с /auth на /login для совместимости */}
          <Route 
            path="/auth" 
            element={<Navigate to="/login" replace />} 
          />
          {/* Редирект всех остальных путей на главную */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
