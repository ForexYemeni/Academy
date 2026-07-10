# Sonic Academy | أكاديمية سونيك

> Premium audio learning platform for 2026 — منصة تعليمية صوتية فاخرة

A production-ready, mobile-first, RTL/LTR audio learning platform built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Framer Motion, Zustand, Prisma, and JWT auth.

## ✨ Features

### Public
- **Luxury landing page** with glassmorphism, gradients, blur effects, animated waveform hero
- Sections: Hero, Stats, Features, Latest Courses, Most Popular, Testimonials, FAQ, CTA, Footer
- Dark/Light theme with `next-themes`
- Arabic (RTL) + English (LTR) with full i18n dictionary
- PWA-ready (manifest.json)

### Authentication
- Phone-based signup (Yemeni format: `+9677XXXXXXXX` or `7XXXXXXXX`)
- Fields: full name, phone (unique), password
- JWT + bcrypt, httpOnly cookie, no OTP
- First registered user becomes ADMIN automatically
- Referral codes supported via `?ref=CODE`

### Admin Console (`/admin`)
- **Dashboard**: students, subscribers, courses, recordings, revenue, pending payments, recent lists, daily/monthly/yearly charts (Recharts)
- **Course management**: full CRUD, hide/show, feature toggle, reorder, level, status, price, cover image, category
- **Lessons per course**: title/description (Ar/En), order, free flag, audio recording, PDFs
- **Audio Recording Studio**: browser-based MediaRecorder, start/pause/resume/stop/restart/save/delete, real-time waveform visualization, auto-compression via Opus codec
- **Payments**: list, search, filter by status, approve/reject (with reason)/suspend, image proof viewer
- **Wallets**: configure Jawali/Jib/One Cash/Cash (name, number, QR, image, instructions)
- **Subscription plans**: 1/3/6/12 months with custom pricing
- **Students list**: search, progress, listen time, joined date
- **Community moderation**: pin/unpin posts, delete
- **Announcements**: NEWS/UPDATE/ALERT types, notify all students
- **Coupons**: percent/fixed, max uses, expiry, course-scoped
- **Moderators**: granular permissions (courses, payments, students, community, announcements, settings)
- **Settings**: platform name, brand, colors, contact, privacy, terms, currency, registration/community/notifications toggles

### Student Area (`/student`)
- **Overview**: stats, continue listening, recent announcements, notifications, referral CTA
- **My courses**: progress, last lesson, completed lessons count
- **Lesson player**: premium audio player with play/pause/next/prev/±15s seek, speed (0.5x/1x/1.25x/1.5x/2x), volume, auto-save progress, resume position
- **Buy course**: plan selector, payment method (4 wallets with QR), coupon validation, transfer image upload, operation no, notes
- **Community per course**: posts, comments, replies, likes, images, pin (admin), search, delete own posts
- **Payments history**: status badges, rejection reasons
- **Notifications**: typed (new lesson, payment approved/rejected, new course, announcement, comment, reply, like), mark as read, mark all read
- **Profile**: edit name/avatar, change password (phone immutable)
- **Settings**: language, theme, app info
- **Referral**: unique link/code, total rewards, invited friends list with subscription status

### Audio
- **Player**: full transport controls, speed presets, volume, seek, position memory (throttled DB writes), auto-complete detection, next/prev lesson navigation
- **Recorder**: MediaRecorder API, echo cancellation + noise suppression + auto gain, Opus codec, real-time frequency visualization (24 bars), base64 storage
- **Streaming**: HTTP Range support on `/api/audio/[lessonId]`, enrollment-gated access

### Security
- JWT in httpOnly cookie (30-day TTL)
- bcrypt password hashing (12 rounds)
- Server-side auth checks via `requireAdmin` / `requireModeratorOrAdmin` / `requireAuth`
- Enrollment-gated audio access
- All mutations via Server Actions with role checks
- Prisma schema with proper indexes and unique constraints

### Database (Prisma + SQLite, swappable to MongoDB/PostgreSQL)
Models: User, Category, Course, Lesson, SubscriptionPlan, Enrollment, Subscription, Payment, Wallet, AudioProgress, CommunityPost, CommunityComment, CommunityReply, CommunityLike, Notification, Announcement, Coupon, Moderator, Settings, Testimonial, FAQ

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | Tailwind CSS 4, shadcn/ui (New York), Framer Motion, Lucide |
| State | Zustand + Persist |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Database | Prisma ORM (SQLite dev, production-ready for PostgreSQL/MySQL) |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| Audio | MediaRecorder API, Web Audio API (AnalyserNode) |
| PWA | manifest.json |

## 🚀 Getting Started

```bash
# Install dependencies
bun install

# Push database schema
bun run db:push

# Run dev server
bun run dev

# Build for production
bun run build
```

## 📁 Structure

```
src/
├── app/
│   ├── (public)/         # Landing, login, register, course detail
│   ├── admin/            # Admin console (dashboard, courses, lessons, payments, wallets, plans, students, community, announcements, coupons, moderators, settings, notifications)
│   ├── student/          # Student area (overview, courses, lessons, buy, community, payments, notifications, profile, settings, referral)
│   ├── courses/[courseId]/  # Public course detail
│   └── api/
│       ├── audio/[lessonId]/  # Streaming audio with Range support
│       └── stats/             # Dashboard statistics
├── components/
│   ├── admin/            # All admin components
│   ├── student/          # All student components
│   ├── audio/            # AudioRecorder + AudioPlayer
│   ├── auth/             # Auth form
│   ├── landing/          # Hero, features, courses, testimonials, FAQ, CTA, stats
│   ├── shared/           # Notifications list
│   └── ui/               # shadcn/ui primitives
├── lib/
│   ├── auth.ts           # JWT, bcrypt, cookies, role checks
│   ├── auth-actions.ts   # register/login/logout/changePassword/updateProfile
│   ├── admin-actions.ts  # Course/Lesson/Payment/Wallet/Plan/Coupon/Announcement/Moderator/Settings actions
│   ├── student-actions.ts # Payment submission, audio progress, community, coupon validation, notifications
│   ├── i18n.ts           # Arabic + English dictionaries with Zustand store
│   └── db.ts             # Prisma client
├── hooks/                # use-mounted, use-toast, use-mobile
└── prisma/schema.prisma  # Complete data model with indexes
```

## 🌐 Deployment (Vercel + GitHub)

1. Push to GitHub
2. Import repo in Vercel
3. Add env vars: `DATABASE_URL`, `JWT_SECRET`
4. Deploy — Vercel auto-detects Next.js 16

## 📝 Notes

- Database uses SQLite for local dev. For production, swap `provider = "sqlite"` to `"postgresql"` or `"mongodb"` in `prisma/schema.prisma` and update `DATABASE_URL`.
- Audio is stored as base64 in DB for simplicity. For production scale, move to S3/Cloudinary and use `audioUrl` field.
- First user to register becomes ADMIN. All subsequent users are STUDENTs.

---

© 2026 Sonic Academy. All rights reserved.
