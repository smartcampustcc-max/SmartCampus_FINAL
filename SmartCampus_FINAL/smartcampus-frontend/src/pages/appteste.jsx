import { useState } from "react";
import { login } from "../api/auth";
import { importarTurmasCsv } from "../api/import";

export default function AppTeste() {
  const [file, setFile] = useState(null);
  const [resultado, setResultado] = useState(null);

  async function testarLogin() {
    try {
      const res = await login("10452", "NovaSenha123"); // professor
      console.log("LOGIN OK:", res);
      alert("Login OK ✅");
      setResultado(res);
    } catch (e) {
      console.error(e);
      alert("Erro no login ❌");
      setResultado(e?.response?.data || e.message);
    }
  }

  async function importar() {
    try {
      if (!file) {
        alert("Seleciona um ficheiro CSV primeiro");
        return;
      }

      const res = await importarTurmasCsv(file, "IG");
      setResultado(res);
      alert("Importação OK ✅");
    } catch (e) {
      setResultado(e?.response?.data || e.message);
      alert("Erro na importação ❌");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>AppTeste – Backend</h2>

      <button onClick={testarLogin}>
        Testar Login (Professor)
      </button>

      <br /><br />

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={importar}>
        Importar Turmas CSV
      </button>

      <h3>Resultado</h3>
      <pre>
        {resultado ? JSON.stringify(resultado, null, 2) : "Sem resultado"}
      </pre>
    </div>
  );
}