import React from 'react';
import { useAppContext } from '../../../contex/useAppContext';
import { authApi } from '../../../router/auth/Signup';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import './Dashboard.css';
import { sidebarItemsData } from './sidebarItems';

const iconMap = {
  LayoutDashboard: LayoutDashboard,
  Users: Users,
  ShieldCheck: ShieldCheck,
  Settings: Settings,
};


const Sidebar = ({ activeTab, setActiveTab, isCollapsed, toggleCollapse, isMobile, isMobileOpen, closeMobileMenu }) => {
  const { setIsAuth, user } = useAppContext();

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

  const filteredItems = sidebarItemsData.filter(item => {
    const role = (user?.role || user?.user?.role)?.toLowerCase();
    return item.roles.includes(role);
  });
  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div className="mobile-overlay show" onClick={closeMobileMenu}></div>
      )}

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobile && isMobileOpen ? 'mobile-show' : ''}`}>
        <div className="sidebar-header">
          {!isCollapsed && <span className="logo-text">AuthAdmin Pro</span>}
          {isCollapsed && <ShieldCheck size={32} color="var(--primary)" />}

          {!isMobile && (
            <button className="toggle-btn" onClick={toggleCollapse}>
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {filteredItems.map((item) => (
            <div
              key={item.label}
              className={`nav-item ${activeTab === item.label ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.label);
                if (isMobile) closeMobileMenu();
              }}
            >
              {iconMap[item.iconName] && React.createElement(iconMap[item.iconName], { size: 20 })}
              {!isCollapsed && <span>{item.label}</span>}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
