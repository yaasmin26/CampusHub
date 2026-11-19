/**
 * ============================================================================
 * Campus Hub - task.js
 * Manajemen Tugas Mahasiswa (Mudah Dipahami Mahasiswa)
 * Semua fungsi di sini langsung dipanggil dari HTML lewat atribut onclick / onsubmit!
 * ============================================================================
 */

const STORAGE_KEY = "campus_hub_tasks";

// Data awal tugas kuliah
const defaultTasks = [
  {
    id: 1,
    title: "💻 Web Programming",
    description: "Bikin website HTML, CSS styling, dan integrasi JavaScript",
    category: "Pemrograman Web",
    deadline: "Kamis, 23:59",
    completed: false
  },
  {
    id: 2,
    title: "📚 Database Report",
    description: "Selesaikan laporan normalisasi tabel dan relasi ERD",
    category: "Basis Data",
    deadline: "Senin, 12:00",
    completed: false
  },
  {
    id: 3,
    title: "🎨 UI/UX Prototype",
    description: "Bikin prototype interaktif mobile app di Figma",
    category: "Desain Sistem",
    deadline: "Rabu, 18:00",
    completed: false
  }
];

// Contoh tugas realistis saat tombol "Impor Tugas" diklik
const sampleImportTasks = [
  {
    title: "Revisi Laporan Praktikum Basis Data (3NF)",
    category: "Basis Data",
    deadline: "Jumat, 23:59",
    description: "Selesaikan diagram normalisasi relasi tabel dan bukti query SQL."
  },
  {
    title: "Deploy Website Portofolio ke GitHub Pages",
    category: "Pemrograman Web",
    deadline: "Sabtu, 17:00",
    description: "Pastikan tampilan responsif dan interaksi JavaScript berjalan lancar."
  },
  {
    title: "Review Materi Algoritma & Struktur Data",
    category: "Algoritma",
    deadline: "Selasa, 14:00",
    description: "Latihan pemahaman Binary Search Tree sebelum ujian."
  }
];

let tasks = [];
let currentFilter = "all";
let importCounter = 0;

// 1. Membuka Modal Tambah Tugas (Dipanggil oleh onclick="bukaModal()" di HTML)
function bukaModal() {
  const modal = document.getElementById("add-task-modal");
  modal.classList.add("active");
  document.getElementById("modal-task-title").focus();
}

// 2. Menutup Modal Tambah Tugas (Dipanggil oleh onclick="tutupModal()" di HTML)
function tutupModal() {
  const modal = document.getElementById("add-task-modal");
  modal.classList.remove("active");
  document.getElementById("form-add-task").reset();

  // Bersihkan pesan error dan garis merah
  ["err-task-title", "err-task-category", "err-task-deadline"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("show");
  });
  ["modal-task-title", "modal-task-category", "modal-task-deadline"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("input-invalid", "input-valid");
  });
}

// 3. Menyimpan Tugas Baru & Validasi (Dipanggil oleh onsubmit="simpanTugas(event)" di HTML)
function simpanTugas(event) {
  event.preventDefault(); // Mencegah reload halaman

  const titleInput = document.getElementById("modal-task-title");
  const categoryInput = document.getElementById("modal-task-category");
  const deadlineInput = document.getElementById("modal-task-deadline");
  const descInput = document.getElementById("modal-task-desc");

  const errTitle = document.getElementById("err-task-title");
  const errCategory = document.getElementById("err-task-category");
  const errDeadline = document.getElementById("err-task-deadline");

  let valid = true;

  // Validasi 1: Judul Tugas
  if (titleInput.value.trim() === "") {
    titleInput.classList.add("input-invalid");
    errTitle.textContent = "⚠️ Judul tugas tidak boleh kosong!";
    errTitle.classList.add("show");
    valid = false;
  } else if (titleInput.value.trim().length < 3) {
    titleInput.classList.add("input-invalid");
    errTitle.textContent = "⚠️ Judul tugas minimal 3 karakter!";
    errTitle.classList.add("show");
    valid = false;
  } else {
    titleInput.classList.remove("input-invalid");
    titleInput.classList.add("input-valid");
    errTitle.classList.remove("show");
  }

  // Validasi 2: Kategori / Mata Kuliah
  if (categoryInput.value.trim() === "") {
    categoryInput.classList.add("input-invalid");
    errCategory.textContent = "⚠️ Mata kuliah / kategori wajib diisi!";
    errCategory.classList.add("show");
    valid = false;
  } else {
    categoryInput.classList.remove("input-invalid");
    categoryInput.classList.add("input-valid");
    errCategory.classList.remove("show");
  }

  // Validasi 3: Deadline
  if (deadlineInput.value.trim() === "") {
    deadlineInput.classList.add("input-invalid");
    errDeadline.textContent = "⚠️ Batas waktu deadline wajib diisi!";
    errDeadline.classList.add("show");
    valid = false;
  } else {
    deadlineInput.classList.remove("input-invalid");
    deadlineInput.classList.add("input-valid");
    errDeadline.classList.remove("show");
  }

  // Jika ada kolom yang salah, hentikan proses
  if (!valid) {
    showToast("Mohon isi form dengan benar!", "error");
    return;
  }

  // Jika semua kolom valid, tambahkan ke daftar tugas
  tasks.unshift({
    id: Date.now(),
    title: titleInput.value.trim(),
    category: categoryInput.value.trim(),
    deadline: deadlineInput.value.trim(),
    description: descInput.value.trim() || "-",
    completed: false
  });

  saveTasks();
  renderTasks();
  tutupModal();
  showToast("Tugas baru berhasil ditambahkan! 📝✨", "success");
}

// 4. Filter Tugas (Dipanggil oleh onclick="filterTugas('pending', this)" di HTML)
function filterTugas(kategori, tombol) {
  currentFilter = kategori;

  // Update tombol yang aktif
  document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"));
  if (tombol) tombol.classList.add("active");

  renderTasks();
}

// 5. Pencarian Tugas Real-Time (Dipanggil oleh onkeyup="cariTugas()" di HTML)
function cariTugas() {
  const query = document.getElementById("task-search-input").value.toLowerCase().trim();

  document.querySelectorAll(".task-card").forEach((card) => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(query) ? "flex" : "none";
  });
}

// 6. Impor Tugas Otomatis (Dipanggil oleh onclick="imporTugas()" di HTML)
function imporTugas() {
  const btn = document.getElementById("btn-import-api-tasks");
  btn.disabled = true;
  btn.innerHTML = `<span>⏳ Menarik tugas...</span>`;

  const item = sampleImportTasks[importCounter % sampleImportTasks.length];
  importCounter++;

  setTimeout(() => {
    tasks.unshift({
      id: Date.now(),
      title: `⚡ ${item.title}`,
      category: item.category,
      deadline: item.deadline,
      description: item.description,
      completed: false
    });

    saveTasks();
    renderTasks();
    showToast("Berhasil mengimpor tugas baru! 🚀", "success");

    btn.disabled = false;
    btn.innerHTML = `<span>⚡</span> Impor Tugas`;
  }, 400);
}

// 7. Ganti Tips Mahasiswa (Dipanggil oleh onclick="gantiTips()" di HTML)
const tipsList = [
  "Selesaikan tugas paling sulit di pagi hari saat fokus masih penuh.",
  "Bikin backup berkala file tugas kuliah di Google Drive / GitHub.",
  "Gunakan teknik 25 menit nugas, 5 menit istirahat biar gak burnout.",
  "Jangan tunda tugas kecil, karena deadline besar berawal dari tugas kecil."
];
let tipIndex = 0;

function gantiTips() {
  const tipText = document.getElementById("dynamic-tip-text");
  tipIndex = (tipIndex + 1) % tipsList.length;

  if (tipText) {
    tipText.textContent = `"${tipsList[tipIndex]}"`;
  }
  showToast("Tips harian diperbarui! 💡", "success");
}

// 8. Tandai Tugas Selesai (Dipanggil oleh tombol centang di kartu HTML)
function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    showToast(task.completed ? "Tugas selesai! 🎉" : "Tugas kembali aktif", "info");
  }
}

// 9. Hapus Tugas (Dipanggil oleh tombol sampah di kartu HTML)
function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
  showToast("Tugas dihapus", "info");
}

// Fungsi Bantu: Simpan ke LocalStorage
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Fungsi Bantu: Render Kartu Tugas ke Wadah HTML
function renderTasks() {
  const container = document.getElementById("task-list-container");
  if (!container) return;

  const filtered = tasks.filter((t) => {
    if (currentFilter === "pending") return !t.completed;
    if (currentFilter === "completed") return t.completed;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p style="color: var(--text-muted); font-size: 15px;">Tidak ada tugas pada kategori ini.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered
    .map(
      (task) => `
      <div class="task-card ${task.completed ? "completed" : ""}">
        <div class="task-card-header">
          <span class="task-category">${task.category || "Umum"}</span>
          <span style="font-size: 12px; font-weight: 700; color: ${task.completed ? "var(--accent-lime)" : "var(--text-muted)"};">
            ${task.completed ? "✓ Selesai" : "⏳ Aktif"}
          </span>
        </div>

        <h3>${task.title}</h3>
        <p>${task.description}</p>

        <div class="task-card-footer">
          <span class="deadline">📅 ${task.deadline}</span>

          <div class="task-actions">
            <button class="btn-action btn-check" onclick="toggleTask(${task.id})" title="Tandai Selesai">
              ${task.completed ? "↩" : "✓"}
            </button>
            <button class="btn-action btn-delete" onclick="deleteTask(${task.id})" title="Hapus Tugas">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

// Muat data saat halaman task.html dibuka pertama kali
document.addEventListener("DOMContentLoaded", () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  tasks = stored ? JSON.parse(stored) : [...defaultTasks];
  renderTasks();
});
