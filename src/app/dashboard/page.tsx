'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, LayoutDashboard, Briefcase, Users, TrendingUp, Calendar, ChevronRight, Wallet, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

import { useTranslation } from "@/components/providers/LanguageProvider";

interface Campaign {
  id: string;
  title: string;
  status: string;
  budget: number;
  platform: string;
  _count: {
    applications: number;
  };
}

export default function MerchantDashboard() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recharging, setRecharging] = useState(false);

  const fetchData = async () => {
    try {
      const [campaignsRes, profileRes] = await Promise.all([
        fetch("/api/campaigns"),
        fetch(`/api/profile?userId=${(session?.user as any)?.id}`)
      ]);
      
      if (campaignsRes.ok) {
        const data = await campaignsRes.json();
        setCampaigns(Array.isArray(data) ? data : []);
      }
      
      if (profileRes.ok) {
        const data = await profileRes.json();
        setBalance(data.merchantProfile?.balance || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const handleRecharge = async () => {
    if (!session?.user) {
      alert("请先登录");
      return;
    }
    
    setRecharging(true);
    try {
      const userId = (session.user as any).id;
      const response = await fetch("/api/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId,
          amount: 5000 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setBalance(data.balance);
        alert(t('common.success') + "！已模拟充值 ¥5,000");
      } else {
        console.error("Recharge failed:", data);
        alert("充值失败: " + (data.details || data.error || "未知错误"));
      }
    } catch (err) {
      console.error(err);
      alert("充值出错，请检查网络连接");
    } finally {
      setRecharging(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-500 font-bold uppercase tracking-widest text-xs">
              <LayoutDashboard className="h-4 w-4" /> {t('dashboard.merchant.title')}
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
              {t('dashboard.merchant.subtitle').split(' ')[0]} <span className="text-zinc-700">{t('dashboard.merchant.subtitle').split(' ')[1] || "业务"}</span>
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleRecharge}
              disabled={recharging}
              className="flex items-center gap-3 px-8 py-5 rounded-3xl bg-zinc-900 border border-white/10 text-white font-black text-lg hover:bg-zinc-800 transition-all active:scale-95"
            >
              <Wallet className="h-6 w-6 text-green-500" />
              {recharging ? t('common.loading') : t('dashboard.merchant.recharge')}
            </button>
            <Link
              href="/dashboard/campaigns/new"
              className="flex items-center gap-3 px-8 py-5 rounded-3xl bg-white text-black font-black text-lg hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_-12px_rgba(255,255,255,0.3)]"
            >
              <Plus className="h-6 w-6 stroke-[3]" />
              {t('dashboard.merchant.newCampaign')}
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: t('dashboard.merchant.activeCampaigns'), value: campaigns.length, icon: Briefcase, color: "text-blue-400" },
            { label: t('dashboard.merchant.receivedApplications'), value: campaigns.reduce((acc, c) => acc + (c._count?.applications || 0), 0), icon: Users, color: "text-green-400" },
            { label: t('dashboard.merchant.walletBalance'), value: `¥${balance.toLocaleString()}`, icon: Wallet, color: "text-yellow-400" },
            { label: t('dashboard.merchant.totalBudget'), value: `¥${campaigns.reduce((acc, c) => acc + c.budget, 0).toLocaleString()}`, icon: TrendingUp, color: "text-purple-400" },
          ].map((stat, i) => (
            <div key={i} className="bg-zinc-900/50 border border-white/5 p-8 rounded-[2rem] backdrop-blur-xl group hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-6">
                <div className={cn("p-4 rounded-2xl bg-white/5", stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <p className="text-zinc-500 font-bold uppercase tracking-wider text-xs mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black tracking-tight">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Campaign List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <Briefcase className="h-6 w-6 text-zinc-700" /> 
              {t('dashboard.merchant.recentCampaigns')}
            </h2>
            <Link href="#" className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">查看全部</Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center border border-dashed border-white/10 rounded-3xl text-zinc-600 font-bold">{t('common.loading')}</div>
            ) : campaigns.length === 0 ? (
              <div className="p-20 text-center bg-zinc-900/30 border border-dashed border-white/10 rounded-[3rem] space-y-4">
                <p className="text-zinc-600 font-bold text-xl">暂无活动</p>
                <Link href="/dashboard/campaigns/new" className="inline-block text-green-500 font-black hover:text-green-400">立即开始您的第一个营销活动 →</Link>
              </div>
            ) : (
              campaigns.map((campaign) => (
                <div key={campaign.id} className="group flex flex-col md:flex-row items-center justify-between p-6 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-green-500/30 transition-all">
                  <div className="flex items-center gap-6 mb-4 md:mb-0">
                    <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 font-bold text-xl">
                      {campaign.platform[0]}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1 group-hover:text-green-500 transition-colors">{campaign.title}</h4>
                      <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        <span>{campaign.platform}</span>
                        <span className="text-zinc-800">|</span>
                        <span>{t(`campaign.status.${campaign.status.toLowerCase()}`)}</span>
                        <span className="text-zinc-800">|</span>
                        <span className="text-green-500/80">¥{campaign.budget.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-zinc-700 uppercase mb-1">收到申请</p>
                      <p className="text-2xl font-black">{campaign._count?.applications || 0}</p>
                    </div>
                    <Link
                      href={`/dashboard/campaigns/${campaign.id}/applications`}
                      className="p-4 rounded-2xl bg-white/5 text-zinc-400 hover:bg-white hover:text-black transition-all"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}


