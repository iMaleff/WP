import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [period, setPeriod] = useState('week');
  
  const { data: stats } = useQuery({
    queryKey: ['stats', period],
    queryFn: async () => {
      const response = await axios.get(`/api/stats?period=${period}`);
      return response.data;
    }
  });

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Views"
          value={stats?.totalViews}
          trend={stats?.viewsTrend}
        />
        <StatCard
          title="Comments"
          value={stats?.totalComments}
          trend={stats?.commentsTrend}
        />
        <StatCard
          title="Bookmarks"
          value={stats?.totalBookmarks}
          trend={stats?.bookmarksTrend}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <Bar data={stats?.chartData} />
      </div>
    </div>
  );
}; 