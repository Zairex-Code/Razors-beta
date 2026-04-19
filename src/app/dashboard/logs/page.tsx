'use client'

import { useState } from 'react'
import { ShieldAlert, Activity, LogIn, LogOut, AlertTriangle, CheckCircle, Clock, Filter } from 'lucide-react'

const mockLogs = [
  { id: 1, action: 'LOGIN', user: 'admin@zentech.com', role: 'ADMIN', ip: '192.168.1.100', timestamp: '2024-04-19 08:32:15', status: 'success' },
  { id: 2, action: 'LOGIN', user: 'boss@razors.com', role: 'BOSS', ip: '192.168.1.101', timestamp: '2024-04-19 08:45:22', status: 'success' },
  { id: 3, action: 'VOID_SALE', user: 'boss@razors.com', role: 'BOSS', ip: '192.168.1.101', timestamp: '2024-04-19 09:12:08', status: 'success', details: 'Sale INV-2024-892 voided' },
  { id: 4, action: 'CREATE_IMPORT', user: 'boss@razors.com', role: 'BOSS', ip: '192.168.1.101', timestamp: '2024-04-19 10:05:33', status: 'success', details: 'Import IMP-2024-004 created' },
  { id: 5, action: 'USER_STATUS_CHANGE', user: 'admin@zentech.com', role: 'ADMIN', ip: '192.168.1.100', timestamp: '2024-04-19 11:20:44', status: 'success', details: 'User carlos@razors.com deactivated' },
  { id: 6, action: 'LOGIN_FAILED', user: 'unknown@hacker.com', role: '-', ip: '45.33.12.89', timestamp: '2024-04-19 12:00:01', status: 'failed' },
  { id: 7, action: 'EXPORT_DATA', user: 'admin@zentech.com', role: 'ADMIN', ip: '192.168.1.100', timestamp: '2024-04-19 14:30:22', status: 'success', details: 'Sales report exported' },
  { id: 8, action: 'LOGOUT', user: 'boss@razors.com', role: 'BOSS', ip: '192.168.1.101', timestamp: '2024-04-19 18:00:00', status: 'success' },
]

const getActionIcon = (action: string) => {
  switch (action) {
    case 'LOGIN': return <LogIn className="w-4 h-4 text-green-400" />
    case 'LOGOUT': return <LogOut className="w-4 h-4 text-gray-400" />
    case 'VOID_SALE': return <Activity className="w-4 h-4 text-cyan-400" />
    case 'CREATE_IMPORT': return <Activity className="w-4 h-4 text-cyan-400" />
    case 'USER_STATUS_CHANGE': return <ShieldAlert className="w-4 h-4 text-purple-400" />
    case 'EXPORT_DATA': return <Activity className="w-4 h-4 text-cyan-400" />
    case 'LOGIN_FAILED': return <AlertTriangle className="w-4 h-4 text-red-400" />
    default: return <Clock className="w-4 h-4 text-gray-400" />
  }
}

const getActionBadgeStyle = (action: string) => {
  if (action.includes('FAILED')) return 'bg-red-500/10 text-red-400 border-red-500/30'
  switch (action) {
    case 'LOGIN': return 'bg-green-500/10 text-green-400 border-green-500/30'
    case 'LOGOUT': return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    default: return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
  }
}

export default function LogsPage() {
  const [filter, setFilter] = useState('ALL')

  const filteredLogs = filter === 'ALL'
    ? mockLogs
    : filter === 'FAILED'
    ? mockLogs.filter(log => log.status === 'failed')
    : mockLogs.filter(log => log.action.includes(filter))

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
          <ShieldAlert className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide">
            Security <span className="text-purple-500">Logs</span>
          </h1>
          <p className="text-gray-500 mt-1">Audit trail & access monitoring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-purple-500/20 bg-background/50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Successful</p>
              <p className="text-xl font-bold text-white">{mockLogs.filter(l => l.status === 'success').length}</p>
            </div>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-purple-500/20 bg-background/50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Failed</p>
              <p className="text-xl font-bold text-white">{mockLogs.filter(l => l.status === 'failed').length}</p>
            </div>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-purple-500/20 bg-background/50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <LogIn className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Logins</p>
              <p className="text-xl font-bold text-white">{mockLogs.filter(l => l.action === 'LOGIN' || l.action === 'LOGIN_FAILED').length}</p>
            </div>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-purple-500/20 bg-background/50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Admin Actions</p>
              <p className="text-xl font-bold text-white">{mockLogs.filter(l => l.role === 'ADMIN').length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-background/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.05)]">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Recent Activity</h3>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="glass-input rounded-lg py-2 px-3 text-sm bg-[#0a0a0a] text-white appearance-none"
            >
              <option value="ALL">All Events</option>
              <option value="LOGIN">Logins</option>
              <option value="FAILED">Failed Attempts</option>
              <option value="USER">User Changes</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/80 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-widest">
              <tr>
                <th className="p-4 font-medium">Event</th>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">IP Address</th>
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="text-gray-300 text-sm">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-800/50 hover:bg-purple-900/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {getActionIcon(log.action)}
                      <span className={`text-xs font-bold tracking-wider px-2 py-1 rounded-full border ${getActionBadgeStyle(log.action)}`}>
                        {log.action.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-white">{log.user}</span>
                      <span className={`text-[10px] font-bold uppercase ${
                        log.role === 'ADMIN' ? 'text-purple-400' :
                        log.role === 'BOSS' ? 'text-cyan-400' : 'text-gray-500'
                      }`}>{log.role}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs text-gray-500">{log.ip}</td>
                  <td className="p-4 text-xs text-gray-400">{log.timestamp}</td>
                  <td className="p-4 text-xs text-gray-400 max-w-xs truncate">{log.details || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
