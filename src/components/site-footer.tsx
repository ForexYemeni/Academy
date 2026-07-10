"use client";

import Link from "next/link";
import { Headphones, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/40 bg-card/30 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center">
                <Headphones className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-gradient">
                {t("brand.name")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("brand.tagline")} — {t("hero.subtitle")}
            </p>
            <div className="flex items-center gap-2">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-muted/50 hover:bg-primary/20 grid place-items-center transition-colors"
                  aria-label="social"
                >
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold mb-4">{t("section.footer.links")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/#courses" className="hover:text-foreground transition-colors">{t("nav.courses")}</Link></li>
              <li><Link href="/#features" className="hover:text-foreground transition-colors">{t("features.title")}</Link></li>
              <li><Link href="/#testimonials" className="hover:text-foreground transition-colors">{t("section.testimonials")}</Link></li>
              <li><Link href="/#faq" className="hover:text-foreground transition-colors">{t("section.faq")}</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold mb-4">{t("nav.profile")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground transition-colors">{t("nav.login")}</Link></li>
              <li><Link href="/register" className="hover:text-foreground transition-colors">{t("nav.register")}</Link></li>
              <li><Link href="/student" className="hover:text-foreground transition-colors">{t("nav.dashboard")}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">{t("section.footer.contact")}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>support@sonicacademy.app</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span dir="ltr">+967 700 000 000</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Sana&apos;a, Yemen</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {year} {t("brand.name")}. {t("section.footer.rights")}.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with Next.js 16 · React 19 · Tailwind 4
          </p>
        </div>
      </div>
    </footer>
  );
}
