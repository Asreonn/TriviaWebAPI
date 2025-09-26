# Test Plan Stub

Bu klasör backend için Jest + Supertest tabanlı entegrasyon testlerini barındırmak üzere hazırlandı. Önerilen senaryolar:

1. `/api/quizzes` uç noktası için doğrulama hataları ve başarılı gönderim akışları.
2. `/api/quizzes/random` filtresiz ve filtreli rastgele soru akışı (MongoMemoryServer kullanarak).
3. `/api/admin/login` için pozitif/negatif kimlik doğrulama vakaları ve kilitleme mekanizması.
4. `/api/admin/quizzes/:id/(approve|reject)` RBAC kontrolü ve audit kaydı doğrulamaları.
5. Sağlık ucu (`/api/health`) ve izinli rate-limit sınırlarının test edilmesi.

> Not: Testler çalıştırılmadan önce `mongodb-memory-server` ile izole veritabanı kurulması ve `NODE_ENV=test` konfigürasyonunun yapılması önerilir.
