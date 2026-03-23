'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  Sparkles, 
  Users, 
  TrendingUp, 
  Target, 
  Globe, 
  Instagram, 
  Twitter, 
  Youtube, 
  CheckCircle2, 
  ArrowLeft,
  Briefcase,
  Star,
  ShieldCheck,
  Zap
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface InfluencerDetail {
  id: string;
  avatar: string | null;
  bio: string | null;
  tags: string | null;
  platforms: string | null;
  followerCount: number;
  rating: number;
  user: {
    name: string;
    email: string;
  };
  stats: {
    totalGMV: number;
    totalConversions: number;
    completedCampaigns: number;
  };
  applications: Array<{
    id: string;
    campaign: {
      title: string;
      platform: string;
      merchant: {
        brandName: string;
      };
    };
    performance: {
      gmv: number;
      conversions: number;
      clicks: number;
    } | null;
  }>;
}

export default function InfluencerDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [influencer, setInfluencer] = useState<InfluencerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/influencers/${id}`)
      .then(res => res.json())
      .then(setInfluencer)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-24 text-center font-bold text-zinc-600">加载中...</div>;
  if (!influencer) return <div className="p-24 text-center font-bold text-zinc-600">达人不存在</div>;

  const tags = influencer.tags ? JSON.parse(influencer.tags) : [];
  const platforms = influencer.platforms ? JSON.parse(influencer.platforms) : [];

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24">
      <div className="max-w-7xl mx-auto space-y-12">
        <Link 
          href="/influencers" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group font-bold"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          返回达人广场
        </Link>

        {/* Hero Section */}
        <div className="relative group p-12 rounded-[3.5rem] bg-zinc-900/50 border border-white/5 backdrop-blur-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            {/* Avatar */}
            <div className="relative">
              <div className="h-48 w-48 rounded-[3rem] bg-zinc-800 overflow-hidden border-4 border-white/10 group-hover:border-green-500/30 transition-all duration-700 shadow-2xl">
                {influencer.avatar ? (
                  <img src={influencer.avatar} alt={influencer.user.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-5xl font-black text-zinc-700">
                    {influencer.user.name[0]}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-4 -right-4 h-16 w-16 bg-green-500 rounded-2xl flex items-center justify-center text-black shadow-2xl rotate-12 group-hover:rotate-0 transition-transform duration-500">
                <CheckCircle2 className="h-8 w-8 stroke-[3]" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-6xl font-black tracking-tighter leading-none">{influencer.user.name}</h1>
                  <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-zinc-400">
                    优质合作伙伴
                  </div>
                </div>
                <p className="text-xl text-zinc-500 font-medium max-w-2xl">{influencer.bio || "该达人暂无简介"}</p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                {tags.map((tag: string, i: number) => (
                  <span key={i} className="px-5 py-2 rounded-2xl bg-white/5 text-sm font-bold text-zinc-300">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-green-500/10 text-green-500">
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">综合评分</p>
                    <p className="text-lg font-black">{influencer.rating.toFixed(1)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">粉丝总数</p>
                    <p className="text-lg font-black">{(influencer.followerCount / 10000).toFixed(1)}W</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">完成合作</p>
                    <p className="text-lg font-black">{influencer.stats.completedCampaigns}次</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="w-full md:w-auto">
              <button className="w-full px-12 py-6 rounded-[2rem] bg-green-500 text-black font-black text-xl hover:bg-green-400 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(34,197,94,0.3)] flex items-center justify-center gap-3">
                <Zap className="h-6 w-6 fill-current" />
                立即邀约合作
              </button>
            </div>
          </div>
        </div>

        {/* Stats and History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Data */}
          <div className="lg:col-span-1 p-10 rounded-[3rem] bg-zinc-900/50 border border-white/5 backdrop-blur-3xl space-y-10">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-green-500" /> 转化表现
            </h2>
            
            <div className="space-y-8">
              <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 space-y-4">
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">累计 GMV 贡献</p>
                <h3 className="text-5xl font-black text-green-500">¥{influencer.stats.totalGMV.toLocaleString()}</h3>
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-600">
                  <Target className="h-4 w-4" /> 累计转化 {influencer.stats.totalConversions} 单
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">活跃平台</h3>
                <div className="grid grid-cols-2 gap-4">
                  {platforms.map((platform: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                      <Globe className="h-5 w-5 text-zinc-500" />
                      <span className="font-bold">{platform}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="lg:col-span-2 p-10 rounded-[3rem] bg-zinc-900/50 border border-white/5 backdrop-blur-3xl space-y-10">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-zinc-700" /> 合作案例展示
            </h2>

            <div className="space-y-6">
              {influencer.applications.length === 0 ? (
                <div className="p-20 text-center border border-dashed border-white/10 rounded-[2.5rem] text-zinc-600 font-bold">
                  该达人暂无公开合作记录
                </div>
              ) : (
                influencer.applications.map((app) => (
                  <div key={app.id} className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-2xl">
                        {app.campaign.platform === "抖音" ? "🎵" : app.campaign.platform === "小红书" ? "📕" : "📱"}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold group-hover:text-green-500 transition-colors">{app.campaign.title}</h4>
                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{app.campaign.merchant.brandName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-12 text-center md:text-right">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-700 uppercase mb-1">成交单数</p>
                        <p className="text-2xl font-black">{app.performance?.conversions || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-700 uppercase mb-1">贡献 GMV</p>
                        <p className="text-2xl font-black text-green-500">¥{app.performance?.gmv.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
