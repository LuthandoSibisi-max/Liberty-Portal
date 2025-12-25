
import React, { useState } from 'react';
import { UserAccount, UserRole } from '../types';

interface AdminUserManagementProps {
    users: UserAccount[];
    setUsers: (users: UserAccount[]) => void;
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ users, setUsers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [tenantFilter, setTenantFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // New User State
    const [newUser, setNewUser] = useState<Partial<UserAccount>>({
        name: '',
        email: '',
        password: '',
        role: UserRole.RECRUITER,
        tenantName: '',
        status: 'active'
    });

    const filteredUsers = users.filter(u => 
        (tenantFilter === 'all' || u.tenantId === tenantFilter) &&
        (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const toggleLock = (userId: string) => {
        setUsers(users.map(u => u.id === userId ? {
            ...u,
            status: u.status === 'active' ? 'locked' : 'active'
        } : u));
    };

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        const id = `u-${Date.now()}`;
        const initials = newUser.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '??';
        
        const account: UserAccount = {
            id,
            name: newUser.name!,
            email: newUser.email!,
            password: newUser.password!,
            role: newUser.role!,
            tenantId: newUser.role === UserRole.PARTNER ? 'mno-global' : (newUser.role === UserRole.LIBERTY ? 'cli-001' : 'mno-hub'),
            tenantName: newUser.tenantName || (newUser.role === UserRole.PARTNER ? 'My Next Opportunity' : 'Client Organization'),
            status: 'active',
            lastLogin: 'Never',
            avatarInitials: initials
        };

        setUsers([...users, account]);
        setShowCreateModal(false);
        setNewUser({ name: '', email: '', password: '', role: UserRole.RECRUITER, tenantName: '', status: 'active' });
    };

    const deleteUser = (id: string) => {
        if (confirm("Permanently delete this user account?")) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <i className="fas fa-users-cog text-blue-500"></i> Identity Governance
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Manage credentials and permissions across the ecosystem.</p>
                </div>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                >
                    <i className="fas fa-user-plus"></i> Create Account
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
                        placeholder="Filter by name or email..."
                        className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                </div>
                <select 
                    value={tenantFilter}
                    onChange={(e) => setTenantFilter(e.target.value)}
                    className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                    <option value="all">All Tenants</option>
                    <option value="mno-global">MNO Admin</option>
                    <option value="cli-001">Clients</option>
                    <option value="mno-hub">Recruiter Hub</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-[#0B1120] rounded-[2.5rem] border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-black/40 text-xs font-bold uppercase tracking-widest text-slate-500">
                            <tr>
                                <th className="p-6">Identity & Password</th>
                                <th className="p-6">Role & Tenant</th>
                                <th className="p-6">Status</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-xs border border-white/10 shadow-lg shrink-0">
                                                {user.avatarInitials}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-white truncate">{user.name}</div>
                                                <div className="text-[10px] font-mono text-slate-500 mt-0.5">{user.email}</div>
                                                <div className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded w-fit mt-1 text-slate-400">PWD: {user.password}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-slate-300 text-xs">{user.tenantName}</span>
                                            <span className={`text-[9px] px-2 py-0.5 rounded-full w-fit font-black uppercase ${
                                                user.role === UserRole.PARTNER ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-800' :
                                                user.role === UserRole.LIBERTY ? 'bg-blue-900/30 text-blue-400 border border-blue-800' :
                                                'bg-emerald-900/30 text-emerald-400 border border-emerald-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`flex items-center gap-2 text-[10px] font-black uppercase ${user.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => toggleLock(user.id)}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                                    user.status === 'active' 
                                                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white' 
                                                        : 'bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white'
                                                }`} 
                                                title={user.status === 'active' ? 'Lock Account' : 'Unlock Account'}
                                            >
                                                <i className={`fas ${user.status === 'active' ? 'fa-user-lock' : 'fa-user-check'}`}></i>
                                            </button>
                                            <button 
                                                onClick={() => deleteUser(user.id)}
                                                className="w-8 h-8 bg-white/5 text-slate-400 hover:bg-red-600 hover:text-white rounded-lg flex items-center justify-center transition-all"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#0B1120] border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden flex flex-col shadow-2xl animate-fade-in-up">
                        <div className="p-8 border-b border-white/5 bg-gradient-to-r from-blue-600/10 to-transparent">
                            <h3 className="text-2xl font-serif font-bold text-white">Create Account</h3>
                            <p className="text-sm text-slate-400 mt-1">Issue new credentials to the system.</p>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-8 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                                <input 
                                    required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                                <input 
                                    type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Initial Password</label>
                                <input 
                                    required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Role</label>
                                    <select 
                                        value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none appearance-none"
                                    >
                                        <option value={UserRole.RECRUITER}>MNO Recruiter</option>
                                        <option value={UserRole.LIBERTY}>Client Portal</option>
                                        <option value={UserRole.PARTNER}>System Admin</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tenant Name</label>
                                    <input 
                                        value={newUser.tenantName} onChange={e => setNewUser({...newUser, tenantName: e.target.value})}
                                        placeholder="e.g. FNB, MNO Hub"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-6 flex gap-3">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 text-slate-400 font-bold text-sm hover:text-white transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-900/20">Finalize Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
