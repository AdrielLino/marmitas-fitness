# Marmitas Fit: cardápio da semana

Tela inicial (`/`), cardápio (`/cardapio`) e painel da dona (`/admin`, com botão discreto "Entrar" na tela inicial). Pedidos vão para o WhatsApp com mensagem pronta.

## 1. Supabase (banco e login)
1. Crie um projeto grátis em supabase.com.
2. SQL Editor > cole o conteúdo de `supabase.sql` > Run.
3. Authentication > Users > Add user: crie o e-mail e a senha dela.
4. Authentication > Sign In / Providers > desative "Allow new users to sign up" (só ela deve ter acesso).
5. Project Settings > API: copie a URL e a chave `anon public`.

## 2. Testar no computador (opcional)
```
cp .env.example .env.local   # preencha as duas variáveis
npm install
npm run dev
```

## 3. Publicar na Vercel
1. Suba esta pasta para um repositório no GitHub.
2. Vercel > Add New Project > importe o repositório.
3. Em Environment Variables, adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy. A tela inicial fica na raiz do link, o cardápio em `/cardapio` e o painel em `/admin`.

## Antes de usar
- No painel, troque o WhatsApp (o padrão é um número de exemplo) e os preços de exemplo.

## Preços
- Preço padrão: R$ 14 por marmita, editável em cada produto no painel.
- Desconto: a partir de 5 marmitas, cada uma sai por R$ 12 (quantidade e valor editáveis no painel). 5 = R$ 60, 6 = R$ 72, 10 = R$ 120.

## Atenção na hospedagem
O plano gratuito da Vercel (Hobby) é só para uso não comercial. Para o uso real, confira os termos da hospedagem escolhida.
