import { Star, TrendingUp, UserCheck, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfluencerCardProps {
  name: string;
  avatar: string;
  tags: string[];
  followers: string;
  rating: number;
  platforms: string[];
  description: string;
}

export function InfluencerCard({
  name,
  avatar,
  tags,
  followers,
  rating,
  platforms,
  description,
}: InfluencerCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] bg-zinc-900/50 border border-white/5 p-6 md:p-8 transition-all hover:bg-zinc-800/80 hover:border-green-500/30">
      {/* Background Glow Effect */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-green-500/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-0" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="relative">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl overflow-hidden ring-2 ring-white/10 group-hover:ring-green-500/50 transition-all">
              <img src={avatar} alt={name} className="h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-green-500 border-2 border-zinc-900 flex items-center justify-center">
              <UserCheck className="h-3 w-3 text-white" />
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-bold text-sm md:text-base">{rating}</span>
            </div>
            <span className="text-zinc-500 text-xs md:text-sm">{followers} 粉丝</span>
          </div>
        </div>

        <h3 className="text-lg md:text-xl font-bold text-white mb-2">{name}</h3>
        <p className="text-zinc-400 text-xs md:text-sm line-clamp-2 mb-4 leading-relaxed">
          {description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider bg-white/5 text-zinc-300 border border-white/5"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex gap-2">
            {platforms.map((p) => (
              <span key={p} className="text-[10px] md:text-xs font-medium text-zinc-500">{p}</span>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-xl bg-green-500 text-black font-black text-xs md:text-sm hover:bg-green-400 transition-all active:scale-95">
            <MessageSquare className="h-3.5 w-3.5 md:h-4 md:w-4" />
            邀约
          </button>
        </div>
      </div>
    </div>
  );
}
