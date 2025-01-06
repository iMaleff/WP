import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import supabase from '@/utils/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'react-hot-toast';

export const SecurityPanel = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Получаем список блокировок
  const { data: blockedUsers, isLoading } = useQuery({
    queryKey: ['blocked-users', searchTerm],
    queryFn: async () => {
      const query = supabase
        .from('auth_attempts')
        .select(`
          id,
          ip_address,
          attempt_count,
          last_attempt,
          is_blocked,
          blocked_until,
          auth_logs (
            user_agent,
            action,
            status,
            created_at
          )
        `)
        .eq('is_blocked', true)
        .order('last_attempt', { ascending: false });

      if (searchTerm) {
        query.ilike('ip_address', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Мутация для разблокировки
  const unblockMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('auth_attempts')
        .update({
          is_blocked: false,
          attempt_count: 0,
          blocked_until: null
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['blocked-users']);
      toast.success('Пользователь разблокирован');
    },
    onError: (error) => {
      toast.error(`Ошибка при разблокировке: ${error.message}`);
    }
  });

  // Получаем статистику
  const { data: stats } = useQuery({
    queryKey: ['security-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_security_stats');
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Безопасность</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-background rounded-lg border">
              <h3 className="font-medium">Активные блокировки</h3>
              <p className="text-2xl">{stats?.active_blocks || 0}</p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <h3 className="font-medium">Попытки входа (24ч)</h3>
              <p className="text-2xl">{stats?.login_attempts_24h || 0}</p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <h3 className="font-medium">Подозрительная активность</h3>
              <p className="text-2xl">{stats?.suspicious_activity || 0}</p>
            </div>
          </div>

          <div className="mb-4">
            <Input
              placeholder="Поиск по IP"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP адрес</TableHead>
                  <TableHead>Попыток</TableHead>
                  <TableHead>Последняя попытка</TableHead>
                  <TableHead>Блокировка до</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blockedUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.ip_address}</TableCell>
                    <TableCell>{user.attempt_count}</TableCell>
                    <TableCell>
                      {new Date(user.last_attempt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(user.blocked_until).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unblockMutation.mutate(user.id)}
                      >
                        Разблокировать
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 