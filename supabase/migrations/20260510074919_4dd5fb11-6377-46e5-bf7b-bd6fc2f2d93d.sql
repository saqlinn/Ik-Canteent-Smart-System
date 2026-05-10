
insert into storage.buckets (id, name, public) values ('menu-images', 'menu-images', true) on conflict (id) do nothing;

create policy "Public read menu images" on storage.objects for select using (bucket_id = 'menu-images');
create policy "Admins upload menu images" on storage.objects for insert with check (bucket_id = 'menu-images' and public.has_role(auth.uid(), 'admin'));
create policy "Admins update menu images" on storage.objects for update using (bucket_id = 'menu-images' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete menu images" on storage.objects for delete using (bucket_id = 'menu-images' and public.has_role(auth.uid(), 'admin'));
