'use client'

import { Settings, Database, Bell, Shield, Palette, Globe } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
          <Settings className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide">
            System <span className="text-purple-500">Settings</span>
          </h1>
          <p className="text-gray-500 mt-1">Configure your Razors CRM instance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 bg-background/50 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <Database className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Database</h3>
              <p className="text-xs text-gray-500">Supabase PostgreSQL</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-sm text-gray-400">Connection Status</span>
              <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">Connected</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-sm text-gray-400">Region</span>
              <span className="text-sm text-white">South America (São Paulo)</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-400">Last Backup</span>
              <span className="text-sm text-white">Today at 03:00 AM</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 bg-background/50 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <Bell className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Notifications</h3>
              <p className="text-xs text-gray-500">System alerts & updates</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Low Stock Alerts', enabled: true },
              { label: 'Import Status Changes', enabled: true },
              { label: 'New User Registrations', enabled: false },
              { label: 'Daily Sales Summary', enabled: true },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-sm text-gray-300">{item.label}</span>
                <button
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    item.enabled ? 'bg-primary' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      item.enabled ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 bg-background/50 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Security</h3>
              <p className="text-xs text-gray-500">Authentication & access control</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-sm text-gray-400">Two-Factor Auth</span>
              <span className="text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full">Recommended</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-sm text-gray-400">Session Timeout</span>
              <span className="text-sm text-white">24 hours</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-400">Password Policy</span>
              <span className="text-sm text-white">Strong (8+ chars)</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 bg-background/50 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <Palette className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Appearance</h3>
              <p className="text-xs text-gray-500">Visual customization</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Theme</span>
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">Dark Mode (Locked)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Accent Color</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary neon-glow" />
                <span className="text-sm text-white">Cyan #00f7ff</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Glassmorphism</span>
              <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">Enabled</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 bg-background/50 backdrop-blur-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-purple-500/10">
            <Globe className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">Business Information</h3>
            <p className="text-xs text-gray-500">Company details & localization</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Company Name</label>
            <input
              type="text"
              defaultValue="Razors Barber Supplies"
              className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-purple-500 focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Tax ID (RUC)</label>
            <input
              type="text"
              defaultValue="20601234567"
              className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-purple-500 focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Currency</label>
            <select className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-purple-500 focus:outline-none transition-all cursor-pointer appearance-none">
              <option>PEN (Sol Peruano)</option>
              <option>USD (US Dollar)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Timezone</label>
            <select className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 px-4 text-white focus:border-purple-500 focus:outline-none transition-all cursor-pointer appearance-none">
              <option>America/Lima (PET)</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button className="px-8 py-3 rounded-xl bg-purple-600 text-white font-bold text-sm tracking-tight hover:bg-purple-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
