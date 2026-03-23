'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { TrendingUp, Users, DollarSign, Target, ArrowUpRight, ArrowDownRight, Sparkles, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  merchantId: string;
  campaignsCount: number;
  performanceCount: number;
  totalClicks: number;
  totalConversions: number;
  totalGMV: number;
  totalBudget: number;
  averageROI: string;
  cpa: string;
  gmvSeries: Array<{ label: string; gmv: number }>;
  platformDistribution: Array<{ name: string; val: number; gmv: number }>;
  topInfluencers: Array<{ name: string; gmv: number; avatar: string | null }>;
  recentActivity: Array<{ id: string; influencer: string; campaign: string; gmv: number; time: string }>;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/login");
      return;
    }

    let canceled = false;
    setLoading(true);
    setError(null);

    fetch("/api/analytics")
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(json?.details || json?.error || `HTTP ${res.status}`);
        }
        return json as AnalyticsData;
      })
      .then((json) => {
        if (canceled) return;
        setData(json);
      })
      .catch((e) => {
        if (canceled) return;
        setData(null);
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (canceled) return;
        setLoading(false);
      });

    return () => {
      canceled = true;
    };
  }, [session, status, router]);

  if (loading) return <div className="p-24 text-center font-bold text-zinc-600">加载中...</div>;

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-12 overflow-x-hidden">
        <div className="max-w-3xl mx-auto p-10 rounded-[3rem] bg-zinc-900/50 border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-green-500 font-bold uppercase tracking-widest text-xs">
            <Sparkles className="h-4 w-4" /> 营销数据中心
          </div>
          <h1 className="text-3xl font-black tracking-tighter">数据加载失败</h1>
          <p className="text-zinc-500 font-medium break-words">{error}</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "总点击量", value: data ? data.totalClicks.toLocaleString() : "0", trend: "+12.5%", isUp: true, icon: Users },
    { label: "平均 ROI", value: `${data?.averageROI ?? "0"}x`, trend: "+0.4", isUp: true, icon: TrendingUp },
    { label: "转化成本 (CPA)", value: `¥${data?.cpa ?? "0"}`, trend: "-¥2.1", isUp: false, icon: Target },
    { label: "营销总支出", value: `¥${data ? data.totalBudget.toLocaleString() : "0"}`, trend: "+¥12,000", isUp: true, icon: DollarSign },
  ];

  const gmvSeries = data?.gmvSeries ?? [];
  const maxGMV = gmvSeries.reduce((acc, p) => Math.max(acc, p.gmv), 0);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-500 font-bold uppercase tracking-widest text-xs">
              <Sparkles className="h-4 w-4" /> 营销数据中心
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
              全域流量 <span className="text-zinc-700">实时大屏</span>
            </h1>
          </div>
          
          <div className="flex flex-col items-start gap-2 text-zinc-500 font-bold uppercase tracking-widest text-xs border border-white/5 bg-zinc-900/50 px-6 py-4 rounded-2xl">
            <div>数据更新于: {new Date().toLocaleTimeString()}</div>
            <div className="flex items-center gap-3">
              <span>活动数: {data?.campaignsCount ?? 0}</span>
              <span className="text-zinc-800">|</span>
              <span>数据点: {data?.performanceCount ?? 0}</span>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="group relative p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 backdrop-blur-3xl overflow-hidden hover:border-green-500/30 transition-all">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-green-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div className="p-4 rounded-2xl bg-white/5 text-zinc-500 group-hover:text-green-500 transition-colors">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-sm font-black",
                    stat.isUp ? "text-green-500" : "text-red-400"
                  )}>
                    {stat.trend}
                    {stat.isUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  </div>
                </div>
                
                <div>
                  <p className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] mb-1">{stat.label}</p>
                  <h3 className="text-4xl font-black tracking-tight">{stat.value}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts and Lists Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Growth Chart */}
          <div className="lg:col-span-2 p-10 rounded-[3rem] bg-zinc-900/50 border border-white/5 backdrop-blur-3xl space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-green-500" /> 销售转化总额 (GMV)
              </h2>
              <div className="text-4xl font-black text-white">¥{data ? data.totalGMV.toLocaleString() : "0"}</div>
            </div>
            
            <div className="space-y-4">
              <div className="relative h-64 w-full flex items-end gap-2 px-2">
                {gmvSeries.map((p, i) => {
                  const height = maxGMV > 0 ? Math.max(6, (p.gmv / maxGMV) * 100) : 6;
                  return (
                    <div key={i} className="flex-1 group relative">
                      <div
                        className="w-full bg-zinc-800 rounded-t-xl group-hover:bg-green-500 transition-all cursor-pointer relative"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          ¥{p.gmv.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {maxGMV === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="px-6 py-3 rounded-2xl bg-black/60 border border-white/10 text-zinc-500 text-xs font-black">
                      暂无 GMV 数据（录入 ROI 后自动展示）
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-12 gap-2 px-2">
                {gmvSeries.map((p, i) => (
                  <div key={i} className="text-center text-[10px] font-bold text-zinc-700">
                    {p.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Platform Distribution */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">平台流量占比</h3>
                <div className="space-y-4">
                  {data && data.platformDistribution.length > 0 ? data.platformDistribution.map((p, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm font-bold">
                        <span>{p.name}</span>
                        <span className="text-green-500">{p.val}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-1000" 
                          style={{ width: `${p.val}%` }} 
                        />
                      </div>
                    </div>
                  )) : (
                    <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-zinc-500 font-bold">
                      暂无平台数据
                    </div>
                  )}
                </div>
              </div>

              {/* Top Influencers */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">达人贡献排行</h3>
                <div className="space-y-4">
                  {data && data.topInfluencers.length > 0 ? data.topInfluencers.map((inf, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-800 overflow-hidden">
                          {inf.avatar ? (
                            <img src={inf.avatar} alt={inf.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] font-bold">
                              {inf.name[0]}
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-bold">{inf.name}</span>
                      </div>
                      <span className="text-sm font-black text-green-500">¥{inf.gmv.toLocaleString()}</span>
                    </div>
                  )) : (
                    <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-zinc-500 font-bold">
                      暂无达人贡献数据
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="p-10 rounded-[3rem] bg-zinc-900/50 border border-white/5 backdrop-blur-3xl space-y-8">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-green-500" /> 实时转化动态
            </h2>
            
            <div className="space-y-6">
              {data && data.recentActivity.length > 0 ? data.recentActivity.map((act) => (
                <div key={act.id} className="relative pl-6 pb-6 border-l border-white/10 last:border-0 last:pb-0">
                  <div className="absolute left-[-5px] top-0 h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-500 font-medium">
                      {new Date(act.time).toLocaleTimeString()}
                    </p>
                    <p className="text-sm font-bold">
                      <span className="text-green-500">{act.influencer}</span> 带来一笔成交
                    </p>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">
                      所属活动: {act.campaign}
                    </p>
                    <div className="mt-2 text-lg font-black text-white">
                      ¥{act.gmv.toLocaleString()}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 text-zinc-500 font-bold">
                  暂无动态数据
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
