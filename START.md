# 🚀 QuizCraft - Kurulum ve Başlatma Rehberi

Bu rehber, QuizCraft projesini sıfırdan kurmak veya mevcut kurulumu başlatmak için gereken tüm adımları içerir.

---

## 📋 Gereksinimler

- **Node.js** 18 veya üzeri
- **npm** (Node.js ile birlikte gelir)

Node.js kurulu mu kontrol etmek için:
```bash
node --version
npm --version
```

---

## 🆕 İLK KURULUM (Sıfırdan)

Projeyi ilk kez kuruyorsanız bu adımları takip edin.

### 1. Backend Kurulumu

```bash
# Backend klasörüne git
cd backend

# Bağımlılıkları yükle
npm install

# .env dosyasını oluştur (zaten varsa bu adımı atla)
# .env.example dosyasını kopyala ve düzenle
cp .env.example .env

# Veritabanı şemasını oluştur
npm run db:push

# Başlangıç verilerini yükle (admin kullanıcısı ve kategoriler)
npm run db:seed
```

### 2. Frontend Kurulumu

```bash
# Yeni bir terminal aç ve frontend klasörüne git
cd frontend

# Bağımlılıkları yükle
npm install
```

### 3. Projeyi Başlat

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Tarayıcıda Aç

- **Uygulama**: http://localhost:5173
- **API**: http://localhost:3001

---

## 🔄 MEVCUT KURULUMU BAŞLATMA

Proje daha önce kurulmuşsa, sadece sunucuları başlatmanız yeterli.

### Hızlı Başlatma

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Bu kadar! 🎉

---

## 🔐 Giriş Bilgileri

### Admin Hesabı
- **Email**: `admin@quizcraft.com`
- **Şifre**: `admin123`

### Yeni Kullanıcı
Kayıt sayfasından yeni kullanıcı oluşturabilirsiniz: http://localhost:5173/register

---

## 🗂️ Ortam Değişkenleri (.env)

Backend `.env` dosyası şu değişkenleri içerir:

```env
DATABASE_URL=file:./database/quizcraft.db
JWT_SECRET=quizcraft-super-secret-jwt-key-change-me-in-production
JWT_EXPIRES_IN=7d
QUESTION_API_KEY=your-api-key-here
PORT=3001
```

| Değişken | Açıklama |
|----------|----------|
| `DATABASE_URL` | SQLite veritabanı dosya yolu |
| `JWT_SECRET` | JWT token imzalama anahtarı |
| `JWT_EXPIRES_IN` | Token geçerlilik süresi |
| `QUESTION_API_KEY` | Soru üretim servisi API anahtarı |
| `PORT` | Backend sunucu portu |

---

## 📜 Mevcut NPM Komutları

### Backend (`cd backend`)

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusunu başlat |
| `npm run db:push` | Veritabanı şemasını senkronize et |
| `npm run db:seed` | Başlangıç verilerini yükle |

### Frontend (`cd frontend`)

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusunu başlat |
| `npm run build` | Prodüksiyon build oluştur |
| `npm run preview` | Build'i önizle |

---

## ❓ Sık Karşılaşılan Sorunlar

### 1. Port zaten kullanımda
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Çözüm**: Başka bir terminal'de çalışan sunucuyu kapatın veya `.env` dosyasında portu değiştirin.

### 2. Veritabanı hatası
```
Error: SQLITE_CANTOPEN
```
**Çözüm**: 
```bash
cd backend
npm run db:push
npm run db:seed
```

### 3. Modül bulunamadı
```
Error: Cannot find module
```
**Çözüm**:
```bash
# Backend için
cd backend
npm install

# Frontend için
cd frontend
npm install
```

### 4. Giriş yapamıyorum
**Çözüm**: Admin şifresini sıfırlamak için:
```bash
cd backend
npm run db:seed
```
Bu komut admin kullanıcısını yeniden oluşturur.

---

## 🎯 Kullanım Akışı

1. **Giriş Yap** - Admin veya kayıtlı kullanıcı olarak giriş yapın
2. **Kategori Seç** - Ana sayfadan bir kategori seçin
3. **Quiz Ayarla** - Alt kategori, zorluk ve soru sayısını belirleyin
4. **Quiz Oyna** - Soruları cevaplayın
5. **Sonuçları Gör** - Skorunuzu ve liderlik tablosundaki yerinizi görün

---

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Terminaldeki hata mesajlarını kontrol edin
2. Node.js ve npm sürümlerinizin güncel olduğundan emin olun
3. `node_modules` klasörünü silip `npm install` komutunu tekrar çalıştırın

```bash
# Temiz kurulum
rm -rf node_modules
npm install
```

Windows için:
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```
