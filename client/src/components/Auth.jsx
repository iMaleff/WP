import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import supabase from '@/utils/supabase';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 60; // в секундах
const PERMANENT_BLOCK_ATTEMPTS = 7;
const MAX_LENGTH = 40; // Увеличиваем максимальную длину до 40 символов

export const Auth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [blockTimer, setBlockTimer] = useState(0);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState({
    login: '',
    password: ''
  });

  useEffect(() => {
    // Проверяем блокировку при загрузке
    checkBlockStatus();
    
    // Запускаем таймер, если есть блокировка
    let interval;
    if (blockTimer > 0) {
      interval = setInterval(() => {
        setBlockTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [blockTimer]);

  const checkBlockStatus = async () => {
    const { data, error } = await supabase
      .from('auth_attempts')
      .select('attempt_count, blocked_until')
      .eq('ip_address', 'CLIENT_IP') // Нужно получить IP клиента
      .single();

    if (data) {
      setAttempts(data.attempt_count);
      if (data.blocked_until) {
        const blockTimeLeft = Math.ceil((new Date(data.blocked_until) - new Date()) / 1000);
        if (blockTimeLeft > 0) {
          setBlockTimer(blockTimeLeft);
        }
      }
    }
  };

  const validateInput = (input, type) => {
    if (!input.trim()) {
      setError(`${type} не может быть пустым`);
      return false;
    }

    if (input.length > MAX_LENGTH) {
      setError(`${type} не может быть длиннее ${MAX_LENGTH} символов`);
      return false;
    }

    if (type === 'Логин') {
      const loginRegex = /^[a-zA-Z0-9@._]+$/;
      if (!loginRegex.test(input)) {
        setError('Логин может содержать только буквы, цифры и символы @._');
        return false;
      }
    }

    if (type === 'Пароль') {
      const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()]+$/;
      if (!passwordRegex.test(input)) {
        setError('Пароль содержит недопустимые символы');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Проверяем блокировку
    if (blockTimer > 0) {
      setError(`Попробуйте через ${blockTimer} секунд`);
      return;
    }

    if (attempts >= PERMANENT_BLOCK_ATTEMPTS) {
      setError('Аккаунт заблокирован. Обратитесь к администратору.');
      return;
    }

    // Валидация
    const login = credentials.login.trim();
    const password = credentials.password.trim();

    if (!validateInput(login, 'Логин') || !validateInput(password, 'Пароль')) {
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: login,
        password: password,
      });

      if (error) {
        // Увеличиваем счетчик попыток
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        // Обновляем в базе
        await supabase.from('auth_attempts').upsert({
          ip_address: 'CLIENT_IP', // Нужно получить IP клиента
          attempt_count: newAttempts,
          last_attempt: new Date().toISOString(),
          is_blocked: newAttempts >= PERMANENT_BLOCK_ATTEMPTS,
          blocked_until: newAttempts >= PERMANENT_BLOCK_ATTEMPTS 
            ? new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() // 3 часа
            : newAttempts >= MAX_ATTEMPTS 
              ? new Date(Date.now() + BLOCK_DURATION * 1000).toISOString()
              : null
        });

        if (newAttempts >= PERMANENT_BLOCK_ATTEMPTS) {
          setError('Аккаунт заблокирован. Обратитесь к администратору.');
        } else if (newAttempts >= MAX_ATTEMPTS) {
          setBlockTimer(BLOCK_DURATION);
          setError(`Слишком много попыток. Попробуйте через ${BLOCK_DURATION} секунд`);
        } else {
          throw error;
        }
      } else if (data.user) {
        // Сброс попыток при успешном входе
        await supabase.from('auth_attempts').upsert({
          ip_address: 'CLIENT_IP',
          attempt_count: 0,
          is_blocked: false,
          blocked_until: null
        });

        toast.success('Вход выполнен успешно!');
        queryClient.invalidateQueries(['session']);
        navigate('/');
      }
    } catch (error) {
      toast.error(`Ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img 
              src="/logo.png" 
              alt="Wellness Puzzle Logo" 
              className="h-20 w-auto"
            />
          </div>
          <CardTitle className="text-2xl text-center">
            Wellness Puzzle
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Добро пожаловать! Войдите в свой аккаунт
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">Логин</Label>
              <Input
                id="login"
                value={credentials.login}
                onChange={(e) => setCredentials(prev => ({ 
                  ...prev, 
                  login: e.target.value.slice(0, MAX_LENGTH)
                }))}
                placeholder="Login"
                disabled={blockTimer > 0}
                maxLength={MAX_LENGTH}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ 
                  ...prev, 
                  password: e.target.value.slice(0, MAX_LENGTH)
                }))}
                placeholder="Password"
                disabled={blockTimer > 0}
                maxLength={MAX_LENGTH}
                required
              />
            </div>

            {blockTimer > 0 && (
              <p className="text-sm text-muted-foreground text-center">
                Повторите попытку через: {blockTimer} сек
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || blockTimer > 0}
            >
              {loading ? 'Загрузка...' : 'Войти'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth; 