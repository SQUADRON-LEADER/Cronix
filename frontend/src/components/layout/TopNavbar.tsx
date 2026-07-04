import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Job Completed',
    message: 'Process payment batch #1234 finished successfully in 890ms',
    time: '2m ago',
    read: false,
    type: 'success',
  },
  {
    id: '2',
    title: 'Worker Alert',
    message: 'Worker node-4 went offline — orphan jobs recovered automatically',
    time: '18m ago',
    read: false,
    type: 'warning',
  },
  {
    id: '3',
    title: 'DLQ Item',
    message: 'Generate Daily Report moved to Dead Letter Queue after 3 retries',
    time: '1h ago',
    read: true,
    type: 'error',
  },
  {
    id: '4',
    title: 'Queue Resumed',
    message: 'email-bulk queue resumed — 123 pending jobs re-queued',
    time: '3h ago',
    read: true,
    type: 'info',
  },
];

const notifIcon = {
  success: <CheckCircle2 className="w-3.5 h-3.5 text-[#38B2AC]" />,
  warning: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
  error:   <XCircle      className="w-3.5 h-3.5 text-coral" />,
  info:    <Info         className="w-3.5 h-3.5 text-blue-500" />,
};

export function TopNavbar() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  const initials = user?.name
    ? user.name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)
    : 'CX';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className="h-16 sticky top-0 z-40 w-full flex-shrink-0 flex items-center select-none"
      style={{
        background: 'var(--cronix-bg-primary)',
        boxShadow: '0 4px 12px rgba(163, 177, 198, 0.3)',
      }}
    >
      <div className="h-full w-full px-6 flex items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
              style={{ color: searchFocused ? '#6C63FF' : '#6B7280' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search jobs, queues, workers…"
              className="input-field pl-11 pr-11 py-2 h-10"
            />
            <AnimatePresence>
              {searchFocused && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute top-full left-0 right-0 mt-2 p-2.5 z-50 rounded-2xl bg-cronix-bg-primary shadow-extruded text-xs"
                >
                  <p className="px-3 py-1 font-semibold text-cronix-secondary">
                    Press <kbd className="px-1.5 py-0.5 rounded shadow-inset-small bg-cronix-bg-primary text-cronix-text">/</kbd> to focus search
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="relative h-10 w-10 rounded-2xl flex items-center justify-center bg-cronix-bg-primary shadow-extruded-small hover:shadow-extruded transition-all duration-300 ease-out active:shadow-inset-small text-cronix-text"
              >
                <Bell className="w-4 h-4 text-cronix-secondary group-hover:text-cronix-text" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full flex items-center justify-center bg-[#6C63FF] shadow-[0_0_8px_rgba(108,99,255,0.6)]">
                    <span className="absolute inset-0 rounded-full animate-ping bg-[#6C63FF] opacity-60" />
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-1 bg-cronix-bg-primary shadow-extruded rounded-[24px]">
              <DropdownMenuLabel className="flex items-center justify-between py-3 px-4 text-cronix-text font-display">
                <span className="text-sm font-bold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold shadow-inset-small bg-cronix-bg-primary text-[#6C63FF]">
                    {unreadCount} new
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-cronix-muted/20" />
              <div className="max-h-72 overflow-y-auto">
                {mockNotifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer rounded-xl hover:bg-cronix-muted/10 transition-colors"
                    style={{ opacity: n.read ? 0.6 : 1 }}
                  >
                    <div className="mt-0.5 flex-shrink-0">{notifIcon[n.type]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-cronix-text">{n.title}</p>
                      <p className="text-xs mt-0.5 line-clamp-2 text-cronix-secondary font-medium">{n.message}</p>
                      <p className="text-[10px] mt-1 text-cronix-muted font-mono">{n.time}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator className="bg-cronix-muted/20" />
              <DropdownMenuItem className="justify-center py-3 cursor-pointer text-sm font-bold text-[#6C63FF] hover:text-[#8B84FF] rounded-xl">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2.5 px-3.5 h-10 rounded-2xl bg-cronix-bg-primary shadow-extruded-small hover:shadow-extruded transition-all duration-300 ease-out active:shadow-inset-small text-cronix-text"
              >
                <Avatar className="w-6 h-6 border-none shadow-inset">
                  <AvatarFallback className="text-[10px] font-extrabold bg-[#6C63FF]/15 text-[#6C63FF] font-display border-none">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-bold hidden sm:block text-cronix-text font-display">
                  {user?.name ?? 'Demo User'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-cronix-secondary" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1 bg-cronix-bg-primary shadow-extruded rounded-[24px]">
              <DropdownMenuLabel className="py-3 px-4 font-display">
                <p className="text-sm font-extrabold text-cronix-text">{user?.name ?? 'Demo User'}</p>
                <p className="text-xs text-cronix-secondary font-medium truncate mt-0.5">{user?.email ?? 'demo@cronix.dev'}</p>
                <span className="inline-block mt-2 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-inset-small text-[#6C63FF]">
                  {user?.role ?? 'admin'}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-cronix-muted/20" />
              <DropdownMenuItem className="cursor-pointer gap-2.5 py-2.5 px-4 text-sm font-semibold rounded-xl text-cronix-text hover:bg-cronix-muted/10">
                <User className="w-4 h-4 text-cronix-secondary" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2.5 py-2.5 px-4 text-sm font-semibold rounded-xl text-cronix-text hover:bg-cronix-muted/10">
                <Settings className="w-4 h-4 text-cronix-secondary" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-cronix-muted/20" />
              <DropdownMenuItem
                className="cursor-pointer gap-2.5 py-2.5 px-4 text-sm font-bold rounded-xl text-[#EF4444] hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
