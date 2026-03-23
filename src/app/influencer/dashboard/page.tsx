'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Send, 
  Link as LinkIcon,
  ChevronRight,
  Image as ImageIcon,
  Wallet,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import FileUpload from "@/components/FileUpload";
import { useSession } from "next-auth/react";
import { NotificationBell } from "@/components/NotificationBell";

interface Application {
  id: string;
  status: string;
  paymentStatus: string;
  submissionUrl: string | null;
  submissionScreenshot: string | null;
  createdAt: string;
  campaign: {
    id: string;
    title: string;
    platform: string;
    budget: number;
    merchant: {
      brandName: string;
    };
  };
}

export default function InfluencerDashboard() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;
  const [applications, setApplications] = useState<Application[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [applicationsRes, profileRes] = await Promise.all([
        fetch("/api/influencer/applications"),
        fetch(`/api/profile?userId=${userId}`)
      ]);
      
      if (applicationsRes.ok) {
        const data = await applicationsRes.json();
        setApplications(Array.isArray(data) ? data : []);
      }

      if (profileRes.ok) {
        const data = await profileRes.json();
        setBalance(data.influencerProfile?.balance || 0);
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

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionId) return;
    setSubmitting(true);

    try {
      const response = await fetch(`/api/applications/${submissionId}/submit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          submissionUrl: url,
          submissionScreenshot: screenshot
        }),
      });

      if (response.ok) {
        setSubmissionId(null);
        setUrl("");
        setScreenshot(null);
        fetchData();
      } else {
        alert("提交失败");
      }
    } catch (err) {
      console.error(err);
      alert("提交出错");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "REJECTED": return <XCircle className="h-4 w-4 text-red-400" />;
      case "COMPLETED": return <CheckCircle2 className="h-4 w-4 text-blue-400" />;
      default: return <Clock className="h-4 w-4 text-blue-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACCEPTED": return "已录取";
      case "REJECTED": return "未通过";
      case "COMPLETED": return "已结案";
      default: return "审核中";
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "ESCROW": return "资金托管中";
      case "PAID": return "已结算";
      default: return "未支付";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-500 font-bold uppercase tracking-widest text-xs">
              <Sparkles className="h-4 w-4" /> 达人工作台
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
              管理您的 <span className="text-zinc-700">合作</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {userId ? <NotificationBell userId={userId} /> : null}
            <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl backdrop-blur-xl flex items-center gap-6">
              <div className="p-3 bg-green-500/10 rounded-2xl">
                <Wallet className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">累计收益</p>
                <p className="text-2xl font-black">¥{balance.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Applications List */}
        <main className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <Briefcase className="h-6 w-6 text-zinc-700" /> 
              我的申请
            </h2>
            <div className="flex items-center gap-3">
              <Link
                href="/influencer/tasks"
                className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/5 text-white font-black text-sm hover:bg-white hover:text-black transition-all border border-white/10"
              >
                <History className="h-4 w-4" />
                历史任务
              </Link>
              <Link
                href="/campaigns"
                className="px-8 py-4 rounded-2xl bg-white text-black font-black text-sm hover:bg-zinc-200 transition-all"
              >
                探索新机会
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="p-24 text-center font-bold text-zinc-600">加载中...</div>
          ) : applications.length === 0 ? (
            <div className="p-24 text-center bg-zinc-900/30 border border-dashed border-white/10 rounded-[3rem] space-y-6">
              <p className="text-zinc-600 font-bold text-xl">暂无合作申请</p>
              <Link href="/campaigns" className="inline-block px-8 py-4 rounded-2xl bg-white text-black font-black hover:bg-zinc-200 transition-all">
                前往活动广场找找机会 →
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {applications.map((app) => (
                <div key={app.id} className="group relative bg-zinc-900/50 border border-white/5 p-8 rounded-[2.5rem] hover:border-green-500/30 transition-all duration-500 overflow-hidden">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="h-20 w-20 rounded-3xl bg-white/5 flex items-center justify-center text-3xl">
                        {app.campaign.platform === "抖音" ? "🎵" : app.campaign.platform === "小红书" ? "📕" : "📱"}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold group-hover:text-green-500 transition-colors">
                          {app.campaign.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-500">
                          <span className="flex items-center gap-1.5">
                            {getStatusIcon(app.status)}
                            {getStatusText(app.status)}
                          </span>
                          <span className="text-zinc-800">|</span>
                          <span className="flex items-center gap-1.5">
                            <Wallet className="h-3 w-3" />
                            {getPaymentStatusText(app.paymentStatus)}
                          </span>
                          <span className="text-zinc-800">|</span>
                          <span>{app.campaign.merchant.brandName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-zinc-700 uppercase mb-1">预估收益</p>
                        <p className="text-xl font-black text-green-500">¥{app.campaign.budget.toLocaleString()}</p>
                      </div>

                      {app.status === "ACCEPTED" && !app.submissionUrl && (
                        <button
                          onClick={() => setSubmissionId(app.id)}
                          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-black font-black text-sm hover:bg-zinc-200 transition-all"
                        >
                          <Send className="h-4 w-4" />
                          提交作品
                        </button>
                      )}

                      {app.submissionUrl && (
                        <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 text-zinc-400 text-sm font-bold border border-white/5">
                          <LinkIcon className="h-4 w-4" />
                          已提交
                        </div>
                      )}

                      <Link
                        href={`/influencer/tasks/${app.id}`}
                        className="p-4 rounded-2xl bg-white/5 text-zinc-400 hover:bg-white hover:text-black transition-all"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Submission Modal Overlay */}
      {submissionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-zinc-900 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl animate-in zoom-in duration-300 my-auto">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-black tracking-tighter">提交作品</h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                请输入您的发布作品链接并上传作品截图（如发布后的数据后台截图），品牌方将据此进行审核与效果统计。
              </p>
            </div>

            <form onSubmit={handleSubmission} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">作品链接</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
                      <input
                        required
                        type="url"
                        placeholder="https://..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:border-green-500/50 focus:ring-0 transition-all text-white placeholder:text-zinc-700 font-medium"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <FileUpload 
                    label="作品截图 (可选)"
                    aspectRatio="video"
                    onUploadComplete={(url) => setScreenshot(url)}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setSubmissionId(null);
                    setScreenshot(null);
                  }}
                  className="flex-1 py-4 rounded-2xl border border-white/10 text-zinc-400 font-bold hover:text-white transition-all"
                >
                  取消
                </button>
                <button
                  disabled={submitting}
                  type="submit"
                  className={cn(
                    "flex-1 py-4 rounded-2xl bg-green-500 text-black font-black hover:bg-green-400 transition-all shadow-[0_0_50px_-12px_rgba(34,197,94,0.3)]",
                    submitting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {submitting ? "提交中..." : "确认提交"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
