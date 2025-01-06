import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import supabase from '../utils/supabase';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">Загрузка...</div>;
  }

  if (!profile || (allowedRoles.length > 0 && !allowedRoles.includes(profile.role))) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute; 