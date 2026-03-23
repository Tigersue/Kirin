'use client';

import { LayoutDashboard, Briefcase, TrendingUp, Settings, LogOut, Bell, Globe } from "lucide-react";
import Link from "next/link";
import { NotificationBell } from "@/components/NotificationBell";
import { useTranslation } from "@/components/providers/LanguageProvider";
import { useSession, signOut } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const { t, language, setLanguage } = useTranslation();
  const userId = (session?.user as any)?.id;

  const menuItems = [
    { label: t('common.dashboard'), icon: LayoutDashboard, href: "/dashboard" },
    { label: t('common.campaigns'), icon: Briefcase, href: "/dashboard/campaigns/new" },
    { label: "数据大屏", icon: TrendingUp, href: "/dashboard/analytics" },
    { label: t('common.settings'), icon: Settings, href: "/dashboard/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-6 border-b border-white/5">
        <div className="h-10 w-10 rounded-xl bg-green-500 flex items-center justify-center text-black font-black text-xl">
          Q
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            className="p-2 rounded-xl bg-white/5 text-zinc-500 hover:text-white transition-all"
          >
            <Globe className="h-5 w-5" />
          </button>
          <NotificationBell userId={userId} />
        </div>
      </header>

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-white/5 flex-col items-start p-6 space-y-12">
        <div className="flex items-center justify-between w-full">
          <div className="h-12 w-12 rounded-2xl bg-green-500 flex items-center justify-center text-black font-black text-2xl">
            Q
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
              className="p-3 rounded-2xl bg-white/5 text-zinc-500 hover:text-white transition-all group"
              title={language === 'zh' ? 'Switch to English' : '切换至中文'}
            >
              <Globe className="h-5 w-5 group-hover:text-green-500 transition-colors" />
            </button>
            <NotificationBell userId={userId} />
          </div>
        </div>

        <nav className="flex-1 w-full space-y-4">
          {menuItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="flex items-center gap-4 p-4 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all group"
            >
              <item.icon className="h-6 w-6 group-hover:text-green-500 transition-colors" />
              <span className="font-bold">{item.label}</span>
            </Link>
          ))}
        </nav>

        <button 
          onClick={() => signOut()}
          className="flex items-center gap-4 p-4 rounded-2xl text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all w-full group"
        >
          <LogOut className="h-6 w-6" />
          <span className="font-bold">{t('common.logout')}</span>
        </button>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around p-4">
        {menuItems.map((item, i) => (
          <Link key={i} href={item.href} className="flex flex-col items-center gap-1 text-zinc-500 hover:text-green-500 transition-all">
            <item.icon className="h-6 w-6" />
            <span className="text-[10px] font-bold uppercase">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-24 md:pb-0">
        {children}
      </main>
    </div>
  );
}
