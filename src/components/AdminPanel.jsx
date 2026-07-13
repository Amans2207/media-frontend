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
      fetchUsers(); // Refresh list
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

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Admin Dashboard
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
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">No users found.</td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">{user.email}</td>
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
                        {user.is_pro ? (
                          <button 
                            onClick={() => handleRevokePro(user)}
                            className="px-4 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm transition-colors border border-red-500/20"
                          >
                            Revoke PRO
                          </button>
                        ) : (
                          <button 
                            onClick={() => { setSelectedUser(user); setModalOpen(true); }}
                            className="px-4 py-1.5 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded-lg text-sm transition-colors border border-purple-500/30"
                          >
                            Grant PRO
                          </button>
                        )}
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
