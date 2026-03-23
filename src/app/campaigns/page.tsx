'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Sparkles, Calendar, Users, DollarSign, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  title: string;
  description: string;
  platform: string;
  budget: number;
  deadline: string;
  merchant: {
    brandName: string;
  };
  _count: {
    applications: number;
  };
}

export default function CampaignMarketplace() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/campaigns")
      .then(res => res.json())
      .then(data => {
        setCampaigns(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredCampaigns = campaigns.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.merchant.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header Section */}
      <header className="max-w-7xl mx-auto mb-16 space-y-4">
        <div className="flex items-center gap-2 text-green-500 font-bold uppercase tracking-widest text-sm">
          <Sparkles className="h-4 w-4" />
          任务广场
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
          探索最优质的 <span className="text-zinc-600">品牌</span> 合作机会
        </h1>
      </header>

      {/* Filter & Search Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row gap-4 p-2 rounded-[2rem] bg-zinc-900/80 border border-white/5 backdrop-blur-xl">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input
              type="text"
              placeholder="搜索品牌、平台或关键词..."
              className="w-full bg-transparent border-none py-4 pl-14 pr-6 focus:ring-0 text-white placeholder:text-zinc-600 font-medium"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 p-1">
            <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-800 text-zinc-300 hover:text-white transition-colors font-bold text-sm">
              <SlidersHorizontal className="h-4 w-4" />
              筛选
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-zinc-600 font-bold">加载中...</div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-zinc-900/30 border border-dashed border-white/10 rounded-[3rem]">
            <p className="text-zinc-600 font-bold text-xl">没有匹配的活动</p>
          </div>
        ) : (
          filteredCampaigns.map((campaign) => (
            <Link 
              key={campaign.id} 
              href={`/campaigns/${campaign.id}`}
              className="group relative flex flex-col p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 hover:border-green-500/30 transition-all overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-green-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <span className="px-4 py-1 rounded-full bg-white/5 text-zinc-400 text-[10px] font-bold uppercase tracking-widest border border-white/5">
                    {campaign.platform}
                  </span>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase mb-1">预算</p>
                    <p className="text-xl font-black text-green-500">¥{campaign.budget.toLocaleString()}</p>
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-2 group-hover:text-green-500 transition-colors line-clamp-1">
                  {campaign.title}
                </h3>
                <p className="text-zinc-500 text-sm line-clamp-2 mb-6 flex-grow leading-relaxed">
                  {campaign.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-bold text-zinc-700 uppercase">品牌</p>
                    <p className="text-sm font-bold">{campaign.merchant.brandName}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <p className="text-[10px] font-bold text-zinc-700 uppercase">截止日期</p>
                      <p className="text-sm font-medium text-zinc-400">
                        {new Date(campaign.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </main>
    </div>
  );
}
