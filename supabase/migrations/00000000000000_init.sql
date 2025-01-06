-- Создаем enum тип для ролей
CREATE TYPE user_role AS ENUM ('reader', 'editor', 'admin');

-- Создаем таблицу профилей
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    avatar_url TEXT,
    role user_role DEFAULT 'reader',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Триггер для updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Включаем RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
CREATE POLICY "Profiles are viewable by authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can update roles"
ON profiles FOR UPDATE
TO authenticated
USING (
    auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    )
)
WITH CHECK (
    auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    )
);

CREATE POLICY "Only admins can create profiles"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    )
);

-- Создаем первого админа
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Создаем пользователя в auth.users
    INSERT INTO auth.users (
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        role
    ) VALUES (
        'admin@example.com', -- Замените на реальный email
        crypt('admin123', gen_salt('bf')), -- Замените на реальный пароль
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Admin"}',
        NOW(),
        NOW(),
        'authenticated'
    ) RETURNING id INTO user_id;

    -- Создаем профиль админа
    INSERT INTO profiles (
        id,
        email,
        username,
        role
    ) VALUES (
        user_id,
        'admin@example.com', -- Тот же email
        'admin',
        'admin'
    );
END $$;

-- Создаем индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role); 