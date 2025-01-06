import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MagnifyingGlassIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import supabase from '@/utils/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loading } from "@/components/ui/loading"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { PerPageSelect } from "@/components/ui/per-page-select"
import { SortIcon } from "@/components/ui/sort-icon"
import { SecurityPanel } from "@/components/admin/SecurityPanel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const ROLES = [
  { value: 'reader', label: 'Читатель' },
  { value: 'editor', label: 'Редактор' },
  { value: 'admin', label: 'Администратор' }
];

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [newUser, setNewUser] = useState({ email: '', password: '' });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Получаем список пользователей
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Мутация для создания пользователя
  const createUser = useMutation({
    mutationFn: async ({ email, password }) => {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          email,
          username: email.split('@')[0],
          role: 'reader'
        }]);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Пользователь успешно создан');
      setNewUser({ email: '', password: '' });
    },
    onError: (error) => {
      toast.error(`Ошибка: ${error.message}`);
    }
  });

  // Мутация для обновления роли пользователя
  const updateRole = useMutation({
    mutationFn: async ({ userId, role }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Роль пользователя обновлена');
    },
    onError: (error) => {
      toast.error(`Ошибка: ${error.message}`);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createUser.mutate(newUser);
  };

  // Функция для экспорта пользователей в CSV
  const exportUsers = () => {
    const headers = ['Email', 'Имя пользователя', 'Роль', 'Дата регистрации'];
    const csvData = filteredUsers.map(user => [
      user.email,
      user.username,
      ROLES.find(r => r.value === user.role)?.label || user.role,
      new Date(user.created_at).toLocaleDateString('ru-RU')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Фильтрация пользователей
  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Сортировка и пагинация
  const sortedAndFilteredUsers = React.useMemo(() => {
    let result = filteredUsers ? [...filteredUsers] : [];

    // Сортировка
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [filteredUsers, sortConfig]);

  // Пагинация
  const paginatedUsers = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredUsers.slice(start, start + itemsPerPage);
  }, [sortedAndFilteredUsers, currentPage]);

  const pageCount = Math.ceil(sortedAndFilteredUsers.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const [dialogState, setDialogState] = useState({
    isOpen: false,
    userId: null,
    newRole: null
  });

  // Обновляем функцию изменения роли
  const handleRoleChange = (userId, newRole) => {
    setDialogState({
      isOpen: true,
      userId,
      newRole
    });
  };

  const handleConfirmRoleChange = () => {
    updateRole.mutate({
      userId: dialogState.userId,
      role: dialogState.newRole
    });
    setDialogState({ isOpen: false, userId: null, newRole: null });
  };

  // Функция для отображения пагинации
  const renderPagination = () => {
    const maxVisiblePages = 5;
    const pages = [];
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <PaginationItem key="1">
          <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        pages.push(
          <PaginationItem key="ellipsis-1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < pageCount) {
      if (endPage < pageCount - 1) {
        pages.push(
          <PaginationItem key="ellipsis-2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      pages.push(
        <PaginationItem key={pageCount}>
          <PaginationLink onClick={() => setCurrentPage(pageCount)}>
            {pageCount}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loading size="lg" />
        <p className="text-muted-foreground">Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Создать нового пользователя</CardTitle>
              <CardDescription>
                Создайте нового пользователя с базовыми правами доступа
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={createUser.isPending}
                  >
                    {createUser.isPending ? 'Создание...' : 'Создать пользователя'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Список пользователей</CardTitle>
              <CardDescription>
                Управляйте пользователями и их ролями
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative w-full sm:w-72">
                  <Input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Поиск пользователей..."
                    className="pl-10"
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Все роли" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все роли</SelectItem>
                    {ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={exportUsers}
                  className="flex items-center gap-2"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  <span>Экспорт</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      onClick={() => handleSort('email')} 
                      className="cursor-pointer group hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>Email</span>
                        <SortIcon 
                          direction={sortConfig.direction} 
                          active={sortConfig.key === 'email'} 
                          className="transition-transform group-hover:opacity-100" 
                        />
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort('username')} 
                      className="cursor-pointer group hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>Имя пользователя</span>
                        <SortIcon 
                          direction={sortConfig.direction} 
                          active={sortConfig.key === 'username'} 
                          className="transition-transform group-hover:opacity-100" 
                        />
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Роль</TableHead>
                    <TableHead className="hidden md:table-cell">Дата регистрации</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col md:hidden mb-2">
                          <span className="font-medium">Email:</span>
                        </div>
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col md:hidden mb-2">
                          <span className="font-medium">Имя пользователя:</span>
                        </div>
                        {user.username}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col md:hidden mb-2">
                          <span className="font-medium">Роль:</span>
                        </div>
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Выберите роль" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map(role => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col md:hidden mb-2">
                          <span className="font-medium">Дата регистрации:</span>
                        </div>
                        {new Date(user.created_at).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary/80"
                        >
                          Подробнее
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <PerPageSelect value={itemsPerPage} onChange={setItemsPerPage} />
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Показано {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedAndFilteredUsers.length)} из {sortedAndFilteredUsers.length}
              </span>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                {renderPagination()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
                    disabled={currentPage === pageCount}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>

          <Dialog open={dialogState.isOpen} onOpenChange={(open) => !open && setDialogState({ isOpen: false, userId: null, newRole: null })}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Изменение роли пользователя</DialogTitle>
                <DialogDescription>
                  Вы уверены, что хотите изменить роль пользователя? Это действие нельзя отменить.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogState({ isOpen: false, userId: null, newRole: null })}>
                  Отмена
                </Button>
                <Button onClick={handleConfirmRoleChange}>
                  Подтвердить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        <TabsContent value="security">
          <SecurityPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard; 