import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const settingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  company: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    failedJobs: true,
    workerOffline: true,
    highLatency: false,
    dailyDigest: true,
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Acme Inc.',
    },
  });

  const onSubmit = () => {
    toast({
      title: 'Settings saved',
      description: 'Your profile has been updated successfully.',
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Globe },
  ];

  return (
    <div className="page-container">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <motion.div variants={item} className="page-header">
          <h1 className="page-title">Settings</h1>
          <p className="page-description">Manage your account and preferences</p>
        </motion.div>

        <motion.div variants={item} className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                    activeTab === tab.id
                      ? 'bg-teal/10 text-teal border-l-2 border-teal'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1">
            {activeTab === 'profile' && (
              <motion.div
                variants={item}
                className="glass-card p-6 rounded-2xl"
              >
                <h2 className="text-lg font-semibold text-white mb-6">Profile Settings</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="input-field" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" className="input-field" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Company</FormLabel>
                          <FormControl>
                            <Input {...field} className="input-field" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="btn-primary">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div variants={item} className="space-y-6">
                <div className="glass-card p-6 rounded-2xl">
                  <h2 className="text-lg font-semibold text-white mb-6">
                    Email Notifications
                  </h2>
                  <div className="space-y-4">
                    {[
                      {
                        key: 'email',
                        label: 'Email notifications',
                        description: 'Receive notifications via email',
                      },
                      {
                        key: 'dailyDigest',
                        label: 'Daily digest',
                        description: 'Receive daily summary of activity',
                      },
                    ].map((setting) => (
                      <div
                        key={setting.key}
                        className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-white">{setting.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {setting.description}
                          </p>
                        </div>
                        <Switch
                          checked={notifications[setting.key as keyof typeof notifications]}
                          onCheckedChange={(checked) =>
                            setNotifications((prev) => ({ ...prev, [setting.key]: checked }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl">
                  <h2 className="text-lg font-semibold text-white mb-6">
                    Alert Notifications
                  </h2>
                  <div className="space-y-4">
                    {[
                      {
                        key: 'failedJobs',
                        label: 'Failed jobs',
                        description: 'Get notified when jobs fail',
                      },
                      {
                        key: 'workerOffline',
                        label: 'Worker offline',
                        description: 'Get notified when a worker goes offline',
                      },
                      {
                        key: 'highLatency',
                        label: 'High latency',
                        description: 'Get notified when latency exceeds threshold',
                      },
                    ].map((setting) => (
                      <div
                        key={setting.key}
                        className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-white">{setting.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {setting.description}
                          </p>
                        </div>
                        <Switch
                          checked={notifications[setting.key as keyof typeof notifications]}
                          onCheckedChange={(checked) =>
                            setNotifications((prev) => ({ ...prev, [setting.key]: checked }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div variants={item} className="space-y-6">
                <div className="glass-card p-6 rounded-2xl">
                  <h2 className="text-lg font-semibold text-white mb-6">
                    Change Password
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-white mb-2">Current Password</label>
                      <Input
                        type="password"
                        className="input-field"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white mb-2">New Password</label>
                      <Input
                        type="password"
                        className="input-field"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white mb-2">Confirm Password</label>
                      <Input
                        type="password"
                        className="input-field"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <Button className="btn-primary">Update Password</Button>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl">
                  <h2 className="text-lg font-semibold text-white mb-4">Sessions</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage your active sessions across devices.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-teal" />
                        <div>
                          <p className="text-sm font-medium text-white">Current session</p>
                          <p className="text-xs text-muted-foreground">Chrome on macOS</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">Active now</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div variants={item} className="glass-card p-6 rounded-2xl">
                <h2 className="text-lg font-semibold text-white mb-6">Appearance</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-white mb-3">Theme</label>
                    <div className="grid grid-cols-3 gap-4">
                      {['dark', 'light', 'system'].map((theme) => (
                        <button
                          key={theme}
                          className={cn(
                            'p-4 rounded-xl border transition-all',
                            theme === 'dark'
                              ? 'border-teal bg-teal/10'
                              : 'border-white/10 hover:border-white/20'
                          )}
                        >
                          <div
                            className={cn(
                              'w-full h-20 rounded-lg mb-2',
                              theme === 'dark' && 'bg-navy-900',
                              theme === 'light' && 'bg-white',
                              theme === 'system' && 'bg-gradient-to-r from-navy-900 to-white'
                            )}
                          />
                          <p className="text-sm font-medium text-white capitalize">{theme}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'integrations' && (
              <motion.div variants={item} className="glass-card p-6 rounded-2xl">
                <h2 className="text-lg font-semibold text-white mb-6">Integrations</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Slack', description: 'Get notifications in Slack', connected: true },
                    { name: 'PagerDuty', description: 'Incident management', connected: false },
                    { name: 'Datadog', description: 'Metrics and monitoring', connected: true },
                    { name: 'GitHub', description: 'Repository integration', connected: false },
                  ].map((integration) => (
                    <div
                      key={integration.name}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-white">{integration.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          integration.connected
                            ? 'border-teal text-teal'
                            : 'border-white/10 text-muted-foreground'
                        )}
                      >
                        {integration.connected ? 'Connected' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
