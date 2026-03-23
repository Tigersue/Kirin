'use client';

import { useState, useEffect } from "react";
import { User, Briefcase, Globe, FileText, Save, Sparkles, UserCheck, Instagram, Twitter, Youtube, Hash } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import FileUpload from "@/components/FileUpload";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const userId = user?.id;
  const role = user?.role;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (!userId) return;
    
    fetch(`/api/profile?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (role === "MERCHANT") {
          setFormData(data.merchantProfile || {});
        } else {
          setFormData(data.influencerProfile || {});
        }
        setLoading(false);
      });
  }, [userId, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/profile?userId=${userId}&role=${role}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert("资料更新成功");
      } else {
        console.error("Profile update failed:", data);
        alert("保存失败: " + (data.details || data.error || "验证失败"));
      }
    } catch (err) {
      console.error(err);
      alert("保存时发生网络错误");
    } finally {
      setSaving(false);
    }
  };

  if (!session) return <div className="p-24 text-center font-bold text-zinc-600">请先登录</div>;
  if (loading) return <div className="p-24 text-center font-bold text-zinc-600">加载中...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-green-500 font-bold uppercase tracking-widest text-xs">
            <Sparkles className="h-4 w-4" /> 账户设置
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
            编辑您的 <span className="text-zinc-700">资料</span>
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-900/50 border border-white/5 p-10 rounded-[3rem] backdrop-blur-2xl">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="w-full md:w-48 shrink-0">
              <FileUpload 
                label={role === "MERCHANT" ? "品牌Logo" : "个人头像"}
                defaultValue={formData.avatar}
                onUploadComplete={(url) => setFormData({ ...formData, avatar: url })}
              />
            </div>

            <div className="flex-1 space-y-8 w-full">
              {role === "MERCHANT" ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">品牌名称</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
                      <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:border-green-500/50 focus:ring-0 transition-all text-white font-medium"
                        value={formData.brandName || ""}
                        onChange={e => setFormData({ ...formData, brandName: e.target.value })}
                        placeholder="输入您的品牌或公司名称"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">所属行业</label>
                      <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-green-500/50 focus:ring-0 transition-all text-white font-medium"
                        value={formData.industry || ""}
                        onChange={e => setFormData({ ...formData, industry: e.target.value })}
                        placeholder="例如：时尚、科技、美妆"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">官方网站</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
                        <input
                          type="url"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:border-green-500/50 focus:ring-0 transition-all text-white font-medium"
                          value={formData.website || ""}
                          onChange={e => setFormData({ ...formData, website: e.target.value })}
                          placeholder="https://yourbrand.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">品牌介绍</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 h-5 w-5 text-zinc-600" />
                      <textarea
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:border-green-500/50 focus:ring-0 transition-all text-white font-medium resize-none"
                        value={formData.description || ""}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="简短描述您的品牌故事和核心价值"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">个人简介</label>
                    <div className="relative">
                      <User className="absolute left-4 top-4 h-5 w-5 text-zinc-600" />
                      <textarea
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:border-green-500/50 focus:ring-0 transition-all text-white font-medium resize-none"
                        value={formData.bio || ""}
                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="向品牌介绍你自己..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">粉丝数量</label>
                      <div className="relative">
                        <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
                        <input
                          type="number"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:border-green-500/50 focus:ring-0 transition-all text-white font-medium"
                          value={formData.followerCount || 0}
                          onChange={e => setFormData({ ...formData, followerCount: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">擅长领域 (以逗号分隔)</label>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
                        <input
                          type="text"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:border-green-500/50 focus:ring-0 transition-all text-white font-medium"
                          value={formData.tags || ""}
                          onChange={e => setFormData({ ...formData, tags: e.target.value })}
                          placeholder="例如：时尚, 数码, 旅行"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-green-500 hover:bg-green-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-[0_20px_50px_rgba(34,197,94,0.2)] hover:shadow-[0_20px_50px_rgba(34,197,94,0.4)]"
              >
                {saving ? (
                  <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="h-5 w-5 transition-transform group-hover:scale-110" />
                    保存资料设置
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
