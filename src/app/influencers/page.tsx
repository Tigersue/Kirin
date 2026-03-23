'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { InfluencerCard } from "@/components/InfluencerCard";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";

interface Influencer {
  id: string;
  user: {
    name: string;
    email: string;
  };
  bio: string | null;
  tags: string | null; // JSON string
  platforms: string | null; // JSON string
  followerCount: number;
  rating: number;
}

export default function InfluencerDiscoveryPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/influencers")
      .then(res => res.json())
      .then(data => {
        setInfluencers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredInfluencers = influencers.filter(inf => {
    const name = inf.user.name?.toLowerCase() || "";
    const bio = inf.bio?.toLowerCase() || "";
    let tagsStr = "";
    if (inf.tags) {
      try {
        const parsedTags = JSON.parse(inf.tags);
        tagsStr = Array.isArray(parsedTags) ? parsedTags.join(" ").toLowerCase() : "";
      } catch (e) {
        console.error("Failed to parse tags for influencer:", inf.id, e);
      }
    }
    const query = searchQuery.toLowerCase();
    
    return name.includes(query) || bio.includes(query) || tagsStr.includes(query);
  });

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header Section */}
      <header className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-500 font-bold uppercase tracking-widest text-sm">
            <Sparkles className="h-4 w-4" />
            发现最匹配的“超能力”达人
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter max-w-2xl leading-[0.9]">
            赋能您的 <span className="text-zinc-600">品牌</span> 爆发式增长
          </h1>
        </div>
        
        <div className="flex flex-col gap-4">
          <p className="text-zinc-500 max-w-xs text-sm leading-relaxed">
            我们通过 AI 驱动的数据分析，为您连接全球最具影响力的创作者。
          </p>
        </div>
      </header>

      {/* Filter & Search Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row gap-4 p-2 rounded-[2rem] bg-zinc-900/80 border border-white/5 backdrop-blur-xl">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input
              type="text"
              placeholder="搜索领域、风格或达人名称..."
              className="w-full bg-transparent border-none py-4 pl-14 pr-6 focus:ring-0 text-white placeholder:text-zinc-600 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 p-1">
            <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-800 text-zinc-300 hover:text-white transition-colors font-bold text-sm">
              <SlidersHorizontal className="h-4 w-4" />
              高级筛选
            </button>
            <button className="px-8 py-3 rounded-2xl bg-white text-black font-black text-sm hover:bg-zinc-200 transition-colors">
              智能匹配
            </button>
          </div>
        </div>
      </div>

      {/* Influencer Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-zinc-600 font-bold">加载中...</div>
        ) : filteredInfluencers.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-zinc-900/30 border border-dashed border-white/10 rounded-[3rem]">
            <p className="text-zinc-600 font-bold text-xl">没有匹配的达人</p>
          </div>
        ) : (
          filteredInfluencers.map((inf) => (
            <Link key={inf.id} href={`/influencers/${inf.id}`}>
              <InfluencerCard 
                name={inf.user.name || "未命名达人"}
                avatar={`https://ui-avatars.com/api/?name=${inf.user.name || 'U'}&background=random`}
                tags={JSON.parse(inf.tags || "[]")}
                followers={`${(inf.followerCount / 10000).toFixed(1)}W`}
                rating={inf.rating}
                platforms={JSON.parse(inf.platforms || "[]")}
                description={inf.bio || "暂无简介"}
              />
            </Link>
          ))
        )}
      </main>

      {/* Footer / Load More */}
      <div className="max-w-7xl mx-auto mt-20 text-center">
        <button className="px-12 py-4 rounded-full border border-white/10 text-zinc-500 font-bold hover:text-white hover:border-white/20 transition-all">
          加载更多达人
        </button>
      </div>
    </div>
  );
}
