-- Включаем необходимые расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Создаем таблицу для rate limiting если её нет
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ip_address TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    requests_count INTEGER DEFAULT 1,
    first_request TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_request TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем индексы если их нет
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_rate_limits_ip_endpoint') THEN
        CREATE INDEX idx_rate_limits_ip_endpoint ON rate_limits(ip_address, endpoint);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_rate_limits_time') THEN
        CREATE INDEX idx_rate_limits_time ON rate_limits(last_request);
    END IF;
END$$;

-- Удаляем существующие функции и триггеры
DROP TRIGGER IF EXISTS cleanup_old_rate_limits ON rate_limits;
DROP FUNCTION IF EXISTS trigger_cleanup_rate_limits();
DROP FUNCTION IF EXISTS cleanup_rate_limits();
DROP FUNCTION IF EXISTS check_rate_limit(TEXT, TEXT, INTEGER, INTEGER);

-- Создаем функции заново
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM rate_limits 
    WHERE last_request < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_cleanup_rate_limits()
RETURNS trigger AS $$
BEGIN
    DELETE FROM rate_limits 
    WHERE last_request < NOW() - INTERVAL '1 hour';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_old_rate_limits
    AFTER INSERT ON rate_limits
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_cleanup_rate_limits();

CREATE OR REPLACE FUNCTION check_rate_limit(
    _ip_address TEXT,
    _endpoint TEXT,
    _max_requests INTEGER DEFAULT 100,
    _window_seconds INTEGER DEFAULT 3600
) RETURNS boolean AS $$
DECLARE
    existing_record RECORD;
BEGIN
    SELECT * INTO existing_record
    FROM rate_limits
    WHERE ip_address = _ip_address
    AND endpoint = _endpoint
    AND last_request > NOW() - (_window_seconds || ' seconds')::interval;

    IF existing_record IS NULL THEN
        INSERT INTO rate_limits (ip_address, endpoint)
        VALUES (_ip_address, _endpoint);
        RETURN true;
    ELSIF existing_record.requests_count >= _max_requests THEN
        RETURN false;
    ELSE
        UPDATE rate_limits
        SET requests_count = requests_count + 1,
            last_request = NOW()
        WHERE id = existing_record.id;
        RETURN true;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Включаем RLS и создаем политики
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can view rate limits" ON rate_limits;
CREATE POLICY "Only admins can view rate limits"
ON rate_limits FOR SELECT
TO authenticated
USING (
    auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    )
); 