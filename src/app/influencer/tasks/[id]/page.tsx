'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Briefcase, Calendar, CheckCircle2, Clock, ExternalLink, Image as ImageIcon, Wallet, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplicationDetail {
  id: string;
  status: string;
  paymentStatus: string;
  submissionUrl: string | null;
  submissionScreenshot: string | null;
  createdAt: string;
  campaignId: string;
  campaign: {
    id: string;
    title: string;
    platform: string;
    budget: number;
    deadline: string;
    description: string;
    merchant: {
      brandName: string;
      description: string | null;
    };
  };
  performance: {
    clicks: number;
    conversions: number;
    gmv: number;
  } | null;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "ACCEPTED":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "REJECTED":
      return <XCircle className="h-4 w-4 text-red-400" />;
    case "COMPLETED":
      return <CheckCircle2 className="h-4 w-4 text-blue-400" />;
    default:
      return <Clock className="h-4 w-4 text-blue-400" />;
  }
}

function getStatusText(status: string) {
  switch (status) {
    case "ACCEPTED":
      return "已录取";
    case "REJECTED":
      return "未通过";
    case "COMPLETED":
      return "已结案";
    default:
      return "审核中";
  }
}

function getPaymentStatusText(status: string) {
  switch (status) {
    case "ESCROW":
      return "资金托管中";
    case "PAID":
      return "已结算";
    default:
      return "未支付";
  }
}

export default function InfluencerTaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const { data: session } = useSession();
  const role = (session?.user as any)?.role as string | undefined;

  const [data, setData] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    if (role && role !== "INFLUENCER") {
      router.push("/dashboard");
      return;
    }
    if (!id) return;

    let canceled = false;
    setLoading(true);
    fetch(`/api/applications/${id}`)
      .then((r) => r.json().then((j) => ({ ok: r.ok, json: j })))
      .then(({ ok, json }) => {
        if (canceled) return;
        if (!ok) {
          setData(null);
          return;
        }
        setData(json as ApplicationDetail);
      })
      .finally(() => {
        if (canceled) return;
        setLoading(false);
      });

    return () => {
      canceled = true;
    };
  }, [id, session, role, router]);

  const roi = useMemo(() => {
    if (!data?.performance) return null;
    const budget = data.campaign.budget || 0;
    if (budget <= 0) return null;
    return Number((data.performance.gmv / budget).toFixed(2));
  }, [data]);

  if (loading) {
    return <div className="min-h-screen bg-black text-white p-24 text-center font-bold text-zinc-600">加载中...</div>;
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24">
        <div className="max-w-5xl mx-auto space-y-10">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold uppercase tracking-widest text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>
          <div className="p-24 text-center bg-zinc-900/30 border border-dashed border-white/10 rounded-[3rem] space-y-6">
            <p className="text-zinc-600 font-bold text-xl">未找到任务详情</p>
            <Link href="/influencer/tasks" className="inline-block px-8 py-4 rounded-2xl bg-white text-black font-black hover:bg-zinc-200 transition-all">
              返回历史任务 →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold uppercase tracking-widest text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </button>
            <Link
              href={`/campaigns/${data.campaignId}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 text-zinc-300 font-black text-sm hover:bg-white hover:text-black transition-all border border-white/10"
            >
              查看活动页
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          <div className="p-10 rounded-[3rem] bg-zinc-900/50 border border-white/5 backdrop-blur-3xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-500 font-bold uppercase tracking-widest text-xs">
                  <Briefcase className="h-4 w-4" />
                  任务详情
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">
                  {data.campaign.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    {getStatusIcon(data.status)}
                    {getStatusText(data.status)}
                  </span>
                  <span className="text-zinc-800">|</span>
                  <span className="flex items-center gap-1.5">
                    <Wallet className="h-4 w-4" />
                    {getPaymentStatusText(data.paymentStatus)}
                  </span>
                  <span className="text-zinc-800">|</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    截止 {new Date(data.campaign.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold text-zinc-700 uppercase mb-1">预估收益</p>
                <p className="text-2xl font-black text-green-500">¥{data.campaign.budget.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            <div className="p-10 rounded-[3rem] bg-zinc-900/50 border border-white/5 space-y-5">
              <h2 className="text-xl font-black tracking-tight">任务要求</h2>
              <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">{data.campaign.description}</p>
            </div>

            <div className="p-10 rounded-[3rem] bg-zinc-900/50 border border-white/5 space-y-6">
              <h2 className="text-xl font-black tracking-tight">我的交付</h2>

              {data.submissionUrl ? (
                <div className="space-y-4">
                  <a
                    href={data.submissionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white text-black font-black hover:bg-zinc-200 transition-all"
                  >
                    打开作品链接
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <div className="text-sm text-zinc-500 font-bold">
                    申请时间：{new Date(data.createdAt).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 text-zinc-500 font-bold">
                  暂未提交作品
                </div>
              )}

              {data.submissionScreenshot ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-zinc-500 font-bold text-sm">
                    <ImageIcon className="h-4 w-4" />
                    作品截图
                  </div>
                  <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">
                    <img src={data.submissionScreenshot} alt="submission screenshot" className="w-full h-auto object-cover" />
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="p-10 rounded-[3rem] bg-zinc-900/50 border border-white/5 space-y-4">
              <h2 className="text-xl font-black tracking-tight">品牌方</h2>
              <div className="space-y-2">
                <p className="text-2xl font-black">{data.campaign.merchant.brandName}</p>
                <p className="text-zinc-500 leading-relaxed">
                  {data.campaign.merchant.description || "暂无品牌介绍"}
                </p>
              </div>
            </div>

            <div className="p-10 rounded-[3rem] bg-zinc-900/50 border border-white/5 space-y-6">
              <h2 className="text-xl font-black tracking-tight">效果数据</h2>
              {data.performance ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-bold text-sm">点击</span>
                    <span className="text-white font-black">{data.performance.clicks.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-bold text-sm">转化</span>
                    <span className="text-white font-black">{data.performance.conversions.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-bold text-sm">GMV</span>
                    <span className="text-green-500 font-black">¥{data.performance.gmv.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-bold text-sm">ROI</span>
                    <span className={cn("font-black", roi ? "text-green-500" : "text-zinc-500")}>{roi ?? "-"}</span>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-zinc-500 font-bold">
                  暂无效果数据
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
