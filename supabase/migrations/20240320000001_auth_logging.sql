-- Создаем таблицу для логирования если её нет
CREATE TABLE IF NOT EXISTS auth_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    action TEXT NOT NULL,
    status TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем индексы если их нет
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_auth_logs_ip') THEN
        CREATE INDEX idx_auth_logs_ip ON auth_logs(ip_address);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_auth_logs_created') THEN
        CREATE INDEX idx_auth_logs_created ON auth_logs(created_at);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_auth_logs_status') THEN
        CREATE INDEX idx_auth_logs_status ON auth_logs(status);
    END IF;
END$$;

-- Удаляем существующие функции и триггеры
DROP TRIGGER IF EXISTS cleanup_old_auth_logs ON auth_logs;
DROP FUNCTION IF EXISTS trigger_cleanup_auth_logs();
DROP FUNCTION IF EXISTS cleanup_auth_logs();
DROP FUNCTION IF EXISTS log_auth_attempt(TEXT, TEXT, TEXT, TEXT, JSONB);

-- Создаем функции заново
CREATE OR REPLACE FUNCTION cleanup_auth_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM auth_logs 
    WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_cleanup_auth_logs()
RETURNS trigger AS $$
BEGIN
    DELETE FROM auth_logs 
    WHERE created_at < NOW() - INTERVAL '7 days';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_old_auth_logs
    AFTER INSERT ON auth_logs
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_cleanup_auth_logs();

CREATE OR REPLACE FUNCTION log_auth_attempt(
    _ip_address TEXT,
    _user_agent TEXT,
    _action TEXT,
    _status TEXT,
    _details JSONB
) RETURNS void AS $$
BEGIN
    INSERT INTO auth_logs (ip_address, user_agent, action, status, details)
    VALUES (_ip_address, _user_agent, _action, _status, _details);
    
    IF _status = 'failed' THEN
        WITH suspicious_activity AS (
            SELECT COUNT(*) as failed_count
            FROM auth_logs
            WHERE ip_address = _ip_address
            AND status = 'failed'
            AND created_at > NOW() - INTERVAL '1 hour'
        )
        SELECT notify_admin(
            'Подозрительная активность',
            format('IP %s имеет %s неудачных попыток входа за последний час', 
                _ip_address, failed_count)
        )
        FROM suspicious_activity
        WHERE failed_count >= 10;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Включаем RLS и создаем политики
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can view auth logs" ON auth_logs;
CREATE POLICY "Only admins can view auth logs"
ON auth_logs FOR SELECT
TO authenticated
USING (
    auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    )
); 