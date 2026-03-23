'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutGrid, Send, Calendar, DollarSign, Globe, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewCampaignPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    platform: "小红书",
    budget: "",
    deadline: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          budget: Number(formData.budget),
          merchantId: (session?.user as any)?.id,
        }),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        const error = await response.json();
        alert("发布失败: " + JSON.stringify(error));
      }
    } catch (err) {
      console.error(err);
      alert("发布出错");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <div className="flex items-center gap-2 text-green-500 font-bold uppercase tracking-widest text-xs">
            <Sparkles className="h-4 w-4" />
            发布您的营销攻势
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
            创建新 <span className="text-zinc-700">Campaign</span>
          </h1>
          <p className="text-zinc-500 text-lg">
            清晰的描述和合理的预算是吸引优质达人的关键。
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-900/50 border border-white/5 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Title */}
            <div className="md:col-span-2 space-y-3">
              <label className="text-sm font-bold text-zinc-400 flex items-center gap-2 ml-1">
                <LayoutGrid className="h-4 w-4" /> 活动标题
              </label>
              <input
                required
                type="text"
                placeholder="例如：2024夏季新品护肤测评招募"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-green-500/50 focus:ring-0 transition-all text-white placeholder:text-zinc-600 font-medium"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Platform */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-400 flex items-center gap-2 ml-1">
                <Globe className="h-4 w-4" /> 目标平台
              </label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-green-500/50 focus:ring-0 transition-all text-white font-medium appearance-none cursor-pointer"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              >
                <option value="小红书">小红书</option>
                <option value="抖音">抖音</option>
                <option value="Bilibili">Bilibili</option>
                <option value="视频号">视频号</option>
              </select>
            </div>

            {/* Budget */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-400 flex items-center gap-2 ml-1">
                <DollarSign className="h-4 w-4" /> 预估预算 (CNY)
              </label>
              <input
                required
                type="number"
                placeholder="5000"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-green-500/50 focus:ring-0 transition-all text-white placeholder:text-zinc-600 font-medium"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>

            {/* Deadline */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-400 flex items-center gap-2 ml-1">
                <Calendar className="h-4 w-4" /> 申请截止日期
              </label>
              <input
                required
                type="date"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-green-500/50 focus:ring-0 transition-all text-white font-medium [color-scheme:dark]"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-3">
              <label className="text-sm font-bold text-zinc-400 flex items-center gap-2 ml-1">
                <FileText className="h-4 w-4" /> 活动详情与要求
              </label>
              <textarea
                required
                rows={5}
                placeholder="请详细说明产品亮点、达人要求（粉丝量、风格）、交付件要求等..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-green-500/50 focus:ring-0 transition-all text-white placeholder:text-zinc-600 font-medium resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-6 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-4 rounded-2xl border border-white/10 text-zinc-400 font-bold hover:text-white hover:border-white/20 transition-all"
            >
              取消
            </button>
            <button
              disabled={loading}
              type="submit"
              className={cn(
                "flex items-center gap-2 px-10 py-4 rounded-2xl bg-green-500 text-black font-black hover:bg-green-400 transition-all",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              <Send className="h-5 w-5" />
              {loading ? "发布中..." : "立即发布活动"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
