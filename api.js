/**
 * ============================================================================
 * Campus Hub - api.js
 * Mengambil & Menampilkan Data Public API (JSONPlaceholder)
 * Semua fungsi di sini langsung dipanggil dari api.html lewat onclick / onkeyup!
 * ============================================================================
 */

const API_URL = "https://jsonplaceholder.typicode.com/posts?_limit=9";
let postsData = [];

// 1. Fungsi Utama Mengambil Data dari Public API (Dipanggil oleh onclick="loadFeed()" di HTML)
async function loadFeed() {
  const loading = document.getElementById("loading-state");
  const errorState = document.getElementById("error-state");
  const errorMessage = document.getElementById("error-message");
  const grid = document.getElementById("api-cards-grid");

  // Tampilkan loading, sembunyikan error
  if (loading) loading.style.display = "block";
  if (errorState) errorState.style.display = "none";
  if (grid) grid.innerHTML = "";

  try {
    // Mengirim HTTP request GET ke Public API
    const response = await fetch(API_URL, { method: "GET" });

    // Cek apakah server merespon sukses
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Mengubah data respon menjadi JSON
    const data = await response.json();
    postsData = data;

    // Tampilkan kartu data ke HTML
    renderCards(postsData);
  } catch (err) {
    console.error("Gagal fetch data dari API:", err);
    if (errorState) {
      errorState.style.display = "block";
      if (errorMessage) {
        errorMessage.textContent = err.message || "Gagal memuat data dari server.";
      }
    }
  } finally {
    // Matikan loading setelah selesai
    if (loading) loading.style.display = "none";
  }
}

// 2. Fungsi Pencarian Postingan (Dipanggil oleh onkeyup="cariPostingan()" di HTML)
function cariPostingan() {
  const searchInput = document.getElementById("api-search-input");
  const keyword = searchInput.value.toLowerCase().trim();

  // Filter data berdasarkan kata kunci judul atau isi
  const filtered = postsData.filter(
    (item) =>
      item.title.toLowerCase().includes(keyword) ||
      item.body.toLowerCase().includes(keyword)
  );

  renderCards(filtered);
}

// 3. Fungsi Render Kartu ke HTML
function renderCards(posts) {
  const grid = document.getElementById("api-cards-grid");
  const countEl = document.getElementById("data-count");

  if (!grid) return;

  if (countEl) {
    countEl.textContent = `Menampilkan ${posts.length} postingan dari Public API ✨`;
  }

  if (posts.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: white; border-radius: 20px;">
        <p style="color: #64748b;">Tidak ada data yang cocok dengan pencarian.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = posts
    .map(
      (item) => `
      <div class="api-card">
        <div class="api-card-top">
          <span class="task-category">Post #${item.id}</span>
          <span class="api-id-badge">User #${item.userId}</span>
        </div>

        <h3 style="margin-top: 10px; font-size: 16px; font-weight: 700; color: var(--text-main); text-transform: capitalize;">
          ${escapeHTML(item.title)}
        </h3>
        <p style="margin-top: 8px; font-size: 13px; color: var(--text-muted); line-height: 1.5;">
          ${escapeHTML(item.body)}
        </p>
      </div>
    `
    )
    .join("");
}

// Sanitasi teks sederhana agar aman
function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Jalankan pengambilan data API otomatis saat halaman pertama kali dibuka
document.addEventListener("DOMContentLoaded", () => {
  loadFeed();
});
