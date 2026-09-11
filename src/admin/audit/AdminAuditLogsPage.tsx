import React, { useState } from 'react';
import { ShieldCheck, Search, Filter, Clock, User, HardDrive } from 'lucide-react';
import { usePlatformStore } from '../../services/store';

export const AdminAuditLogsPage: React.FC = () => {
  const { auditLogs, loadSupabaseData, isLoadingData } = usePlatformStore();
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    loadSupabaseData();
  }, []);

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-indigo-400" /> Platform Security &amp; Audit Trail Logs
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log trail capturing user logins, rate changes, bank updates, wallet adjustments, and seller KYC actions
          </p>
        </div>
        <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
          ● Cryptographically Signed Audit Active
        </span>
      </div>

      {/* Search */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by action, user, entity ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold">{filteredLogs.length} Events Recorded</span>
      </div>

      {/* Audit Logs Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">User &amp; Role</th>
                <th className="p-3.5">Action Code</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">Old Value → New Value</th>
                <th className="p-3.5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No platform audit events logged yet. System operations will be captured here in real-time.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-white block">{log.user_name}</span>
                    <span className="text-[10px] text-indigo-400 font-semibold uppercase">{log.role}</span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-emerald-400">{log.action}</td>
                  <td className="p-3.5 font-mono text-slate-300">
                    <span className="font-semibold text-slate-200">{log.entity_type}</span>
                    <span className="block text-[10px] text-slate-400">{log.entity_id}</span>
                  </td>
                  <td className="p-3.5 font-mono text-xs">
                    {log.old_value || log.new_value ? (
                      <span>
                        <span className="text-rose-400">{log.old_value || 'NONE'}</span> →{' '}
                        <span className="text-emerald-400">{log.new_value || 'UPDATED'}</span>
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">{log.ip_address}</td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
