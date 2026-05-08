import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge, Avatar, Tooltip } from 'antd';
import {
  BellOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  DownOutlined,
} from '@ant-design/icons';

/**
 * SkillBridge top Navbar — Client variant
 * Matches the Figma design: logo + nav links (orange) + icon cluster + avatar
 */
const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="sb-navbar">
      {/* Logo */}
      <Link to="/dashboard" style={{ textDecoration: 'none', flexShrink: 0 }}>
        <span style={{ fontSize: '1.35rem', letterSpacing: '-0.5px' }}>
          <span className="sb-logo-skill">Skill</span>
          <span className="sb-logo-bridge">Bridge</span>
        </span>
      </Link>

      {/* Primary nav links */}
      <div className="sb-nav-links">
        <Link to="/post-project" className="sb-nav-link" id="nav-post-job">
          Post a job
        </Link>

        <div
          className="sb-nav-link-dark flex items-center gap-1 cursor-pointer select-none"
          id="nav-find-freelancers"
        >
          Find Freelancers <DownOutlined style={{ fontSize: 11 }} />
        </div>

        <div
          className="sb-nav-link-dark flex items-center gap-1 cursor-pointer select-none"
          id="nav-deliver-work"
        >
          Deliver work <DownOutlined style={{ fontSize: 11 }} />
        </div>

        <div
          className="sb-nav-link-dark flex items-center gap-1 cursor-pointer select-none"
          id="nav-manage-finances"
        >
          Manage Finances <DownOutlined style={{ fontSize: 11 }} />
        </div>

        <span className="sb-nav-link-dark cursor-pointer" id="nav-messages">
          Messages
        </span>
      </div>

      {/* Right-side icons */}
      <div className="flex items-center gap-4 ml-auto">
        <Tooltip title="Help">
          <QuestionCircleOutlined
            id="nav-help"
            style={{ fontSize: 20, color: '#6b7280', cursor: 'pointer' }}
          />
        </Tooltip>

        <Tooltip title="Notifications">
          <Badge count={3} size="small" color="#E85D24">
            <BellOutlined
              id="nav-notifications"
              style={{ fontSize: 20, color: '#6b7280', cursor: 'pointer' }}
            />
          </Badge>
        </Tooltip>

        <Avatar
          id="nav-avatar"
          icon={<UserOutlined />}
          style={{ background: '#E85D24', cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        />
      </div>
    </nav>
  );
};

export default Navbar;
