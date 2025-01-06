-- Создаем bucket для хранения изображений
insert into storage.buckets (id, name)
values ('post-covers', 'post-covers')
on conflict do nothing;

-- Настраиваем политики доступа к bucket
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'post-covers' );

create policy "Authenticated users can upload"
on storage.objects for insert
with check (
  bucket_id = 'post-covers' 
  and auth.role() = 'authenticated'
); 