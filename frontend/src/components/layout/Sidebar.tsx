import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  Layers,
  ListTodo,
  Server,
  Clock,
  RefreshCw,
  AlertOctagon,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Workflow,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',        path: '/' },
  { icon: FolderKanban,    label: 'Projects',          path: '/projects' },
  { icon: Layers,          label: 'Queues',            path: '/queues' },
  { icon: ListTodo,        label: 'Jobs',              path: '/jobs' },
  { icon: Server,          label: 'Workers',           path: '/workers' },
  { icon: Clock,           label: 'Scheduled Jobs',    path: '/scheduled' },
  { icon: RefreshCw,       label: 'Retry Queue',       path: '/retry-queue' },
  { icon: AlertOctagon,    label: 'Dead Letter Queue', path: '/dlq' },
  { icon: FileText,        label: 'Execution Logs',    path: '/logs' },
  { icon: BarChart3,       label: 'Metrics',           path: '/metrics' },
];

const bottomNavItems = [
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      initial={{ width: 256 }}
      animate={{ width: collapsed ? 76 : 256 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="h-screen sticky top-0 flex flex-col overflow-hidden select-none"
      style={{
        background: 'var(--cronix-bg-primary)',
        boxShadow: '4px 0 16px rgba(163, 177, 198, 0.4)',
        minWidth: collapsed ? 76 : 256,
        zIndex: 50,
      }}
    >
      {/* Logo Header */}
      <div className="flex items-center h-16 px-5 flex-shrink-0"
           style={{ borderBottom: '1px solid rgba(163, 177, 198, 0.3)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-cronix-bg-primary shadow-extruded-small text-[#6C63FF]"
          >
            <Workflow className="w-5 h-5 fill-[#6C63FF]/10 animate-pulse" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
              >
                <span className="text-base font-extrabold text-cronix-text tracking-tight font-display">Cronix</span>
                <p className="text-[10px] font-bold leading-none uppercase tracking-wider text-cronix-secondary mt-0.5">
                  Scheduler
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav Link List */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-none">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={cn(
                'nav-item group font-display',
                isActive && 'active'
              )}
            >
              <item.icon
                className="w-4 h-4 flex-shrink-0 transition-colors duration-300"
                style={{ color: isActive ? '#6C63FF' : '#6B7280' }}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-semibold tracking-tight transition-colors duration-300"
                    style={{ color: isActive ? '#6C63FF' : '#6B7280' }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Nav Items */}
      <div className="px-3 pb-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(163, 177, 198, 0.3)' }}>
        <div className="pt-3">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={cn('nav-item group font-display', isActive && 'active')}
              >
                <item.icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: isActive ? '#6C63FF' : '#6B7280' }}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-semibold tracking-tight"
                      style={{ color: isActive ? '#6C63FF' : '#6B7280' }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full mt-3 flex items-center justify-center rounded-xl transition-all duration-300 ease-out bg-cronix-bg-primary text-cronix-secondary shadow-extruded-small hover:shadow-extruded hover:text-cronix-text active:shadow-inset-small"
          style={{ height: 38 }}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-1.5" />
              <span className="text-xs font-bold uppercase tracking-wider font-display">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
