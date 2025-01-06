import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import supabase from '../utils/supabase';

const Notifications = () => {
  const [showAll, setShowAll] = useState(false);
  const queryClient = useQueryClient();

  // Подписываемся на новые уведомления
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${supabase.auth.user()?.id}`
        },
        (payload) => {
          queryClient.invalidateQueries(['notifications']);
          toast.info(payload.new.title);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(showAll ? 50 : 5);

      if (error) throw error;
      return data;
    }
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'comment':
        return '💬';
      case 'like':
        return '❤️';
      case 'follow':
        return '👥';
      default:
        return '📢';
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Notifications</h2>
        </div>
        <div className="divide-y">
          {notifications?.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">
                  {getNotificationIcon(notification.type)}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => markAsRead.mutate(notification.id)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {notifications?.length > 0 && (
          <div className="p-4 border-t">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showAll ? 'Show less' : 'Show all'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications; 