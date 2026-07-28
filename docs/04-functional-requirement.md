# 04 — Functional Requirement

## 1. Scope

Dokumen ini mendefinisikan seluruh kebutuhan fungsional sistem Distill — apa yang harus dilakukan sistem, oleh siapa, dan dengan kriteria penerimaan seperti apa. Dokumen ini **tidak** membahas desain database, arsitektur teknis, diagram urutan, atau spesifikasi API (tersedia di dokumen terpisah).

---

## 2. Functional Decomposition

Sistem Distill terdiri dari 7 modul fungsional utama:

```
┌─────────────────────────────────────────────────────────────────┐
│                    DISTILL FUNCTIONAL MODULES                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│  │  FR-MOD-01  │  │  FR-MOD-02  │  │     FR-MOD-03       │   │
│  │  Project    │  │  Chat &     │  │  Thinking Canvas    │   │
│  │  Management │  │  Conversation│  │  Visualization      │   │
│  └─────────────┘  └─────────────┘  └─────────────────────┘   │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│  │  FR-MOD-04  │  │  FR-MOD-05  │  │     FR-MOD-06       │   │
│  │  Detail     │  │  AI Reasoning│  │  Blueprint          │   │
│  │  Panel      │  │  Engine     │  │  Generator          │   │
│  └─────────────┘  └─────────────┘  └─────────────────────┘   │
│                                                                  │
│              ┌─────────────────────────────┐                    │
│              │        FR-MOD-07            │                    │
│              │   Canvas State Management   │                    │
│              └─────────────────────────────┘                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Module: FR-MOD-01 — Project Management

### Overview
Modul ini mengelola lifecycle project Distill — pembuatan, penyimpanan, penghapusan, dan navigasi antar project.

### Functional Requirements

#### FR-01-001: Create New Project
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-01-001 |
| **Modul** | Project Management |
| **Prioritas** | Must Have |
| **Aktor** | User |
| **Deskripsi** | Sistem harus memungkinkan user untuk membuat project discovery baru |
| **Pre-condition** | Aplikasi Distill dalam keadaan aktif |
| **Trigger** | User memilih opsi "New Project" atau "Start Discovery" |
| **Input** | Project name (opsional, default: "Untitled Project") |
| **Proses** | 1. Sistem generate project ID unik<br>2. Sistem inisialisasi canvas dengan 10 stage dalam status "not_started"<br>3. Sistem set timestamp created_at<br>4. Sistem tampilkan empty canvas dengan panduan per stage<br>5. AI generate greeting message dan pertanyaan pembuka |
| **Output** | Project baru dengan canvas kosong, chat panel menampilkan greeting AI |
| **Post-condition** | Project tersimpan dalam storage, user siap memulai discovery |

**Acceptance Criteria:**
- [ ] Project ID unik di-generate otomatis
- [ ] 10 stage diinisialisasi dengan status "not_started"
- [ ] Empty canvas menampilkan panduan deskriptif per stage
- [ ] AI greeting muncul dalam chat panel
- [ ] Project dapat diakses kembali setelah dibuat

---

#### FR-01-002: List Projects
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-01-002 |
| **Modul** | Project Management |
| **Prioritas** | Must Have |
| **Aktor** | User |
| **Deskripsi** | Sistem harus menampilkan daftar project yang pernah dibuat user |
| **Pre-condition** | Minimal satu project telah dibuat |
| **Trigger** | User membuka halaman daftar project |
| **Input** | — |
| **Proses** | 1. Sistem retrieve daftar project dari storage<br>2. Sistem tampilkan project dengan: nama, tanggal dibuat, status terakhir, progress ringkas |
| **Output** | Daftar project dalam format list/card |
| **Post-condition** | User dapat memilih project untuk dilanjutkan |

**Acceptance Criteria:**
- [ ] Daftar project diurutkan berdasarkan waktu modifikasi terbaru
- [ ] Setiap item menampilkan nama, tanggal, dan status progres
- [ ] User dapat memilih project untuk melanjutkan sesi
- [ ] User dapat menghapus project dari daftar

---

#### FR-01-003: Delete Project
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-01-003 |
| **Modul** | Project Management |
| **Prioritas** | Should Have |
| **Aktor** | User |
| **Deskripsi** | Sistem harus memungkinkan user menghapus project |
| **Pre-condition** | Project exists dalam storage |
| **Trigger** | User memilih opsi delete pada project |
| **Input** | Project ID |
| **Proses** | 1. Sistem tampilkan konfirmasi penghapusan<br>2. Jika user konfirmasi, sistem hapus project dan semua data terkait dari storage |
| **Output** | Project dihapus, daftar project diperbarui |
| **Post-condition** | Project tidak lagi dapat diakses |

**Acceptance Criteria:**
- [ ] Konfirmasi penghapusan ditampilkan sebelum eksekusi
- [ ] Setelah dihapus, project tidak muncul dalam daftar
- [ ] Data terkait (canvas, chat history) ikut terhapus

---

#### FR-01-004: Resume Project
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-01-004 |
| **Modul** | Project Management |
| **Prioritas** | Must Have |
| **Aktor** | User |
| **Deskripsi** | Sistem harus memungkinkan user melanjutkan project yang sudah ada |
| **Pre-condition** | Project exists dengan state tersimpan |
| **Trigger** | User memilih project dari daftar |
| **Input** | Project ID |
| **Proses** | 1. Sistem retrieve project data (canvas state, chat history)<br>2. Sistem restore canvas ke state terakhir<br>3. Sistem restore chat history ke panel chat<br>4. Sistem tampilkan workspace dalam keadaan aktif |
| **Output** | Workspace dengan canvas dan chat yang sudah berisi data sebelumnya |
| **Post-condition** | User dapat melanjutkan discovery dari titik terakhir |

**Acceptance Criteria:**
- [ ] Canvas state di-restore dengan akurat
- [ ] Chat history ditampilkan dalam urutan kronologis
- [ ] Detail panel menampilkan card yang terakhir dipilih (jika ada)
- [ ] User dapat langsung melanjutkan chat tanpa kehilangan konteks

---

## 4. Module: FR-MOD-02 — Chat & Conversation

### Overview
Modul ini menangani interaksi percakapan antara user dan AI Thinking Partner.

### Functional Requirements

#### FR-02-001: Send User Message
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-02-001 |
| **Modul** | Chat & Conversation |
| **Prioritas** | Must Have |
| **Aktor** | User |
| **Deskripsi** | Sistem harus memungkinkan user mengirim pesan teks ke AI |
| **Pre-condition** | Project aktif, chat panel tersedia |
| **Trigger** | User mengetik pesan dan menekan enter/klik send |
| **Input** | Teks pesan (string, maksimal 2000 karakter) |
| **Proses** | 1. Sistem tampilkan pesan user dalam chat panel<br>2. Sistem kirim pesan ke AI Reasoning Engine<br>3. Sistem tampilkan indikator "AI sedang berpikir..." |
| **Output** | Pesan user ditampilkan dalam chat panel |
| **Post-condition** | Pesan user terekam, AI sedang memproses |

**Acceptance Criteria:**
- [ ] Pesan user ditampilkan secara real-time dalam chat panel
- [ ] Input field dikosongkan setelah pesan terkirim
- [ ] Indikator processing ditampilkan saat AI memproses
- [ ] Pesan disimpan dalam chat history

---

#### FR-02-002: Receive AI Response
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-02-002 |
| **Modul** | Chat & Conversation |
| **Prioritas** | Must Have |
| **Aktor** | AI Reasoning Engine |
| **Deskripsi** | Sistem harus menampilkan respons AI dalam chat panel setelah pemrosesan selesai |
| **Pre-condition** | AI telah menyelesaikan reasoning pipeline |
| **Trigger** | AI Reasoning Engine mengembalikan response |
| **Input** | Response dari AI (teks natural + structured data untuk canvas update) |
| **Proses** | 1. Sistem sembunyikan indikator processing<br>2. Sistem tampilkan response AI dalam chat panel<br>3. Sistem update canvas berdasarkan structured data<br>4. Sistem update detail panel jika card aktif berubah<br>5. Sistem simpan response ke chat history |
| **Output** | Response AI ditampilkan, canvas terupdate, detail panel terupdate |
| **Post-condition** | User dapat membaca response dan melihat progres canvas |

**Acceptance Criteria:**
- [ ] Response AI muncul dalam chat panel setelah processing selesai
- [ ] Canvas terupdate secara otomatis berdasarkan structured data
- [ ] Detail panel terupdate jika card yang sedang aktif berubah
- [ ] Response disimpan dalam chat history
- [ ] Scroll chat otomatis ke pesan terbaru

---

#### FR-02-003: Display Chat History
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-02-003 |
| **Modul** | Chat & Conversation |
| **Prioritas** | Must Have |
| **Aktor** | User, System |
| **Deskripsi** | Sistem harus menampilkan riwayat percakapan dalam urutan kronologis |
| **Pre-condition** | Project memiliki chat history |
| **Trigger** | User membuka project atau scroll chat panel |
| **Input** | — |
| **Proses** | 1. Sistem retrieve chat history dari storage<br>2. Sistem tampilkan pesan dalam urutan kronologis<br>3. Sistem bedakan visual antara pesan user dan AI |
| **Output** | Chat history dalam panel chat |
| **Post-condition** | User dapat melihat konteks percakapan sebelumnya |

**Acceptance Criteria:**
- [ ] Pesan user dan AI dibedakan secara visual (alignment, color, avatar)
- [ ] Urutan kronologis terjaga
- [ ] Chat history di-load saat project di-resume
- [ ] Scroll otomatis ke pesan terbaru saat ada pesan baru

---

#### FR-02-004: Handle Off-Topic Input
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-02-004 |
| **Modul** | Chat & Conversation |
| **Prioritas** | Should Have |
| **Aktor** | User, AI |
| **Deskripsi** | Sistem harus menangani input user yang di luar scope discovery |
| **Pre-condition** | User mengirim pesan off-topic |
| **Trigger** | AI mendeteksi pesan tidak relevan dengan project discovery |
| **Input** | Pesan off-topic user |
| **Proses** | 1. AI deteksi bahwa pesan di luar scope<br>2. AI generate response yang gently redirect ke topik discovery<br>3. AI tidak mengupdate canvas untuk pesan off-topic |
| **Output** | Response AI yang mengarahkan kembali ke discovery |
| **Post-condition** | Percakapan tetap pada track discovery |

**Acceptance Criteria:**
- [ ] AI tidak memproses pesan off-topic sebagai data discovery
- [ ] AI memberikan response yang sopan dan mengarahkan kembali
- [ ] Canvas tidak terupdate oleh pesan off-topic
- [ ] AI tetap menjaga personality sebagai thinking partner

---

## 5. Module: FR-MOD-03 — Thinking Canvas Visualization

### Overview
Modul ini menangani tampilan visual Thinking Canvas — representasi progres discovery dalam bentuk card-based workspace.

### Functional Requirements

#### FR-03-001: Display Canvas Cards
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-03-001 |
| **Modul** | Thinking Canvas |
| **Prioritas** | Must Have |
| **Aktor** | System |
| **Deskripsi** | Sistem harus menampilkan 10 card canvas dalam layout vertikal |
| **Pre-condition** | Project aktif |
| **Trigger** | Project di-load atau canvas di-update |
| **Input** | Canvas state (10 stage dengan status dan konten) |
| **Proses** | 1. Sistem render 10 card sesuai urutan thinking flow<br>2. Setiap card menampilkan: icon, nama stage, status indicator, summary singkat |
| **Output** | Canvas panel dengan 10 card |
| **Post-condition** | User dapat melihat progres discovery secara visual |

**Acceptance Criteria:**
- [ ] 10 card ditampilkan dalam urutan: Idea, User, Workflow, Pain Point, Root Cause, Assumption, Evidence, Opportunity, Decision, MVP
- [ ] Setiap card memiliki icon yang konsisten
- [ ] Status indicator terlihat jelas (warna/icon)
- [ ] Summary singkat terlihat tanpa perlu expand
- [ ] Layout responsif dan tidak overlap

---

#### FR-03-002: Visual Stage States
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-03-002 |
| **Modul** | Thinking Canvas |
| **Prioritas** | Must Have |
| **Aktor** | System |
| **Deskripsi** | Sistem harus menampilkan 3 state visual per card |
| **Pre-condition** | Canvas memiliki state stage |
| **Trigger** | State stage berubah |
| **Input** | Status stage: not_started, in_progress, completed |
| **Proses** | 1. Sistem map status ke visual indicator<br>2. Sistem update tampilan card sesuai status |
| **Output** | Card dengan visual state yang sesuai |

**State Visual Mapping:**

| Status | Visual | Deskripsi Tampilan |
|--------|--------|-------------------|
| not_started | ⚪ Gray/Neutral | Card tipis, hanya judul dan panduan singkat |
| in_progress | 🟡 Yellow/Active | Card expanded, menampilkan summary, indikator aktif |
| completed | 🟢 Green/Done | Card compact, menampilkan ringkasan hasil, checkmark |
| needs_review | 🔴 Red/Warning | Card dengan warning indicator, menandakan perlu tinjauan |

**Acceptance Criteria:**
- [ ] Setiap status memiliki visual yang jelas dan konsisten
- [ ] Transisi antar status terlihat smooth
- [ ] User dapat membedakan status dengan sekali lihat
- [ ] Status needs_review memiliki penanda khusus

---

#### FR-03-003: Auto-Update Canvas
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-03-003 |
| **Modul** | Thinking Canvas |
| **Prioritas** | Must Have |
| **Aktor** | System, AI Reasoning Engine |
| **Deskripsi** | Sistem harus memperbarui canvas secara otomatis berdasarkan structured data dari AI |
| **Pre-condition** | AI mengembalikan structured updates |
| **Trigger** | Setiap kali AI response mengandung canvas updates |
| **Input** | Structured JSON: stage updates (status, summary, confirmed items, needs validation items, next steps) |
| **Proses** | 1. Sistem parse structured updates<br>2. Sistem merge updates ke canvas state existing<br>3. Sistem re-render card yang terpengaruh<br>4. Sistem highlight card yang baru berubah |
| **Output** | Canvas terupdate secara real-time |
| **Post-condition** | User melihat perubahan canvas tanpa refresh manual |

**Acceptance Criteria:**
- [ ] Canvas terupdate dalam waktu < 500ms setelah AI response
- [ ] Hanya card yang berubah yang di-re-render (tidak full refresh)
- [ ] Card yang baru berubah memiliki highlight/brief animation
- [ ] Update terjadi sebelum chat response selesai ditampilkan

---

#### FR-03-004: Empty Canvas State
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-03-004 |
| **Modul** | Thinking Canvas |
| **Prioritas** | Must Have |
| **Aktor** | System |
| **Deskripsi** | Sistem harus menampilkan panduan pada canvas kosong saat project baru dibuat |
| **Pre-condition** | Project baru diinisialisasi |
| **Trigger** | Project creation |
| **Input** | — |
| **Proses** | 1. Sistem render 10 card dengan status "not_started"<br>2. Setiap card menampilkan guiding question |
| **Output** | Canvas dengan guiding questions |

**Guiding Questions per Stage:**

| Stage | Guiding Question |
|-------|-----------------|
| Idea | Apa yang ingin Anda bangun? |
| User | Siapa pengguna utama? |
| Workflow | Bagaimana proses mereka saat ini? |
| Pain Point | Bagian mana yang paling menyulitkan? |
| Root Cause | Mengapa masalah ini terjadi? |
| Assumption | Apa yang Anda anggap benar tapi belum bukti? |
| Evidence | Bukti apa yang mendukung asumsi ini? |
| Opportunity | Peluang apa yang muncul dari masalah ini? |
| Decision | Keputusan apa yang ingin Anda ambil? |
| MVP | Fitur minimum apa yang harus ada? |

**Acceptance Criteria:**
- [ ] Semua 10 card menampilkan guiding question yang relevan
- [ ] Guiding question membantu user memahami tujuan setiap stage
- [ ] Guiding question hilang setelah stage memiliki konten

---

#### FR-03-005: Card Selection
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-03-005 |
| **Modul** | Thinking Canvas |
| **Prioritas** | Must Have |
| **Aktor** | User |
| **Deskripsi** | Sistem harus memungkinkan user memilih card untuk melihat detail |
| **Pre-condition** | Canvas ditampilkan |
| **Trigger** | User mengklik card |
| **Input** | Card ID / Stage name |
| **Proses** | 1. Sistem highlight card yang dipilih<br>2. Sistem tampilkan detail card di panel kanan |
| **Output** | Card terpilih, detail panel terupdate |
| **Post-condition** | User dapat melihat detail stage yang dipilih |

**Acceptance Criteria:**
- [ ] Card yang dipilih memiliki visual highlight yang jelas
- [ ] Detail panel menampilkan konten card yang sesuai
- [ ] Hanya satu card yang dapat dipilih pada satu waktu
- [ ] Card yang sedang in_progress otomatis terpilih jika tidak ada pilihan manual

---

## 6. Module: FR-MOD-04 — Detail Panel

### Overview
Modul ini menampilkan detail lengkap dari card yang sedang dipilih pada canvas.

### Functional Requirements

#### FR-04-001: Display Card Detail
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-04-001 |
| **Modul** | Detail Panel |
| **Prioritas** | Must Have |
| **Aktor** | System |
| **Deskripsi** | Sistem harus menampilkan detail lengkap card yang dipilih |
| **Pre-condition** | Card telah dipilih pada canvas |
| **Trigger** | Card selection event |
| **Input** | Card data: stage name, status, summary, confirmed[], needs_validation[], next_step |
| **Proses** | 1. Sistem render detail panel dengan struktur 4 bagian<br>2. Sistem tampilkan status dan confidence score |
| **Output** | Detail panel terisi dengan data card |

**Struktur Detail Panel:**

```
┌─────────────────────────────────────┐
│  [Icon] Stage Name                  │
│  Status: [Indicator]                │
│  Confidence: [Score]%               │
│                                     │
│  ── Summary ──────────────────────  │
│  [Ringkasan insight]                │
│                                     │
│  ── Confirmed ────────────────────  │
│  ✓ [Item 1]                         │
│  ✓ [Item 2]                         │
│                                     │
│  ── Needs Validation ─────────────  │
│  ? [Item 1]                         │
│  ? [Item 2]                         │
│                                     │
│  ── Next Step ────────────────────  │
│  → [Aksi berikutnya]                │
└─────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Detail panel menampilkan semua 4 bagian (Summary, Confirmed, Needs Validation, Next Step)
- [ ] Status dan confidence score terlihat jelas
- [ ] Item "Confirmed" memiliki checkmark visual
- [ ] Item "Needs Validation" memiliki tanda tanya/warning visual
- [ ] Panel terupdate secara real-time saat card berubah

---

#### FR-04-002: Confidence Score Display
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-04-002 |
| **Modul** | Detail Panel |
| **Prioritas** | Should Have |
| **Aktor** | System |
| **Deskripsi** | Sistem harus menampilkan confidence score per card |
| **Pre-condition** | Card memiliki confidence data |
| **Trigger** | Card dipilih atau confidence berubah |
| **Input** | Confidence score (0-100%) |
| **Proses** | 1. Sistem map score ke kategori visual<br>2. Sistem tampilkan score dengan color coding |
| **Output** | Confidence score dengan visual indicator |

**Confidence Mapping:**

| Score | Kategori | Visual |
|-------|----------|--------|
| 80-100% | High | 🟢 Green |
| 50-79% | Medium | 🟡 Yellow |
| 0-49% | Low | 🔴 Red |
| N/A | Needs Validation | ⚪ Gray |

**Acceptance Criteria:**
- [ ] Score ditampilkan sebagai persentase
- [ ] Color coding konsisten dengan kategori
- [ ] Score terupdate saat canvas berubah
- [ ] Tooltip/penjelasan singkat tersedia

---

## 7. Module: FR-MOD-05 — AI Reasoning Engine

### Overview
Modul ini mendefinisikan kebutuhan fungsional engine AI yang melakukan reasoning, extraction, dan generation.

### Functional Requirements

#### FR-05-001: Information Extraction
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-05-001 |
| **Modul** | AI Reasoning Engine |
| **Prioritas** | Must Have |
| **Aktor** | AI |
| **Deskripsi** | AI harus mengekstrak informasi relevan dari setiap pesan user |
| **Pre-condition** | User mengirim pesan |
| **Trigger** | Pesan user diterima |
| **Input** | User message + current canvas state |
| **Proses** | 1. AI analisis pesan user<br>2. AI identifikasi stage mana yang terkandung dalam pesan<br>3. AI ekstrak nilai/value untuk stage tersebut |
| **Output** | Structured extraction: stage → {status, value, confidence} |

**Acceptance Criteria:**
- [ ] AI dapat mengekstrak informasi untuk satu atau multiple stage dalam satu pesan
- [ ] AI tidak mengarang informasi yang tidak ada dalam pesan
- [ ] AI menandai status sebagai "partial" jika informasi belum lengkap
- [ ] AI mengembalikan hasil ekstraksi dalam format structured

---

#### FR-05-002: Canvas Update Generation
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-05-002 |
| **Modul** | AI Reasoning Engine |
| **Prioritas** | Must Have |
| **Aktor** | AI |
| **Deskripsi** | AI harus menghasilkan structured updates untuk canvas berdasarkan ekstraksi |
| **Pre-condition** | Information extraction selesai |
| **Trigger** | Hasil ekstraksi tersedia |
| **Input** | Extracted information |
| **Proses** | 1. AI format ekstraksi ke struktur canvas update<br>2. AI tentukan action per stage: add, replace, needs_review |
| **Output** | JSON updates: {stage: {action, value, status}} |

**Acceptance Criteria:**
- [ ] AI hanya mengembalikan stage yang berubah (delta update)
- [ ] AI menentukan action yang tepat (add/replace/needs_review)
- [ ] Format output konsisten dan parseable
- [ ] AI tidak mengembalikan stage yang tidak berubah

---

#### FR-05-003: Impact Detection
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-05-003 |
| **Modul** | AI Reasoning Engine |
| **Prioritas** | Must Have |
| **Aktor** | AI |
| **Deskripsi** | AI harus mendeteksi apakah perubahan pada satu stage mempengaruhi stage lain |
| **Pre-condition** | Stage diupdate |
| **Trigger** | Setelah canvas update generation |
| **Input** | Updated stage + current canvas state |
| **Proses** | 1. AI analisis hubungan antar stage<br>2. AI identifikasi stage yang mungkin terdampak<br>3. AI tandai stage terdampak sebagai "needs_review" |
| **Output** | Impact report: {affected_stages: [{stage, reason, action}]} |

**Acceptance Criteria:**
- [ ] AI mendeteksi dampak perubahan user ke stage lain
- [ ] AI tidak mengarang data baru untuk stage yang terdampak
- [ ] AI hanya menandai sebagai "needs_review", bukan mengisi nilai baru
- [ ] Reason untuk impact tersedia untuk ditampilkan

---

#### FR-05-004: Missing Stage Detection
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-05-004 |
| **Modul** | AI Reasoning Engine |
| **Prioritas** | Must Have |
| **Aktor** | AI |
| **Deskripsi** | AI harus menentukan stage mana yang paling perlu diisi berikutnya |
| **Pre-condition** | Canvas update dan impact detection selesai |
| **Trigger** | Setelah impact detection |
| **Input** | Current canvas state |
| **Proses** | 1. AI evaluasi status semua stage<br>2. AI prioritaskan stage yang "missing" atau "partial"<br>3. AI pilih stage dengan prioritas tertinggi |
| **Output** | Target stage untuk pertanyaan berikutnya |

**Acceptance Criteria:**
- [ ] AI memilih stage yang benar-benar missing/partial
- [ ] AI mengikuti urutan thinking flow (Idea → User → Workflow → ...)
- [ ] AI tidak melewati stage yang belum lengkap
- [ ] AI dapat menangani multiple missing stage dengan prioritas yang tepat

---

#### FR-05-005: Question Generation
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-05-005 |
| **Modul** | AI Reasoning Engine |
| **Prioritas** | Must Have |
| **Aktor** | AI |
| **Deskripsi** | AI harus menghasilkan satu pertanyaan terbaik untuk stage yang missing |
| **Pre-condition** | Missing stage telah terdeteksi |
| **Trigger** | Setelah missing stage detection |
| **Input** | Target stage + current canvas state |
| **Proses** | 1. AI analisis konteks stage yang missing<br>2. AI generate pertanyaan yang spesifik dan terbuka<br>3. AI pastikan pertanyaan natural dan tidak seperti kuesioner |
| **Output** | Natural language question |

**Acceptance Criteria:**
- [ ] AI mengajukan maksimal satu pertanyaan utama per turn
- [ ] Pertanyaan spesifik untuk stage yang missing
- [ ] Pertanyaan dalam bahasa natural, tidak seperti form
- [ ] Pertanyaan mempertimbangkan konteks stage yang sudah terisi
- [ ] AI tetap merespons jika user tidak langsung menjawab pertanyaan

---

#### FR-05-006: Conversation Response Generation
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-05-006 |
| **Modul** | AI Reasoning Engine |
| **Prioritas** | Must Have |
| **Aktor** | AI |
| **Deskripsi** | AI harus menghasilkan response natural yang mengakui input user, memberikan feedback, dan mengajukan pertanyaan berikutnya |
| **Pre-condition** | Semua reasoning steps selesai |
| **Trigger** | Setelah question generation |
| **Input** | User message, canvas updates, impact report, target question |
| **Proses** | 1. AI generate response yang mengakui input user<br>2. AI sampaikan update canvas (jika relevan)<br>3. AI ajukan pertanyaan berikutnya secara natural |
| **Output** | Natural language chat response |

**Acceptance Criteria:**
- [ ] Response mengakui dan memvalidasi input user
- [ ] Response tidak terlalu panjang (maksimal 3-4 paragraf)
- [ ] Response mengandung satu pertanyaan utama yang jelas
- [ ] Tone sesuai personality: tidak menghakimi, tidak memuji berlebihan, mempertanyakan asumsi
- [ ] Response tidak mengungkapkan internal reasoning (user tidak perlu tahu "stage detection")

---

#### FR-05-007: Distillation Process
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-05-007 |
| **Modul** | AI Reasoning Engine |
| **Prioritas** | Must Have |
| **Aktor** | AI |
| **Deskripsi** | AI harus melakukan distillation pada setiap stage setelah semua stage complete |
| **Pre-condition** | Semua 10 stage berstatus complete |
| **Trigger** | User atau system memicu distillation |
| **Input** | Complete canvas data |
| **Proses** | 1. AI review semua item per stage<br>2. AI identifikasi duplikasi dan redundancy<br>3. AI merge item yang serupa<br>4. AI generate core insight per stage<br>5. AI assign confidence score |
| **Output** | Distilled canvas: core insight + confidence per stage |

**Acceptance Criteria:**
- [ ] Distillation mengurangi kompleksitas tanpa kehilangan esensi
- [ ] Duplikasi teridentifikasi dan digabungkan
- [ ] Core insight jelas dan ringkas
- [ ] Confidence score tersedia per stage
- [ ] AI tidak mengarang insight baru yang tidak ada di canvas

---

#### FR-05-008: Contradiction Detection
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-05-008 |
| **Modul** | AI Reasoning Engine |
| **Prioritas** | Must Have |
| **Aktor** | AI |
| **Deskripsi** | AI harus mendeteksi kontradiksi antar stage selama discovery |
| **Pre-condition** | Minimal 2 stage terisi |
| **Trigger** | Setiap kali canvas diupdate |
| **Input** | Current canvas state |
| **Proses** | 1. AI cross-check antar stage<br>2. AI identifikasi inkonsistensi logis<br>3. AI tandai stage yang konflik sebagai "needs_review" |
| **Output** | Contradiction report (jika ada) |

**Acceptance Criteria:**
- [ ] AI mendeteksi kontradiksi logis antar stage
- [ ] AI tidak membuat false positive (menandai non-kontradiksi sebagai kontradiksi)
- [ ] AI menjelaskan mengapa terjadi kontradiksi
- [ ] AI menyarankan cara menyelesaikan kontradiksi

---

## 8. Module: FR-MOD-06 — Blueprint Generator

### Overview
Modul ini menangani generasi dan penyajian Project Blueprint sebagai output akhir.

### Functional Requirements

#### FR-06-001: Trigger Blueprint Generation
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-06-001 |
| **Modul** | Blueprint Generator |
| **Prioritas** | Must Have |
| **Aktor** | User, System |
| **Deskripsi** | Sistem harus memungkinkan user memicu generasi blueprint setelah distillation selesai |
| **Pre-condition** | Distillation selesai dan user menyetujui |
| **Trigger** | User memilih "Generate Blueprint" atau semua stage complete + user validasi |
| **Input** | Distilled canvas data |
| **Proses** | 1. Sistem compile semua stage menjadi struktur blueprint<br>2. AI generate reasoning summary<br>3. Sistem format output |
| **Output** | Project Blueprint document |

**Acceptance Criteria:**
- [ ] Blueprint hanya dapat di-generate setelah distillation selesai
- [ ] User dapat memicu generation secara eksplisit
- [ ] Sistem menampilkan preview blueprint sebelum final

---

#### FR-06-002: Blueprint Content Compilation
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-06-002 |
| **Modul** | Blueprint Generator |
| **Prioritas** | Must Have |
| **Aktor** | AI, System |
| **Deskripsi** | Sistem harus mengcompile 11 komponen blueprint dari distilled canvas |
| **Pre-condition** | Distilled canvas tersedia |
| **Trigger** | Blueprint generation triggered |
| **Input** | Distilled canvas (10 stage) |
| **Proses** | 1. Map setiap stage ke komponen blueprint<br>2. Generate reasoning summary<br>3. Format dalam struktur yang rapi |
| **Output** | Blueprint dengan 11 komponen |

**Blueprint Structure:**

| No | Komponen | Sumber Stage |
|----|----------|--------------|
| 1 | Project Name | Idea + User input |
| 2 | Problem Statement | Pain Point (distilled) |
| 3 | Primary User | User (distilled) |
| 4 | Workflow | Workflow (distilled) |
| 5 | Core Pain Point | Pain Point (distilled) |
| 6 | Root Cause | Root Cause (distilled) |
| 7 | Key Evidence | Evidence (distilled) |
| 8 | Opportunity | Opportunity (distilled) |
| 9 | Decision | Decision (distilled) |
| 10 | MVP Scope | MVP (distilled) |
| 11 | Next Validation | Assumption + Evidence (needs_validation items) |

**Acceptance Criteria:**
- [ ] Semua 11 komponen tersedia dalam blueprint
- [ ] Setiap komponen berisi distilled insight, bukan raw data
- [ ] Reasoning summary menjelaskan mengapa keputusan diambil
- [ ] Blueprint tidak mengandung informasi yang tidak ada di canvas

---

#### FR-06-003: Blueprint Display
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-06-003 |
| **Modul** | Blueprint Generator |
| **Prioritas** | Must Have |
| **Aktor** | System |
| **Deskripsi** | Sistem harus menampilkan blueprint dalam format yang rapi dan mudah dibaca |
| **Pre-condition** | Blueprint telah di-generate |
| **Trigger** | Blueprint generation selesai |
| **Input** | Blueprint data |
| **Proses** | 1. Sistem render blueprint dalam modal/panel khusus<br>2. Sistem bedakan heading dan konten<br>3. Sistem tampilkan confidence score per section |
| **Output** | Blueprint display |

**Acceptance Criteria:**
- [ ] Blueprint ditampilkan dalam format yang rapi dan terstruktur
- [ ] User dapat scroll dan membaca seluruh blueprint
- [ ] Confidence score terlihat per section
- [ ] User dapat menyalin isi blueprint (copy to clipboard)

---

#### FR-06-004: Blueprint Export
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-06-004 |
| **Modul** | Blueprint Generator |
| **Prioritas** | Could Have |
| **Aktor** | User, System |
| **Deskripsi** | Sistem harus memungkinkan user mengekspor blueprint |
| **Pre-condition** | Blueprint tersedia |
| **Trigger** | User memilih opsi export |
| **Input** | Blueprint data |
| **Proses** | 1. Sistem format blueprint ke format yang diminta<br>2. Sistem initiate download |
| **Output** | File yang di-download (JSON/Markdown/TXT) |

**Acceptance Criteria:**
- [ ] Minimal format JSON dan Markdown tersedia
- [ ] File berisi seluruh komponen blueprint
- [ ] Nama file mengandung project name dan timestamp

---

## 9. Module: FR-MOD-07 — Canvas State Management

### Overview
Modul ini mengelola state canvas — status stage, perubahan, konsistensi, dan persistensi.

### Functional Requirements

#### FR-07-001: Stage Status Management
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-07-001 |
| **Modul** | Canvas State Management |
| **Prioritas** | Must Have |
| **Aktor** | System |
| **Deskripsi** | Sistem harus mengelola status setiap stage secara akurat |
| **Pre-condition** | Project aktif |
| **Trigger** | Canvas update dari AI |
| **Input** | Stage update: {stage, status, value} |
| **Proses** | 1. Sistem validasi status yang diterima<br>2. Sistem update status stage<br>3. Sistem trigger canvas re-render |
| **Output** | Updated stage status |

**Status Valid Values:**
- `not_started` — Stage belum memiliki konten
- `partial` — Stage memiliki konten tapi belum lengkap
- `complete` — Stage memiliki konten yang cukup
- `needs_review` — Stage perlu ditinjau ulang karena perubahan di stage lain

**Acceptance Criteria:**
- [ ] Status hanya dapat berubah melalui AI update (bukan manual edit)
- [ ] Status transition valid: not_started → partial → complete
- [ ] Status complete dapat kembali ke needs_review jika terdampak
- [ ] Status needs_review dapat kembali ke complete setelah direview

---

#### FR-07-002: Canvas Persistence
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-07-002 |
| **Modul** | Canvas State Management |
| **Prioritas** | Must Have |
| **Aktor** | System |
| **Deskripsi** | Sistem harus menyimpan state canvas setelah setiap update |
| **Pre-condition** | Canvas berubah |
| **Trigger** | Setelah canvas update diterapkan |
| **Input** | Current canvas state |
| **Proses** | 1. Sistem serialize canvas state<br>2. Sistem simpan ke storage<br>3. Sistem update timestamp |
| **Output** | Canvas state tersimpan |

**Acceptance Criteria:**
- [ ] Canvas state disimpan setelah setiap update
- [ ] Data tidak hilang jika browser di-refresh
- [ ] Data dapat di-restore saat project di-resume
- [ ] Timestamp last_updated tercatat

---

#### FR-07-003: Consistency Maintenance
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-07-003 |
| **Modul** | Canvas State Management |
| **Prioritas** | Must Have |
| **Aktor** | System, AI |
| **Deskripsi** | Sistem harus memastikan konsistensi antar stage |
| **Pre-condition** | Canvas memiliki multiple stage |
| **Trigger** | Setiap canvas update |
| **Input** | Updated canvas state |
| **Proses** | 1. Sistem terima impact report dari AI<br>2. Sistem tandai stage terdampak sebagai needs_review<br>3. Sistem update canvas visual |
| **Output** | Canvas dengan konsistensi terjaga |

**Acceptance Criteria:**
- [ ] Stage yang terdampak otomatis menjadi needs_review
- [ ] User dapat melihat stage mana yang perlu ditinjau ulang
- [ ] Konsistensi diperiksa setiap kali canvas berubah
- [ ] Sistem tidak mengubah nilai stage tanpa input user

---

#### FR-07-004: Progress Tracking
| Atribut | Nilai |
|---------|-------|
| **ID** | FR-07-004 |
| **Modul** | Canvas State Management |
| **Prioritas** | Should Have |
| **Aktor** | System |
| **Deskripsi** | Sistem harus menampilkan progress keseluruhan discovery |
| **Pre-condition** | Canvas memiliki state |
| **Trigger** | Setiap kali canvas berubah atau user meminta progress |
| **Input** | Canvas state |
| **Proses** | 1. Sistem hitung jumlah stage complete / total stage<br>2. Sistem tampilkan progress indicator |
| **Output** | Progress percentage / progress bar |

**Acceptance Criteria:**
- [ ] Progress ditampilkan sebagai persentase
- [ ] Progress bar terlihat jelas dalam UI
- [ ] Progress terupdate real-time
- [ ] Progress 100% hanya jika semua stage complete dan tidak ada needs_review

---

## 10. Data Requirements (Functional Level)

### 10.1 Input Data

| ID | Input | Sumber | Format | Validasi |
|----|-------|--------|--------|----------|
| DI-01 | User message | User input | Teks, max 2000 char | Tidak boleh kosong |
| DI-02 | Project name | User input | Teks, max 100 char | Opsional, default "Untitled" |
| DI-03 | Card selection | User click | Stage ID | Harus valid stage |
| DI-04 | Blueprint approval | User action | Boolean | — |
| DI-05 | Project deletion confirm | User action | Boolean | — |

### 10.2 Output Data

| ID | Output | Tujuan | Format |
|----|--------|--------|--------|
| DO-01 | AI chat response | Chat panel | Teks natural |
| DO-02 | Canvas updates | Canvas panel | Structured JSON |
| DO-03 | Card detail | Detail panel | Structured data |
| DO-04 | Project blueprint | Blueprint panel | Structured document |
| DO-05 | Progress indicator | Canvas/UI | Percentage/Bar |
| DO-06 | Project list | Project page | List/Card array |

### 10.3 Internal Data Flow

```
User Message
    ↓
[DI-01] ──► AI Reasoning Engine
                ↓
    ┌───────────┼───────────┐
    ▼           ▼           ▼
[DO-01]    [DO-02]     [DO-03]
Chat       Canvas      Detail
Response   Updates     Panel
    │           │           │
    └───────────┴───────────┘
                ↓
         Canvas State Store
                ↓
         [DO-04] Blueprint
```

---

## 11. Error Handling Requirements (Functional)

| ID | Error Condition | System Response |
|----|-----------------|-----------------|
| EH-01 | AI tidak merespons dalam waktu yang wajar | Tampilkan pesan error, beri opsi retry |
| EH-02 | AI mengembalikan structured data invalid | Tampilkan chat response tanpa canvas update, log error |
| EH-03 | Storage penuh atau tidak dapat menyimpan | Tampilkan warning, tetap izinkan chat |
| EH-04 | Project data corrupt saat resume | Tampilkan error, beri opsi start new project |
| EH-05 | User mengirim pesan sangat panjang | Truncate atau tolak dengan pesan yang jelas |
| EH-06 | Browser refresh saat session aktif | Auto-restore state terakhir yang tersimpan |
| EH-07 | AI hallucination (mengarang data) | Validasi structured data, tolak jika tidak ada basis di chat history |

---

## 12. Summary: FR Priority Matrix

| ID | Requirement | Modul | Priority | Status |
|----|-------------|-------|----------|--------|
| FR-01-001 | Create New Project | Project Mgmt | Must Have | ⏳ |
| FR-01-002 | List Projects | Project Mgmt | Must Have | ⏳ |
| FR-01-003 | Delete Project | Project Mgmt | Should Have | ⏳ |
| FR-01-004 | Resume Project | Project Mgmt | Must Have | ⏳ |
| FR-02-001 | Send User Message | Chat | Must Have | ⏳ |
| FR-02-002 | Receive AI Response | Chat | Must Have | ⏳ |
| FR-02-003 | Display Chat History | Chat | Must Have | ⏳ |
| FR-02-004 | Handle Off-Topic | Chat | Should Have | ⏳ |
| FR-03-001 | Display Canvas Cards | Canvas | Must Have | ⏳ |
| FR-03-002 | Visual Stage States | Canvas | Must Have | ⏳ |
| FR-03-003 | Auto-Update Canvas | Canvas | Must Have | ⏳ |
| FR-03-004 | Empty Canvas State | Canvas | Must Have | ⏳ |
| FR-03-005 | Card Selection | Canvas | Must Have | ⏳ |
| FR-04-001 | Display Card Detail | Detail | Must Have | ⏳ |
| FR-04-002 | Confidence Score | Detail | Should Have | ⏳ |
| FR-05-001 | Information Extraction | AI Engine | Must Have | ⏳ |
| FR-05-002 | Canvas Update Gen | AI Engine | Must Have | ⏳ |
| FR-05-003 | Impact Detection | AI Engine | Must Have | ⏳ |
| FR-05-004 | Missing Stage Detection | AI Engine | Must Have | ⏳ |
| FR-05-005 | Question Generation | AI Engine | Must Have | ⏳ |
| FR-05-006 | Conversation Response | AI Engine | Must Have | ⏳ |
| FR-05-007 | Distillation Process | AI Engine | Must Have | ⏳ |
| FR-05-008 | Contradiction Detection | AI Engine | Must Have | ⏳ |
| FR-06-001 | Trigger Blueprint | Blueprint | Must Have | ⏳ |
| FR-06-002 | Blueprint Compilation | Blueprint | Must Have | ⏳ |
| FR-06-003 | Blueprint Display | Blueprint | Must Have | ⏳ |
| FR-06-004 | Blueprint Export | Blueprint | Could Have | ⏳ |
| FR-07-001 | Stage Status Mgmt | State Mgmt | Must Have | ⏳ |
| FR-07-002 | Canvas Persistence | State Mgmt | Must Have | ⏳ |
| FR-07-003 | Consistency Maintenance | State Mgmt | Must Have | ⏳ |
| FR-07-004 | Progress Tracking | State Mgmt | Should Have | ⏳ |

**Priority Legend:**
- **Must Have** — Fitur esensial, MVP tidak dapat berfungsi tanpanya
- **Should Have** — Fitur penting, tetapi MVP masih dapat berfungsi tanpanya
- **Could Have** — Fitur nice-to-have, dapat ditambahkan pasca-MVP

---

## 13. Kesimpulan

Dokumen ini mendefinisikan **31 Functional Requirements** yang tersebar dalam 7 modul utama. Setiap requirement dilengkapi dengan deskripsi, aktor, pre-condition, trigger, proses, output, post-condition, dan acceptance criteria yang jelas.

**Prinsip yang dipegang:**
1. **Canvas tidak diedit manual** — semua perubahan melalui chat
2. **AI reasoning transparan** — impact detection dan contradiction detection selalu aktif
3. **User in control** — keputusan akhir dan validasi di tangan user
4. **Progress visible** — user selalu tahu sejauh mana discovery berjalan
5. **Output actionable** — blueprint adalah handoff document yang siap digunakan