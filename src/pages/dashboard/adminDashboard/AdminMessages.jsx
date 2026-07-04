import React, { useState, useEffect } from 'react';
import { Mail, Search, Trash2, Eye, EyeOff, Check, CheckCircle2, Clock, AlertCircle, X } from 'lucide-react';
import { apiFetch } from '../../../api';

export function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewingMessage, setViewingMessage] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch('/contact');
      if (res.success) {
        setMessages(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch contact messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleOpenMessage = async (msg) => {
    setViewingMessage(msg);
    setShowViewModal(true);

    if (msg.status === 'unread') {
      try {
        const res = await apiFetch(`/contact/${msg._id}/read`, {
          method: 'PUT'
        });
        if (res.success) {
          // Update status in local state
          setMessages(prev =>
            prev.map(m => m._id === msg._id ? { ...m, status: 'read' } : m)
          );
        }
      } catch (error) {
        console.error('Failed to mark message as read:', error);
      }
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const res = await apiFetch(`/contact/${id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        setMessages(prev => prev.filter(m => m._id !== id));
        if (viewingMessage && viewingMessage._id === id) {
          setShowViewModal(false);
          setViewingMessage(null);
        }
      }
    } catch (error) {
      alert(error.message || 'Failed to delete message');
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || msg.status === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const totalCount = messages.length;
  const unreadCount = messages.filter(m => m.status === 'unread').length;
  const readCount = messages.filter(m => m.status === 'read').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900" style={{ fontFamily: "DM Serif Display, serif" }}>Customer Messages</h1>
          <p className="text-slate-500 mt-1">Review and manage queries sent from the contact section</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-[#0F172A] rounded-2xl">
            <Mail className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Messages</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-amber-50 rounded-2xl">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unread Messages</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{unreadCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 rounded-2xl">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Read Messages</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{readCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#D4AF37] focus:bg-white outline-none transition-all font-semibold text-sm text-slate-700"
            />
          </div>

          <div className="flex gap-2">
            {['All', 'Unread', 'Read'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  filterStatus === status
                    ? 'bg-[#0F172A] text-white shadow-lg shadow-slate-900/20'
                    : 'bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Message Table */}
        <div className="overflow-x-auto rounded-[1.5rem] border border-slate-100">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sender Name</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Message Preview</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Received Date</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">Loading messages...</td>
                </tr>
              ) : filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">No contact messages found</td>
                </tr>
              ) : (
                filteredMessages.map((msg) => (
                  <tr key={msg._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{msg.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-600">{msg.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">{msg.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full border ${
                        msg.status === 'unread'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {msg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-semibold text-slate-600">
                        {new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenMessage(msg)}
                          className="text-xs bg-[#0F172A] text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#D4AF37]" /> Open
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                          title="Delete Message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* VIEW MESSAGE MODAL */}
      {showViewModal && viewingMessage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4" onClick={() => setShowViewModal(false)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg border border-white/20 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#0F172A] text-white p-6 flex justify-between items-center relative">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-[#D4AF37]/20 rounded-l-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-xl font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>Message details</h2>
                <p className="text-[#D4AF37] text-[10px] uppercase tracking-widest mt-1">Sender: {viewingMessage.name}</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 border-b border-slate-100 pb-2">Sender Email</h4>
                <p className="text-sm font-semibold text-slate-900">{viewingMessage.email}</p>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 border-b border-slate-100 pb-2">Received At</h4>
                <p className="text-xs text-slate-600 font-semibold">
                  {new Date(viewingMessage.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Message Body</h4>
                <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap font-medium leading-relaxed">
                  {viewingMessage.message}
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between">
              <button
                onClick={() => handleDeleteMessage(viewingMessage._id)}
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
              <button 
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
