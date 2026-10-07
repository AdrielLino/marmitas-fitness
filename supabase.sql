create table configuracoes (
  id int primary key default 1 check (id = 1),
  whatsapp text not null default '5531999999999',
  aviso text default '',
  pedidos_abertos boolean default true,
  combo_qtd int not null default 5,
  combo_preco numeric(10,2) not null default 12
);
insert into configuracoes (id) values (1);

create table produtos (
  id bigint generated always as identity primary key,
  nome text not null,
  descricao text default '',
  preco numeric(10,2) not null default 14,
  na_semana boolean default false,
  esgotado boolean default false,
  ordem int default 0
);

alter table configuracoes enable row level security;
alter table produtos enable row level security;
create policy "leitura publica" on configuracoes for select using (true);
create policy "leitura publica" on produtos for select using (true);
create policy "admin escreve" on configuracoes for all to authenticated using (true) with check (true);
create policy "admin escreve" on produtos for all to authenticated using (true) with check (true);

insert into produtos (nome, descricao, preco, na_semana, ordem) values
('Opção 01', 'Arroz integral ou branco, feijão carioca, chuchu refogado e carne moída', 14, true, 1),
('Opção 02', 'Arroz integral ou branco, purê de batata e coxa desossada de frango assada', 14, true, 2),
('Opção 03', 'Espaguete ao molho bolonhesa', 14, true, 3),
('Opção 04', 'Iscas de lombo, purê de moranga e cenouras', 14, true, 4),
('Opção 05', 'Panqueca de frango com espinafre e queijo', 14, true, 5);
