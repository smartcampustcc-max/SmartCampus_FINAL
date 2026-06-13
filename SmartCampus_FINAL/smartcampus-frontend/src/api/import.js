import api from "./http";
import { getToken } from "./auth";

export async function importarTurmasCsv(file, curso_sigla) {
  if (!file) throw new Error("Seleciona um ficheiro CSV primeiro.");
  if (!curso_sigla) throw new Error("curso_sigla é obrigatório (ex: IG).");

  const fd = new FormData();
  fd.append("file", file);
  fd.append("curso_sigla", curso_sigla);

  const token = getToken();

  const res = await api.post("/admin/import/turmas-csv", fd, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),

    },
  });

  return res.data;
}