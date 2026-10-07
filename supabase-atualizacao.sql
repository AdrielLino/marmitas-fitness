-- Só rode se você JÁ executou o supabase.sql de uma versão anterior.
alter table configuracoes add column if not exists combo_qtd int not null default 5;
alter table configuracoes add column if not exists combo_preco numeric(10,2) not null default 12;
alter table configuracoes alter column combo_preco set default 12;
update configuracoes set combo_preco = 12 where id = 1;
alter table produtos alter column preco set default 14;
