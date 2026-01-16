# 🎯 QuizCraft

QuizCraft, gerçek zamanlı soru üretimi, liderlik tabloları ve modern animasyonlar içeren full-stack bir quiz uygulamasıdır. Farklı kategorilerde bilginizi test edin!

## ✨ Özellikler

- **📚 Çoklu Kategoriler** - Spor, Eğlence, Bilim, Tarih, Coğrafya, Teknoloji, Oyunlar, Yemek & İçecek, Doğa & Hayvanlar
- **🎚️ 3 Zorluk Seviyesi** - Kolay, Orta, Zor
- **🏆 Liderlik Tabloları** - Konfigürasyon bazlı sıralama ve madalya sistemi (🥇🥈🥉)
- **👤 Kullanıcı Profilleri** - Quiz geçmişi ve istatistikler
- **🔐 Güvenli Kimlik Doğrulama** - JWT tabanlı authentication
- **👨‍💼 Admin Paneli** - Kullanıcı yönetimi
- **🌙 Karanlık Mod** - Tema değiştirme desteği
- **🎨 Modern Arayüz** - Tailwind CSS ve Framer Motion animasyonları
- **🎊 Eğlenceli Efektler** - Doğru cevaplarda konfeti kutlaması

## 🛠️ Teknolojiler

### Backend
- **Runtime**: Node.js + Express
- **Dil**: TypeScript (ESM)
- **Veritabanı**: SQLite + Drizzle ORM
- **Kimlik Doğrulama**: JWT + bcrypt
- **Validasyon**: Zod
- **Rate Limiting**: express-rate-limit

### Frontend
- **Framework**: React 18 + Vite
- **Dil**: TypeScript
- **Stil**: Tailwind CSS
- **State Yönetimi**: Zustand
- **Animasyonlar**: Framer Motion
- **Efektler**: canvas-confetti
- **İkonlar**: Lucide React
- **UI Primitives**: Radix UI

## 📁 Proje Yapısı

```
quizcraft/
├── backend/                 # Express.js API sunucusu
│   ├── src/
│   │   ├── index.ts         # Ana başlangıç noktası
│   │   ├── db/              # Veritabanı şeması ve seed
│   │   ├── middleware/      # Auth ve error handling
│   │   ├── routes/          # API endpoint'leri
│   │   └── services/        # İş servisleri
│   └── package.json
│
├── frontend/                # React + Vite uygulaması
│   ├── src/
│   │   ├── components/      # UI bileşenleri
│   │   ├── pages/           # Sayfa bileşenleri
│   │   ├── store/           # Zustand state
│   │   ├── lib/             # API ve utility fonksiyonlar
│   │   └── types/           # TypeScript tipleri
│   └── package.json
│
├── README.md
└── START.md                 # Kurulum ve başlatma rehberi
```

## 🚀 Hızlı Başlangıç

Detaylı kurulum ve başlatma talimatları için [START.md](START.md) dosyasına bakın.

### Özet

```bash
# Backend
cd backend
npm install
npm run db:push
npm run db:seed
npm run dev

# Frontend (yeni terminal)
cd frontend
npm install
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

### Varsayılan Admin Bilgileri

- **Email**: admin@quizcraft.com
- **Şifre**: admin123

## 📖 API Endpoints

### Kimlik Doğrulama
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/register` | Yeni kullanıcı kaydı |
| POST | `/api/auth/login` | Kullanıcı girişi |
| GET | `/api/auth/me` | Mevcut kullanıcı bilgisi |

### Kategoriler
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/categories` | Tüm kategorileri listele |
| GET | `/api/categories/:id` | Kategori detayı ve alt kategoriler |

### Quiz
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/quiz/start` | Yeni quiz başlat |
| GET | `/api/quiz/:uuid` | Quiz detayı |
| POST | `/api/quiz/:uuid/answer` | Soru cevapla |
| POST | `/api/quiz/:uuid/submit` | Quiz'i tamamla |

### Liderlik Tablosu
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/leaderboard` | Genel liderlik tablosu |
| GET | `/api/leaderboard/config` | Konfigürasyon bazlı sıralama |

### Profil
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/profile` | Kullanıcı profili |
| GET | `/api/profile/history` | Quiz geçmişi |
| GET | `/api/profile/stats` | İstatistikler |

### Admin
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/admin/users` | Kullanıcı listesi |
| DELETE | `/api/admin/users/:id` | Kullanıcı sil |
| PUT | `/api/admin/users/:id` | Kullanıcı güncelle |

## 📝 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.
