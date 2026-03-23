'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Sparkles, Send, Calendar, DollarSign, Globe, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  title: string;
  description: string;
  platform: string;
  budget: number;
  deadline: string;
  status: string;
  merchant: {
    brandName: string;
    description: string;
  };
}

export default function CampaignDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    // In a real app, this would be a dedicated GET /api/campaigns/[id]
    // For now, we'll fetch all and find the one we need
    fetch("/api/campaigns")
      .then(res => res.json())
      .then(data => {
        const found = data.find((c: Campaign) => c.id === id);
        setCampaign(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    const user = session?.user as any;
    const userId = user?.id as string | undefined;
    const role = user?.role as string | undefined;

    if (!userId) {
      alert("请先登录");
      router.push("/login");
      return;
    }

    if (role !== "INFLUENCER") {
      alert("只有达人账号可以申请合作");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/campaigns/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ influencerId: userId }),
      });

      if (response.ok) {
        setApplied(true);
      } else {
        const error = await response.json().catch(() => null);
        alert("申请失败: " + (error?.details || error?.error || "未知错误"));
      }
    } catch (err) {
      console.error(err);
      alert("申请出错");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-24 text-center font-bold">加载中...</div>;
  if (!campaign) return <div className="min-h-screen bg-black text-white p-24 text-center font-bold">未找到活动</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-12 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold uppercase tracking-widest text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> 返回列表
        </button>

        {/* Hero Section */}
        <header className="mb-16 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="px-4 py-1 rounded-full bg-green-500 text-black text-xs font-black uppercase tracking-widest">
              {campaign.platform}
            </span>
            <span className="px-4 py-1 rounded-full bg-zinc-900 border border-white/5 text-zinc-500 text-xs font-bold uppercase tracking-widest">
              状态: {campaign.status}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
            {campaign.title}
          </h1>
          
          <div className="flex flex-wrap gap-12 pt-8 border-t border-white/5">
            <div className="space-y-2">
              <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                <DollarSign className="h-3 w-3" /> 合作预算
              </p>
              <p className="text-3xl font-black text-green-500">¥{campaign.budget.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                <Calendar className="h-3 w-3" /> 申请截止
              </p>
              <p className="text-3xl font-black">{new Date(campaign.deadline).toLocaleDateString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                <Globe className="h-3 w-3" /> 目标平台
              </p>
              <p className="text-3xl font-black uppercase">{campaign.platform}</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12">
            <section className="space-y-4">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <FileText className="h-6 w-6 text-zinc-700" /> 活动详情
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed whitespace-pre-wrap">
                {campaign.description}
              </p>
            </section>

            <section className="p-10 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-green-500" /> 品牌方资料
              </h2>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight">{campaign.merchant.brandName}</h3>
                <p className="text-zinc-500 leading-relaxed">
                  {campaign.merchant.description || "暂无品牌介绍"}
                </p>
              </div>
            </section>
          </div>

          {/* Action Sidebar */}
          <aside className="space-y-8">
            <div className="sticky top-12 p-10 rounded-[3rem] bg-zinc-900 border border-white/5 shadow-2xl space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-center">立即申请合作</h3>
                <p className="text-zinc-500 text-sm text-center leading-relaxed">
                  提交申请后，品牌方将在 3 个工作日内完成审核并联系您。
                </p>
              </div>

              {applied ? (
                <div className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-green-500/10 border border-green-500/20 text-green-500">
                  <CheckCircle2 className="h-12 w-12" />
                  <p className="font-black text-xl">已提交申请</p>
                  <p className="text-sm text-center font-bold">请耐心等待品牌方联系。</p>
                </div>
              ) : (
                <button
                  disabled={submitting}
                  onClick={handleApply}
                  className={cn(
                    "w-full flex items-center justify-center gap-3 py-6 rounded-3xl bg-green-500 text-black font-black text-xl hover:bg-green-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_50px_-12px_rgba(34,197,94,0.3)]",
                    submitting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Send className="h-6 w-6" />
                  {submitting ? "提交中..." : "提交申请"}
                </button>
              )}

              <div className="flex flex-col gap-4 pt-8 border-t border-white/5">
                <div className="flex items-center gap-3 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  <AlertCircle className="h-4 w-4" /> 申请要求
                </div>
                <ul className="space-y-2 text-sm text-zinc-400 font-medium">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    需具备至少 10W 粉丝量
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    过往 ROI 不低于 1.5
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    能够产出高质量原创视频
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
