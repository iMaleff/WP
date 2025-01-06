import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import supabase from '../utils/supabase';

const NotificationSettings = () => {
  const { data: settings } = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .single();

      if (error) throw error;
      return data.notification_preferences;
    }
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings) => {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: newSettings });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Notification settings updated');
    }
  });

  const notificationTypes = [
    { id: 'comment', label: 'Comments on your posts' },
    { id: 'follow', label: 'New followers' },
    { id: 'like', label: 'Likes on your posts' },
    { id: 'mention', label: 'Mentions in comments' }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Notification Settings</h2>

      <div className="space-y-6">
        {notificationTypes.map(type => (
          <div key={type.id} className="flex items-start space-x-4">
            <div className="flex-1">
              <h3 className="font-medium">{type.label}</h3>
              <div className="space-y-2 mt-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings?.[type.id]?.inApp ?? true}
                    onChange={(e) =>
                      updateSettings.mutate({
                        ...settings,
                        [type.id]: {
                          ...settings?.[type.id],
                          inApp: e.target.checked
                        }
                      })
                    }
                    className="mr-2"
                  />
                  In-app notifications
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings?.[type.id]?.email ?? true}
                    onChange={(e) =>
                      updateSettings.mutate({
                        ...settings,
                        [type.id]: {
                          ...settings?.[type.id],
                          email: e.target.checked
                        }
                      })
                    }
                    className="mr-2"
                  />
                  Email notifications
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationSettings; 