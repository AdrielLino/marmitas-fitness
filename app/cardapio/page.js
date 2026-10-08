"use client";
import { useEffect, useState } from "react";
import { supabase, brl, calcTotal } from "../../lib/supabase";

export default function Cardapio() {
  const [cfg, setCfg] = useState(null);
  const [prods, setProds] = useState([]);
  const [qtd, setQtd] = useState({});
  const [obs, setObs] = useState("");

  useEffect(() => {
    (async () => {
      const { data: c } = await supabase.from("configuracoes").select("*").eq("id", 1).single();
      const { data: p } = await supabase
        .from("produtos").select("*").eq("na_semana", true)
        .order("ordem").order("nome");
      setCfg(c);
      setProds(p || []);
    })();
  }, []);

  const mudar = (id, d) => setQtd((q) => ({ ...q, [id]: Math.max(0, (q[id] || 0) + d) }));
  const itens = prods.filter((p) => qtd[p.id] > 0);
  const excecoes = prods.filter((p) => p.sem_desconto).map((p) => p.nome);
  const total = calcTotal(itens.flatMap((p) => Array(qtd[p.id]).fill({ preco: p.preco, fixo: p.sem_desconto })), cfg);
  const totalQtd = itens.reduce((s, p) => s + qtd[p.id], 0);

  function pedir() {
    let msg = "Olá! Quero pedir:\n" + itens.map((p) => `${qtd[p.id]}x ${p.nome}`).join("\n");
    msg += `\n\nTotal: ${brl(total)}`;
    if (obs.trim()) msg += `\n\nObservações: ${obs.trim()}`;
    window.open(`https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  if (!cfg) return <div className="wrap"><header><h1>Carregando cardápio...</h1></header></div>;
  const aberto = cfg.pedidos_abertos;

  return (
    <div className="wrap">
      <header>
        <h1>Marmitas Fit Congeladas</h1>
        <p><a href="/" style={{ color: "#fff" }}>← Início</a> · Cardápio da semana</p>
      </header>
      {cfg.combo_qtd > 0 && (
        <div className="aviso">
          A partir de {cfg.combo_qtd} marmitas, cada uma sai por {brl(cfg.combo_preco)}!
          {excecoes.length > 0 && ` (exceto: ${excecoes.join(", ")})`}
        </div>
      )}
      {!aberto && <div className="aviso">Pedidos fechados no momento. {cfg.aviso}</div>}
      {aberto && cfg.aviso && <div className="aviso">{cfg.aviso}</div>}

      {prods.length === 0 && <div className="box">O cardápio desta semana ainda não foi publicado.</div>}

      {prods.map((p) => (
        <div key={p.id} className={"card" + (p.esgotado ? " off" : "")}>
        {p.foto_url && <img src={p.foto_url} alt={p.nome} className="thumb" />}
          <div>
            <b>{p.nome}</b>
            <span>{p.descricao}{p.sem_desconto ? " (preço fixo, fora do desconto)" : ""}</span>
            {p.esgotado ? (
              <div className="qty">Esgotada</div>
            ) : (
              aberto && (
                <div className="qty">
                  <button onClick={() => mudar(p.id, -1)}>−</button>
                  {qtd[p.id] || 0}
                  <button onClick={() => mudar(p.id, 1)}>+</button>
                </div>
              )
            )}
          </div>
          <div className="preco">{brl(p.preco)}</div>
        </div>
      ))}

      {aberto && prods.length > 0 && (
        <div className="obs">
          <textarea rows={3} value={obs} onChange={(e) => setObs(e.target.value)}
            placeholder="Nome, bairro ou observação (opcional). Ex.: sem cebola" />
        </div>
      )}

      {aberto && (
        <div className="bar">
          <div>
            <div className="tot"><span>{totalQtd} marmita(s)</span><span>{brl(total)}</span></div>
            <button className="btn" disabled={totalQtd === 0} onClick={pedir}>Pedir pelo WhatsApp</button>
          </div>
        </div>
      )}
    </div>
  );
}
