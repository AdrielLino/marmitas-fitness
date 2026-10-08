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

function redimensionar(file, max = 900) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error("falhou"))), "image/jpeg", 0.8);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function FotoProduto({ p, onChange, aviso }) {
  const [enviando, setEnviando] = useState(false);

  async function escolher(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEnviando(true);
    try {
      const blob = await redimensionar(file);
      const nome = `${p.id}-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("fotos").upload(nome, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      const { data } = supabase.storage.from("fotos").getPublicUrl(nome);
      await onChange(data.publicUrl);
    } catch (err) {
      aviso("Erro ao enviar a foto.");
    }
    setEnviando(false);
    e.target.value = "";
  }

  return (
    <div className="f">Foto
      {p.foto_url && <img src={p.foto_url} alt="" className="foto-prev" />}
      <label className="btn s g" style={{ cursor: "pointer" }}>
        {enviando ? "Enviando..." : p.foto_url ? "Trocar foto" : "Escolher foto"}
        <input type="file" accept="image/*" onChange={escolher} hidden />
      </label>
      {p.foto_url && <button className="btn s r" onClick={() => onChange(null)}>Remover foto</button>}
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
            <FotoProduto p={p} onChange={(url) => salvarProd(p.id, { foto_url: url })} aviso={aviso} />
            <div className="acoes">
              <label className="chk"><input type="checkbox" checked={p.na_semana}
                onChange={(e) => salvarProd(p.id, { na_semana: e.target.checked })} />Na semana</label>
              <label className="chk"><input type="checkbox" checked={p.esgotado}
                onChange={(e) => salvarProd(p.id, { esgotado: e.target.checked })} />Esgotada</label>
              <label className="chk"><input type="checkbox" checked={!!p.sem_desconto}
                onChange={(e) => salvarProd(p.id, { sem_desconto: e.target.checked })} />Fora do desconto</label>
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
