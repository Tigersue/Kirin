'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Briefcase, CheckCircle2, Clock, Filter, Search, Wallet, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  status: string;
  paymentStatus: string;
  submissionUrl: string | null;
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

const statusOptions = [
  { value: "ALL", label: "全部" },
  { value: "PENDING", label: "审核中" },
  { value: "ACCEPTED", label: "已录取" },
  { value: "REJECTED", label: "未通过" },
  { value: "COMPLETED", label: "已结案" },
];

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

export default function InfluencerTasksPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;
  const role = (session?.user as any)?.role as string | undefined;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]["value"]>("ALL");

  useEffect(() => {
    if (!userId) return;
    if (role && role !== "INFLUENCER") {
      router.push("/dashboard");
      return;
    }

    let canceled = false;
    setLoading(true);
    fetch("/api/influencer/applications")
      .then((r) => r.json().then((j) => ({ ok: r.ok, json: j })))
      .then(({ ok, json }) => {
        if (canceled) return;
        if (!ok) {
          setTasks([]);
          return;
        }
        setTasks(Array.isArray(json) ? json : []);
      })
      .finally(() => {
        if (canceled) return;
        setLoading(false);
      });

    return () => {
      canceled = true;
    };
  }, [userId, role, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks
      .filter((t) => (statusFilter === "ALL" ? true : t.status === statusFilter))
      .filter((t) => {
        if (!q) return true;
        const hay = `${t.campaign.title} ${t.campaign.platform} ${t.campaign.merchant.brandName}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [tasks, query, statusFilter]);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="flex items-start justify-between gap-6">
          <div className="space-y-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold uppercase tracking-widest text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </button>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none flex items-center gap-4">
              <Briefcase className="h-8 w-8 text-zinc-700" />
              历史任务
            </h1>
            <p className="text-zinc-500 font-medium">
              查看全部合作任务、状态、结算与提交记录
            </p>
          </div>

          <Link
            href="/campaigns"
            className="hidden md:inline-flex px-8 py-4 rounded-2xl bg-white text-black font-black text-sm hover:bg-zinc-200 transition-all"
          >
            去找新任务
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索活动名称 / 平台 / 品牌..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:border-green-500/50 focus:ring-0 transition-all text-white placeholder:text-zinc-700 font-medium"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full appearance-none bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:border-green-500/50 focus:ring-0 transition-all text-white font-bold"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value} className="bg-black text-white">
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-24 text-center font-bold text-zinc-600">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="p-24 text-center bg-zinc-900/30 border border-dashed border-white/10 rounded-[3rem] space-y-6">
            <p className="text-zinc-600 font-bold text-xl">暂无任务</p>
            <Link href="/campaigns" className="inline-block px-8 py-4 rounded-2xl bg-white text-black font-black hover:bg-zinc-200 transition-all">
              前往活动广场找找机会 →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {filtered.map((t) => (
              <Link
                key={t.id}
                href={`/influencer/tasks/${t.id}`}
                className={cn(
                  "group relative bg-zinc-900/50 border border-white/5 p-8 rounded-[2.5rem] hover:border-green-500/30 transition-all duration-500 overflow-hidden"
                )}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-3xl bg-white/5 flex items-center justify-center text-3xl">
                      {t.campaign.platform === "抖音" ? "🎵" : t.campaign.platform === "小红书" ? "📕" : "📱"}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold group-hover:text-green-500 transition-colors">
                        {t.campaign.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-500">
                        <span className="flex items-center gap-1.5">
                          {getStatusIcon(t.status)}
                          {getStatusText(t.status)}
                        </span>
                        <span className="text-zinc-800">|</span>
                        <span className="flex items-center gap-1.5">
                          <Wallet className="h-3 w-3" />
                          {getPaymentStatusText(t.paymentStatus)}
                        </span>
                        <span className="text-zinc-800">|</span>
                        <span>{t.campaign.merchant.brandName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-zinc-700 uppercase mb-1">预估收益</p>
                      <p className="text-xl font-black text-green-500">¥{t.campaign.budget.toLocaleString()}</p>
                    </div>
                    <div className="px-6 py-3 rounded-2xl bg-white/5 text-zinc-400 text-sm font-bold border border-white/5">
                      查看详情 →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

