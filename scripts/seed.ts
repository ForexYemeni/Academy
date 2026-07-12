/**
 * Seed script — creates default admin + sample data
 * Run with: `bun run seed`
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Default Admin
  const adminPhone = "+967711111111";
  let admin = await db.user.findUnique({ where: { phone: adminPhone } });
  if (!admin) {
    admin = await db.user.create({
      data: {
        fullName: "مدير المنصة",
        phone: adminPhone,
        passwordHash: bcrypt.hashSync("admin123", 12),
        role: "ADMIN",
        preferredLang: "ar",
      },
    });
    console.log(`✅ Admin created: ${adminPhone} / admin123`);
  } else {
    console.log(`ℹ️  Admin already exists: ${adminPhone}`);
  }

  // 2. Demo Student
  const studentPhone = "+967722222222";
  let student = await db.user.findUnique({ where: { phone: studentPhone } });
  if (!student) {
    student = await db.user.create({
      data: {
        fullName: "طالب تجريبي",
        phone: studentPhone,
        passwordHash: bcrypt.hashSync("student123", 12),
        role: "STUDENT",
        preferredLang: "ar",
      },
    });
    console.log(`✅ Demo student created: ${studentPhone} / student123`);
  } else {
    console.log(`ℹ️  Demo student already exists: ${studentPhone}`);
  }

  // 3. Categories
  const categories = [
    { nameAr: "البرمجة", nameEn: "Programming", icon: "💻", order: 0 },
    { nameAr: "التصميم", nameEn: "Design", icon: "🎨", order: 1 },
    { nameAr: "التسويق", nameEn: "Marketing", icon: "📈", order: 2 },
    { nameAr: "الأعمال", nameEn: "Business", icon: "💼", order: 3 },
    { nameAr: "اللغات", nameEn: "Languages", icon: "🌐", order: 4 },
    { nameAr: "التطوير الذاتي", nameEn: "Self-Development", icon: "🚀", order: 5 },
  ];
  for (const c of categories) {
    const existing = await db.category.findFirst({ where: { nameAr: c.nameAr } });
    if (!existing) {
      await db.category.create({ data: c });
    }
  }
  console.log(`✅ ${categories.length} categories ensured`);

  // 4. Subscription Plans
  const plans = [
    { nameAr: "شهر واحد", nameEn: "1 Month", duration: "ONE_MONTH", monthsCount: 1, price: 2500 },
    { nameAr: "ثلاثة أشهر", nameEn: "3 Months", duration: "THREE_MONTHS", monthsCount: 3, price: 6500 },
    { nameAr: "ستة أشهر", nameEn: "6 Months", duration: "SIX_MONTHS", monthsCount: 6, price: 12000 },
    { nameAr: "سنة كاملة", nameEn: "1 Year", duration: "ONE_YEAR", monthsCount: 12, price: 20000 },
  ];
  for (const p of plans) {
    const existing = await db.subscriptionPlan.findFirst({ where: { duration: p.duration } });
    if (existing) {
      await db.subscriptionPlan.update({
        where: { id: existing.id },
        data: { nameAr: p.nameAr, nameEn: p.nameEn, monthsCount: p.monthsCount, price: p.price },
      });
    } else {
      await db.subscriptionPlan.create({ data: p });
    }
  }
  console.log(`✅ ${plans.length} subscription plans ensured`);

  // 5. Wallets (4 methods)
  const wallets = [
    {
      method: "JAWALI",
      nameAr: "جوالي",
      nameEn: "Jawali",
      number: "733444555",
      instructionsAr: "حوّل المبلغ إلى رقم جوالي أعلاه ثم ارفع صورة الإيصال.",
      instructionsEn: "Transfer the amount to the Jawali number above, then upload the receipt image.",
    },
    {
      method: "JIB",
      nameAr: "جيب",
      nameEn: "Jib",
      number: "711222333",
      instructionsAr: "حوّل المبلغ إلى محفظة جيب أعلاه ثم ارفع صورة الإيصال.",
      instructionsEn: "Transfer the amount to the Jib wallet above, then upload the receipt image.",
    },
    {
      method: "ONE_CASH",
      nameAr: "ون كاش",
      nameEn: "One Cash",
      number: "744555666",
      instructionsAr: "حوّل المبلغ إلى محفظة ون كاش أعلاه ثم ارفع صورة الإيصال.",
      instructionsEn: "Transfer the amount to the One Cash wallet above, then upload the receipt image.",
    },
    {
      method: "CASH",
      nameAr: "كاش",
      nameEn: "Cash",
      number: "722333444",
      instructionsAr: "حوّل المبلغ نقداً عبر وكيل كاش ثم ارفع صورة الإيصال.",
      instructionsEn: "Transfer the amount in cash via a Cash agent, then upload the receipt image.",
    },
  ];
  for (const w of wallets) {
    await db.wallet.upsert({
      where: { method: w.method },
      create: w,
      update: w,
    });
  }
  console.log(`✅ ${wallets.length} payment wallets configured`);

  // 6. Sample Courses
  const programmingCat = await db.category.findFirst({ where: { nameAr: "البرمجة" } });
  const designCat = await db.category.findFirst({ where: { nameAr: "التصميم" } });
  const marketingCat = await db.category.findFirst({ where: { nameAr: "التسويق" } });
  const businessCat = await db.category.findFirst({ where: { nameAr: "الأعمال" } });

  const courses = [
    {
      titleAr: "أساسيات البرمجة بلغة JavaScript",
      titleEn: "JavaScript Programming Basics",
      descriptionAr: "تعلّم أساسيات البرمجة من الصفر باستخدام لغة JavaScript الأكثر طلباً في العالم. دورة شاملة للمبتدئين.",
      descriptionEn: "Learn programming basics from scratch using JavaScript, the world's most in-demand language. A comprehensive course for beginners.",
      price: 2500,
      level: "BEGINNER",
      status: "PUBLISHED",
      isFeatured: true,
      order: 0,
      categoryId: programmingCat?.id,
    },
    {
      titleAr: "تصميم واجهات المستخدم بـ Figma",
      titleEn: "UI Design with Figma",
      descriptionAr: "احترف تصميم واجهات المستخدم باستخدام Figma. من المبادئ الأساسية إلى تصميم تطبيقات احترافية.",
      descriptionEn: "Master UI design using Figma. From basic principles to designing professional applications.",
      price: 3500,
      level: "INTERMEDIATE",
      status: "PUBLISHED",
      isFeatured: true,
      order: 1,
      categoryId: designCat?.id,
    },
    {
      titleAr: "التسويق الرقمي للمبتدئين",
      titleEn: "Digital Marketing for Beginners",
      descriptionAr: "دليلك الشامل للتسويق الرقمي. تعلّم SEO، إعلانات فيسبوك، وإنستغرام، وبناء العلامة التجارية.",
      descriptionEn: "Your complete guide to digital marketing. Learn SEO, Facebook & Instagram ads, and brand building.",
      price: 3000,
      level: "BEGINNER",
      status: "PUBLISHED",
      isFeatured: false,
      order: 2,
      categoryId: marketingCat?.id,
    },
    {
      titleAr: "ريادة الأعمال وإدارة المشاريع",
      titleEn: "Entrepreneurship & Project Management",
      descriptionAr: "تعلّم كيف تبدأ مشروعك الخاص من الفكرة إلى التنفيذ. إدارة المخاطر، التمويل، وبناء الفريق.",
      descriptionEn: "Learn how to start your own business from idea to execution. Risk management, financing, and team building.",
      price: 4500,
      level: "ADVANCED",
      status: "PUBLISHED",
      isFeatured: false,
      order: 3,
      categoryId: businessCat?.id,
    },
    {
      titleAr: "تطوير تطبيقات React و Next.js",
      titleEn: "React & Next.js App Development",
      descriptionAr: "احترف تطوير تطبيقات الويب الحديثة باستخدام React 19 و Next.js 16. من المكونات إلى النشر.",
      descriptionEn: "Master modern web app development using React 19 and Next.js 16. From components to deployment.",
      price: 5000,
      level: "ADVANCED",
      status: "PUBLISHED",
      isFeatured: true,
      order: 4,
      categoryId: programmingCat?.id,
    },
    {
      titleAr: "اللغة الإنجليزية للمحترفين",
      titleEn: "Professional English",
      descriptionAr: "حسّن مهاراتك في اللغة الإنجليزية للأعمال والتواصل المهني. مستوى متوسط إلى متقدم.",
      descriptionEn: "Improve your English skills for business and professional communication. Intermediate to advanced level.",
      price: 2800,
      level: "INTERMEDIATE",
      status: "PUBLISHED",
      isFeatured: false,
      order: 5,
      categoryId: null,
    },
  ];
  for (const c of courses) {
    const existing = await db.course.findFirst({ where: { titleAr: c.titleAr } });
    if (!existing) {
      await db.course.create({ data: c });
    }
  }
  console.log(`✅ ${courses.length} sample courses ensured`);

  // 7. Sample Lessons for first course
  const jsCourse = await db.course.findFirst({ where: { titleAr: "أساسيات البرمجة بلغة JavaScript" } });
  if (jsCourse) {
    const existingLessons = await db.lesson.count({ where: { courseId: jsCourse.id } });
    if (existingLessons === 0) {
      const lessons = [
        { titleAr: "مقدمة في البرمجة", titleEn: "Introduction to Programming", order: 0, isFree: true, duration: 480 },
        { titleAr: "المتغيرات وأنواع البيانات", titleEn: "Variables and Data Types", order: 1, isFree: false, duration: 620 },
        { titleAr: "العمليات الحسابية", titleEn: "Arithmetic Operations", order: 2, isFree: false, duration: 540 },
        { titleAr: "الجمل الشرطية", titleEn: "Conditional Statements", order: 3, isFree: false, duration: 720 },
        { titleAr: "الحلقات التكرارية", titleEn: "Loops", order: 4, isFree: false, duration: 680 },
        { titleAr: "الدوال", titleEn: "Functions", order: 5, isFree: false, duration: 850 },
      ];
      for (const l of lessons) {
        await db.lesson.create({
          data: {
            courseId: jsCourse.id,
            titleAr: l.titleAr,
            titleEn: l.titleEn,
            descriptionAr: `شرح تفصيلي لـ ${l.titleAr} مع أمثلة عملية.`,
            descriptionEn: `Detailed explanation of ${l.titleEn} with practical examples.`,
            order: l.order,
            isFree: l.isFree,
            duration: l.duration,
          },
        });
      }
      // Update course total duration
      await db.course.update({
        where: { id: jsCourse.id },
        data: { totalDuration: lessons.reduce((s, l) => s + l.duration, 0) },
      });
      console.log(`✅ ${lessons.length} sample lessons created for JS course`);
    }
  }

  // 8. Testimonials
  const testimonials = [
    {
      nameAr: "أحمد محمد",
      nameEn: "Ahmed Mohammed",
      roleAr: "مطور برمجيات",
      roleEn: "Software Developer",
      contentAr: "منصة رائعة! تعلمت JavaScript من الصفر وحصلت على وظيفة بعد شهرين فقط من الدراسة.",
      contentEn: "Amazing platform! I learned JavaScript from scratch and got a job after just two months of study.",
      rating: 5,
      order: 0,
    },
    {
      nameAr: "سارة العلي",
      nameEn: "Sara Al-Ali",
      roleAr: "مصممة واجهات",
      roleEn: "UI Designer",
      contentAr: "جودة الصوت ممتازة والمشغل احترافي جداً. أنصح الجميع بالاشتراك في دورة Figma.",
      contentEn: "Audio quality is excellent and the player is very professional. I recommend everyone to subscribe to the Figma course.",
      rating: 5,
      order: 1,
    },
    {
      nameAr: "خالد عبدالله",
      nameEn: "Khaled Abdullah",
      roleAr: "رائد أعمال",
      roleEn: "Entrepreneur",
      contentAr: "المحتوى قيّم جداً وسهل الفهم. ساعدني كثيراً في تطوير مشروعي الخاص.",
      contentEn: "Very valuable content and easy to understand. It helped me a lot in developing my own business.",
      rating: 5,
      order: 2,
    },
    {
      nameAr: "فاطمة الزهراء",
      nameEn: "Fatima Al-Zahra",
      roleAr: "طالبة جامعية",
      roleEn: "University Student",
      contentAr: "أفضل منصة تعليمية صوتية جربتها. الدورات منظمة والمجتمع تفاعلي جداً.",
      contentEn: "The best audio learning platform I've tried. Courses are organized and the community is very interactive.",
      rating: 5,
      order: 3,
    },
  ];
  for (const t of testimonials) {
    const existing = await db.testimonial.findFirst({ where: { nameAr: t.nameAr } });
    if (!existing) {
      await db.testimonial.create({ data: t });
    }
  }
  console.log(`✅ ${testimonials.length} testimonials ensured`);

  // 9. FAQs
  const faqs = [
    {
      questionAr: "كيف أشترك في دورة؟",
      questionEn: "How do I subscribe to a course?",
      answerAr: "بعد إنشاء حساب، اختر الدورة ثم الباقة المناسبة، ادفع عبر إحدى وسائل الدفع المتاحة (جوالي، جيب، ون كاش، كاش)، ارفع إثبات التحويل، وسيتم تفعيل اشتراكك خلال دقائق بعد موافقة الإدارة.",
      answerEn: "After creating an account, pick a course and plan, pay via one of the available methods (Jawali, Jib, One Cash, Cash), upload proof of transfer, and your subscription will be activated within minutes after admin approval.",
      order: 0,
    },
    {
      questionAr: "هل التسجيل صوتي فقط أم فيديو؟",
      questionEn: "Is the content audio only or video?",
      answerAr: "المنصة صوتية بالكامل لضمان سرعة التحميل وتقليل استهلاك البيانات. لكن كل درس قد يحتوي على ملفات PDF ومرفقات إضافية.",
      answerEn: "The platform is fully audio-based for fast loading and low data usage. Each lesson may include PDF files and additional attachments.",
      order: 1,
    },
    {
      questionAr: "هل يمكنني استكمال الاستماع لاحقاً؟",
      questionEn: "Can I resume listening later?",
      answerAr: "نعم، يحفظ المشغل تلقائياً آخر نقطة استماع ويعرضها لك عند العودة لنفس الدرس على أي جهاز.",
      answerEn: "Yes, the player automatically saves your last position and shows it when you return on any device.",
      order: 2,
    },
    {
      questionAr: "ما هي وسائل الدفع المتاحة؟",
      questionEn: "What payment methods are supported?",
      answerAr: "ندعم جوالي، جيب، ون كاش، وكاش. تختار الإدارة وسيلة الدفع وتظهر لك تعليمات التحويل مع QR Code ورقم المحفظة.",
      answerEn: "We support Jawali, Jib, One Cash, and Cash. Admins configure each wallet with QR code, number, and instructions.",
      order: 3,
    },
    {
      questionAr: "هل يوجد نظام إحالات؟",
      questionEn: "Is there a referral system?",
      answerAr: "نعم، كل طالب يحصل على رابط إحالة خاص. عند تسجيل صديق جديد واشتراكه في دورة، تحصل على مكافأة 10% من قيمة الاشتراك.",
      answerEn: "Yes, each student gets a unique referral link. When a friend signs up and subscribes, you earn a 10% reward of the subscription amount.",
      order: 4,
    },
    {
      questionAr: "هل التطبيق متوافق مع الهواتف؟",
      questionEn: "Is it mobile-friendly?",
      answerAr: "نعم، المنصة مصممة بمنهجية Mobile First ويمكن تثبيتها كـ PWA على شاشتك الرئيسية لتجربة تطبيق أصلية.",
      answerEn: "Yes, the platform is Mobile-First and installable as a PWA on your home screen for a native app experience.",
      order: 5,
    },
    {
      questionAr: "هل يمكنني استرجاع المبلغ بعد الاشتراك؟",
      questionEn: "Can I get a refund after subscribing?",
      answerAr: "نوفر سياسة استرجاع خلال 7 أيام من تاريخ الاشتراك إذا لم تتجاوز نسبة استماعك 25% من الدورة. تواصل مع الدعم لطلب الاسترجاع.",
      answerEn: "We offer a refund policy within 7 days of subscription if your listening progress hasn't exceeded 25% of the course. Contact support to request a refund.",
      order: 6,
    },
    {
      questionAr: "كيف أحصل على شهادة إتمام الدورة؟",
      questionEn: "How do I get a course completion certificate?",
      answerAr: "عند إكمال جميع دروس الدورة (نسبة الإنجاز 100%)، يمكنك تحميل شهادة إتمام موثقة تلقائياً من صفحة دوراتي.",
      answerEn: "Upon completing all course lessons (100% progress), you can download an authenticated completion certificate from your My Courses page.",
      order: 7,
    },
  ];
  for (const f of faqs) {
    const existing = await db.fAQ.findFirst({ where: { questionAr: f.questionAr } });
    if (!existing) {
      await db.fAQ.create({ data: f });
    }
  }
  console.log(`✅ ${faqs.length} FAQs ensured`);

  // 10. Settings singleton (use findFirst since MongoDB doesn't allow string IDs)
  const existingSettings = await db.settings.findFirst();
  if (!existingSettings) {
    await db.settings.create({
      data: {
        platformNameAr: "أكاديمية سونيك",
        platformNameEn: "Sonic Academy",
        primaryColor: "#7C3AED",
        accentColor: "#06B6D4",
        descriptionAr: "منصة تعليمية صوتية فاخرة لتعلّم أي شيء بالاستماع، أينما كنت.",
        descriptionEn: "A premium audio learning platform to learn anything by listening, anywhere.",
        contactEmail: "support@sonicacademy.app",
        contactPhone: "+967711111111",
        contactAddress: "صنعاء، اليمن",
        currency: "YER",
        welcomeMessageAr: "مرحباً بك في أكاديمية سونيك! استمع وتعلّم في أي وقت.",
        welcomeMessageEn: "Welcome to Sonic Academy! Listen and learn anytime.",
        registrationEnabled: true,
        communityEnabled: true,
        notificationsEnabled: true,
      },
    });
    console.log("✅ Platform settings initialized");
  } else {
    console.log("ℹ️  Platform settings already exist");
  }

  // 11. Sample coupon
  const existingCoupon = await db.coupon.findUnique({ where: { code: "WELCOME10" } });
  if (!existingCoupon) {
    await db.coupon.create({
      data: {
        code: "WELCOME10",
        type: "PERCENT",
        value: 10,
        maxUses: 100,
        usedCount: 0,
        isActive: true,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    });
    console.log("✅ Sample coupon created: WELCOME10 (10% off)");
  }

  // 12. Sample announcement
  const existingAnn = await db.announcement.findFirst({ where: { titleAr: "مرحباً بكم في أكاديمية سونيك!" } });
  if (!existingAnn) {
    await db.announcement.create({
      data: {
        type: "NEWS",
        titleAr: "مرحباً بكم في أكاديمية سونيك!",
        titleEn: "Welcome to Sonic Academy!",
        bodyAr: "نرحب بكم في منصتنا التعليمية الصوتية. استكشفوا دوراتنا المتنوعة وابدؤوا رحلتكم التعليمية اليوم. استخدموا كوبون WELCOME10 للحصول على خصم 10% على أول اشتراك.",
        bodyEn: "Welcome to our audio learning platform. Explore our diverse courses and start your learning journey today. Use coupon WELCOME10 for 10% off your first subscription.",
        createdBy: admin.id,
        isActive: true,
      },
    });
    console.log("✅ Welcome announcement created");
  }

  console.log("\n🎉 Seed completed successfully!\n");
  console.log("═══════════════════════════════════════════");
  console.log("  DEFAULT ADMIN LOGIN:");
  console.log("  Phone:    +967711111111");
  console.log("  Password: admin123");
  console.log("═══════════════════════════════════════════");
  console.log("  DEMO STUDENT LOGIN:");
  console.log("  Phone:    +967722222222");
  console.log("  Password: student123");
  console.log("═══════════════════════════════════════════");
  console.log("  COUPON: WELCOME10 (10% off)");
  console.log("═══════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
