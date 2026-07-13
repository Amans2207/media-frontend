import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function AdminPanel({ onBack }) {
  const [activeTab, setActiveTab] = useState('users'); // users, activity, settings
  
  // User Data
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [stats, setStats] = useState({ total: 0, pro: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('1 Month');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');

  // Activity Data
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Settings Data
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Fetching Functions
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await axios.get('https://media-backend-production-b846.up.railway.app/api/admin/users', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setUsers(res.data.users || []);
      setStats({ total: res.data.total_users || 0, pro: res.data.pro_users || 0 });
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchActivity = async () => {
    try {
      setLoadingActivity(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await axios.get('https://media-backend-production-b846.up.railway.app/api/admin/activity', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setActivityLogs(res.data.logs || []);
    } catch (error) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoadingActivity(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await axios.get('https://media-backend-production-b846.up.railway.app/api/admin/maintenance', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setMaintenanceMode(res.data.maintenance_mode);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchActivity();
    fetchSettings();
  }, []);

  const handleToggleMaintenance = async () => {
    try {
      toast.loading('Toggling Maintenance Mode...', { id: 'maint' });
      const { data: { session } } = await supabase.auth.getSession();
      const res = await axios.post('https://media-backend-production-b846.up.railway.app/api/admin/maintenance', 
        {},
        { headers: { Authorization: `Bearer ${session.access_token}` }}
      );
      setMaintenanceMode(res.data.maintenance_mode);
      toast.success(res.data.message, { id: 'maint' });
    } catch (error) {
      toast.error('Failed to toggle maintenance mode', { id: 'maint' });
    }
  };

  const handleGrantPro = async () => {
    if (!selectedUser) return;
    try {
      toast.loading('Granting PRO...', { id: 'grant' });
      const { data: { session } } = await supabase.auth.getSession();
      await axios.post('https://media-backend-production-b846.up.railway.app/api/admin/grant_pro', 
        { user_id: selectedUser.id, plan: selectedPlan },
        { headers: { Authorization: `Bearer ${session.access_token}` }}
      );
      toast.success(`PRO (${selectedPlan}) granted!`, { id: 'grant' });
      setModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to grant PRO', { id: 'grant' });
    }
  };

  const handleRevokePro = async (user) => {
    if (!window.confirm(`Revoke PRO from ${user.email}?`)) return;
    try {
      toast.loading('Revoking PRO...', { id: 'revoke' });
      const { data: { session } } = await supabase.auth.getSession();
      await axios.post('https://media-backend-production-b846.up.railway.app/api/admin/revoke_pro', 
        { user_id: user.id },
        { headers: { Authorization: `Bearer ${session.access_token}` }}
      );
      toast.success('PRO revoked', { id: 'revoke' });
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
    const confirmPrompt = window.prompt(`DANGER: Type "DELETE" to permanently remove ${user.email}.`);
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
    const headers = ['ID', 'Email', 'Name', 'Phone', 'Joined', 'Last Login', 'PRO Status', 'Plan', 'Banned'];
    const rows = users.map(u => [
      u.id, u.email, u.name, u.phone, u.created_at ? new Date(u.created_at).toISOString() : '', 
      u.last_sign_in_at ? new Date(u.last_sign_in_at).toISOString() : '', 
      u.is_pro ? 'YES' : 'NO', u.plan || 'None', u.is_banned ? 'YES' : 'NO'
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

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'PRO') return u.is_pro;
    if (filter === 'Free') return !u.is_pro;
    if (filter === 'Banned') return u.is_banned;
    return true;
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
              Admin Command Center
            </h1>
            <p className="text-gray-400 mt-1">Manage users, track activity, and system settings</p>
          </div>
          <button 
            onClick={onBack}
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all flex items-center gap-2 font-medium"
          >
            ← Back to App
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8 bg-white/5 p-1 rounded-xl w-full max-w-md border border-white/10">
          <button onClick={() => setActiveTab('users')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'users' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>User Directory</button>
          <button onClick={() => setActiveTab('activity')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'activity' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Activity Logs</button>
          <button onClick={() => setActiveTab('settings')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'settings' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Settings</button>
        </div>

        {/* Tab Content: USERS */}
        {activeTab === 'users' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                 Export CSV
               </button>
            </div>

            {/* Users Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-sm font-medium text-gray-400">User Info</th>
                      <th className="px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                      <th className="px-6 py-4 text-sm font-medium text-gray-400">Plan</th>
                      <th className="px-6 py-4 text-sm font-medium text-gray-400">Joined</th>
                      <th className="px-6 py-4 text-sm font-medium text-gray-400">Last Login</th>
                      <th className="px-6 py-4 text-sm font-medium text-gray-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loadingUsers ? (
                      <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400">Loading users...</td></tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400">No users found.</td></tr>
                    ) : (
                      filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${user.is_banned ? "text-gray-500 line-through" : ""}`}>{user.email}</span>
                                {user.is_banned && <span className="bg-red-500/20 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-500/30">BANNED</span>}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-400">
                                {user.name !== 'N/A' && <span>👤 {user.name}</span>}
                                {user.phone !== 'N/A' && <span>📱 {user.phone}</span>}
                              </div>
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
                              {user.is_pro ? (
                                <button onClick={() => handleRevokePro(user)} className="px-3 py-1.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded-lg text-xs font-medium border border-yellow-500/20">- PRO</button>
                              ) : (
                                <button onClick={() => { setSelectedUser(user); setModalOpen(true); }} className="px-3 py-1.5 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded-lg text-xs font-medium border border-purple-500/30">+ PRO</button>
                              )}
                              <button onClick={() => handleToggleBan(user)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${user.is_banned ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>{user.is_banned ? 'Unban' : 'Ban'}</button>
                              <button onClick={() => handleDeleteUser(user)} className="px-2.5 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-xs border border-red-500/20">Delete</button>
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
        )}

        {/* Tab Content: ACTIVITY */}
        {activeTab === 'activity' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold">Global Activity Feed</h2>
                <button onClick={fetchActivity} className="text-sm text-purple-400 hover:text-purple-300">Refresh Feed</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-sm font-medium text-gray-400 w-48">Timestamp</th>
                      <th className="px-6 py-4 text-sm font-medium text-gray-400">User Email</th>
                      <th className="px-6 py-4 text-sm font-medium text-gray-400">Action Taken</th>
                      <th className="px-6 py-4 text-sm font-medium text-gray-400">Details (URL)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loadingActivity ? (
                      <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">Loading activity...</td></tr>
                    ) : activityLogs.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">No recent activity found. Make sure the database table exists.</td></tr>
                    ) : (
                      activityLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-gray-400 text-sm whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="px-6 py-4 font-medium text-purple-300">{log.user_email}</td>
                          <td className="px-6 py-4 text-sm"><span className="px-2.5 py-1 bg-white/10 rounded-lg text-gray-300">{log.action}</span></td>
                          <td className="px-6 py-4 text-gray-400 text-sm truncate max-w-xs" title={log.details}>{log.details}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md max-w-2xl">
              <h2 className="text-2xl font-bold mb-6">System Settings</h2>
              
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      Maintenance Mode
                    </h3>
                    <p className="text-gray-400 text-sm mt-2 max-w-md">
                      When enabled, the entire application will be locked down for regular users. 
                      They will not be able to download any videos. Use this during critical updates or server issues.
                    </p>
                  </div>
                  
                  <button 
                    onClick={handleToggleMaintenance}
                    disabled={loadingSettings}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${maintenanceMode ? 'bg-red-500' : 'bg-gray-600'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-8' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
                <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
                  <option value="1 Month" className="bg-[#111]">1 Month</option>
                  <option value="1 Year" className="bg-[#111]">1 Year</option>
                  <option value="Lifetime" className="bg-[#111]">Lifetime</option>
                </select>
              </label>
            </div>
            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleGrantPro} className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 text-white rounded-xl font-medium shadow-lg transition-all">Confirm Grant</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
