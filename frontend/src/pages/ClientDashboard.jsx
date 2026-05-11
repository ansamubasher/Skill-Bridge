import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Table, Tag, Button, Space, Avatar,
  notification, Spin, Empty, Badge, Tooltip, Typography, Alert,
} from 'antd';
import {
  PlusOutlined, EyeOutlined, ReloadOutlined,
  CheckCircleOutlined, UserOutlined, DollarOutlined,
  ClockCircleOutlined, ProjectOutlined, LogoutOutlined,
} from '@ant-design/icons';
import Navbar from '../components/Navbar';
import axiosInstance from '../api/axiosInstance';

const { Title, Text } = Typography;

/** Status badge colours matching Figma palette */
const STATUS_COLOR = {
  'in_progress': 'orange',
  completed: 'blue',
  cancelled: 'red',
};

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [api, contextHolder] = notification.useNotification();

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [activeTab, setActiveTab] = useState('projects');
  const [loggingOut, setLoggingOut] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const res = await axiosInstance.get('/projects/my');
      setProjects(res.data?.projects || res.data || []);
    } catch (err) {
      api.error({ message: 'Could not load projects', description: err.message, placement: 'topRight' });
    } finally {
      setLoadingProjects(false);
    }
  }, [api]);

  const fetchContracts = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/projects/contracts/mine');
      setContracts(res.data?.contracts || []);
    } catch { /* silent */ }
  }, []);

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await axiosInstance.get('/profiles/me');
      setProfile(res.data?.profile || res.data);
    } catch { /* profile might not exist yet */ }
    finally { setLoadingProfile(false); }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchContracts();
    fetchProfile();
  }, [fetchProjects, fetchContracts, fetchProfile]);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await axiosInstance.post('/auth/logout');
    } catch {
      // even if the server request fails, we still clear local state
    } finally {
      logout(); // clears 'sb_token' from localStorage & resets user state
      setLoggingOut(false);
      navigate('/login');
    }
  };

  // ── Navigate to bids for a project ───────────────────────────────────────────────
  const openBidsPage = (projectId, projectTitle, projectStatus) => {
    console.log('[Dashboard] openBidsPage called:', { projectId, projectTitle, projectStatus });
    navigate(`/view-bids?projectId=${projectId}&title=${encodeURIComponent(projectTitle)}&status=${projectStatus || 'open'}`);
  };

  // Build URL for a project's bids page
  const getBidsUrl = (record) =>
    `/view-bids?projectId=${record._id}&title=${encodeURIComponent(record.title || '')}&status=${record.status || 'open'}`;

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Project Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Text strong style={{ color: '#1a1a1a', cursor: 'pointer' }}
          onClick={() => openBidsPage(record._id, text, record.status)}
        >
          {text}
        </Text>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'projectType',
      key: 'projectType',
      render: (val) => (
        <Tag color="purple" style={{ borderRadius: 6 }}>
          {val || '—'}
        </Tag>
      ),
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      render: (val) => (
        <Text style={{ color: '#E85D24', fontWeight: 600 }}>
          {val ? `$${val}` : '—'}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={STATUS_COLOR[status] || 'default'} style={{ borderRadius: 6, fontWeight: 500 }}>
          {status ? status.toUpperCase() : 'OPEN'}
        </Tag>
      ),
    },
    {
      title: 'Bids',
      dataIndex: 'bids',
      key: 'bids',
      render: (bidsArr) => (
        <Badge
          count={Array.isArray(bidsArr) ? bidsArr.length : 0}
          style={{ background: '#E85D24' }}
          showZero
        />
      ),
    },
    {
      title: 'Posted On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Proposals">
            <Link to={getBidsUrl(record)} id={`view-bids-${record._id}`}>
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                style={{ background: '#E85D24', borderColor: '#E85D24', borderRadius: 6 }}
              >
                View Proposals
              </Button>
            </Link>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ── Summary stats ──────────────────────────────────────────────────────────
  const openCount = projects.filter((p) => p.status === 'open' || !p.status).length;
  const activeCount = projects.filter((p) => p.status === 'in_progress').length;
  const totalBids = projects.reduce((acc, p) => acc + (Array.isArray(p.bids) ? p.bids.length : 0), 0);

  return (
    <div className="sb-page">
      {contextHolder}
      <Navbar />

      <div className="sb-container py-8">
        {/* Page header */}
        {/* Profile Reminder */}
        {!loadingProfile && (!profile?.bio) && (
          <Alert
            message="Complete your profile!"
            description="Add a bio and skills to attract more freelancers and build trust."
            type="info"
            showIcon
            action={
              <Button size="small" type="primary" onClick={() => navigate('/profile')}>
                Go to Profile
              </Button>
            }
            style={{ marginBottom: 24, borderRadius: 10, border: '1px solid #bae7ff', background: '#e6f7ff' }}
          />
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <Title level={2} style={{ margin: 0, letterSpacing: '-0.5px' }}>Client Dashboard</Title>
            <Text style={{ color: '#6b7280' }}>Manage your posted projects and review proposals</Text>
          </div>
          <Space>
            <Button
              id="dashboard-refresh"
              icon={<ReloadOutlined />}
              onClick={fetchProjects}
              loading={loadingProjects}
              style={{ borderRadius: 8 }}
            >
              Refresh
            </Button>
            <Button
              id="dashboard-post-job"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/post-project')}
              size="large"
              style={{ background: '#E85D24', borderColor: '#E85D24', borderRadius: 8, fontWeight: 600 }}
            >
              Post a Job
            </Button>
            <Button
              id="dashboard-logout"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              loading={loggingOut}
              size="large"
              danger
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Logout
            </Button>
          </Space>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid #e5e7eb' }}>
          {[{ key: 'projects', label: '📋 My Projects' }, { key: 'contracts', label: `📄 Contracts (${contracts.length})` }].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{ padding: '10px 22px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: activeTab === t.key ? 700 : 400, color: activeTab === t.key ? '#E85D24' : '#6b7280', borderBottom: activeTab === t.key ? '2px solid #E85D24' : '2px solid transparent', marginBottom: -2 }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'contracts' ? (
          <div className="sb-card">
            {contracts.length === 0 ? (
              <Empty description="No contracts yet — accept a bid to create one" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              contracts.map((c, i) => (
                <div key={c._id || i} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, marginBottom: 12, background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{c.project?.title || 'Project'}</div>
                    <span style={{ background: c.status === 'active' ? '#f0fdf4' : '#f9fafb', color: c.status === 'active' ? '#16a34a' : '#6b7280', border: `1px solid ${c.status === 'active' ? '#bbf7d0' : '#d1d5db'}`, borderRadius: 999, padding: '2px 12px', fontSize: 12, fontWeight: 600 }}>
                      {c.status?.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, fontSize: 13 }}>
                    <div><div style={{ color: '#9ca3af', fontSize: 11, marginBottom: 3 }}>FREELANCER</div><div style={{ fontWeight: 600 }}>{c.freelancer?.name || '—'}</div><div style={{ color: '#6b7280', fontSize: 12 }}>{c.freelancer?.email}</div></div>
                    <div><div style={{ color: '#9ca3af', fontSize: 11, marginBottom: 3 }}>AGREED AMOUNT</div><div style={{ fontWeight: 700, color: '#E85D24', fontSize: 16 }}>${c.agreedAmount}</div></div>
                    <div><div style={{ color: '#9ca3af', fontSize: 11, marginBottom: 3 }}>STARTED</div><div style={{ fontWeight: 600 }}>{c.startDate ? new Date(c.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</div></div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Jobs Posted', value: projects.length, icon: <ProjectOutlined />, color: '#E85D24' },
                { label: 'Open Projects', value: openCount, icon: <ClockCircleOutlined />, color: '#16a34a' },
                { label: 'Active Contracts', value: activeCount, icon: <CheckCircleOutlined />, color: '#d97706' },
                { label: 'Pending Proposals', value: totalBids, icon: <UserOutlined />, color: '#7c3aed' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="sb-card"
                  style={{ display: 'flex', alignItems: 'center', gap: 16 }}
                >
                  <div
                    style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: `${stat.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 2 }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar + Table layout */}
            <div className="grid grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="col-span-1">
                <div className="sb-card mb-4">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <Avatar icon={<UserOutlined />} style={{ background: '#E85D24' }} size={40} />
                    <div>
                      <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.95rem' }}>My Account</div>
                      <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>Client</div>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
                    {[
                      { label: 'Jobs Posted', value: projects.length, color: '#E85D24' },
                      { label: 'Active Contracts', value: activeCount, color: '#16a34a' },
                      { label: 'Pending Proposals', value: totalBids, color: '#7c3aed' },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between items-center mb-2">
                        <Text style={{ fontSize: '0.82rem', color: '#6b7280' }}>{row.label}:</Text>
                        <Text strong style={{ color: row.color }}>{row.value}</Text>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sb-card">
                  <p style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: 12, fontSize: '0.9rem' }}>Quick Actions</p>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                      id="sidebar-post-job"
                      block
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => navigate('/post-project')}
                      style={{ background: '#E85D24', borderColor: '#E85D24', borderRadius: 8, fontWeight: 600 }}
                    >
                      Post New Job
                    </Button>
                    {projects.length > 0 ? (
                      <Link to={getBidsUrl(projects[0])} style={{ display: 'block' }}>
                        <Button
                          id="sidebar-view-proposals"
                          block
                          icon={<EyeOutlined />}
                          style={{ borderRadius: 8 }}
                        >
                          View Proposals
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        id="sidebar-view-proposals"
                        block
                        icon={<EyeOutlined />}
                        style={{ borderRadius: 8 }}
                        disabled
                      >
                        No Projects Yet
                      </Button>
                    )}
                    <Button
                      id="sidebar-view-profile"
                      block
                      icon={<UserOutlined />}
                      style={{ borderRadius: 8 }}
                      onClick={() => navigate('/profile')}
                    >
                      View Profile
                    </Button>
                  </Space>
                </div>
              </div>

              {/* Projects table */}
              <div className="col-span-3">
                <div className="sb-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Title level={5} style={{ margin: 0 }}>Your Posted Jobs</Title>
                    <Text style={{ color: '#6b7280', fontSize: '0.85rem' }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</Text>
                  </div>

                  <Spin spinning={loadingProjects}>
                    <Table
                      id="dashboard-projects-table"
                      dataSource={projects}
                      columns={columns}
                      rowKey={(r) => r._id || r.id || Math.random()}
                      pagination={{ pageSize: 8, showSizeChanger: false }}
                      locale={{
                        emptyText: (
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                              <span>
                                No projects yet.{' '}
                                <span
                                  style={{ color: '#E85D24', cursor: 'pointer', fontWeight: 600 }}
                                  onClick={() => navigate('/post-project')}
                                >
                                  Post your first job!
                                </span>
                              </span>
                            }
                          />
                        ),
                      }}
                      style={{ borderRadius: 0 }}
                    />
                  </Spin>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
