import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  MessageSquare, 
  Calendar, 
  ChevronDown, 
  Menu,
  TrendingUp,
  MoreVertical,
  CheckCircle,
  Copy,
  Share2,
  QrCode,
  Sparkles,
  ReceiptText,
  Clock,
  Wallet,
  User as UserIcon,
  Settings,
  LogOut,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import Sidebar from './Sidebar';
import { useAppContext } from '../../../contex/useAppContext';
import { authApi } from '../../../router/auth/Signup';
import './Dashboard.css';

const chartData = [
  { name: 'Apr 5', sessions: 5000, downloads: 4000 },
  { name: 'Apr 10', sessions: 7000, downloads: 4500 },
  { name: 'Apr 15', sessions: 6500, downloads: 5500 },
  { name: 'Apr 20', sessions: 11000, downloads: 7000 },
  { name: 'Apr 25', sessions: 14000, downloads: 8500 },
  { name: 'Apr 30', sessions: 18000, downloads: 10000 },
];

const barData = [
  { name: 'Jan', value: 4000, secondary: 2400, tertiary: 2400 },
  { name: 'Feb', value: 3000, secondary: 1398, tertiary: 2210 },
  { name: 'Mar', value: 2000, secondary: 9800, tertiary: 2290 },
  { name: 'Apr', value: 2780, secondary: 3908, tertiary: 2000 },
  { name: 'May', value: 1890, secondary: 4800, tertiary: 2181 },
  { name: 'Jun', value: 2390, secondary: 3800, tertiary: 2500 },
  { name: 'Jul', value: 3490, secondary: 4300, tertiary: 2100 },
];

const mockUsers = [
  { id: 1, name: 'Alex Rivera', email: 'alex@example.com', status: 'Active', role: 'User', avatar: 'AR' },
  { id: 2, name: 'Sarah Chen', email: 'sarah.c@example.com', status: 'Pending', role: 'Admin', avatar: 'SC' },
  { id: 3, name: 'Marcus Wright', email: 'm.wright@example.com', status: 'Active', role: 'User', avatar: 'MW' },
  { id: 4, name: 'Elena Gomez', email: 'elena@example.com', status: 'Suspended', role: 'User', avatar: 'EG' },
  { id: 5, name: 'Elena Gomez', email: 'elena@example.com', status: 'Suspended', role: 'User', avatar: 'EG' },
  { id: 6, name: 'Elena Gomez', email: 'elena@example.com', status: 'Suspended', role: 'User', avatar: 'EG' },
  { id: 7, name: 'Elena Gomez', email: 'elena@example.com', status: 'Suspended', role: 'User', avatar: 'EG' },
  { id: 8, name: 'Elena Gomez', email: 'elena@example.com', status: 'Suspended', role: 'User', avatar: 'EG' },
  { id: 9, name: 'Elena Gomez', email: 'elena@example.com', status: 'Suspended', role: 'User', avatar: 'EG' },
  { id: 10, name: 'Elena Gomez', email: 'elena@example.com', status: 'Suspended', role: 'User', avatar: 'EG' },
  { id: 11, name: 'Elena Gomez', email: 'elena@example.com', status: 'Suspended', role: 'User', avatar: 'EG' },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const { user, setIsAuth } = useAppContext();
  const profileRef = useRef(null);

  console.log(user,"user....................")
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDrawerToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleCollapseToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = async () => {
    try {
      const result = await authApi.logout();
      if (result?.status) {
        setIsAuth(false);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });

  return (
    <div className="dashboard-layout">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isCollapsed}
        toggleCollapse={handleCollapseToggle}
        isMobile={window.innerWidth <= 1024}
        isMobileOpen={isMobileOpen}
        closeMobileMenu={() => setIsMobileOpen(false)}
      />

      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header animate-fade-in">
          <div className="header-left">
            {window.innerWidth <= 1024 && (
              <button className="icon-btn" onClick={handleDrawerToggle}>
                <Menu size={24} />
              </button>
            )}
            <div className="page-info">
              <h1>{activeTab}</h1>
              <div className="date-info">
                <Calendar size={14} />
                <span>{currentDate}</span>
              </div>
            </div>
          </div>

          <div className="search-container">
            <Search size={18} className="text-muted" />
            <input type="text" placeholder="Search everything..." />
          </div>

          <div className="header-right">
            <div className="icon-actions">
              <button className="icon-btn">
                <MessageSquare size={20} />
              </button>
              <button className="icon-btn">
                <Bell size={20} />
              </button>
            </div>

            <div className="divider-v"></div>

            <div className="user-profile-trigger" ref={profileRef} onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <div className="user-info-text">
                <h4>{user?.name || "Admin User"}</h4>
                <span>Super Admin</span>
              </div>
              <div className="avatar">
                {user?.name ? user.name[0].toUpperCase() : "A"}
              </div>
              <ChevronDown size={18} className={`transition ${isProfileOpen ? 'rotate-180' : ''}`} />

              {/* Dropdown Menu */}
              <div className={`dropdown-menu ${isProfileOpen ? 'show' : ''}`} style={{ padding: 0 }}>
                {/* Header Section */}
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div className="avatar" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                      {user?.name ? user.name[0].toUpperCase() : "A"}
                    </div>
                    <div>
                      {console.log(user,"asssssssssssssssssss")}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{user?.name || "Dr. Sagar Kumar"}</h3>
                        <ShieldCheck size={18} color="#2563eb" fill="#2563eb" />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Super Admin Account</span>
                    </div>
                  </div>

               
                </div>

            

                {/* Menu Items */}
                <div style={{ padding: '8px' }}>
                  <div className="nav-item">
                    <UserIcon size={18} />
                    <span>My Profile</span>
                  </div>
                  <div className="nav-item">
                    <Sparkles size={18} />
                    <span>My Genie</span>
                  </div>
                  <div className="nav-item">
                    <ReceiptText size={18} />
                    <span>My RX Template</span>
                  </div>
                  <div className="nav-item">
                    <Clock size={18} />
                    <span>My Availability</span>
                  </div>
                  <div className="nav-item" style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Wallet size={18} />
                      <span>My Credits</span>
                    </div>
                    <div style={{ background: '#22c55e', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                      33
                    </div>
                  </div>
                </div>

                <div style={{ padding: '8px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <div className="nav-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
                    <LogOut size={18} />
                    <span style={{ fontWeight: 700 }}>Log Out</span>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '16px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span>Privacy Policy</span>
                  <span>•</span>
                  <span>Terms & Conditions</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Overview Section */}
        <div style={{ padding: '0 10px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '24px 0 16px 0' }}>Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* Users Card */}
            <div className="stat-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Users</span>
                <span style={{ fontSize: '0.75rem', color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <ArrowUpRight size={12} /> +25%
                </span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>14k</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Last 30 days</div>
              <div style={{ height: '40px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <Area type="monotone" dataKey="sessions" stroke="#22c55e" fill="rgba(34, 197, 94, 0.1)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Conversions Card */}
            <div className="stat-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Conversions</span>
                <span style={{ fontSize: '0.75rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <ArrowDownRight size={12} /> -25%
                </span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>325</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Last 30 days</div>
              <div style={{ height: '40px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <Area type="monotone" dataKey="downloads" stroke="#ef4444" fill="rgba(239, 68, 68, 0.1)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Event Count Card */}
            <div className="stat-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Event count</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>+5%</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>200k</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Last 30 days</div>
              <div style={{ height: '40px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <Area type="monotone" dataKey="sessions" stroke="var(--primary)" fill="rgba(99, 102, 241, 0.1)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Insights Card */}
            <div className="stat-card" style={{ padding: '20px', background: 'var(--surface)' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '12px' }}><TrendingUp size={24} /></div>
              <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>Explore your data</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Uncover performance and visitor insights with our data wizardry.</p>
              <button style={{ background: '#000', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                Get insights <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Large Charts Section */}
        <div style={{ padding: '0 10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          {/* Sessions Area Chart */}
          <div className="stat-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Sessions</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>13,277</span>
                  <span style={{ fontSize: '0.75rem', color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>+35%</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Sessions per day for the last 30 days</p>
              </div>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="sessions" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Page Views Bar Chart */}
          <div className="stat-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Page views and downloads</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>1.3M</span>
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>-8%</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Page views and downloads for the last 6 months</p>
              </div>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="value" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="secondary" stackId="a" fill="#60a5fa" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="tertiary" stackId="a" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Details Table Section */}
        <div style={{ padding: '0 10px', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>Details</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}><input type="checkbox" /></th>
                  <th>Page Title</th>
                  <th>Status</th>
                  <th>Users</th>
                  <th>Event Count</th>
                  <th>Views per User</th>
                  <th>Average Time</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { title: 'Homepage Overview', status: 'Online', users: '212423', events: '8345', vpu: '18.5', time: '2m 15s' },
                  { title: 'Product Details - Gadgets', status: 'Online', users: '172240', events: '5653', vpu: '9.7', time: '2m 30s' },
                  { title: 'Checkout Process - Step 1', status: 'Offline', users: '58240', events: '3455', vpu: '15.2', time: '2m 10s' },
                  { title: 'User Profile Dashboard', status: 'Online', users: '96240', events: '112543', vpu: '4.5', time: '2m 40s' },
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td><input type="checkbox" /></td>
                    <td><div style={{ fontWeight: 600 }}>{row.title}</div></td>
                    <td>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        color: row.status === 'Online' ? '#22c55e' : '#64748b',
                        background: row.status === 'Online' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{row.users}</td>
                    <td style={{ fontWeight: 500 }}>{row.events}</td>
                    <td style={{ fontWeight: 500 }}>{row.vpu}</td>
                    <td style={{ fontWeight: 500 }}>{row.time}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="icon-btn"><MoreVertical size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
