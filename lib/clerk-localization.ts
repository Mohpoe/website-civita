import { idID } from "@clerk/localizations";
import type { LocalizationResource } from "@clerk/shared/types";

/**
 * Tambahan terjemahan Indonesia untuk Clerk.
 *
 * Locale `idID` bawaan Clerk baru mencakup ~590 dari ~1.680 kunci, sehingga
 * sebagian label pada alur auth dan dialog kelola akun jatuh kembali ke bahasa
 * Inggris. Overlay ini melengkapi area yang benar-benar dipakai situs:
 * masuk/daftar, verifikasi, kelola profil, email, kata sandi, passkey, MFA,
 * dan pesan error umum.
 *
 * Billing, organization profile, configure SSO, dan directory sync sengaja
 * tidak diterjemahkan karena situs ini tidak memakainya.
 */
const overrides = {
  actionBlocked: {
    subtitle: "Demi keamanan Anda, permintaan ini tidak dapat diselesaikan.",
    title: "Permintaan tidak dapat kami selesaikan",
    traceIdLabel: "Referensi",
  },

  badge__activePlan: "Aktif",
  badge__banned: "Diblokir",
  badge__canceledEndsAt: "Dibatalkan • Berakhir {{ date | shortDate('id-ID') }}",
  badge__currentPlan: "Paket saat ini",
  badge__deprovisioned: "Akses dicabut",
  badge__endsAt: "Berakhir {{ date | shortDate('id-ID') }}",
  badge__expired: "Kedaluwarsa",
  badge__freeTrial: "Uji coba gratis",
  badge__pastDueAt: "Terlambat {{ date | shortDate('id-ID') }}",
  badge__pastDuePlan: "Terlambat bayar",
  badge__renewsAt: "Diperbarui {{ date | shortDate('id-ID') }}",
  badge__startsAt: "Mulai {{ date | shortDate('id-ID') }}",
  badge__trialEndsAt: "Uji coba berakhir {{ date | shortDate('id-ID') }}",
  badge__upcomingPlan: "Akan datang",

  formFieldInputPlaceholder__apiKeyDescription:
    "Jelaskan alasan Anda membuat kunci ini",
  formFieldInputPlaceholder__apiKeyExpirationDate: "Pilih tanggal",
  formFieldInputPlaceholder__apiKeyName: "Masukkan nama kunci rahasia",
  formFieldInputPlaceholder__backupCode: "Masukkan kode cadangan",
  formFieldInputPlaceholder__emailAddress: "Masukkan alamat email",
  formFieldInputPlaceholder__emailAddress_username:
    "Masukkan email atau nama pengguna",
  formFieldInputPlaceholder__firstName: "Nama depan",
  formFieldInputPlaceholder__lastName: "Nama belakang",
  formFieldInputPlaceholder__organizationDomain: "contoh.com",
  formFieldInputPlaceholder__organizationDomainEmailAddress:
    "anda@contoh.com",
  formFieldInputPlaceholder__organizationName: "Nama organisasi",
  formFieldInputPlaceholder__password: "Masukkan kata sandi",
  formFieldInputPlaceholder__phoneNumber: "Masukkan nomor telepon",
  formFieldInputPlaceholder__signUpPassword: "Buat kata sandi",
  formFieldInputPlaceholder__username: "Masukkan nama pengguna",
  formFieldInput__emailAddress_format: "Contoh format: nama@contoh.com",

  oauthConsent: {
    action__allow: "Izinkan",
    action__deny: "Tolak",
    offlineAccessNotice:
      " Anda akan tetap masuk hingga keluar atau mencabut akses.",
    redirectNotice:
      "Jika Anda mengizinkan akses, aplikasi ini akan mengarahkan Anda ke {{domainAction}}.",
    redirectUriModal: {
      subtitle:
        "Pastikan Anda memercayai {{applicationName}} dan URL ini benar milik {{applicationName}}.",
      title: "URL pengalihan",
    },
    scopeList: {
      privateMetadata:
        "Metadata privat Anda yang diatur oleh {{applicationName}}, yang mungkin berisi informasi sensitif",
      title: "Ini akan memberi {{applicationName}} akses ke:",
    },
    subtitle:
      "ingin mengakses {{applicationName}} atas nama {{identifier}}",
    viewFullUrl: "Lihat URL lengkap",
    warning:
      "Pastikan Anda memercayai {{applicationName}} ({{domainAction}}). Anda mungkin membagikan data sensitif ke situs atau aplikasi ini.",
  },

  organizationSwitcher: {
    action__closeOrganizationSwitcher: "Tutup pengalih organisasi",
    action__openOrganizationSwitcher: "Buka pengalih organisasi",
  },

  reverification: {
    alternativeMethods: {
      blockButton__passkey: "Gunakan passkey Anda",
    },
    passkey: {
      blockButton__passkey: "Gunakan passkey Anda",
      subtitle:
        "Menggunakan passkey memastikan identitas Anda. Perangkat Anda mungkin meminta sidik jari, wajah, atau kunci layar.",
      title: "Gunakan passkey Anda",
    },
    passkeyMfa: {
      blockButton__passkey: "Gunakan passkey Anda",
      subtitle:
        "Menggunakan passkey memastikan itu Anda. Perangkat Anda mungkin meminta sidik jari, wajah, atau kunci layar.",
      title: "Verifikasi diperlukan",
    },
  },

  signIn: {
    alternativePhoneCodeProvider: {
      formTitle: "Kode verifikasi",
      resendButton: "Belum menerima kode? Kirim ulang",
      subtitle: "untuk melanjutkan ke {{applicationName}}",
      title: "Periksa {{provider}} Anda",
    },
    emailLink: {
      verifiedTransferable: {
        subtitle: "Kembali ke tab awal untuk melanjutkan",
        title: "Email terverifikasi",
      },
    },
    enterpriseConnections: {
      subtitle: "Pilih akun perusahaan untuk melanjutkan.",
      title: "Pilih akun",
    },
    enterpriseSSO: {
      formButtonPrimary: "Lanjutkan dengan SSO",
    },
    passkeyMfa: {
      subtitle:
        "Menggunakan passkey memastikan itu Anda. Perangkat Anda mungkin meminta sidik jari, wajah, atau kunci layar.",
      title: "Gunakan passkey Anda",
    },
    passwordCompromised: {
      title: "Kata sandi bocor",
    },
    passwordUntrusted: {
      title: "Kata sandi tidak tepercaya",
    },
    protectCheck: {
      loading: "Memuat…",
      retryButton: "Coba lagi",
      subtitle: "Mohon tunggu sementara kami memverifikasi permintaan Anda.",
      title: "Memverifikasi permintaan Anda",
    },
    ssoBypass: {
      actionLink: "Tidak bisa memakai SSO?",
      code: {
        resendButton: "Belum menerima kode? Kirim ulang",
        subtitle: "untuk melanjutkan ke {{applicationName}}",
        title: "Periksa email Anda",
      },
      notice:
        "Organisasi Anda mewajibkan single sign-on. Melanjutkan tanpa itu akan dicatat.",
    },
    start: {
      alternativePhoneCodeProvider: {
        actionLink: "Gunakan metode lain",
        label: "Nomor telepon {{provider}}",
        subtitle:
          "Masukkan nomor telepon Anda untuk menerima kode verifikasi di {{provider}}.",
        title: "Masuk ke {{applicationName}} dengan {{provider}}",
      },
      titleCombined: "Lanjutkan ke {{applicationName}}",
    },
  },

  signUp: {
    alternativePhoneCodeProvider: {
      resendButton: "Belum menerima kode? Kirim ulang",
      subtitle: "Masukkan kode verifikasi yang dikirim ke {{provider}} Anda",
      title: "Verifikasi {{provider}} Anda",
    },
    enterpriseConnections: {
      subtitle: "Pilih akun perusahaan untuk melanjutkan.",
      title: "Pilih akun",
    },
    protectCheck: {
      loading: "Memuat…",
      retryButton: "Coba lagi",
      subtitle: "Mohon tunggu sementara kami memverifikasi permintaan Anda.",
      title: "Memverifikasi permintaan Anda",
    },
    start: {
      alternativePhoneCodeProvider: {
        actionLink: "Gunakan metode lain",
        label: "Nomor telepon {{provider}}",
        subtitle:
          "Masukkan nomor telepon Anda untuk menerima kode verifikasi di {{provider}}.",
        title: "Daftar ke {{applicationName}} dengan {{provider}}",
      },
    },
  },

  taskResetPassword: {
    formButtonPrimary: "Atur Ulang Kata Sandi",
    signOut: {
      actionLink: "Keluar",
      actionText: "Masuk sebagai {{identifier}}",
    },
    subtitle:
      "Akun Anda memerlukan kata sandi baru sebelum dapat melanjutkan",
    title: "Atur ulang kata sandi",
  },

  taskSetupMfa: {
    badge: "Pengaturan verifikasi dua langkah",
    signOut: {
      actionLink: "Keluar",
      actionText: "Masuk sebagai {{identifier}}",
    },
    smsCode: {
      addPhone: {
        formButtonPrimary: "Lanjutkan",
        infoText:
          "Pesan teks berisi kode verifikasi akan dikirim ke nomor telepon ini. Biaya pesan dan data mungkin berlaku.",
      },
      addPhoneNumber: "Tambahkan nomor telepon",
      cancel: "Batal",
      subtitle:
        "Pilih nomor telepon yang ingin Anda gunakan untuk verifikasi dua langkah lewat kode SMS",
      success: {
        finishButton: "Lanjutkan",
        message1:
          "Verifikasi dua langkah kini aktif. Saat masuk, Anda perlu memasukkan kode verifikasi yang dikirim ke nomor telepon ini sebagai langkah tambahan.",
        message2:
          "Simpan kode cadangan ini di tempat yang aman. Jika Anda kehilangan akses ke perangkat autentikasi, kode cadangan dapat dipakai untuk masuk.",
        title: "Verifikasi kode SMS aktif",
      },
      title: "Tambahkan verifikasi kode SMS",
      verifyPhone: {
        formButtonPrimary: "Lanjutkan",
        formTitle: "Kode verifikasi",
        resendButton: "Belum menerima kode? Kirim ulang",
        subtitle: "Masukkan kode verifikasi yang dikirim ke",
        title: "Verifikasi nomor telepon Anda",
      },
    },
    start: {
      methodSelection: {
        phoneCode: "Kode SMS",
        totp: "Aplikasi autentikator",
      },
      subtitle:
        "Pilih metode yang Anda inginkan untuk melindungi akun dengan lapisan keamanan ekstra",
      title: "Siapkan verifikasi dua langkah",
    },
    totpCode: {
      addAuthenticatorApp: {
        buttonAbleToScan__nonPrimary: "Pindai kode QR",
        buttonUnableToScan__nonPrimary: "Tidak bisa memindai kode QR?",
        formButtonPrimary: "Lanjutkan",
        formButtonReset: "Batal",
        infoText__ableToScan:
          "Siapkan metode masuk baru di aplikasi autentikator Anda dan pindai kode QR berikut untuk menautkannya ke akun Anda.",
        infoText__unableToScan:
          "Siapkan metode masuk baru di autentikator Anda dan masukkan kunci di bawah ini.",
        inputLabel__unableToScan1:
          "Pastikan kata sandi berbasis waktu atau sekali pakai aktif, lalu selesaikan penautan akun Anda.",
      },
      success: {
        finishButton: "Lanjutkan",
        message1:
          "Verifikasi dua langkah kini aktif. Saat masuk, Anda perlu memasukkan kode verifikasi dari autentikator ini sebagai langkah tambahan.",
        message2:
          "Simpan kode cadangan ini di tempat yang aman. Jika Anda kehilangan akses ke perangkat autentikasi, kode cadangan dapat dipakai untuk masuk.",
        title: "Verifikasi aplikasi autentikator aktif",
      },
      title: "Tambahkan aplikasi autentikator",
      verifyTotp: {
        formButtonPrimary: "Lanjutkan",
        formButtonReset: "Batal",
        formTitle: "Kode verifikasi",
        subtitle: "Masukkan kode verifikasi yang dibuat oleh autentikator Anda",
        title: "Tambahkan aplikasi autentikator",
      },
    },
  },

  unstable__errors: {
    action_blocked:
      "Tindakan ini tidak dapat diselesaikan. Coba lagi nanti atau hubungi dukungan jika masalah berlanjut.",
    api_key_name_already_exists: "Nama kunci API sudah dipakai.",
    api_key_usage_exceeded:
      "Batas penggunaan Anda telah tercapai. Batas dapat dihapus dengan meningkatkan ke paket berbayar.",
    form_new_password_matches_current:
      "Kata sandi baru tidak boleh sama dengan kata sandi saat ini.",
    form_password_length_too_short:
      "Kata sandi Anda terlalu pendek. Minimal 8 karakter.",
    form_password_matches_identifier:
      "Kata sandi tidak boleh sama dengan alamat email, nomor telepon, atau nama pengguna Anda. Demi keamanan akun, gunakan kata sandi lain.",
    form_password_untrusted__sign_in:
      "Kata sandi Anda mungkin bocor. Untuk melindungi akun, lanjutkan dengan metode masuk lain. Anda wajib mengatur ulang kata sandi setelah masuk.",
    form_username_invalid_length:
      "Nama pengguna harus terdiri dari {{min_length}}–{{max_length}} karakter.",
    insufficient_seats_change_plan:
      "Organisasi Anda tidak memiliki cukup kursi untuk mengundang anggota sebanyak itu. Ganti ke paket yang mendukung jumlah anggota tersebut.",
    insufficient_seats_contact_support:
      "Organisasi Anda tidak memiliki cukup kursi untuk mengundang anggota sebanyak itu. Hubungi dukungan.",
    oauth_access_denied: "Anda tidak memberikan akses ke akun Anda.",
    organization_not_found_or_unauthorized:
      "Anda bukan lagi anggota organisasi ini. Pilih atau buat organisasi lain.",
    organization_not_found_or_unauthorized_with_create_organization_disabled:
      "Anda bukan lagi anggota organisasi ini. Silakan pilih organisasi lain.",
    protect_check_execution_failed:
      "Verifikasi tidak selesai. Silakan coba lagi.",
    protect_check_invalid_script:
      "Verifikasi tidak dapat dimuat. Hubungi dukungan jika masalah berlanjut.",
    protect_check_invalid_sdk_url:
      "Verifikasi tidak dapat dimulai. Silakan hubungi dukungan.",
    protect_check_required:
      "Proses masuk ini memerlukan langkah verifikasi tambahan yang tidak dapat ditampilkan di sini. Coba lagi atau gunakan metode masuk lain.",
    protect_check_script_load_failed:
      "Verifikasi tidak dapat dimuat. Ini mungkin karena masalah jaringan atau Content Security Policy yang memblokir skrip verifikasi. Coba lagi atau hubungi dukungan.",
    protect_check_timed_out:
      "Verifikasi tidak selesai tepat waktu. Silakan coba lagi.",
    protect_check_unsupported_environment:
      "Verifikasi tidak didukung di lingkungan ini. Lanjutkan di browser standar atau hubungi dukungan.",
    sso_bypass_domain_not_served:
      "Anggota ini tidak dapat ditambahkan karena alamat emailnya tidak dilayani oleh koneksi.",
    ticket_expired_code:
      "Tautan ini sudah kedaluwarsa. Mulai lagi atau minta tautan baru.",
    ticket_invalid_code:
      "Tautan ini tidak lagi valid atau sudah dipakai. Mulai lagi atau minta tautan baru.",
    too_many_unverified_identifications:
      "Terlalu banyak verifikasi tertunda di akun ini. Hapus alamat email, nomor telepon, atau dompet yang tidak lagi Anda perlukan, atau tunggu beberapa menit hingga pengaturan passkey yang belum selesai kedaluwarsa, lalu coba lagi.",
    web3_missing_identifier:
      "Ekstensi Dompet Web3 tidak ditemukan. Pasang salah satu untuk melanjutkan.",
  },

  userButton: {
    action__closeUserMenu: "Tutup menu pengguna",
    action__openUserMenu: "Buka menu pengguna",
  },

  userProfile: {
    emailAddressPage: {
      enterpriseSSOLink: {
        formButton: "Klik untuk masuk",
        formSubtitle: "Selesaikan proses masuk dengan {{identifier}}",
      },
      formHint:
        "Anda perlu memverifikasi alamat email ini sebelum dapat ditambahkan ke akun Anda.",
    },
    mfaPhoneCodePage: {
      backButton: "Gunakan nomor yang ada",
      primaryButton__addPhoneNumber: "Tambahkan nomor telepon",
      removeResource: {
        messageLine1:
          "{{identifier}} tidak akan lagi menerima kode verifikasi saat masuk.",
        messageLine2:
          "Keamanan akun Anda mungkin berkurang. Yakin ingin melanjutkan?",
        successMessage:
          "Verifikasi dua langkah lewat kode SMS telah dihapus untuk {{mfaPhoneCode}}",
        title: "Hapus verifikasi dua langkah",
      },
      subtitle__availablePhoneNumbers:
        "Pilih nomor telepon yang ada untuk mendaftarkan verifikasi dua langkah lewat kode SMS atau tambahkan nomor baru.",
      subtitle__unavailablePhoneNumbers:
        "Tidak ada nomor telepon yang tersedia untuk verifikasi dua langkah lewat kode SMS. Silakan tambahkan nomor baru.",
      successMessage1:
        "Saat masuk, Anda perlu memasukkan kode verifikasi yang dikirim ke nomor telepon ini sebagai langkah tambahan.",
      successMessage2:
        "Simpan kode cadangan ini di tempat yang aman. Jika Anda kehilangan akses ke perangkat autentikasi, kode cadangan dapat dipakai untuk masuk.",
      successTitle: "Verifikasi kode SMS aktif",
      title: "Tambahkan verifikasi kode SMS",
    },
    mfaTOTPPage: {
      authenticatorApp: {
        buttonAbleToScan__nonPrimary: "Pindai kode QR",
        buttonUnableToScan__nonPrimary: "Tidak bisa memindai kode QR?",
        infoText__ableToScan:
          "Siapkan metode masuk baru di aplikasi autentikator Anda dan pindai kode QR berikut untuk menautkannya ke akun Anda.",
        infoText__unableToScan:
          "Siapkan metode masuk baru di autentikator Anda dan masukkan kunci di bawah ini.",
        inputLabel__unableToScan1:
          "Pastikan kata sandi berbasis waktu atau sekali pakai aktif, lalu selesaikan penautan akun Anda.",
        inputLabel__unableToScan2:
          "Alternatifnya, jika autentikator Anda mendukung URI TOTP, Anda juga dapat menyalin URI lengkapnya.",
      },
      removeResource: {
        messageLine1:
          "Kode verifikasi dari autentikator ini tidak lagi diperlukan saat masuk.",
        messageLine2:
          "Keamanan akun Anda mungkin berkurang. Yakin ingin melanjutkan?",
        successMessage:
          "Verifikasi dua langkah lewat aplikasi autentikator telah dihapus.",
        title: "Hapus verifikasi dua langkah",
      },
      successMessage:
        "Verifikasi dua langkah kini aktif. Saat masuk, Anda perlu memasukkan kode verifikasi dari autentikator ini sebagai langkah tambahan.",
      title: "Tambahkan aplikasi autentikator",
      verifySubtitle:
        "Masukkan kode verifikasi yang dibuat oleh autentikator Anda",
      verifyTitle: "Kode verifikasi",
    },
    mobileButton__menu: "Menu",
    navbar: {
      apiKeys: "Kunci API",
      billing: "Tagihan",
    },
    passkeyScreen: {
      removeResource: {
        messageLine1: "{{name}} akan dihapus dari akun ini.",
        title: "Hapus passkey",
      },
      subtitle__rename:
        "Anda dapat mengubah nama passkey agar lebih mudah ditemukan.",
      title__rename: "Ganti nama passkey",
    },
    plansPage: {
      title: "Paket",
    },
    start: {
      activeDevicesSection: {
        destructiveAction: "Keluar dari perangkat",
        title: "Perangkat aktif",
      },
      connectedAccountsSection: {
        actionLabel__connectionFailed: "Hubungkan ulang",
        actionLabel__reauthorize: "Izinkan sekarang",
        destructiveActionTitle: "Hapus",
        primaryButton: "Hubungkan akun",
        subtitle__disconnected: "Akun ini telah terputus.",
        subtitle__reauthorize:
          "Izin yang diperlukan telah diperbarui dan sebagian fungsi mungkin terbatas. Silakan izinkan ulang aplikasi ini untuk menghindari masalah",
        title: "Akun terhubung",
      },
      dangerSection: {
        deleteAccountButton: "Hapus akun",
        title: "Hapus akun",
      },
      emailAddressesSection: {
        destructiveAction: "Hapus email",
        detailsAction__nonPrimary: "Jadikan utama",
        detailsAction__primary: "Selesaikan verifikasi",
        detailsAction__unverified: "Verifikasi",
        primaryButton: "Tambahkan alamat email",
        title: "Alamat email",
      },
      enterpriseAccountsSection: {
        title: "Akun perusahaan",
      },
      headerTitle__account: "Detail profil",
      headerTitle__security: "Keamanan",
      mfaSection: {
        backupCodes: {
          actionLabel__regenerate: "Buat ulang",
          headerTitle: "Kode cadangan",
          subtitle__regenerate:
            "Dapatkan kode cadangan aman yang baru. Kode cadangan sebelumnya akan dihapus dan tidak dapat digunakan.",
          title__regenerate: "Buat ulang kode cadangan",
        },
        phoneCode: {
          actionLabel__setDefault: "Jadikan default",
          destructiveActionLabel: "Hapus",
        },
        primaryButton: "Tambahkan verifikasi dua langkah",
        title: "Verifikasi dua langkah",
        totp: {
          destructiveActionTitle: "Hapus",
          headerTitle: "Aplikasi autentikator",
        },
      },
      passkeysSection: {
        menuAction__destructive: "Hapus",
        menuAction__rename: "Ganti nama",
        primaryButton: "Tambahkan passkey",
        title: "Passkey",
      },
      passwordSection: {
        primaryButton__setPassword: "Atur kata sandi",
        primaryButton__updatePassword: "Perbarui kata sandi",
        title: "Kata sandi",
      },
      phoneNumbersSection: {
        destructiveAction: "Hapus nomor telepon",
        detailsAction__nonPrimary: "Jadikan utama",
        detailsAction__primary: "Selesaikan verifikasi",
        detailsAction__unverified: "Verifikasi nomor telepon",
        primaryButton: "Tambahkan nomor telepon",
        title: "Nomor telepon",
      },
      profileSection: {
        primaryButton: "Perbarui profil",
        title: "Profil",
      },
      usernameSection: {
        primaryButton__setUsername: "Atur nama pengguna",
        primaryButton__updateUsername: "Perbarui nama pengguna",
        title: "Nama pengguna",
      },
      web3WalletsSection: {
        destructiveAction: "Hapus dompet",
        detailsAction__nonPrimary: "Jadikan utama",
        primaryButton: "Hubungkan dompet",
        title: "Dompet Web3",
      },
    },
    usernamePage: {
      successMessage: "Nama pengguna Anda telah diperbarui.",
      title__set: "Atur nama pengguna",
      title__update: "Perbarui nama pengguna",
    },
    web3WalletPage: {
      removeResource: {
        messageLine1: "{{identifier}} akan dihapus dari akun ini.",
        messageLine2:
          "Anda tidak akan bisa lagi masuk menggunakan dompet web3 ini.",
        successMessage: "{{web3Wallet}} telah dihapus dari akun Anda.",
        title: "Hapus dompet web3",
      },
      subtitle__availableWallets:
        "Pilih dompet web3 untuk dihubungkan ke akun Anda.",
      subtitle__unavailableWallets: "Tidak ada dompet web3 yang tersedia.",
      successMessage: "Dompet telah ditambahkan ke akun Anda.",
      title: "Tambahkan dompet web3",
      web3WalletButtonsBlockButton: "{{provider|titleize}}",
    },
  },
} as const;

type LocalizationTree = Record<string, unknown>;

/** Gabungkan objek terjemahan bertingkat tanpa kehilangan kunci dari locale. */
function deepMerge(base: LocalizationTree, patch: LocalizationTree): LocalizationTree {
  const result: LocalizationTree = { ...base };

  for (const [key, value] of Object.entries(patch)) {
    const current = result[key];

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      current &&
      typeof current === "object" &&
      !Array.isArray(current)
    ) {
      result[key] = deepMerge(
        current as LocalizationTree,
        value as LocalizationTree,
      );
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Locale `idID` resmi Clerk, ditambah label yang belum tersedia di upstream.
 */
export const civitaLocalization = deepMerge(
  idID as unknown as LocalizationTree,
  overrides as unknown as LocalizationTree,
) as LocalizationResource;
