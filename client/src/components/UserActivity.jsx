import { useQuery } from '@tanstack/react-query';
import supabase from '../utils/supabase';

const UserActivity = ({ userId }) => {
  const { data: activity } = useQuery({
    queryKey: ['userActivity', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_activity')
        .select(`
          *,
          profile:profiles(username, avatar_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    }
  });

  const getActivityText = (item) => {
    switch (item.action_type) {
      case 'post_create':
        return 'created a new post';
      case 'post_comment':
        return 'commented on a post';
      case 'post_like':
        return 'liked a post';
      case 'bookmark_create':
        return 'bookmarked a post';
      default:
        return 'performed an action';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recent Activity</h3>
      <div className="space-y-2">
        {activity?.map((item) => (
          <div
            key={item.id}
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
          >
            <img
              src={item.profile.avatar_url || '/default-avatar.png'}
              alt={item.profile.username}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="text-sm">
                <span className="font-medium">{item.profile.username}</span>{' '}
                {getActivityText(item)}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserActivity; 