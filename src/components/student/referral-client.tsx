"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Copy, Users, DollarSign, Share2, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export function ReferralClient({
  referralCode,
  referralRewards,
  referrals,
}: {
  referralCode: string;
  referralRewards: number;
  referrals: { id: string; fullName: string; avatar: string | null; createdAt: Date; hasSubscription: boolean }[];
}) {
  const { t, locale } = useI18n();
  const [copied, setCopied] = useState(false);

  const link = typeof window !== "undefined" ? `${window.location.origin}/register?ref=${referralCode}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success(t("student.copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: locale === "ar" ? "أكاديمية سونيك" : "Sonic Academy",
          text: locale === "ar" ? "انضم إليّ في أكاديمية سونيك للتعليم الصوتي" : "Join me at Sonic Academy for audio learning",
          url: link,
        });
      } catch {}
    } else {
      copyLink();
    }
  };

  const subscribedCount = referrals.filter((r) => r.hasSubscription).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">{t("student.referralLink")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {locale === "ar"
            ? "ادعُ أصدقاءك واحصل على 10% من كل اشتراك جديد"
            : "Invite friends and earn 10% of every new subscription"}
        </p>
      </div>

      {/* Reward card */}
      <Card className="glass card-lux rounded-2xl overflow-hidden">
        <div className="relative bg-gradient-to-br from-primary to-accent p-6 text-white">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5" />
              <h3 className="font-display font-bold text-lg">
                {t("student.referralRewards")}
              </h3>
            </div>
            <div className="font-display font-bold text-4xl">
              {referralRewards.toFixed(0)} <span className="text-lg">YER</span>
            </div>
            <p className="text-xs text-white/80 mt-1">
              {locale === "ar" ? "إجمالي مكافآتك" : "Total rewards"}
            </p>
          </div>
        </div>
      </Card>

      {/* Referral link */}
      <Card className="glass card-lux rounded-2xl p-5">
        <h3 className="font-semibold mb-3">{t("student.referralLink")}</h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 glass rounded-xl p-3 flex items-center gap-2 min-w-0">
            <code className="text-xs font-mono truncate flex-1" dir="ltr">
              {link}
            </code>
          </div>
          <div className="flex gap-2">
            <Button onClick={copyLink} className="rounded-xl">
              {copied ? <Check className="w-4 h-4 me-2" /> : <Copy className="w-4 h-4 me-2" />}
              {t("student.copyLink")}
            </Button>
            <Button onClick={shareLink} variant="outline" className="rounded-xl">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="mt-3 glass rounded-xl p-3 text-xs text-muted-foreground">
          <span className="font-mono text-primary">{referralCode}</span>
          <span className="mx-2">·</span>
          {locale === "ar" ? "رمز الإحالة الخاص بك" : "Your referral code"}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="glass card-lux rounded-2xl">
          <div className="p-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 grid place-items-center mb-3">
              <Users className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-2xl font-display font-bold text-gradient">
              {referrals.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {locale === "ar" ? "إجمالي الإحالات" : "Total referrals"}
            </div>
          </div>
        </Card>
        <Card className="glass card-lux rounded-2xl">
          <div className="p-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 grid place-items-center mb-3">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-display font-bold text-gradient">
              {subscribedCount}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {locale === "ar" ? "اشتراكات ناجحة" : "Successful subscriptions"}
            </div>
          </div>
        </Card>
      </div>

      {/* Referrals list */}
      {referrals.length > 0 && (
        <Card className="glass card-lux rounded-2xl p-4">
          <h3 className="font-semibold mb-3">
            {locale === "ar" ? "أصدقاؤك المدعوّون" : "Your invited friends"}
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto scroll-lux">
            {referrals.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-2 glass rounded-xl">
                <Avatar className="w-9 h-9">
                  {r.avatar ? <img src={r.avatar} alt="" /> : null}
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-xs">
                    {r.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{r.fullName}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString(locale === "ar" ? "ar" : "en")}
                  </div>
                </div>
                <Badge
                  variant={r.hasSubscription ? "default" : "secondary"}
                  className="text-[10px]"
                >
                  {r.hasSubscription
                    ? (locale === "ar" ? "مشترك" : "Subscribed")
                    : (locale === "ar" ? "مسجّل" : "Registered")}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
