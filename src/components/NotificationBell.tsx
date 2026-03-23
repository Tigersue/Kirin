'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, BellRing, X, Check, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties | undefined>(undefined);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [userId]);

  const updatePanelPosition = useCallback(() => {
    const buttonEl = buttonRef.current;
    const panelEl = panelRef.current;
    if (!buttonEl || !panelEl) return;

    const margin = 12;
    const gap = 12;
    const rect = buttonEl.getBoundingClientRect();
    const panelWidth = panelEl.offsetWidth;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = rect.right - panelWidth;
    left = Math.max(margin, Math.min(left, viewportWidth - panelWidth - margin));

    let top = rect.bottom + gap;
    const panelHeight = panelEl.offsetHeight;
    if (top + panelHeight + margin > viewportHeight) {
      top = Math.max(margin, rect.top - gap - panelHeight);
    }

    setPanelStyle({ left, top, visibility: "visible" });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setPanelStyle({ visibility: "hidden" });
    const raf = requestAnimationFrame(updatePanelPosition);

    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [isOpen, updatePanelPosition]);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${id}`, {
        method: "PATCH",
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SUCCESS": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "WARNING": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "ALERT": return <X className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
      >
        {unreadCount > 0 ? (
          <>
            <BellRing className="h-6 w-6 text-green-500 animate-pulse" />
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-black">
              {unreadCount}
            </span>
          </>
        ) : (
          <Bell className="h-6 w-6" />
        )}
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          style={panelStyle}
          className="fixed w-80 md:w-96 bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-black tracking-tight text-lg">消息通知</h3>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[400px] overflow-auto">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-zinc-600 font-bold text-sm">
                暂无消息
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                  className={cn(
                    "p-6 border-b border-white/5 transition-all cursor-pointer hover:bg-white/5",
                    !notification.isRead ? "bg-green-500/5" : "opacity-60"
                  )}
                >
                  <div className="flex gap-4">
                    <div className="mt-1">{getTypeIcon(notification.type)}</div>
                    <div className="space-y-1 flex-1">
                      <p className={cn("text-sm font-bold", !notification.isRead ? "text-white" : "text-zinc-400")}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        {notification.content}
                      </p>
                      <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest pt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-zinc-800/50 text-center">
            <button className="text-xs font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">
              查看全部消息
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
