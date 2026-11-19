/**
 * ============================================================================
 * Campus Hub - script.js
 * Logika Sederhana Beranda (Mudah Dipahami Mahasiswa)
 * Semua fungsi di sini langsung dipanggil dari HTML lewat atribut onclick / onsubmit!
 * ============================================================================
 */

// 1. Fungsi Toggle Menu Mobile (Dipanggil oleh onclick="toggleNav()" di HTML)
function toggleNav() {
  const menu = document.getElementById("nav-menu");
  const icon = document.getElementById("nav-icon");

  menu.classList.toggle("open");
  if (icon) {
    icon.textContent = menu.classList.contains("open") ? "✕" : "☰";
  }
}

// 2. Fungsi Tambah Streak (Dipanggil oleh onclick="tambahStreak()" di HTML)
function tambahStreak() {
  const streakEl = document.getElementById("streak-count");
  let streak = parseInt(localStorage.getItem("campus_hub_streak"), 10) || 7;

  streak++;
  localStorage.setItem("campus_hub_streak", streak);

  if (streakEl) {
    streakEl.textContent = `${streak} hari berturut-turut`;
  }
  showToast(`🔥 Hebat! Study streak naik jadi ${streak} hari!`, "success");
}

// 3. Fungsi Ganti Kutipan Motivasi (Dipanggil oleh onclick="gantiQuote()" di HTML)
const kumpulanQuotes = [
  "Konsistensi kecil setiap hari akan menghasilkan lompatan besar di masa depan.",
  "Fokus pada proses belajarnya, bukan hanya sekadar nilai di atas kertas.",
  "Jangan takut salah saat coding, error adalah guru terbaik programmer.",
  "Waktu terbaik untuk memulai adalah sekarang, bukan nanti saat deadline mepet."
];
let indeksQuote = 0;

function gantiQuote() {
  const quoteEl = document.getElementById("api-advice-text");
  indeksQuote = (indeksQuote + 1) % kumpulanQuotes.length;

  if (quoteEl) {
    quoteEl.textContent = `"${kumpulanQuotes[indeksQuote]}"`;
  }
  showToast("Inspirasi baru diperbarui! ✨", "success");
}

// 4. Fungsi Validasi Form Kontak (Dipanggil oleh onsubmit="kirimPesan(event)" di HTML)
function kirimPesan(event) {
  event.preventDefault(); // Mencegah halaman reload otomatis

  const nameInput = document.getElementById("name-input");
  const emailInput = document.getElementById("email-input");
  const messageInput = document.getElementById("message-input");
  const formAlert = document.getElementById("form-alert");

  const nama = nameInput.value.trim();
  const email = emailInput.value.trim();
  const pesan = messageInput.value.trim();

  // Validasi 1: Cek apakah ada yang kosong
  if (nama === "" || email === "" || pesan === "") {
    formAlert.style.display = "block";
    formAlert.style.background = "#fef2f2";
    formAlert.style.border = "1px solid #fecaca";
    formAlert.style.color = "#dc2626";
    formAlert.textContent = "Peringatan: Semua kolom (Nama, Email, dan Pesan) wajib diisi!";
    return;
  }

  // Validasi 2: Cek format email
  if (!email.includes("@") || !email.includes(".")) {
    formAlert.style.display = "block";
    formAlert.style.background = "#fef2f2";
    formAlert.style.border = "1px solid #fecaca";
    formAlert.style.color = "#dc2626";
    formAlert.textContent = "Peringatan: Format email tidak valid (harus mengandung @ dan .)";
    return;
  }

  // Jika berhasil lolos validasi
  formAlert.style.display = "block";
  formAlert.style.background = "#f0fdf4";
  formAlert.style.border = "1px solid #bbf7d0";
  formAlert.style.color = "#16a34a";
  formAlert.textContent = "Terima kasih! Pesan Anda telah berhasil dikirim.";

  // Kosongkan form kembali
  document.getElementById("contact-form").reset();
}

// 5. Inisialisasi Otomatis saat Halaman Dimuat
document.addEventListener("DOMContentLoaded", () => {
  // Sapaan otomatis berdasarkan jam laptop
  const greetingEl = document.getElementById("dynamic-greeting");
  if (greetingEl) {
    const jam = new Date().getHours();
    if (jam >= 4 && jam < 11) greetingEl.textContent = "🌅 Selamat Pagi! Semangat kuliah hari ini!";
    else if (jam >= 11 && jam < 15) greetingEl.textContent = "☀️ Selamat Siang! Jangan lupa istirahat & makan!";
    else if (jam >= 15 && jam < 18) greetingEl.textContent = "🌤️ Selamat Sore! Keep that study energy going!";
    else greetingEl.textContent = "🌙 Selamat Malam! Waktunya istirahat & recharge ✨";
  }

  // Hitung jumlah tugas aktif yang belum selesai dari LocalStorage
  const countEl = document.getElementById("active-task-count");
  if (countEl) {
    const tasks = JSON.parse(localStorage.getItem("campus_hub_tasks")) || [];
    const pending = tasks.filter((t) => !t.completed).length;
    countEl.textContent = `${pending} tugas belum selesai`;
  }

  // Muat streak dari LocalStorage
  const streakEl = document.getElementById("streak-count");
  if (streakEl) {
    const streak = parseInt(localStorage.getItem("campus_hub_streak"), 10) || 7;
    streakEl.textContent = `${streak} hari berturut-turut`;
  }
});

// Helper notifikasi toast mengambang
function showToast(pesan, tipe = "info") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${tipe}`;
  toast.textContent = pesan;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
