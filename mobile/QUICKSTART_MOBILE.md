# QuizCraft Mobilde Çalıştırma Kılavuzu

Bu döküman, QuizCraft projesinin mobilde (Android Studio ile) nasıl çalıştırılacağını ve backend/frontend servislerinin nasıl başlatılacağını adım adım açıklar.

## 1. Backend (API) Sunucusunu Başlatma

1. Terminali açın ve backend klasörüne gidin:
   ```bash
   cd backend
   ```
2. Gerekli paketleri yükleyin:
   ```bash
   npm install
   ```
3. Sunucuyu başlatın:
   ```bash
   npm run dev
   ```
   - Sunucu genellikle `http://localhost:3000` adresinde çalışır.

## 2. Frontend (Web) Sunucusunu Başlatma

1. Yeni bir terminal açın ve frontend klasörüne gidin:
   ```bash
   cd frontend
   ```
2. Gerekli paketleri yükleyin:
   ```bash
   npm install
   ```
3. Frontend'i başlatın:
   ```bash
   npm run dev
   ```
   - Genellikle `http://localhost:5173` adresinde çalışır.

## 3. Mobil (React Native) Uygulamasını Çalıştırma

1. Android Studio'yu açın ve bir Android emülatörü başlatın veya cihazınızı bağlayın.
2. Terminalde mobile klasörüne gidin:
   ```bash
   cd mobile
   ```
3. Gerekli paketleri yükleyin:
   ```bash
   npm install
   ```
4. Metro bundler'ı başlatın:
   ```bash
   npx react-native start
   ```
5. Yeni bir terminal açın ve uygulamayı emülatörde başlatın:
   ```bash
   npx react-native run-android
   ```

> **Not:**
> - Backend `http://localhost:3001` adresinde çalışıyor.
> - Mobil uygulama, API bağlantısı için Android emülatörde otomatik olarak `10.0.2.2:3001` kullanır (`mobile/src/lib/api.ts`).
> - Gerçek cihazda test ediyorsanız, bilgisayarınızın yerel IP'sini kullanın (örn: `192.168.1.100:3001`).

## 4. Siyah Ekran Sorunu Çözümleri

Eğer uygulamayı başlattığınızda siyah ekran görüyorsanız, aşağıdaki adımları deneyin:

### Çözüm 1: Metro Bundler'ı Temizle ve Yeniden Başlat
```bash
cd mobile
npx expo start -c
```
`-c` parametresi cache'i temizler.

### Çözüm 2: Terminal'de Hataları Kontrol Edin
- Expo başladığında terminalde hata loglarını kontrol edin.
- Genellikle eksik modül, syntax hatası veya API bağlantı hatası gösterilir.

### Çözüm 3: Android Emülatörü Yeniden Başlatın
- Emülatörü kapatıp tekrar açın.
- `npx expo start` komutunu çalıştırın ve `a` tuşuna basın.

### Çözüm 4: React Native Debugger ile Hata Takibi
- Expo çalışırken terminalde `j` tuşuna basarak debugger açın.
- Chrome Developer Tools ile console loglarını kontrol edin.

### Çözüm 5: Uygulamayı Tamamen Sil ve Yeniden Yükle
```bash
# Android emülatörde uygulamayı silin
adb uninstall com.quizcraftmobile
# Expo'yu yeniden başlatın
npx expo start
```

## 5. Sık Karşılaşılan Diğer Sorunlar
- **Bağlantı Hatası:** Backend çalışmıyor olabilir. Backend'in `http://localhost:3001` adresinde çalıştığını doğrulayın.
- **Paket Eksikliği:** `npm install` komutlarını her klasörde çalıştırdığınızdan emin olun.
- **Emülatör Sorunu:** Android Studio'da bir emülatör başlatın veya gerçek cihazı USB ile bağlayın.

---

Herhangi bir hata alırsanız, hata mesajını paylaşarak destek isteyebilirsiniz.