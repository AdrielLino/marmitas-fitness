"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

function Login() {
  const ADMIN_USERNAME = "Eliana";
  const ADMIN_EMAIL = "adriel.lino06@gmail.com";
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function entrar(e) {
    e.preventDefault();

    if (username !== ADMIN_USERNAME) {
      setErro("Usuário ou senha incorretos.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: senha
    });

    if (error) {
      setErro("Usuário ou senha incorretos.");
    }
  }

  return (
    <div className="wrap">
      <header><h1>Painel das marmitas</h1><p><a href="/" style={{ color: "#fff" }}>← Início</a></p></header>
      <form className="box" onSubmit={entrar}>
        <div className="f">Usuário<input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
        <div className="f">Senha<input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required /></div>
        <button className="btn g">Entrar</button>
        {erro && <p className="msg" style={{ color: "#b3402a" }}>{erro}</p>}
      </form>
    </div>
  );
}

function Painel() {
  const [cfg, setCfg] = useState(null);
  const [prods, setProds] = useState([]);
  const [msg, setMsg] = useState("");

  async function carregar() {
    const { data: c } = await supabase.from("configuracoes").select("*").eq("id", 1).single();
    const { data: p } = await supabase.from("produtos").select("*").order("ordem").order("nome");
    setCfg(c);
    setProds(p || []);
  }
  useEffect(() => { carregar(); }, []);

  const aviso = (t) => { setMsg(t); setTimeout(() => setMsg(""), 2500); };

  async function salvarCfg(campos) {
    const { error } = await supabase.from("configuracoes").update(campos).eq("id", 1);
    if (error) return aviso("Erro ao salvar.");
    setCfg({ ...cfg, ...campos });
    aviso("Salvo!");
  }

  async function salvarProd(id, campos) {
    const { error } = await supabase.from("produtos").update(campos).eq("id", id);
    if (error) return aviso("Erro ao salvar.");
    setProds(prods.map((p) => (p.id === id ? { ...p, ...campos } : p)));
    aviso("Salvo!");
  }

  async function adicionar() {
    const { error } = await supabase.from("produtos")
      .insert({ nome: "Novo produto", preco: 14, ordem: prods.length + 1 });
    if (error) return aviso("Erro ao adicionar.");
    carregar();
  }

  async function apagar(id) {
    if (!confirm("Apagar este produto de vez?")) return;
    await supabase.from("produtos").delete().eq("id", id);
    carregar();
  }

  if (!cfg) return <div className="wrap"><header><h1>Carregando...</h1></header></div>;

  return (
    <div className="wrap">
      <header>
        <h1>Painel das marmitas</h1>
        <p>{msg || "Alterações são salvas ao sair do campo."}</p>
      </header>

      <div className="box">
        <h2>Pedidos</h2>
        <label className="chk">
          <input type="checkbox" checked={cfg.pedidos_abertos}
            onChange={(e) => salvarCfg({ pedidos_abertos: e.target.checked })} />
          Pedidos abertos
        </label>
        <div className="f">Aviso no topo (prazo, entrega...)
          <input defaultValue={cfg.aviso} placeholder="Pedidos até quinta, entrega sexta"
            onBlur={(e) => salvarCfg({ aviso: e.target.value })} />
        </div>
        <div className="f">WhatsApp (55 + DDD + número, só números)
          <input defaultValue={cfg.whatsapp} inputMode="numeric"
            onBlur={(e) => salvarCfg({ whatsapp: e.target.value.replace(/\D/g, "") })} />
        </div>
        <div className="f">Desconto a partir de (marmitas)
          <input type="number" min="0" defaultValue={cfg.combo_qtd}
            onBlur={(e) => salvarCfg({ combo_qtd: Number(e.target.value) })} />
        </div>
        <div className="f">Preço de cada marmita no desconto (R$)
          <input type="number" step="0.01" min="0" defaultValue={cfg.combo_preco}
            onBlur={(e) => salvarCfg({ combo_preco: Number(e.target.value) })} />
        </div>
        <a className="msg" href="/cardapio" target="_blank">Ver cardápio como o cliente vê</a>
      </div>

      <div className="box">
        <h2>Produtos</h2>
        <p className="msg" style={{ color: "#66705f", marginBottom: 0 }}>
          Marque "Na semana" para o produto aparecer no cardápio.
        </p>
        {prods.map((p) => (
          <div className="prod" key={p.id}>
            <div className="f">Nome<input defaultValue={p.nome} onBlur={(e) => salvarProd(p.id, { nome: e.target.value })} /></div>
            <div className="f">O que vem na marmita
              <textarea rows={2} defaultValue={p.descricao} onBlur={(e) => salvarProd(p.id, { descricao: e.target.value })} />
            </div>
            <div className="f">Preço (R$)
              <input type="number" step="0.01" min="0" defaultValue={p.preco}
                onBlur={(e) => salvarProd(p.id, { preco: Number(e.target.value) })} />
            </div>
            <div className="acoes">
              <label className="chk"><input type="checkbox" checked={p.na_semana}
                onChange={(e) => salvarProd(p.id, { na_semana: e.target.checked })} />Na semana</label>
              <label className="chk"><input type="checkbox" checked={p.esgotado}
                onChange={(e) => salvarProd(p.id, { esgotado: e.target.checked })} />Esgotada</label>
              <button className="btn s r" onClick={() => apagar(p.id)}>Apagar</button>
            </div>
          </div>
        ))}
        <div className="prod"><button className="btn g" onClick={adicionar}>Adicionar produto</button></div>
      </div>

      <div className="box">
        <button className="btn s g" onClick={() => supabase.auth.signOut()}>Sair</button>
      </div>
    </div>
  );
}

export default function Admin() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  if (user === undefined) return null;
  return user ? <Painel /> : <Login />;
}
