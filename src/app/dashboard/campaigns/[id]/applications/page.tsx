'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, UserCheck, X, Check, Star, Users, Briefcase, TrendingUp, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface Application {
  id: string;
  status: string;
  submissionUrl?: string;
  performance?: {
    clicks: number;
    conversions: number;
    gmv: number;
  };
  influencer: {
    user: {
      name: string;
      email: string;
    };
    rating: number;
    followerCount: number;
    tags: string;
  };
}

interface Campaign {
  id: string;
  title: string;
  applications: Application[];
}

export default function CampaignApplicationsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [roiAppId, setRoiAppId] = useState<string | null>(null);
  const [roiData, setRoiData] = useState({ clicks: 0, conversions: 0, gmv: 0 });
  const [roiSaving, setRoiSaving] = useState(false);

  const fetchCampaign = async () => {
    try {
      const response = await fetch(`/api/campaigns/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCampaign(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const handleStatusUpdate = async (appId: string, status: "ACCEPTED" | "REJECTED") => {
    try {
      const response = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchCampaign();
      } else {
        const error = await response.json().catch(() => null);
        if (error?.code === "INSUFFICIENT_BALANCE") {
          const required = error?.details?.requiredBudget ?? 0;
          const balance = error?.details?.merchantBalance ?? 0;
          const shortfall = error?.details?.shortfall ?? Math.max(0, required - balance);
          const goRecharge = confirm(
            `余额不足，无法托管资金。\n当前余额：¥${Number(balance).toLocaleString()}\n所需预算：¥${Number(required).toLocaleString()}\n还差：¥${Number(shortfall).toLocaleString()}\n\n是否前往充值？`
          );
          if (goRecharge) {
            router.push("/dashboard");
          }
          return;
        }

        alert("操作失败: " + (error?.details || error?.error || "未知错误"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async (appId: string) => {
    try {
      const response = await fetch(`/api/applications/${appId}/complete`, {
        method: "PATCH",
      });

      if (response.ok) {
        fetchCampaign();
      } else {
        alert("结案失败");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roiAppId) return;
    setRoiSaving(true);

    try {
      const response = await fetch(`/api/applications/${roiAppId}/roi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roiData),
      });

      if (response.ok) {
        setRoiAppId(null);
        fetchCampaign();
      } else {
        alert("保存失败");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRoiSaving(false);
    }
  };

  const handleExport = () => {
    if (!campaign) return;
    
    const reportData = campaign.applications.map(app => ({
      influencer: app.influencer.user.name,
      status: app.status,
      clicks: app.performance?.clicks || 0,
      conversions: app.performance?.conversions || 0,
      gmv: app.performance?.gmv || 0,
    }));

    const blob = new Blob([JSON.stringify({ campaign: campaign.title, results: reportData }, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Campaign_Report_${campaign.title}.json`;
    a.click();
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-24 text-center font-bold">加载中...</div>;
  if (!campaign) return <div className="min-h-screen bg-black text-white p-24 text-center font-bold">未找到活动</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-12 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold uppercase tracking-widest text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> 返回仪表盘
        </button>

        <header className="mb-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-500 font-bold uppercase tracking-widest text-sm">
              <Users className="h-4 w-4" /> 申请管理
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              {campaign.title}
            </h1>
            <p className="text-zinc-500 text-lg">
              共有 {campaign.applications.length} 位达人申请了此活动
            </p>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-black hover:bg-zinc-200 transition-all"
          >
            <Download className="h-5 w-5" />
            导出结案报告
          </button>
        </header>

        <main className="space-y-6">
          {campaign.applications.length === 0 ? (
            <div className="p-20 text-center bg-zinc-900/30 border border-dashed border-white/10 rounded-[3rem] text-zinc-600 font-bold">
              目前还没有达人申请此活动
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaign.applications.map((app) => {
                const tags = JSON.parse(app.influencer.tags || "[]");
                return (
                  <div key={app.id} className="group relative overflow-hidden rounded-[2.5rem] bg-zinc-900/50 border border-white/5 p-8 transition-all hover:border-white/10">
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 font-bold text-2xl">
                          {app.influencer.user.name?.[0] || "?"}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{app.influencer.user.name}</h3>
                          <p className="text-zinc-500 text-sm">{app.influencer.user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-bold">{app.influencer.rating}</span>
                        </div>
                        <span className="text-zinc-600 text-[10px] font-bold uppercase">{app.influencer.followerCount.toLocaleString()} 粉丝</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {tags.map((tag: string) => (
                        <span key={tag} className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-zinc-400 border border-white/5">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-bold text-zinc-700 uppercase">当前状态</p>
                        <span className={cn(
                          "text-sm font-bold",
                          app.status === "PENDING" && "text-blue-400",
                          app.status === "ACCEPTED" && (app.submissionUrl ? "text-yellow-400" : "text-green-500"),
                          app.status === "REJECTED" && "text-red-400",
                          app.status === "COMPLETED" && "text-blue-500"
                        )}>
                          {app.status === "PENDING" ? "待审核" : 
                           app.status === "ACCEPTED" ? (app.submissionUrl ? "待结案" : "已录取") : 
                           app.status === "REJECTED" ? "已拒绝" : "已结案"}
                        </span>
                      </div>

                      {app.status === "PENDING" && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleStatusUpdate(app.id, "REJECTED")}
                            className="p-4 rounded-2xl bg-white/5 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <X className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(app.id, "ACCEPTED")}
                            className="p-4 rounded-2xl bg-green-500 text-black hover:bg-green-400 transition-all shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]"
                          >
                            <Check className="h-5 w-5 stroke-[3]" />
                          </button>
                        </div>
                      )}

                      {app.status === "ACCEPTED" && app.submissionUrl && (
                        <div className="flex gap-3 items-center">
                          <button
                            onClick={() => {
                              setRoiAppId(app.id);
                              setRoiData(app.performance || { clicks: 0, conversions: 0, gmv: 0 });
                            }}
                            className="p-4 rounded-2xl bg-white/5 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                            title="录入数据"
                          >
                            <TrendingUp className="h-5 w-5" />
                          </button>
                          <a
                            href={app.submissionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-white/5 text-zinc-400 text-xs font-bold hover:text-white transition-all"
                          >
                            查看作品
                          </a>
                          <button
                            onClick={() => handleComplete(app.id)}
                            className="px-6 py-2 rounded-xl bg-green-500 text-black font-black text-xs hover:bg-green-400 transition-all shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]"
                          >
                            确认结案
                          </button>
                        </div>
                      )}
                    </div>

                    {app.performance && (
                      <div className="mt-6 grid grid-cols-3 gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-zinc-600 uppercase">点击</p>
                          <p className="text-sm font-black">{app.performance.clicks}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-zinc-600 uppercase">转化</p>
                          <p className="text-sm font-black">{app.performance.conversions}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-zinc-600 uppercase">GMV</p>
                          <p className="text-sm font-black text-green-500">¥{app.performance.gmv}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ROI Modal */}
      {roiAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-black tracking-tighter">录入效果数据</h2>
              <p className="text-zinc-500 text-sm">请根据达人反馈录入真实的转化数据</p>
            </div>

            <form onSubmit={handleRoiSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">总点击量</label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-green-500/50 text-white"
                    value={roiData.clicks}
                    onChange={e => setRoiData({ ...roiData, clicks: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">总转化数</label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-green-500/50 text-white"
                    value={roiData.conversions}
                    onChange={e => setRoiData({ ...roiData, conversions: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase ml-1">总销售额 (GMV)</label>
                <input
                  type="number"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-green-500/50 text-white"
                  value={roiData.gmv}
                  onChange={e => setRoiData({ ...roiData, gmv: parseFloat(e.target.value) })}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setRoiAppId(null)}
                  className="flex-1 py-4 rounded-2xl border border-white/10 text-zinc-400 font-bold"
                >
                  取消
                </button>
                <button
                  disabled={roiSaving}
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-green-500 text-black font-black hover:bg-green-400"
                >
                  {roiSaving ? "保存中..." : "保存数据"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
