import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Tag, Button, Space, Modal, List, Avatar,
  notification, Spin, Empty, Badge, Tooltip, Typography,
} from 'antd';
import {
  PlusOutlined, EyeOutlined, ReloadOutlined,
  CheckCircleOutlined, UserOutlined, DollarOutlined,
  ClockCircleOutlined, ProjectOutlined,
} from '@ant-design/icons';
import Navbar from '../components/Navbar';
import axiosInstance from '../api/axiosInstance';

const { Title, Text } = Typography;

/** Status badge colours matching Figma palette */
const STATUS_COLOR = {
  open: 'green',
  'in-progress': 'orange',
  completed: 'blue',
  cancelled: 'red',
};

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [bidsModal, setBidsModal] = useState({ open: false, projectId: null, projectTitle: '' });
  const [bids, setBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [acceptingBid, setAcceptingBid] = useState(null);

  // ── Fetch my projects ──────────────────────────────────────────────────────
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

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // ── Fetch bids for a project ───────────────────────────────────────────────
  const openBidsModal = async (projectId, projectTitle) => {
    setBidsModal({ open: true, projectId, projectTitle });
    setLoadingBids(true);
    setBids([]);
    try {
      const res = await axiosInstance.get(`/projects/${projectId}/bids`);
      setBids(res.data?.bids || res.data || []);
    } catch (err) {
      api.error({ message: 'Could not load bids', description: err.message, placement: 'topRight' });
    } finally {
      setLoadingBids(false);
    }
  };

  // ── Accept a bid ───────────────────────────────────────────────────────────
  const acceptBid = async (bidId) => {
    setAcceptingBid(bidId);
    try {
      await axiosInstance.patch(`/projects/${bidsModal.projectId}/accept-bid`, { bidId });
      api.success({ message: 'Bid Accepted!', description: 'The freelancer has been notified.', placement: 'topRight', duration: 4 });
      setBidsModal({ open: false, projectId: null, projectTitle: '' });
      fetchProjects();
    } catch (err) {
      api.error({ message: 'Failed to accept bid', description: err.message, placement: 'topRight' });
    } finally {
      setAcceptingBid(null);
    }
  };

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Project Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Text strong style={{ color: '#1a1a1a', cursor: 'pointer' }}
          onClick={() => openBidsModal(record._id, text)}
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
            <Button
              id={`view-bids-${record._id}`}
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => openBidsModal(record._id, record.title)}
              style={{ background: '#E85D24', borderColor: '#E85D24', borderRadius: 6 }}
            >
              View Proposals
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ── Summary stats ──────────────────────────────────────────────────────────
  const openCount = projects.filter((p) => p.status === 'open' || !p.status).length;
  const activeCount = projects.filter((p) => p.status === 'in-progress').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const totalBids = projects.reduce((acc, p) => acc + (Array.isArray(p.bids) ? p.bids.length : 0), 0);

  return (
    <div className="sb-page">
      {contextHolder}
      <Navbar />

      <div className="sb-container py-8">
        {/* Page header */}
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
          </Space>
        </div>

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
                <Button
                  id="sidebar-view-proposals"
                  block
                  icon={<EyeOutlined />}
                  style={{ borderRadius: 8 }}
                  onClick={() => { if (projects.length) openBidsModal(projects[0]._id, projects[0].title); }}
                >
                  View Proposals
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
      </div>

      {/* Bids Modal */}
      <Modal
        id="bids-modal"
        open={bidsModal.open}
        title={
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            Proposals for: <span style={{ color: '#E85D24' }}>{bidsModal.projectTitle}</span>
          </span>
        }
        onCancel={() => setBidsModal({ open: false, projectId: null, projectTitle: '' })}
        footer={null}
        width={620}
        centered
      >
        <Spin spinning={loadingBids}>
          {bids.length === 0 && !loadingBids ? (
            <Empty description="No proposals yet. Share your project to attract freelancers!" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <List
              dataSource={bids}
              renderItem={(bid, idx) => (
                <List.Item
                  id={`bid-item-${idx}`}
                  style={{
                    background: '#fafafa',
                    borderRadius: 10,
                    marginBottom: 10,
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                  }}
                  actions={[
                    <Button
                      id={`accept-bid-${bid._id || idx}`}
                      key="accept"
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      loading={acceptingBid === (bid._id || idx)}
                      onClick={() => acceptBid(bid._id)}
                      style={{ background: '#E85D24', borderColor: '#E85D24', borderRadius: 6, fontWeight: 600 }}
                    >
                      Accept Bid
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar icon={<UserOutlined />} style={{ background: '#7c3aed' }} />
                    }
                    title={
                      <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
                        {bid.freelancer?.name || bid.freelancerName || `Freelancer #${idx + 1}`}
                      </span>
                    }
                    description={
                      <Space direction="vertical" size={2}>
                        <Text style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                          {bid.coverLetter || bid.proposal || 'No cover letter provided.'}
                        </Text>
                        <Space size={12}>
                          <Text strong style={{ color: '#E85D24', fontSize: '0.85rem' }}>
                            <DollarOutlined /> ${bid.bidAmount ?? bid.amount ?? '—'}
                          </Text>
                          <Text style={{ color: '#6b7280', fontSize: '0.82rem' }}>
                            <ClockCircleOutlined /> {bid.deliveryTime || '—'}
                          </Text>
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default ClientDashboard;
