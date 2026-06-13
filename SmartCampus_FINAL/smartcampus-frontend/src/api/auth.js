import http from "./http";

const TOKEN_KEY = "smartcampus_token";
const USER_KEY = "smartcampus_user";

export function setSession(token, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getToken();
}

export function getRole() {
  const u = getUser();
  const raw = u?.role || u?.tipo || u?.perfil || null;

  if (!raw) return null;

  return String(raw).toLowerCase();
}

export function getSchool() {
  const u = getUser();
  return u?.escola || null;
}

export function getSchoolName() {
  return getSchool()?.nome || "";
}

export async function login(loginValue, password) {
  clearSession();

  const { data } = await http.post("/auth/login", {
    login: loginValue,
    password,
  });

  setSession(data?.token, data?.user);

  return data;
}

export const apiLogin = login;

export async function me() {
  const { data } = await http.get("/me");

  const user = data?.user ?? data;
  setSession(getToken(), user);

  return user;
}

export async function logout() {
  try {
    await http.post("/auth/logout");
  } finally {
    clearSession();
  }
}

export function loginLocal(username, roleFromBackend = null, token = null) {
  const u = (username || "").trim().toLowerCase();

  let role = roleFromBackend || "student";
  if (!roleFromBackend) {
    if (u === "admin") role = "admin";
    else if (u === "professor") role = "professor";
    else if (u === "aluno") role = "aluno";
  }

  const user = {
    username: u,
    role,
    escola: null,
    escola_id: null,
  };

  setSession(token || "mock-token", user);
  return user;
}

export function logoutLocal() {
  clearSession();
}