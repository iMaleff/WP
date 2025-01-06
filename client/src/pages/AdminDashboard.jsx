import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axios from 'axios';

const AdminDashboard = () => {
  const [tab, setTab] = useState('pending');
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', tab],
    queryFn: async () => {
      const response = await axios.get(`/api/users?status=${tab}`);
      return response.data;
    }
  });

  const updateUserStatus = useMutation({
    mutationFn: async ({ userId, status }) => {
      const response = await axios.patch(`/api/users/${userId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User status updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error updating user status');
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">User Management</h1>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded ${
            tab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Pending Approval
        </button>
        <button
          onClick={() => setTab('active')}
          className={`px-4 py-2 rounded ${
            tab === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Active Users
        </button>
        <button
          onClick={() => setTab('suspended')}
          className={`px-4 py-2 rounded ${
            tab === 'suspended' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Suspended Users
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registration Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users?.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.username}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(user.registrationDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {user.status === 'pending' && (
                    <button
                      onClick={() => updateUserStatus.mutate({ 
                        userId: user._id, 
                        status: 'active' 
                      })}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Approve
                    </button>
                  )}
                  {user.status === 'active' && (
                    <button
                      onClick={() => updateUserStatus.mutate({ 
                        userId: user._id, 
                        status: 'suspended' 
                      })}
                      className="text-red-600 hover:text-red-900"
                    >
                      Suspend
                    </button>
                  )}
                  {user.status === 'suspended' && (
                    <button
                      onClick={() => updateUserStatus.mutate({ 
                        userId: user._id, 
                        status: 'active' 
                      })}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Reactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard; 