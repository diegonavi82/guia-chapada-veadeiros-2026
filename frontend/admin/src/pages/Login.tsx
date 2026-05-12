import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../services/api";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      const session = await adminLogin(email, password);
      localStorage.setItem("admin_token", session.token);
      navigate("/");
    } catch {
      setError("Login ou senha invalidos.");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-panel px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl border border-white/10 bg-surface p-8 shadow-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-accent">Admin</p>
        <h1 className="mt-3 text-3xl font-black text-white">Guia Chapada</h1>
        <label className="mt-8 block text-sm text-slate-300">
          Email
          <input className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-accent" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="mt-4 block text-sm text-slate-300">
          Senha
          <input className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-accent" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        <button className="mt-6 w-full rounded-xl bg-accent px-4 py-3 font-black text-panel" type="submit">
          Entrar
        </button>
      </form>
    </main>
  );
}
