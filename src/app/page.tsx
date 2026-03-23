import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp, Users, ShieldCheck, Zap, Globe, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-500 selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-green-500 flex items-center justify-center text-black font-black text-xl">Q</div>
            <span className="text-xl font-black tracking-tighter">QILIN</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/influencers" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">达人广场</Link>
            <Link href="/campaigns" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">任务大厅</Link>
            <Link href="#" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">定价</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">登录</Link>
            <Link 
              href="/register" 
              className="px-6 py-3 rounded-full bg-white text-black font-black text-sm hover:bg-zinc-200 transition-all active:scale-95"
            >
              免费加入
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-green-500/10 blur-[120px] rounded-full -z-10 opacity-50" />
        
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-green-500 font-bold text-xs uppercase tracking-widest animate-fade-in">
            <Sparkles className="h-4 w-4" />
            新一代达人营销撮合平台
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] animate-slide-up">
            让流量转化为 <br />
            <span className="text-zinc-700">真实的</span> <span className="text-green-500">增长</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-zinc-500 text-lg md:text-xl font-medium leading-relaxed">
            Qilin 连接全球最具影响力的内容创作者与前瞻品牌。通过 AI 驱动的精准匹配与全链路数据追踪，重塑您的营销 ROI。
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8">
            <Link 
              href="/register" 
              className="group flex items-center gap-3 px-10 py-6 rounded-[2rem] bg-green-500 text-black font-black text-xl hover:bg-green-400 hover:scale-105 transition-all shadow-[0_0_50px_-12px_rgba(34,197,94,0.5)]"
            >
              立即开启品牌增长
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/influencers" 
              className="px-10 py-6 rounded-[2rem] border border-white/10 text-white font-black text-xl hover:bg-white/5 transition-all"
            >
              浏览入驻达人
            </Link>
          </div>

          {/* Social Proof / Stats */}
          <div className="pt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/5">
            {[
              { label: "活跃达人", value: "50,000+" },
              { label: "合作品牌", value: "1,200+" },
              { label: "年交易额", value: "¥2.5B+" },
              { label: "平均 ROI", value: "4.2x" },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-6 space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">全链路 <span className="text-zinc-700">营销超能力</span></h2>
            <p className="text-zinc-500 max-w-xl mx-auto font-medium">从挑选到达人，从发布到结案，每一个环节都为您精心设计。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "智能匹配引擎",
                desc: "基于粉丝画像与产品属性的 AI 深度匹配，找到最懂您产品的那个灵魂。",
                icon: Zap,
                color: "text-blue-400"
              },
              {
                title: "全透明履约链",
                desc: "从接单到提交作品，全程节点记录，资金托管保障，拒绝任何猫腻。",
                icon: ShieldCheck,
                color: "text-green-400"
              },
              {
                title: "实时 ROI 追踪",
                desc: "秒级更新的数据大屏，实时监控转化效果，让每一分预算都有迹可循。",
                icon: TrendingUp,
                color: "text-purple-400"
              },
            ].map((feature, i) => (
              <div key={i} className="group p-10 rounded-[3rem] bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-all hover:-translate-y-2">
                <div className={cn("mb-8 p-4 w-fit rounded-2xl bg-white/5", feature.color)}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-green-500 -z-10" />
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-black leading-none">
            准备好体验 <br />
            高效营销的未来了吗？
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link 
              href="/register" 
              className="w-full md:w-auto px-12 py-6 rounded-[2rem] bg-black text-white font-black text-xl hover:scale-105 transition-all shadow-2xl"
            >
              免费入驻
            </Link>
            <Link 
              href="#" 
              className="w-full md:w-auto px-12 py-6 rounded-[2rem] border-2 border-black/10 text-black font-black text-xl hover:bg-black/5 transition-all"
            >
              咨询顾问
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50 grayscale">
            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-black font-black text-lg">Q</div>
            <span className="font-black tracking-tighter">QILIN</span>
          </div>
          <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">
            © 2024 QILIN TECHNOLOGY. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-xs font-bold text-zinc-600 hover:text-white transition-colors uppercase tracking-widest">隐私政策</Link>
            <Link href="#" className="text-xs font-bold text-zinc-600 hover:text-white transition-colors uppercase tracking-widest">服务协议</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
