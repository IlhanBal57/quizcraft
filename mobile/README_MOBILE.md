# QuizCraft Mobil Proje Başlatma Kılavuzu

## 1. Backend (API) Sunucusunu Başlatma
1. Terminal açın ve backend klasörüne girin:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Sunucu genellikle `http://localhost:3000` adresinde çalışır.

## 2. Frontend (Web) Sunucusunu Başlatma
1. Yeni bir terminal açın ve frontend klasörüne girin:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Genellikle `http://localhost:5173` adresinde çalışır.

## 3. Mobil (React Native) Uygulamasını Çalıştırma
1. Android Studio'da bir emülatör başlatın veya cihazınızı bağlayın.
2. Terminalde mobile klasörüne girin:
   ```bash
   cd mobile
   npm install
   ```
3. Metro bundler'ı başlatın:
   ```bash
   npx react-native start
   ```
4. Yeni bir terminal açın ve uygulamayı başlatın:
   ```bash
   npx react-native run-android
   ```

### Önemli Notlar
- Mobil uygulamanın backend API adresini `mobile/src/lib/api.ts` dosyasında güncelleyin. Emülatörde backend'e erişmek için `10.0.2.2:3000` kullanılır.
- Tüm klasörlerde `npm install` komutunu çalıştırmayı unutmayın.

---

Herhangi bir hata alırsanız, hata mesajını paylaşarak destek isteyebilirsiniz.
