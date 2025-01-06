import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import supabase from '../utils/supabase';

const PrivacySettings = () => {
  const { data: settings } = useQuery({
    queryKey: ['privacySettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    }
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings) => {
      const { error } = await supabase
        .from('privacy_settings')
        .upsert(newSettings);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Privacy settings updated');
    }
  });

  const handleToggle = (field) => {
    updateSettings.mutate({
      ...settings,
      [field]: !settings[field]
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Privacy Settings</h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Profile Visibility</h3>
            <p className="text-sm text-gray-500">
              Control who can see your profile
            </p>
          </div>
          <select
            value={settings?.profile_visibility}
            onChange={(e) =>
              updateSettings.mutate({
                ...settings,
                profile_visibility: e.target.value
              })
            }
            className="rounded-md border-gray-300"
          >
            <option value="public">Public</option>
            <option value="followers">Followers Only</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Direct Messages</h3>
            <p className="text-sm text-gray-500">
              Allow others to send you messages
            </p>
          </div>
          <button
            onClick={() => handleToggle('allow_messages')}
            className={`${
              settings?.allow_messages
                ? 'bg-blue-600'
                : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full`}
          >
            <span
              className={`${
                settings?.allow_messages ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
          </button>
        </div>

        {/* Другие настройки приватности */}
      </div>
    </div>
  );
};

export default PrivacySettings; 