import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const brl = (n) =>
  Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Desconto: a partir de `combo_qtd` marmitas, cada uma sai por `combo_preco` (ou menos, se o preço dela já for menor).
export function calcTotal(precos, cfg) {
  const lista = precos.map(Number);
  const n = cfg?.combo_qtd || 0;
  const pd = Number(cfg?.combo_preco || 0);
  const desconto = n > 0 && pd > 0 && lista.length >= n;
  return lista.reduce((s, x) => s + (desconto ? Math.min(x, pd) : x), 0);
}
