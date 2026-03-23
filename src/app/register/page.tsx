'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, UserCheck, Briefcase, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "MERCHANT",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("注册成功，请登录");
        router.push("/login");
      } else {
        const error = await response.json();
        alert("注册失败: " + JSON.stringify(error));
      }
    } catch (err) {
      console.error(err);
      alert("注册出错");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 relative">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-green-500/5 blur-[100px] rounded-full" />

        <div className="relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-green-500 font-bold uppercase tracking-[0.2em] text-xs">
            <Sparkles className="h-4 w-4" />
            加入麒麟
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-none">
            创建您的 <span className="text-zinc-700">账户</span>
          </h1>
          <p className="text-zinc-500 font-medium">
            选择您的身份，开始不一样的营销之旅
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6 bg-zinc-900/50 border border-white/5 p-10 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl">
          <div className="flex p-1.5 rounded-2xl bg-white/5 border border-white/10 gap-2 mb-8">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "MERCHANT" })}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all",
                formData.role === "MERCHANT" ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
              )}
            >
              <Briefcase className="h-4 w-4" />
              我是品牌方
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "INFLUENCER" })}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all",
                formData.role === "INFLUENCER" ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
              )}
            >
              <UserCheck className="h-4 w-4" />
              我是达人
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
              姓名 / 品牌名称
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
              <input
                required
                type="text"
                placeholder="例如：麒麟官方"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:border-green-500/50 focus:ring-0 transition-all text-white placeholder:text-zinc-700 font-medium"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
              邮箱地址
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
              <input
                required
                type="email"
                placeholder="name@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:border-green-500/50 focus:ring-0 transition-all text-white placeholder:text-zinc-700 font-medium"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
              设置密码
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
              <input
                required
                type="password"
                placeholder="至少 6 位字符"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:border-green-500/50 focus:ring-0 transition-all text-white placeholder:text-zinc-700 font-medium"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className={cn(
              "w-full flex items-center justify-center gap-2 py-5 rounded-2xl bg-green-500 text-black font-black text-lg hover:bg-green-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_50px_-12px_rgba(34,197,94,0.3)]",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? "注册中..." : "立即注册"}
            {!loading && <ArrowRight className="h-5 w-5" />}
          </button>

          <p className="text-center text-sm text-zinc-500 font-medium pt-4">
            已有账号？{" "}
            <Link href="/login" className="text-green-500 hover:text-green-400 font-bold transition-colors">
              立即登录
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
