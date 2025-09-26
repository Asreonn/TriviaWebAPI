# TriviAPI Web & API Platformu

Bu repo, TriviAPI servisinin hem tanıtım(dokümantasyon) sitesini hem de Node.js tabanlı API/backoffice katmanını içeriyor. Ön yüz React ile hazırlanmış SPA, arka planda ise Express + MongoDB ile çalışan bir servis ve yönetim paneli bulunuyor.

## Projenin Amacı
- Geliştiricilere Türkçe trivia sorularını REST API ile sağlamak
- API kullanımını belgelemek ve örneklerle göstermek
- Son kullanıcıların soru çözebileceği basit bir demo arayüzü sunmak
- Kullanıcıların yeni soru gönderebilmesi ve admin onayıyla yayına alınabilmesi

## Mimari Özeti
```
root
├── src/                  # React uygulaması (dokümantasyon, quiz deneyimi, admin paneli)
├── public/               # CRA statik dosyaları
└── server/               # Express tabanlı API ve yönetim backend'i
    ├── server.js         # HTTP giriş noktası, db/cache/jQueue bootstrapping
    ├── src/
    │   ├── app.js        # Express middleware zinciri ve router montajı
    │   ├── config/       # Zod ile doğrulanan yapılandırma katmanı
    │   ├── controllers/  # HTTP request controllerları
    │   ├── middleware/   # Hata yönetimi, auth, RBAC, rate limit vb.
    │   ├── models/       # Mongoose şema tanımları
    │   ├── repositories/ # Veri erişim soyutlamaları
    │   ├── services/     # İş kuralları, cache, job tetikleyiciler
    │   ├── routes/       # API endpoint haritaları
    │   ├── utils/        # Logger, DB, hata sınıfları
    │   ├── validations/  # Zod şemaları
    │   └── jobs/         # BullMQ kuyruğu (quiz served metriği)
    └── tests/            # Jest + Supertest entegrasyon testleri
```

## Ön Yüz (React)
- CRA 5 tabanlı SPA
- react-router-dom ile sayfa navigasyonu (`Home`, `BrowseQuizzes`, `SubmitQuiz`, `Documentation`, `AdminDashboard`)
- IntersectionObserver ile animasyon tetiklemeleri ve statik kod örneği blokları
- Admin paneli `React Toastify` bildirimleri ile form ve pending quiz listesi
- Build almak için `npm run build`

## Backend (Express)
- Mongoose ile MongoDB bağlantısı (`server/src/models/*`)
- JWT tabanlı admin oturumu (`server/src/middleware/auth.js` + `services/adminService.js`)
- RBAC kontrolü (`server/src/middleware/rbac.js`)
- Quiz oluşturma, rastgele quiz listeleme, istatistik uçları (`server/src/routes/quizRoutes.js`)
- Admin login, pending quiz listesi, approve/reject akışı (`server/src/routes/adminRoutes.js`)
- Pino loglama + request id + rate limit + helmet + cors zinciri
- Opsiyonel Redis cache + BullMQ kuyruğu
  - REDIS_URL tanımlanırsa kategori filtreleri cache’lenir ve quiz served metriği job kuyruğuna düşer
  - Redis yoksa servis otomatik olarak degrade olur (direct DB update)

## Kurulum & Çalıştırma
```bash
git clone https://github.com/<USER>/TriviAPIWeb.git
cd TriviAPIWeb
npm install
```

### Çevresel değişkenler
`server/.env.example` dosyasını `.env` olarak kopyala ve aşağıdaki kritik değerleri doldur:
```
MONGODB_URI=mongodb://localhost:27017/triviapi
JWT_ACCESS_SECRET=<en az 32 karakter>
JWT_REFRESH_SECRET=<en az 32 karakter>
CORS_ORIGIN=http://localhost:3000
# Redis opsiyonel
REDIS_URL=redis://localhost:6379
```

### Geliştirme Akışı
- API + frontend aynı anda: `npm run dev` (concurrently ile hem `npm start` hem `npm run server`)
- Sadece API: `npm run server`
- Sadece frontend: `npm start`

### Admin Kullanıcı Tohumu
Varsayılan admin oluşturmak için:
```bash
node server/scripts/seedAdmin.js \
  --username admin \
  --password Sifre123! \
  --displayName "Sistem Yöneticisi" \
  --permissions approve_quizzes reject_quizzes view_pending_quizzes view_stats
```
Bu komut kullanıcı yoksa oluşturur, varsa roller/izinleri günceller.

## Test & Kalite
- Backend entegrasyon testleri: `npm run test:server`
  - MongoMemoryServer ile izole veritabanı kurulur
  - health, quiz akışları, admin login ve review senaryoları kapsanır
- Frontend lint/derleme: `npm run build` (CRA uyarıları: browserslist güncellemesi ve `@babel/plugin-proposal-private-property-in-object` eklemesi yapılabilir)

## Dağıtım Notları
- Frontend statik build `render.yaml` içindeki komutlarla Render Static site olarak yayınlanabilir
- Backend için Render/Heroku benzeri ortamlarda `server/server.js`’i çalıştırmak yeterli; env değişkenlerini ortamdan geçir
- Redis olmadan da çalışır ancak performans optimizasyonları devre dışı kalır

## Yol Haritası (kişisel notlar)
- Admin paneli için granular log ve audit UI eklemek
- Quiz listeleme endpoint’lerinin sorgu performansını Redis ile güçlendirmek (şu an temel cache var)
- CI/CD tarafında GitHub Actions ile `npm run test:server` ve üretim build’i otomatikleştirmek
- Frontend’i CRA dışına taşıma (Vite/Next opsiyonu) ve MUI komponentlerini storybook ile dokümante etmek

## Katkı & Lisans
Bu proje kişisel kullanım için açık durumda. PR göndermek isterseniz lütfen issue açıp hangi katmanda çalışacağınızı belirtin. Kod stili ESLint/Prettier ile hizalanmıştır. Lisans: ISC.
