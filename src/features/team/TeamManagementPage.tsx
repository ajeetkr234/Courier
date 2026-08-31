import React, { useState } from 'react';
import { Users, UserPlus, Shield, Mail, Phone, CheckCircle2, XCircle, Search } from 'lucide-react';
import { usePlatformStore } from '../../services/store';
import { UserRole } from '../../types';
import { toast } from 'sonner';

export const TeamManagementPage: React.FC = () => {
  const { userProfiles, addTeamMember, toggleTeamMemberStatus } = usePlatformStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('OPERATIONS');
  const [search, setSearch] = useState('');

  const filteredMembers = userProfiles.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Please enter name and email');
      return;
    }
    addTeamMember({
      name,
      email,
      phone,
      role,
    });
    toast.success(`Team member ${name} invited successfully!`);
    setName('');
    setEmail('');
    setPhone('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" /> Team & Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Invite team members and assign granular operational permissions (Owner, Admin, Operations, Warehouse, Finance, Support)
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <UserPlus className="h-4 w-4" /> Invite Team Member
        </button>
      </div>

      {/* Member Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold">{filteredMembers.length} Members</span>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((user) => (
          <div key={user.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-white flex items-center justify-center font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{user.name}</h4>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>

              <span
                className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full ${
                  user.role === 'OWNER'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : user.role === 'ADMIN'
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : user.role === 'FINANCE'
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {user.role}
              </span>
            </div>

            <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{user.phone || 'Phone not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-slate-400" />
                <span>Status: <strong className={user.is_active !== false ? 'text-emerald-600' : 'text-rose-600'}>{user.is_active !== false ? 'Active' : 'Disabled'}</strong></span>
              </div>
            </div>

            {user.role !== 'OWNER' && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    toggleTeamMemberStatus(user.id);
                    toast.info(`Updated status for ${user.name}`);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                    user.is_active !== false
                      ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {user.is_active !== false ? 'Disable Access' : 'Enable Access'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Invite New Team Member</h3>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Phone</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Role & Permissions</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ADMIN">ADMIN — Full Operational Access</option>
                  <option value="OPERATIONS">OPERATIONS — Orders, Shipping & NDR</option>
                  <option value="WAREHOUSE">WAREHOUSE — Label Printing & Pickups</option>
                  <option value="FINANCE">FINANCE — Wallet, COD & Billing</option>
                  <option value="SUPPORT">SUPPORT — Order Lookup & Tracking</option>
                  <option value="VIEWER">VIEWER — Read-only Analytics</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-indigo-600/30"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
