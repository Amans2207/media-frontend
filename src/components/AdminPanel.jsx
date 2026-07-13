import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function AdminPanel({ onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pro: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('1 Month');
  
  // Advanced Features State
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const res = await axios.get('https://media-backend-production-b846.up.railway.app/api/admin/users', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      
      setUsers(res.data.users || []);
      setStats({ total: res.data.total_users || 0, pro: res.data.pro_users || 0 });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleGrantPro = async () => {
    if (!selectedUser) return;
    try {
      toast.loading('Granting PRO...', { id: 'grant' });
      const { data: { session } } = await supabase.auth.getSession();
      
      await axios.post('https://media-backend-production-b846.up.railway.app/api/admin/grant_pro', 
        { user_id: selectedUser.id, plan: selectedPlan },
        { headers: { Authorization: `Bearer ${session.access_token}` }}
      );
      
      toast.success(`PRO (${selectedPlan}) granted to ${selectedUser.email}`, { id: 'grant' });
      setModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to grant PRO', { id: 'grant' });
    }
  };

  const handleRevokePro = async (user) => {
    if (!window.confirm(`Are you sure you want to revoke PRO from ${user.email}?`)) return;
    
    try {
      toast.loading('Revoking PRO...', { id: 'revoke' });
      const { data: { session } } = await supabase.auth.getSession();
      
      await axios.post('https://media-backend-production-b846.up.railway.app/api/admin/revoke_pro', 
        { user_id: user.id },
        { headers: { Authorization: `Bearer ${session.access_token}` }}
      );
      
      toast.success(`PRO revoked for ${user.email}`, { id: 'revoke' });
      fetchUsers();
    } catch (error) {
      toast.error('Failed to revoke PRO', { id: 'revoke' });
    }
  };

  const handleToggleBan = async (user) => {
    const action = user.is_banned ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${action} ${user.email}?`)) return;
    
    try {
      toast.loading(`Processing...`, { id: 'ban' });
      const { data: { session } } = await supabase.auth.getSession();
      
      await axios.post(`https://media-backend-production-b846.up.railway.app/api/admin/user/${user.id}/ban`, 
        { ban_status: !user.is_banned },
        { headers: { Authorization: `Bearer ${session.access_token}` }}
      );
      
      toast.success(`User ${action}ned successfully!`, { id: 'ban' });
      fetchUsers();
    } catch (error) {
      toast.error(`Failed to ${action} user`, { id: 'ban' });
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmPrompt = window.prompt(`DANGER: Type "DELETE" to permanently remove ${user.email} from the database.`);
    if (confirmPrompt !== "DELETE") {
      toast.error('Deletion cancelled.');
      return;
    }
    
    try {
      toast.loading(`Deleting account...`, { id: 'del' });
      const { data: { session } } = await supabase.auth.getSession();
      
      await axios.delete(`https://media-backend-production-b846.up.railway.app/api/admin/user/${user.id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      
      toast.success(`Account deleted permanently!`, { id: 'del' });
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete account', { id: 'del' });
    }
  };

  const handleExportCSV = () => {
    if (users.length === 0) return;
    const headers = ['ID', 'Email', 'Joined', 'Last Login', 'PRO Status', 'Plan', 'Banned'];
    const rows = users.map(u => [
      u.id, 
      u.email, 
      u.created_at ? new Date(u.created_at).toISOString() : '', 
      u.last_sign_in_at ? new Date(u.last_sign_in_at).toISOString() : '', 
      u.is_pro ? 'YES' : 'NO', 
      u.plan || 'None', 
      u.is_banned ? 'YES' : 'NO'
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Exported successfully!');
  };

  // Filter & Search Logic
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (filter === 'PRO') return u.is_pro;
    if (filter === 'Free') return !u.is_pro;
    if (filter === 'Banned') return u.is_banned;
    return true; // All
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-white/10 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Advanced Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Manage users, track activity, and control PRO access</p>
          </div>
          <button 
            onClick={onBack}
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all flex items-center gap-2 font-medium"
          >
            ← Back to App
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-gray-400 text-sm font-medium">Total Users</h3>
            <p className="text-4xl font-bold mt-2">{stats.total}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-yellow-500/20 to-transparent pointer-events-none" />
            <h3 className="text-gray-400 text-sm font-medium">Active PRO Members</h3>
            <p className="text-4xl font-bold mt-2 text-yellow-400">{stats.pro}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
             <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-red-500/20 to-transparent pointer-events-none" />
            <h3 className="text-gray-400 text-sm font-medium">Banned Accounts</h3>
            <p className="text-4xl font-bold mt-2 text-red-400">{users.filter(u => u.is_banned).length}</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
           <div className="flex items-center gap-4 w-full md:w-auto">
             <input 
               type="text" 
               placeholder="Search email..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm w-full md:w-64 outline-none focus:border-purple-500/50 transition-colors"
             />
             <select 
               value={filter}
               onChange={(e) => setFilter(e.target.value)}
               className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500/50 appearance-none min-w-[120px]"
             >
               <option value="All" className="bg-[#111]">All Users</option>
               <option value="PRO" className="bg-[#111]">PRO Only</option>
               <option value="Free" className="bg-[#111]">Free Only</option>
               <option value="Banned" className="bg-[#111]">Banned Only</option>
             </select>
           </div>
           
           <button 
             onClick={handleExportCSV}
             className="px-5 py-2.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 rounded-xl transition-all text-sm font-medium flex items-center gap-2 w-full md:w-auto justify-center"
           >
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
             </svg>
             Export CSV
           </button>
        </div>

        {/* Users Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold">User Directory</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">Email</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">Plan</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">Joined</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">Last Login</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">Loading users...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={user.is_banned ? "text-gray-500 line-through" : ""}>{user.email}</span>
                          {user.is_banned && <span className="bg-red-500/20 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-500/30">BANNED</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.is_pro ? (
                          <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold border border-yellow-500/30">PRO</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium border border-gray-500/30">Free</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">{user.plan}</td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* PRO Management */}
                          {user.is_pro ? (
                            <button 
                              onClick={() => handleRevokePro(user)}
                              className="px-3 py-1.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded-lg text-xs font-medium transition-colors border border-yellow-500/20"
                              title="Revoke PRO"
                            >
                              - PRO
                            </button>
                          ) : (
                            <button 
                              onClick={() => { setSelectedUser(user); setModalOpen(true); }}
                              className="px-3 py-1.5 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded-lg text-xs font-medium transition-colors border border-purple-500/30"
                              title="Grant PRO"
                            >
                              + PRO
                            </button>
                          )}
                          
                          {/* Ban Management */}
                          <button 
                            onClick={() => handleToggleBan(user)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                              user.is_banned 
                                ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20' 
                                : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border-orange-500/20'
                            }`}
                          >
                            {user.is_banned ? 'Unban' : 'Ban'}
                          </button>
                          
                          {/* Delete Management */}
                          <button 
                            onClick={() => handleDeleteUser(user)}
                            className="px-2.5 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-xs transition-colors border border-red-500/20"
                            title="Delete Account"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grant PRO Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold">Grant PRO Access</h2>
              <p className="text-gray-400 text-sm mt-1">User: {selectedUser?.email}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <label className="block">
                <span className="text-gray-400 text-sm font-medium mb-2 block">Select Plan Duration</span>
                <select 
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/50"
                >
                  <option value="1 Month" className="bg-[#111]">1 Month</option>
                  <option value="1 Year" className="bg-[#111]">1 Year</option>
                  <option value="Lifetime" className="bg-[#111]">Lifetime</option>
                </select>
              </label>
            </div>
            
            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <button 
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleGrantPro}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white rounded-xl font-medium shadow-lg transition-all"
              >
                Confirm Grant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
