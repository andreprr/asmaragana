function hitungDanSimpan() {
    // Validasi form
    const form = document.getElementById('kuesionerForm');
    if (!form.checkValidity()) {
        alert('Mohon lengkapi semua field yang diperlukan!');
        return;
    }

    // Ambil data dari form
    const nama = document.getElementById('nama').value;
    const telepon = document.getElementById('telepon').value;
    const domisili = document.getElementById('domisili').value;
    const desa = document.getElementById('desa').value;

    let totalNilai = 0;
    let jawaban = {};

    // Hitung total nilai dari pertanyaan 1-10
    for (let i = 1; i <= 10; i++) {
        const radioButtons = document.querySelectorAll(`input[name="q${i}"]:checked`);
        if (radioButtons.length === 0) {
            alert(`Mohon jawab pertanyaan nomor ${i}!`);
            return;
        }

        const nilai = parseInt(radioButtons[0].value);
        totalNilai += nilai;
        jawaban[`q${i}`] = nilai;
    }

    // Tentukan derajat masalah dan rekomendasi
    let derajat, rekomendasi;

    if (totalNilai === 0) {
        derajat = "Tidak Ada Masalah";
        rekomendasi = "Anda tidak menunjukkan tanda-tanda penyalahgunaan zat. Pertahankan gaya hidup sehat.";
    } else if (totalNilai >= 1 && totalNilai <= 2) {
        derajat = "Masalah Ringan";
        rekomendasi = "Anda menunjukkan tanda-tanda ringan. Disarankan untuk lebih waspada dan berkonsultasi dengan ahli jika diperlukan.";
    } else if (totalNilai >= 3 && totalNilai <= 5) {
        derajat = "Masalah Sedang";
        rekomendasi = "Anda menunjukkan tanda-tanda masalah sedang. Sangat disarankan untuk berkonsultasi dengan profesional kesehatan.";
    } else if (totalNilai >= 6 && totalNilai <= 8) {
        derajat = "Masalah Berat";
        rekomendasi = "Anda menunjukkan tanda-tanda masalah berat. Segera cari bantuan profesional untuk evaluasi dan treatment.";
    } else {
        derajat = "Masalah Sangat Berat";
        rekomendasi = "Anda menunjukkan tanda-tanda masalah sangat berat. Segera hubungi profesional kesehatan untuk mendapatkan bantuan intensif.";
    }

    // Tampilkan hasil
    displayResult(totalNilai, derajat, rekomendasi);

    // Siapkan data untuk dikirim ke Apps Script (menggunakan FormData)
    const formData = new FormData();
    formData.append('nama', nama);
    formData.append('telepon', telepon);
    formData.append('domisili', domisili);
    formData.append('desa', desa);
    formData.append('totalNilai', totalNilai);
    formData.append('derajat', derajat);
    formData.append('rekomendasi', rekomendasi);

    // Tambahkan jawaban individual
    for (let i = 1; i <= 10; i++) {
        formData.append(`q${i}`, jawaban[`q${i}`]);
    }

    // Kirim data ke Google Apps Script
    sendToAppsScript(formData);
}


function displayResult(totalNilai, derajat, rekomendasi) {
    document.getElementById('totalNilai').textContent = totalNilai;
    document.getElementById('derajat').textContent = derajat;
    document.getElementById('rekomendasi').textContent = rekomendasi;
    document.getElementById('hasilBox').style.display = 'block';

    // Scroll ke hasil
    document.getElementById('hasilBox').scrollIntoView({ behavior: 'smooth' });
}

function sendToAppsScript(formData) {
    // Ganti dengan URL Apps Script Anda yang sebenarnya
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwHyzPt2zfEMK26xLi8hBFRzWE5okLFvmZ1F5erH1xwRQy50MgVHy549UjH4bd4HJV-fQ/exec';

    // Tampilkan loading
    const statusElement = document.getElementById('statusPenyimpanan');
    statusElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan data...';
    statusElement.style.color = '#007bff';

    // Convert FormData ke URLSearchParams untuk kompatibilitas yang lebih baik
    const params = new URLSearchParams();
    for (let [key, value] of formData.entries()) {
        params.append(key, value);
        console.log(key + ': ' + value);
    }

    console.log('Sending data as URL-encoded:', params.toString());

    // Gunakan XMLHttpRequest dengan data URL-encoded
    const xhr = new XMLHttpRequest();
    xhr.open('POST', APPS_SCRIPT_URL, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log('Status:', xhr.status);
            console.log('Response:', xhr.responseText);

            if (xhr.status === 200) {
                statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Data berhasil disimpan!';
                statusElement.style.color = '#28a745';

                try {
                    const response = JSON.parse(xhr.responseText);
                    console.log('Parsed response:', response);

                    if (response.result === 'error') {
                        console.error('Server error:', response.error);
                        statusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error: ' + response.error;
                        statusElement.style.color = '#dc3545';
                    }
                } catch (e) {
                    console.log('Response bukan JSON valid:', xhr.responseText);
                }
            } else {
                console.error('HTTP Error status:', xhr.status);
                statusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> HTTP Error: ' + xhr.status;
                statusElement.style.color = '#dc3545';
            }
        }
    };

    xhr.onerror = function () {
        console.error('Network error');
        statusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error jaringan. Silakan coba lagi.';
        statusElement.style.color = '#dc3545';
    };

    // Kirim sebagai URL-encoded string
    xhr.send(params.toString());
}

// Alternatif menggunakan XMLHttpRequest (jika fetch tidak bekerja)
function sendToAppsScriptXHR(formData) {
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwHyzPt2zfEMK26xLi8hBFRzWE5okLFvmZ1F5erH1xwRQy50MgVHy549UjH4bd4HJV-fQ/exec';

    const statusElement = document.getElementById('statusPenyimpanan');
    statusElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan data...';
    statusElement.style.color = '#007bff';

    const xhr = new XMLHttpRequest();
    xhr.open('POST', APPS_SCRIPT_URL, true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 0) {
                statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Data berhasil disimpan!';
                statusElement.style.color = '#28a745';
                console.log('Response:', xhr.responseText);
            } else {
                console.error('Error status:', xhr.status);
                statusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Gagal menyimpan data. Silakan coba lagi.';
                statusElement.style.color = '#dc3545';
            }
        }
    };

    xhr.onerror = function () {
        console.error('Network error');
        statusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error jaringan. Silakan coba lagi.';
        statusElement.style.color = '#dc3545';
    };

    xhr.send(formData);
}

// Fungsi untuk reset form
function resetForm() {
    document.getElementById('kuesionerForm').reset();
    document.getElementById('hasilBox').style.display = 'none';
}

// Event listener untuk validasi real-time
document.addEventListener('DOMContentLoaded', function () {
    // Validasi nomor telepon
    const teleponInput = document.getElementById('telepon');
    if (teleponInput) {
        teleponInput.addEventListener('input', function () {
            let value = this.value.replace(/\D/g, ''); // Hapus non-digit
            if (value.length > 13) value = value.substring(0, 13); // Maksimal 13 digit
            this.value = value;
        });
    }

    // Validasi nama (hanya huruf dan spasi)
    const namaInput = document.getElementById('nama');
    if (namaInput) {
        namaInput.addEventListener('input', function () {
            this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
        });
    }
});

const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

// Klik tombol hamburger
hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
});

// Klik menu -> otomatis close di mobile
document.querySelectorAll(".nav-link").forEach(link =>
    link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
    })
);

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: "smooth",  // animasi halus
            block: "start"       // posisinya di atas
        });
    }
}