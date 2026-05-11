import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Table, Tag, Button, Space, Avatar,
  notification, Spin, Empty, Badge, Tooltip, Typography, Alert, Modal,
} from 'antd';
import {
  PlusOutlined, EyeOutlined, ReloadOutlined,
  CheckCircleOutlined, UserOutlined,
  ClockCircleOutlined, ProjectOutlined, LogoutOutlined,
  FileDoneOutlined, DownloadOutlined,
} from '@ant-design/icons';
import Navbar from '../components/Navbar';
import axiosInstance from '../api/axiosInstance';

const { Title, Text } = Typography;

const STATUS_COLOR = {
  in_progress: 'orange',
  completed: 'blue',
  cancelled: 'red',
};

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [api, contextHolder] = notification.useNotification();

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
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

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await axiosInstance.get('/profiles/me');
      setProfile(res.data?.profile || res.data);
    } catch {
      // profile might not exist yet
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchProfile();
  }, [fetchProjects, fetchProfile]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await axiosInstance.post('/auth/logout');
    } catch {
      // clear local state even if server fails
    } finally {
      logout();
      setLoggingOut(false);
      navigate('/login');
    }
  };

  const openBidsPage = (projectId, projectTitle, projectStatus) => {
    navigate('/view-bids?projectId=' + projectId + '&title=' + encodeURIComponent(projectTitle) + '&status=' + (projectStatus || 'open'));
  };

  const getBidsUrl = (record) =>
    '/view-bids?projectId=' + record._id + '&title=' + encodeURIComponent(record.title || '') + '&status=' + (record.status || 'open');

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
          {val || 'General'}
        </Tag>
      ),
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      render: (val) => (
        <Text style={{ color: '#E85D24', fontWeight: 600 }}>
          {val ? '$' + val : 'N/A'}
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
      render: (date) => date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {record.status === 'in_progress' || record.status === 'completed' ? (
            <Button
              size="small"
              block
              type="primary"
              icon={<FileDoneOutlined />}
              onClick={() => showWorkModal(record)}
              style={{ borderRadius: 6, background: '#16a34a', borderColor: '#16a34a' }}
            >
              View Work
            </Button>
          ) : (
            <Tooltip title="View Proposals">
              <Link to={getBidsUrl(record)} id={'view-bids-' + record._id} style={{ display: 'block' }}>
                <Button
                  type="primary"
                  size="small"
                  block
                  icon={<EyeOutlined />}
                  style={{ background: '#E85D24', borderColor: '#E85D24', borderRadius: 6 }}
                >
                  Proposals
                </Button>
              </Link>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const [workModalVisible, setWorkModalVisible] = useState(false);
  const [selectedProjectForWork, setSelectedProjectForWork] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  const fetchDeliveries = async (projectId) => {
    setLoadingDeliveries(true);
    try {
      const res = await axiosInstance.get(`/projects/${projectId}/deliveries`);
      setDeliveries(res.data?.deliveries || []);
    } catch (err) {
      api.error({ message: 'Failed to load deliveries', description: err.message });
    } finally {
      setLoadingDeliveries(false);
    }
  };

  const showWorkModal = (project) => {
    setSelectedProjectForWork(project);
    setWorkModalVisible(true);
    fetchDeliveries(project._id);
  };

  const openCount   = projects.filter((p) => p.status === 'open' || !p.status).length;
  const activeCount = projects.filter((p) => p.status === 'in_progress').length;
  const totalBids   = projects.reduce((acc, p) => acc + (Array.isArray(p.bids) ? p.bids.length : 0), 0);

  return (
    <div className="sb-page">
      {contextHolder}
      <Navbar />

      <div className="sb-container py-8">

        {/* Profile reminder */}
        {!loadingProfile && !profile?.bio && (
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

        {/* Header row */}
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

        {/* Stats cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Jobs Posted',       value: projects.length, icon: <ProjectOutlined />,      color: '#E85D24' },
            { label: 'Open Projects',     value: openCount,       icon: <ClockCircleOutlined />,  color: '#16a34a' },
            { label: 'Active Contracts',  value: activeCount,     icon: <CheckCircleOutlined />,  color: '#d97706' },
            { label: 'Pending Proposals', value: totalBids,       icon: <UserOutlined />,         color: '#7c3aed' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="sb-card"
              style={{ display: 'flex', alignItems: 'center', gap: 16 }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: stat.color + '20',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, color: stat.color,
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 2 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main layout: sidebar + table */}
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
                  { label: 'Jobs Posted',       value: projects.length, color: '#E85D24' },
                  { label: 'Active Contracts',  value: activeCount,     color: '#16a34a' },
                  { label: 'Pending Proposals', value: totalBids,       color: '#7c3aed' },
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
                    <Button id="sidebar-view-proposals" block icon={<EyeOutlined />} style={{ borderRadius: 8 }}>
                      View Proposals
                    </Button>
                  </Link>
                ) : (
                  <Button id="sidebar-view-proposals" block icon={<EyeOutlined />} style={{ borderRadius: 8 }} disabled>
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
                <Text style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                  {projects.length} project{projects.length !== 1 ? 's' : ''}
                </Text>
              </div>
              <Spin spinning={loadingProjects}>
                <Table
                  id="dashboard-projects-table"
                  dataSource={projects}
                  columns={columns}
                  rowKey={(r) => r._id || r.id || Math.random().toString()}
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
      </div>
      {/* Work Submissions Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileDoneOutlined style={{ color: '#E85D24' }} />
            <span>Work Submissions: {selectedProjectForWork?.title}</span>
          </div>
        }
        open={workModalVisible}
        onCancel={() => {
          setWorkModalVisible(false);
          setDeliveries([]);
        }}
        footer={[
          <Button key="close" onClick={() => setWorkModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
        centered
        styles={{ body: { padding: '20px' } }}
      >
        <Spin spinning={loadingDeliveries}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {deliveries.length === 0 ? (
              <Empty description="No work submitted yet." />
            ) : (
              deliveries.map((sub) => (
                <div 
                  key={sub._id} 
                  style={{ 
                    border: '1px solid #f0f0f0', 
                    borderRadius: 12, 
                    padding: 16,
                    background: '#fafafa'
                  }}
                >
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#8c8c8c', marginBottom: 8 }}>
                      Submitted by {sub.freelancer?.name || 'Freelancer'} on {new Date(sub.createdAt).toLocaleString()}
                    </div>
                    {sub.files && sub.files.map((file, fIdx) => (
                      <div key={fIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '8px 12px', borderRadius: 8, border: '1px solid #f0f0f0', marginBottom: 8 }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <div style={{ 
                            width: 32, height: 32, borderRadius: 6, 
                            background: '#E85D2415', color: '#E85D24',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16
                          }}>
                            <FileDoneOutlined />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{file.fileName}</div>
                            <div style={{ fontSize: 11, color: '#8c8c8c' }}>{file.fileSize}</div>
                          </div>
                        </div>
                        <Button 
                          icon={<DownloadOutlined />} 
                          type="link" 
                          style={{ color: '#E85D24' }}
                          onClick={() => window.open(file.fileUrl, '_blank')}
                        >
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div style={{ 
                    padding: '12px', 
                    background: '#fff', 
                    borderRadius: 8, 
                    fontSize: 13, 
                    color: '#595959',
                    border: '1px solid #f0f0f0'
                  }}>
                    {sub.message}
                  </div>
                </div>
              ))
            )}
            
            <div style={{ 
              marginTop: 10, 
              padding: 16, 
              borderRadius: 12, 
              background: '#e6f7ff', 
              border: '1px solid #91d5ff',
              display: 'flex',
              gap: 12,
              alignItems: 'center'
            }}>
              <div style={{ fontSize: 20, color: '#1890ff' }}>ℹ️</div>
              <div style={{ fontSize: 13, color: '#003a8c' }}>
                Once you review the work, you can mark the project as completed in the project settings or release the payment from the finances tab.
              </div>
            </div>
          </div>
        </Spin>
      </Modal>
    </div>
  );
};

export default ClientDashboard;
