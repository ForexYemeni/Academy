# دليل ربط التطبيق بقاعدة بيانات حقيقية

هذا الدليل يشرح 3 طرق لربط تطبيق SonicAcademy بقاعدة بيانات حقيقية للنشر على Vercel.

---

## 🎯 الطريقة الأولى: MongoDB Atlas (موصى بها - مجانية)

### لماذا MongoDB؟
- مجانية مدى الحياة (512MB كافية لآلاف المستخدمين)
- تدعم بيانات غير منظمة (مناسبة للصوت base64)
- تتوسع أفقياً بسهولة
- مدعومة من Prisma ORM

### الخطوة 1: إنشاء حساب MongoDB Atlas

1. اذهب إلى: **https://www.mongodb.com/cloud/atlas/register**
2. سجّل بحساب GitHub أو Google أو بريدك
3. اختر **M0 Free** (مجاني مدى الحياة)
4. اختر:
   - Provider: **AWS** (الأكثر استقراراً)
   - Region: **ap-south-1 (Mumbai)** الأقرب لليمن والخليج
5. اسم الـ Cluster: `sonic-academy`
6. اضغط **Create Cluster** (يستغرق 2-3 دقائق)

### الخطوة 2: إنشاء مستخدم قاعدة البيانات

1. في القائمة الجانبية: **Security** → **Database Access**
2. اضغط **Add New Database User**
3. اسم المستخدم: `sonicadmin`
4. كلمة المرور: استخدم كلمة قوية (مثلاً `SonicPass2026!XYZ`)
5. **Database User Privileges**: `Read and write to any database`
6. اضغط **Add User**

### الخطوة 3: السماح بالاتصال (Network Access)

1. في القائمة الجانبية: **Network Access**
2. اضغط **Add IP Address**
3. اختر **Allow Access From Anywhere** (`0.0.0.0/0`)
   - ملاحظة: هذا ضروري لأن Vercel يستخدم IPs متغيرة
4. اضغط **Confirm**

### الخطوة 4: الحصول على Connection String

1. اذهب إلى **Database** → اضغط **Connect** على الـ Cluster
2. اختر **Drivers**
3. اختر **Node.js** والإصدار **4.4+**
4. انسخ الـ connection string:
   ```
   mongodb+srv://sonicadmin:<db_password>@sonic-academy.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=sonic-academy
   ```
5. استبدل `<db_password>` بكلمة المرور (بدون الأقواس)

### الخطوة 5: تفعيل Prisma MongoDB

في مشروعك، استبدل محتوى `prisma/schema.prisma` بمحتوى `prisma/schema.mongodb.prisma`:

```bash
# في جهازك المحلي
cp prisma/schema.mongodb.prisma prisma/schema.prisma
```

أهم الفروقات في schema MongoDB:
- `provider = "mongodb"` بدلاً من `"sqlite"`
- `previewFeatures = ["mongoDb"]` في generator
- كل ID يصبح: `@id @default(auto()) @map("_id") @db.ObjectId`
- الـ Enums تصبح `String` مع تعليق بالقيم المسموحة
- العلاقات تتطلب `@db.ObjectId` على الحقول المرتبطة

### الخطوة 6: تحديث .env

في ملف `.env`:
```bash
DATABASE_URL="mongodb+srv://sonicadmin:SonicPass2026!XYZ@sonic-academy.xxxxx.mongodb.net/sonic_academy?retryWrites=true&w=majority"
JWT_SECRET="your-super-secret-jwt-key-change-this"
```

ملاحظة مهمة: أضف اسم قاعدة البيانات `/sonic_academy` قبل `?retryWrites`.

### الخطوة 7: دفع الـ schema و seed

```bash
bun run db:push    # أو npx prisma db push
bun run seed       # إنشاء حساب الإدارة الافتراضي + بيانات تجريبية
```

### الخطوة 8: إضافة متغيرات البيئة في Vercel

1. اذهب إلى مشروعك في **Vercel** → **Settings** → **Environment Variables**
2. أضف:
   - **Key**: `DATABASE_URL`
   - **Value**: connection string الكامل
   - **Environments**: Production, Preview, Development (الكل)
3. أضف أيضاً:
   - **Key**: `JWT_SECRET`
   - **Value**: سلسلة عشوائية 32+ حرف (مثلاً `openssl rand -hex 32`)
4. اضغط **Save**
5. **Redeploy** المشروع (Deployments → أحدث deploy → Redeploy)

### الخطوة 9: التحقق

بعد النشر، اذهب إلى موقعك على Vercel:
1. جرّب `/register` — يجب أن يعمل إنشاء الحساب
2. جرّب `/login` — يجب أن يعمل تسجيل الدخول
3. في MongoDB Atlas → **Browse Collections` → يجب أن ترى قاعدة `sonic_academy` مع جداول (Users, Courses, ...)

---

## 🐘 الطريقة الثانية: PostgreSQL (Neon - الأفضل أداءً)

### لماذا PostgreSQL؟
- أداء أعلى من MongoDB في الاستعلامات المعقدة
- يدعم ACID transactions كاملة
- يدعم Enums حقيقية (ليس string مع تعليق)
- يتوافق 100% مع الـ schema الحالي بدون تعديل

### الخطوة 1: إنشاء قاعدة بيانات Neon

1. اذهب إلى: **https://neon.tech**
2. سجّل بحساب GitHub أو Google
3. **Create Project**:
   - Project name: `sonic-academy`
   - Database name: `sonic_academy`
   - Region: `AWS Asia Pacific (Singapore)` الأقرب للخليج
4. اضغط **Create Project**

### الخطوة 2: الحصول على Connection String

انسخ الـ connection string من الصفحة الرئيسية:
```
postgresql://sonic_owner:npg_xxxxxxxxxxxx@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/sonic_academy?sslmode=require
```

ملاحظة: استخدم الـ **Pooled connection** (يحتوي على `-pooler`) للأداء الأفضل.

### الخطوة 3: تعديل schema.prisma

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

لا حاجة لتعديل أي شيء آخر - الـ schema الحالي متوافق 100% مع PostgreSQL.

### الخطوة 4: دفع الـ schema

```bash
bun run db:push
bun run seed
```

### الخطوة 5: إضافة في Vercel

في Vercel → Settings → Environment Variables:
- `DATABASE_URL`: connection string من Neon
- `JWT_SECRET`: `openssl rand -hex 32`

ثم **Redeploy**.

---

## 🚀 الطريقة الثالثة: MySQL (PlanetScale أو TiDB)

### لماذا MySQL؟
- مألوف لمعظم المطورين العرب
- أداء ممتاز للقراءة
- PlanetScale مجاني حتى 5GB

### خطوات PlanetScale (تم إيقاف الخطة المجانية، لكن TiDB مجاني)

### استخدام TiDB Cloud (مجاني):

1. اذهب إلى: **https://tidbcloud.com**
2. سجّل حساب
3. **Create Cluster** → **Serverless Tier** (مجاني)
4. اختر Region: `AWS US East` أو الأقرب لك
5. بعد الإنشاء، اذهب إلى **Connect**:
   - اختر **Prisma** كـ framework
   - انسخ الـ connection string:
     ```
     mysql://xxxxxxxxx.root:password@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/sonic_academy?sslaccept=accept
     ```

### تعديل schema.prisma:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### باقي الخطوات نفس PostgreSQL (db:push, seed, Vercel env vars).

---

## 📊 مقارنة سريعة بين الخيارات

| المعيار | MongoDB Atlas | PostgreSQL (Neon) | MySQL (TiDB) |
|---------|---------------|-------------------|--------------|
| **السعر** | مجاني 512MB | مجاني 3GB | مجاني 5GB |
| **التعقيد** | متوسط (يتطلب schema.mongodb.prisma) | سهل (متوافق مع الـ schema الحالي) | سهل |
| **الأداء** | جيد | ممتاز | ممتاز |
| **التوسع** | أفقي ممتاز | عمودي محدود في الخطة المجانية | عمودي محدود |
| **Transactions** | جزئي | كامل ACID | كامل ACID |
| **الأنسب لـ** | بيانات غير منظمة، صوت base64 | تطبيقات معقدة، استعلامات متقدمة | تطبيقات CRUD بسيطة |

### توصيتي:
- **للمشروع الحالي (SonicAcademy)**: استخدم **MongoDB Atlas** لأنه يدعم base64 صوت بدون مشاكل حجم، ويتوسع بسهولة مع آلاف المستخدمين.
- **إذا كنت تحتاج تقارير معقدة**: استخدم **PostgreSQL (Neon)**.

---

## 🔒 ملاحظات أمنية مهمة

### 1. لا تضع credentials في الكود
```typescript
// ❌ خطأ
const db = new PrismaClient({ datasources: { db: { url: "mongodb+srv://user:pass@..." } } });

// ✅ صحيح
const db = new PrismaClient(); // يقرأ DATABASE_URL تلقائياً من .env
```

### 2. استخدم متغيرات بيئة مختلفة لكل بيئة
- **Development**: قاعدة بيانات محلية أو cluster تجريبي
- **Preview (Vercel)**: cluster staging
- **Production**: cluster منفصل مع نسخ احتياطية

### 3. فعّل النسخ الاحتياطي
- **MongoDB Atlas**: النسخ الاحتياطي مدفوع ($15/شهر) — استخدم `mongodump` يدوياً
- **Neon**: النسخ احتياطي تلقائي مجاني ( PITR حتى 7 أيام)
- **TiDB**: النسخ احتياطي تلقائي مجاني

### 4. راقب الاستخدام
- **MongoDB Atlas**: Dashboard يعرض Storage و Connections
- **Neon**: Dashboard يظهر Compute و Storage
- اطمئن: الخطة المجانية تكفي لـ 1000-5000 مستخدم نشط

---

## 🚨 أخطاء شائحة وحلولها

### خطأ: `PrismaClientInitializationError: Can't reach database server`
- **السبب**: IP غير مسموح في Network Access
- **الحل**: في MongoDB Atlas → Network Access → Add `0.0.0.0/0`

### خطأ: `Authentication failed`
- **السبب**: كلمة مرور خاطئة في connection string
- **الحل**: تأكد أن `<db_password>` مستبدلة بكلمة المرور الفعلية بدون أقواس

### خطأ: `P2002: Unique constraint failed`
- **السبب**: سبق تشغيل seed بنفس البيانات
- **الحل**: الـ seed script idempotent (يتحقق قبل الإنشاء)، لكن إذا استمر الخطأ احذف الـ collection وأعد التشغيل

### خطأ: `PrismaClientValidationError: Unknown field`
- **السبب**: Prisma client قديم بعد تغيير الـ schema
- **الحل**: شغّل `bun run db:generate` لإعادة توليد الـ client

### خطأ: بعد إضافة متغيرات في Vercel لا يزال يظهر "DATABASE_URL is not defined"
- **السبب**: Vercel يحتاج Redeploy لتطبيق متغيرات البيئة الجديدة
- **الحل**: Deployments → أحدث deploy → kebab menu → **Redeploy**

---

## ✅ قائمة تحقق نهائية قبل النشر

- [ ] أنشأت حساب على MongoDB Atlas / Neon / TiDB
- [ ] حصلت على connection string صحيح
- [ ] استبدلت `prisma/schema.prisma` بالنسخة المناسبة
- [ ] شغّلت `bun run db:push` بدون أخطاء
- [ ] شغّلت `bun run seed` بدون أخطاء
- [ ] أضفت `DATABASE_URL` في Vercel Environment Variables
- [ ] أضفت `JWT_SECRET` في Vercel Environment Variables
- [ ] عملت Redeploy في Vercel
- [ ] اختبرت `/register` و `/login` على رابط الإنتاج
- [ ] تأكدت من ظهور البيانات في Atlas/Neon/TiDB Dashboard

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. راجع رسالة الخطأ كاملة في **Vercel → Deployments → Logs**
2. تأكد أن connection string صحيح (اختبره في `mongosh` أو Prisma Studio)
3. راجع **Network Access** في MongoDB Atlas
