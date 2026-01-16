# QuizCraft Mobile 📱

QuizCraft'ın resmi React Native/Expo mobil uygulaması. Yapay zeka destekli quiz oyunu ile bilgini test et!

## 🚀 Özellikler

- 🎯 **Kategori Bazlı Quizler** - Coğrafya, Bayraklar, Tarih ve daha fazlası
- 🤖 **AI Destekli Sorular** - Google Gemini ile dinamik soru üretimi
- 🏆 **Liderlik Tablosu** - Global ve kategori bazlı sıralamalar
- 🎨 **5 Farklı Tema** - Koyu, Gece Mavisi, Okyanus, Gün Batımı, Cyberpunk
- 📊 **Detaylı İstatistikler** - Quiz geçmişi ve performans analizi
- 👑 **Admin Paneli** - Kullanıcı yönetimi (admin kullanıcılar için)
- ✨ **Modern UI** - Animasyonlar, haptic feedback, konfeti efektleri

## 📋 Gereksinimler

- Node.js 18+
- npm veya yarn
- Expo CLI
- iOS Simulator (Mac) veya Android Emulator
- Veya fiziksel cihaz ile Expo Go uygulaması

## 🛠️ Kurulum

### 1. Bağımlılıkları Yükle

```bash
cd mobile
npm install
```

### 2. Backend'i Başlat

Mobil uygulama çalışmadan önce backend sunucusunun çalışıyor olması gerekir:

```bash
cd ../backend
npm install
npm run dev
```

Backend varsayılan olarak `http://localhost:3001` adresinde çalışır.

### 3. API URL'ini Yapılandır

Eğer fiziksel cihazda test ediyorsanız, `src/lib/api.ts` dosyasında API URL'ini güncellemeniz gerekir:

```typescript
// Emulator için localhost kullanabilirsiniz
// Fiziksel cihaz için bilgisayarınızın IP adresini kullanın
const API_BASE_URL = 'http://192.168.1.XXX:3001/api';
```

### 4. Uygulamayı Başlat

```bash
# Expo development server
npm start

# veya doğrudan platform seçerek
npm run ios     # iOS Simulator
npm run android # Android Emulator
npm run web     # Web tarayıcı (beta)
```

## 📱 Expo Go ile Test

1. Telefonunuza [Expo Go](https://expo.dev/client) uygulamasını indirin
2. `npm start` ile development server'ı başlatın
3. Terminaldeki QR kodu telefonunuzla tarayın
4. Uygulama Expo Go içinde açılacaktır

**Not:** Fiziksel cihazda test ederken bilgisayar ve telefon aynı Wi-Fi ağında olmalıdır.

## 🏗️ Proje Yapısı

```
mobile/
├── App.tsx                 # Ana uygulama bileşeni
├── app.json               # Expo yapılandırması
├── package.json           # Bağımlılıklar
├── assets/                # İkon, splash, sesler
│   ├── sounds/           # Ses dosyaları
│   └── README.md         # Asset gereksinimleri
└── src/
    ├── components/       # Yeniden kullanılabilir UI bileşenleri
    │   └── ui/          # Button, Card, Input, Modal, vb.
    ├── constants/       # Tema renkleri, spacing, typography
    ├── contexts/        # React Context'ler (Theme)
    ├── lib/             # API client, utility fonksiyonları
    ├── navigation/      # React Navigation yapılandırması
    ├── screens/         # Uygulama ekranları
    │   ├── auth/       # Login, Register
    │   ├── main/       # Home, Profile, Leaderboard, Admin
    │   └── quiz/       # QuizSetup, QuizPlay, QuizResults
    ├── store/           # Zustand state yönetimi
    └── types/           # TypeScript tipleri
```

## 🎨 Temalar

Uygulama 5 farklı tema ile gelir. Profil ekranından tema değiştirebilirsiniz:

| Tema | Açıklama |
|------|----------|
| 🌙 Koyu | Klasik koyu tema |
| 🌌 Gece Mavisi | Derin mavi tonlar |
| 🌊 Okyanus | Turkuaz ve deniz renkleri |
| 🌅 Gün Batımı | Turuncu ve mor tonlar |
| 🤖 Cyberpunk | Neon pembe ve cyan |

## 🔐 Kimlik Doğrulama

### Demo Hesapları

```
Admin: admin@quizcraft.com / admin123
User:  demo@quizcraft.com / demo123
```

### Kayıt

Yeni hesap oluşturmak için Register ekranını kullanın.

## 🛠️ Geliştirme

### Kod Stili

- TypeScript strict mode
- Functional components with hooks
- Zustand for state management
- React Navigation v6
- Expo SDK 51

### Animasyonlar

Uygulama `react-native-reanimated` v3 kullanır:

```typescript
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';

<Animated.View entering={FadeIn.duration(500)}>
  {/* content */}
</Animated.View>
```

### API İstekleri

Tüm API istekleri `src/lib/api.ts` üzerinden yapılır:

```typescript
import { authAPI, quizAPI, leaderboardAPI } from '../lib/api';

// Örnek kullanım
const response = await quizAPI.start(categoryId, subcategoryId, difficulty, count);
```

## 📦 Build

### Development Build

```bash
npx expo prebuild
npx expo run:ios
npx expo run:android
```

### Production Build

```bash
# EAS Build (önerilen)
npx eas build --platform ios
npx eas build --platform android

# Veya local build
npx expo build:ios
npx expo build:android
```

## 🐛 Sorun Giderme

### Metro bundler hataları

```bash
npx expo start -c  # Cache temizleyerek başlat
```

### Bağımlılık sorunları

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### iOS Simulator bulunamıyor

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

### Android Emulator bağlantı sorunu

```bash
adb reverse tcp:3001 tcp:3001
```

## 📄 Lisans

MIT License - QuizCraft Team

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın
