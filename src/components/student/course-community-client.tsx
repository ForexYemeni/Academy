"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Send,
  Heart,
  MessageCircle,
  Pin,
  Trash2,
  Search,
  ImagePlus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useI18n } from "@/lib/i18n";
import {
  createPostAction,
  createCommentAction,
  createReplyAction,
  toggleLikeAction,
  deleteOwnPostAction,
} from "@/lib/student-actions";
import { toast } from "sonner";

type Post = {
  id: string;
  contentAr: string | null;
  contentEn: string | null;
  images: string | null;
  isPinned: boolean;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  user: { id: string; fullName: string; avatar: string | null };
  comments: {
    id: string;
    contentAr: string | null;
    contentEn: string | null;
    likesCount: number;
    createdAt: Date;
    user: { id: string; fullName: string; avatar: string | null };
    replies: {
      id: string;
      contentAr: string | null;
      contentEn: string | null;
      createdAt: Date;
      user: { id: string; fullName: string; avatar: string | null };
    }[];
    likes: { id: string }[];
  }[];
  likes: { id: string }[];
};

export function CourseCommunityClient({
  course,
  posts: initialPosts,
  currentUserId,
}: {
  course: { id: string; titleAr: string; titleEn: string; coverImage: string | null };
  posts: Post[];
  currentUserId: string;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [posts, setPosts] = useState(initialPosts);
  const [query, setQuery] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const filtered = posts.filter((p) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (p.contentAr || "").toLowerCase().includes(q) || (p.contentEn || "").toLowerCase().includes(q) || p.user.fullName.toLowerCase().includes(q);
  });

  async function readImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  async function submitPost() {
    if (!content.trim()) return;
    startTransition(async () => {
      try {
        await createPostAction({
          courseId: course.id,
          contentAr: locale === "ar" ? content : null,
          contentEn: locale === "en" ? content : null,
          images,
        });
        setContent("");
        setImages([]);
        toast.success(locale === "ar" ? "تم النشر" : "Posted");
        router.refresh();
      } catch (e: any) {
        toast.error(e.message || "Error");
      }
    });
  }

  async function submitComment(postId: string, text: string) {
    if (!text.trim()) return;
    startTransition(async () => {
      await createCommentAction({
        postId,
        contentAr: locale === "ar" ? text : null,
        contentEn: locale === "en" ? text : null,
      });
      toast.success(locale === "ar" ? "تم إرسال التعليق" : "Comment added");
      router.refresh();
    });
  }

  async function submitReply(commentId: string, text: string) {
    if (!text.trim()) return;
    startTransition(async () => {
      await createReplyAction({
        commentId,
        contentAr: locale === "ar" ? text : null,
        contentEn: locale === "en" ? text : null,
      });
      setReplyingTo(null);
      toast.success(locale === "ar" ? "تم الرد" : "Replied");
      router.refresh();
    });
  }

  async function toggleLike(postId: string) {
    startTransition(async () => {
      await toggleLikeAction({ postId });
      router.refresh();
    });
  }

  async function deletePost(postId: string) {
    if (!confirm(locale === "ar" ? "حذف المنشور؟" : "Delete post?")) return;
    startTransition(async () => {
      await deleteOwnPostAction(postId);
      toast.success(locale === "ar" ? "تم الحذف" : "Deleted");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/student/community">
            <ArrowRight className="w-4 h-4 me-2 rtl:rotate-180" />
            {t("common.back")}
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center overflow-hidden shrink-0">
          {course.coverImage ? (
            <img src={course.coverImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <MessageCircle className="w-6 h-6 text-primary" />
          )}
        </div>
        <div>
          <h1 className="font-display font-bold text-lg">
            {locale === "ar" ? course.titleAr : course.titleEn}
          </h1>
          <p className="text-xs text-muted-foreground">{t("community.title")}</p>
        </div>
      </div>

      {/* New post */}
      <Card className="glass card-lux rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-xs">?</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("community.placeholder")}
              className="rounded-xl min-h-20 bg-background/50"
            />
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20">
                    <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-1 -end-1 rounded-full w-5 h-5 p-0"
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              <label className="cursor-pointer">
                <Button asChild size="sm" variant="ghost" className="rounded-full">
                  <span>
                    <ImagePlus className="w-4 h-4 me-2" />
                    {locale === "ar" ? "صورة" : "Image"}
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 1024 * 1024) {
                        toast.error(locale === "ar" ? "حجم الصورة كبير (1MB كحد أقصى)" : "Image too large (max 1MB)");
                        return;
                      }
                      setImages((prev) => [...prev, await readImage(file)]);
                    }
                  }}
                />
              </label>
              <Button
                onClick={submitPost}
                disabled={pending || !content.trim()}
                size="sm"
                className="rounded-full"
              >
                {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 me-2" />}
                {t("community.newPost")}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("community.search")}
          className="ps-9 rounded-xl"
        />
      </div>

      {/* Posts */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="glass card-lux rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    {p.user.avatar ? <img src={p.user.avatar} alt="" /> : null}
                    <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-xs">
                      {p.user.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{p.user.fullName}</h3>
                      {p.isPinned && (
                        <Badge className="text-[10px] bg-amber-500 text-white">
                          <Pin className="w-3 h-3 me-1" />
                          {locale === "ar" ? "مثبّت" : "Pinned"}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(p.createdAt).toLocaleString(locale === "ar" ? "ar" : "en")}
                      </span>
                    </div>
                    <p className="text-sm mt-1.5 whitespace-pre-wrap">
                      {locale === "ar" ? p.contentAr : p.contentEn}
                    </p>
                    {p.images && (
                      (() => {
                        try {
                          const imgs = JSON.parse(p.images) as string[];
                          if (imgs.length === 0) return null;
                          return (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                              {imgs.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt=""
                                  className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                />
                              ))}
                            </div>
                          );
                        } catch {
                          return null;
                        }
                      })()
                    )}
                    <div className="flex items-center gap-1 mt-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full h-8 px-2 text-xs"
                        onClick={() => toggleLike(p.id)}
                      >
                        <Heart className={`w-3.5 h-3.5 me-1 ${p.likes.length > 0 ? "fill-pink-500 text-pink-500" : ""}`} />
                        {p.likesCount}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full h-8 px-2 text-xs"
                        onClick={() => setExpandedComments((s) => ({ ...s, [p.id]: !s[p.id] }))}
                      >
                        <MessageCircle className="w-3.5 h-3.5 me-1" />
                        {p.commentsCount}
                      </Button>
                      {p.user.id === currentUserId && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full h-8 w-8 p-0 ms-auto text-destructive hover:text-destructive"
                          onClick={() => deletePost(p.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>

                    {/* Comments */}
                    <AnimatePresence>
                      {expandedComments[p.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3 space-y-2 overflow-hidden"
                        >
                          {p.comments.map((c) => (
                            <div key={c.id} className="glass rounded-xl p-2.5 ms-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-7 h-7">
                                  {c.user.avatar ? <img src={c.user.avatar} alt="" /> : null}
                                  <AvatarFallback className="text-[10px] bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30">
                                    {c.user.fullName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-semibold">{c.user.fullName}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(c.createdAt).toLocaleString(locale === "ar" ? "ar" : "en")}
                                </span>
                              </div>
                              <p className="text-xs mt-1.5 ms-9">
                                {locale === "ar" ? c.contentAr : c.contentEn}
                              </p>
                              <div className="flex items-center gap-1 mt-1.5 ms-9">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="rounded-full h-6 px-2 text-[10px]"
                                  onClick={() => toggleLikeAction({ commentId: c.id }).then(() => router.refresh())}
                                >
                                  <Heart className="w-3 h-3 me-1" />
                                  {c.likesCount}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="rounded-full h-6 px-2 text-[10px]"
                                  onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                                >
                                  {t("community.reply")}
                                </Button>
                              </div>

                              {/* Replies */}
                              {c.replies.map((r) => (
                                <div key={r.id} className="glass rounded-lg p-2 mt-2 ms-4">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-6 h-6">
                                      {r.user.avatar ? <img src={r.user.avatar} alt="" /> : null}
                                      <AvatarFallback className="text-[9px] bg-gradient-to-br from-cyan-500/30 to-blue-500/30">
                                        {r.user.fullName.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-[11px] font-semibold">{r.user.fullName}</span>
                                  </div>
                                  <p className="text-[11px] mt-1 ms-7">
                                    {locale === "ar" ? r.contentAr : r.contentEn}
                                  </p>
                                </div>
                              ))}

                              {/* Reply box */}
                              {replyingTo === c.id && (
                                <ReplyBox onSubmit={(text) => submitReply(c.id, text)} pending={pending} />
                              )}
                            </div>
                          ))}

                          {/* New comment */}
                          <ReplyBox
                            placeholder={t("community.comment")}
                            onSubmit={(text) => submitComment(p.id, text)}
                            pending={pending}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <Card className="glass rounded-2xl p-12 text-center text-muted-foreground">
            {t("community.noPosts")}
          </Card>
        )}
      </div>
    </div>
  );
}

function ReplyBox({
  onSubmit,
  pending,
  placeholder,
}: {
  onSubmit: (text: string) => void;
  pending: boolean;
  placeholder?: string;
}) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  return (
    <div className="flex gap-2">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder || t("community.reply")}
        className="rounded-lg text-xs h-8"
        onKeyDown={(e) => {
          if (e.key === "Enter" && text.trim()) {
            onSubmit(text);
            setText("");
          }
        }}
      />
      <Button
        size="sm"
        className="rounded-lg h-8 px-3"
        disabled={pending || !text.trim()}
        onClick={() => {
          onSubmit(text);
          setText("");
        }}
      >
        <Send className="w-3 h-3" />
      </Button>
    </div>
  );
}
