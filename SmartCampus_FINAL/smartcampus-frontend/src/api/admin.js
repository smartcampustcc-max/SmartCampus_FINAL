
import http from "./http";

export async function importTurmasCsv(file, curso_sigla) {
  const form = new FormData();
  form.append("file", file);
  form.append("curso_sigla", curso_sigla);

  const { data } = await http.post("/admin/import/turmas-csv", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function listarTurmas(curso_id) {
  const params = curso_id ? { curso_id } : {};
  const { data } = await http.get("/admin/turmas", { params });
  return data;
}