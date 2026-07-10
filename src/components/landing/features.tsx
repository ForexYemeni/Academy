"use client";

import { motion } from "framer-motion";
import {
  Mic,
  Headphones,
  MessageCircle,
  Wallet,
  Gift,
  ShieldCheck,
  Smartphone,
  Globe,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

const features = [
  { icon: Mic, key: "audioStudio", color: "from-violet-500/20 to-fuchsia-500/20", iconColor: "text-violet-400" },
  { icon: Headphones, key: "player", color: "from-cyan-500/20 to-blue-500/20", iconColor: "text-cyan-400" },
  { icon: MessageCircle, key: "community", color: "from-emerald-500/20 to-teal-500/20", iconColor: "text-emerald-400" },
  { icon: Wallet, key: "payments", color: "from-amber-500/20 to-orange-500/20", iconColor: "text-amber-400" },
  { icon: Gift, key: "referrals", color: "from-pink-500/20 to-rose-500/20", iconColor: "text-pink-400" },
  { icon: ShieldCheck, key: "security", color: "from-lime-500/20 to-green-500/20", iconColor: "text-lime-400" },
  { icon: Smartphone, key: "mobile", color: "from-indigo-500/20 to-purple-500/20", iconColor: "text-indigo-400" },
  { icon: Globe, key: "community", color: "from-sky-500/20 to-cyan-500/20", iconColor: "text-sky-400" },
];

export function FeaturesSection() {
  const { t } = useI18n();

  return (
    <section id="features" className="py-20 sm:py-28 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <h2 className="font-display font-bold text-3xl sm:text-5xl tracking-tight">
            {t("features.title")}
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            {t("features.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group relative glass rounded-2xl p-6 card-lux overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} grid place-items-center mb-4`}>
                  <f.icon className={`w-6 h-6 ${f.iconColor}`} />
                </div>
                <h3 className="font-semibold text-base mb-2">
                  {t(`features.${f.key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`features.${f.key}.desc`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
