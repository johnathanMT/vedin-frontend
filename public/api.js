// ============================================================================
//  api.js  —  Frontend API client for MTN Portfolio
//  Frontend : the deployed site origin (GitHub Pages or a custom domain)
//  Backend  : configurable — see BASE_URL below (Render, .NET 8 API)
//  Database : Aiven MySQL (accessed only by the backend)
//
//  This file is served verbatim from /public (NOT processed by Vite), so it
//  can't read import.meta.env. The API origin is therefore taken from an
//  optional global `window.SITE_CONFIG.apiUrl` (which the postbuild injector or
//  an inline <script> can set), falling back to the default below.
//
//  Verified against the live Swagger contract (/swagger/v1/swagger.json):
//   - POST /api/Auth/login     body JSON  { email, password }
//   - POST /api/Auth/register  body JSON  { username, email, password, adminSecret? }
//   - GET  /api/Articles       query: page, pageSize, published, tag, search
//   - GET  /api/Articles/{id}
//   - POST /api/Articles       multipart/form-data (Title, Content, Author req.;
//                              Image, Tags, IsPublished, PublishedDate optional)
//   - PUT  /api/Articles/{id}  multipart/form-data (same fields, all optional)
//   - DELETE /api/Articles/{id}
//  All responses are wrapped: { success, message, data, errors, statusCode }.
// ============================================================================
 
const PortfolioAPI = (() => {
  // Single configurable backend origin. Override at runtime by defining
  // `window.SITE_CONFIG = { apiUrl: "https://your-api.example.com" }` before
  // this script loads; otherwise the default is used.
  const BASE_URL = (window.SITE_CONFIG && window.SITE_CONFIG.apiUrl) || "https://myweb-zqv1.onrender.com";

  // SECURITY: the admin JWT + user object live ONLY in memory — never in
  // localStorage. An XSS payload therefore cannot read the token, and it is
  // wiped on tab close OR any full page reload (re-login required — intended
  // for a single admin who prefers a zero-persistence session).
  let _token = null;
  let _user  = null;
  const VISITOR_KEY = "mtn_visitor";   // anonymous, non-sensitive → may persist

  // Stable anonymous visitor id for like/reaction dedupe (no login, no PII)
  const visitorId = () => {
    let v = localStorage.getItem(VISITOR_KEY);
    if (!v) {
      v = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VISITOR_KEY, v);
    }
    return v;
  };

  const getToken = () => _token;
  const setToken = (t) => { _token = t; };
  const clearToken = () => { _token = null; };
  const isLoggedIn = () => !!_token;

  // Current user (id, username, email, role) — in memory only, for UI scoping.
  const setUser = (u) => { _user = u; };
  const getCurrentUser = () => _user;
  const isAdmin  = () => getCurrentUser()?.role === "Admin";
  const isAuthor = () => ["Admin", "Author"].includes(getCurrentUser()?.role);
 
  // ---- Core request helper ------------------------------------------------
  async function request(path, { method = "GET", body, auth = false, isForm = false, keepSessionOn401 = false } = {}) {
    const headers = { "X-Visitor-Id": visitorId() };
    // For FormData, DO NOT set Content-Type — the browser adds the multipart boundary.
    if (!isForm && body !== undefined) headers["Content-Type"] = "application/json";
    if (auth && getToken()) headers["Authorization"] = `Bearer ${getToken()}`;
 
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
 
    // keepSessionOn401 → don't wipe the session; fall through so the backend
    // message (e.g. "Current password is incorrect.") surfaces as an error.
    if (res.status === 401 && !keepSessionOn401) {
      clearToken();
      setUser(null);                       // clear stale session fully
      throw new Error("Unauthorized — please log in again.");
    }
    if (res.status === 403) throw new Error("You do not have permission (admin required).");
    if (res.status === 429) throw new Error("Too many requests — please slow down.");
 
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON body (e.g. proxy error page) */ }
    if (!res.ok) {
      // Surface EVERYTHING the backend sent so failures are debuggable in the console:
      // status, the ApiResponse.message, and any errors[] detail (stack trace when
      // the server has detailed errors enabled).
      console.error(
        `[api] ${method} ${path} → ${res.status} ${res.statusText}`,
        { message: json?.message, errors: json?.errors, raw: text }
      );
      const detail = json?.errors && json.errors.length ? ` — ${json.errors.join("; ")}` : "";
      const msg = (json?.message || `Request failed (${res.status})`) + detail;
      throw new Error(msg);
    }
    return json; // ApiResponse wrapper: { success, message, data, errors, statusCode }
  }
 
  // ---- Auth ---------------------------------------------------------------
  // NOTE: login uses EMAIL (per LoginDto), not username.
  async function login(email, password) {
    const resp = await request("/api/Auth/login", { method: "POST", body: { email, password } });
    const d = resp?.data;
    if (d?.token) {
      setToken(d.token);
      setUser({ id: d.id, username: d.username, email: d.email, role: d.role });
    }
    return resp; // resp.data = { id, token, username, email, role, expiresAt }
  }
 
  // adminSecret is optional — include it only if registering an admin account.
  async function register(username, email, password, adminSecret) {
    const body = { username, email, password };
    if (adminSecret) body.adminSecret = adminSecret;
    return request("/api/Auth/register", { method: "POST", body });
  }
 
  const logout = () => { clearToken(); setUser(null); };

  // Change the signed-in user's password. auth:true attaches the Bearer token;
  // keepSessionOn401 lets a wrong CURRENT password surface as an error toast
  // instead of silently logging the user out.
  async function changePassword(currentPassword, newPassword) {
    return request("/api/Auth/change-password", {
      method: "POST", auth: true, keepSessionOn401: true,
      body: { currentPassword, newPassword },
    });
  }

  // ---- Articles -----------------------------------------------------------
  // published: true (published only), false (drafts only), or "all" (admins).
  // The token is sent when logged in so Authors also receive their own drafts.
  function getArticles({ page = 1, pageSize = 10, published = true, tag, search } = {}) {
    console.log('[api] getArticles() → about to fetch', `${BASE_URL}/api/Articles`, { page, pageSize, published });
    const q = new URLSearchParams({ page, pageSize });
    if (published === "all" || published === null) {
      q.set("published", ""); // empty -> backend treats as "all" (admin only)
    } else {
      q.set("published", published);
    }
    if (tag) q.set("tag", tag);
    if (search) q.set("search", search);
    return request(`/api/Articles?${q.toString()}`, { auth: true });
  }
 
  const getArticle = (id) => request(`/api/Articles/${id}`);
 
  // Build the multipart body the API expects (PascalCase field names).
  // `image` is a File object from an <input type="file">, optional.
  function buildArticleForm({ title, content, author, image, galleryImages, video, imageUrls, tags, isPublished, publishedDate }) {
    const form = new FormData();
    if (title != null) form.append("Title", title);
    if (content != null) form.append("Content", content);
    if (author != null) form.append("Author", author);
    if (image) form.append("Image", image);                                   // primary / cover
    if (Array.isArray(galleryImages)) galleryImages.forEach(f => form.append("GalleryImages", f)); // extra image files
    if (Array.isArray(imageUrls))     imageUrls.forEach(u => form.append("ImageUrls", u));         // extra hosted URLs
    if (video) form.append("Video", video);                                   // optional video file
    if (tags != null) form.append("Tags", tags);
    if (isPublished != null) form.append("IsPublished", isPublished);
    if (publishedDate != null) form.append("PublishedDate", publishedDate);
    return form;
  }
 
  const createArticle = (article) =>
    request("/api/Articles", { method: "POST", body: buildArticleForm(article), auth: true, isForm: true });
 
  const updateArticle = (id, article) =>
    request(`/api/Articles/${id}`, { method: "PUT", body: buildArticleForm(article), auth: true, isForm: true });
 
  const deleteArticle = (id) =>
    request(`/api/Articles/${id}`, { method: "DELETE", auth: true });

  // ---- Gallery image management (Author/Admin) ---------------------------
  const deleteArticleImage = (articleId, imageId) =>
    request(`/api/Articles/${articleId}/images/${imageId}`, { method: "DELETE", auth: true });
  const reorderArticleImages = (articleId, imageIds) =>
    request(`/api/Articles/${articleId}/images/reorder`, { method: "PUT", auth: true, body: { imageIds } });

  // ---- Anonymous interactions (no login; X-Visitor-Id dedupes) ------------
  const likeArticle   = (id) => request(`/api/Articles/${id}/like`,   { method: "POST" });
  const unlikeArticle = (id) => request(`/api/Articles/${id}/like`,   { method: "DELETE" });
  const reactArticle  = (id, reaction) =>
    request(`/api/Articles/${id}/reactions`, { method: "POST", body: { reaction } });

  // ---- Wake the free-tier backend (Render sleeps after ~15 min idle) ------
  // Hit a real CORS-enabled API endpoint, NOT the bare root "/" — the root
  // 301-redirects to /index.html and the redirect has no CORS headers, which
  // spams the console with misleading "blocked by CORS / 301" errors.
  const wakeBackend = () =>
    fetch(`${BASE_URL}/api/Articles?page=1&pageSize=1`, { method: "GET" }).catch(() => {});
 
  return {
    BASE_URL, isLoggedIn, getCurrentUser, isAdmin, isAuthor,
    login, register, logout, changePassword,
    getArticles, getArticle, createArticle, updateArticle, deleteArticle,
    deleteArticleImage, reorderArticleImages,
    likeArticle, unlikeArticle, reactArticle,
    wakeBackend,
  };
})();
 
window.PortfolioAPI = PortfolioAPI;
 