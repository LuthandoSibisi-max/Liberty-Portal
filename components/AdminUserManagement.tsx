
import React, { useState } from 'react';
import { MOCK_USERS } from '../constants';
import { UserAccount, UserRole } from '../types';

export const AdminUserManagement: React.FC = () => {
    const [users, setUsers] = useState<UserAccount[]>(MOCK_USERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [tenantFilter, setTenantFilter] = useState('all');

    const filteredUsers = users.filter(u => 
        (tenantFilter === 'all' || u.tenantId === tenantFilter) &&
        (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const toggleLock = (userId: string) => {
        setUsers(prev => prev.map(u => u.id === userId ? {
            ...u,
            status: u.status === 'active' ? 'locked' : 'active'
        } : u));
    };

    const handleInvite = () => {
        const email = prompt("Enter email address for new user:");
        if (email) {
            alert(`Invitation sent to ${email}. User will appear here once they register.`);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <i className="fas fa-users-cog text-blue-500"></i> User Management
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Multi-tenant identity control. Manage access across all organizations.</p>
                </div>
                <button 
                    onClick={handleInvite}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                >
                    <i className="fas fa-user-plus"></i> Invite User
                </button>
            </div>

            {/* Filters */}
            <div className="bg-[#0B1120] p-4 rounded-2xl border border-white/5 flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"></i>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search name or email..."
                        className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                </div>
                <select 
                    value={tenantFilter}
                    onChange={(e) => setTenantFilter(e.target.value)}
                    className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                    <option value="all">All Tenants</option>
                    <option value="mno-global">My Next Opportunity (Admin)</option>
                    <option value="cli-001">Liberty Group (Client)</option>
                    <option value="mno-hub">MNO Hub (Recruiter)</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-[#0B1120] rounded-[2.5rem] border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-black/40 text-xs font-bold uppercase tracking-widest text-slate-500">
                            <tr>
                                <th className="p-6">Identity</th>
                                <th className="p-6">Role & Tenant</th>
                                <th className="p-6">Status</th>
                                <th className="p-6">Last Active</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-xs border border-white/10 shadow-lg">
                                                {user.avatarInitials}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{user.name}</div>
                                                <div className="text-xs text-slate-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-slate-300">{user.tenantName}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full w-fit font-bold uppercase ${
                                                user.role === UserRole.PARTNER ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-800' :
                                                user.role === UserRole.LIBERTY ? 'bg-blue-900/30 text-blue-400 border border-blue-800' :
                                                'bg-emerald-900/30 text-emerald-400 border border-emerald-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`flex items-center gap-2 text-xs font-bold ${user.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                                            <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {user.status === 'active' ? 'Active' : 'Locked'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-slate-500 font-mono text-xs">{user.lastLogin}</td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => alert("Password reset link sent.")}
                                                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" 
                                                title="Reset Password"
                                            >
                                                <i className="fas fa-key"></i>
                                            </button>
                                            <button 
                                                onClick={() => toggleLock(user.id)}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    user.status === 'active' 
                                                        ? 'hover:bg-red-900/30 text-slate-400 hover:text-red-400' 
                                                        : 'hover:bg-green-900/30 text-red-400 hover:text-green-400'
                                                }`} 
                                                title={user.status === 'active' ? 'Lock Account' : 'Unlock Account'}
                                            >
                                                <i className={`fas ${user.status === 'active' ? 'fa-lock-open' : 'fa-lock'}`}></i>
                                            </button>
                                            <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title="Edit Profile">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
