import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const brl = (n) =>
  Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Desconto: a partir de `combo_qtd` marmitas (somando todas), cada uma sai por `combo_preco`
// (ou menos, se o preço dela já for menor). Produtos "fora do desconto" mantêm o preço deles.
// itens = [{ preco, fixo }, ...], uma entrada por marmita.
export function calcTotal(itens, cfg) {
  const n = cfg?.combo_qtd || 0;
  const pd = Number(cfg?.combo_preco || 0);
  const desconto = n > 0 && pd > 0 && itens.length >= n;
  return itens.reduce((s, i) => {
    const p = Number(i.preco);
    return s + (desconto && !i.fixo ? Math.min(p, pd) : p);
  }, 0);
}
