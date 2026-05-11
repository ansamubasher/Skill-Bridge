import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Button, Space, Avatar, notification, Spin, Empty, Tag, Typography, Popconfirm, Card,
} from 'antd';
import {
  CheckCircleOutlined, UserOutlined, DollarOutlined,
  ClockCircleOutlined, ArrowLeftOutlined, CloseCircleOutlined, CheckOutlined,
  MailOutlined, BankOutlined, BookOutlined,
} from '@ant-design/icons';
import Navbar from '../components/Navbar';
import axiosInstance from '../api/axiosInstance';

const { Title, Text } = Typography;

const ViewBids = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [notifApi, contextHolder] = notification.useNotification();

  const projectId = searchParams.get('projectId');
  const projectTitle = searchParams.get('title') || 'Project';
  const projectStatus = searchParams.get('status') || 'open';

  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingBid, setAcceptingBid] = useState(null);

  useEffect(() => {
    if (!projectId) return;
    const fetchBids = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/projects/${projectId}/bids`);
        console.log('Bids API response:', res.data);
        setBids(res.data?.bids || res.data || []);
      } catch (err) {
        console.error('Failed to fetch bids:', err);
        notifApi.error({ message: 'Could not load bids', description: err.message });
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, [projectId, notifApi]);

  const acceptBid = async (bidId) => {
    setAcceptingBid(bidId);
    try {
      await axiosInstance.patch(`/projects/${projectId}/accept-bid`, { bidId });
      notifApi.success({ message: 'Bid Accepted! 🎉', description: 'A contract has been created.' });
      // Refresh bids to show updated statuses
      const res = await axiosInstance.get(`/projects/${projectId}/bids`);
      setBids(res.data?.bids || res.data || []);
    } catch (err) {
      notifApi.error({ message: 'Failed to accept bid', description: err.message });
    } finally {
      setAcceptingBid(null);
    }
  };

  if (!projectId) {
    return (
      <div className="sb-page">
        <Navbar />
        <div className="sb-container py-8" style={{ textAlign: 'center', paddingTop: 80 }}>
          <Empty description="No project selected" />
          <Button type="primary" onClick={() => navigate('/dashboard')} style={{ marginTop: 16, background: '#E85D24', borderColor: '#E85D24' }}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const alreadyHasWinner = projectStatus === 'in_progress' || projectStatus === 'completed';

  return (
    <div className="sb-page">
      {contextHolder}
      <Navbar />

      <div className="sb-container py-8" style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/dashboard')}
            style={{ marginBottom: 16, borderRadius: 8 }}
          >
            Back to Dashboard
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Title level={3} style={{ margin: 0 }}>
              Bids for: <span style={{ color: '#E85D24' }}>{projectTitle}</span>
            </Title>
            <Tag
              color={projectStatus === 'in_progress' ? 'orange' : projectStatus === 'completed' ? 'blue' : 'green'}
              style={{ borderRadius: 999, fontWeight: 600 }}
            >
              {projectStatus.toUpperCase()}
            </Tag>
            <Tag color="purple" style={{ borderRadius: 999 }}>
              {bids.length} bid{bids.length !== 1 ? 's' : ''}
            </Tag>
          </div>
        </div>

        {/* Content */}
        <Spin spinning={loading}>
          {!loading && bids.length === 0 ? (
            <Card style={{ textAlign: 'center', borderRadius: 12, padding: 40 }}>
              <Empty
                description={<span style={{ color: '#6b7280' }}>No bids yet — share your project to attract freelancers!</span>}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {bids.map((bid, idx) => {
                const isAccepted = bid.status === 'accepted';
                const isRejected = bid.status === 'rejected';
                const isPending = !bid.status || bid.status === 'pending';

                return (
                  <Card
                    key={bid._id || idx}
                    style={{
                      border: isAccepted ? '2px solid #16a34a' : isRejected ? '1px solid #fca5a5' : '1px solid #e5e7eb',
                      borderRadius: 12,
                      background: isAccepted ? '#f0fdf4' : isRejected ? '#fff5f5' : '#fafafa',
                    }}
                    bodyStyle={{ padding: '16px 20px' }}
                  >
                    {/* Status tag top-right */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar
                          icon={<UserOutlined />}
                          size={44}
                          style={{ background: isAccepted ? '#16a34a' : '#7c3aed', flexShrink: 0 }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a1a' }}>
                            {bid.freelancer?.name || `Freelancer #${idx + 1}`}
                          </div>
                          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 2 }}>
                            {bid.freelancer?.email && (
                              <Text style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                                <MailOutlined style={{ marginRight: 3 }} />
                                {bid.freelancer.email}
                              </Text>
                            )}
                            {bid.freelancer?.department && (
                              <Text style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                                <BankOutlined style={{ marginRight: 3 }} />
                                {bid.freelancer.department}
                              </Text>
                            )}
                            {bid.freelancer?.academicYear && (
                              <Text style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                                <BookOutlined style={{ marginRight: 3 }} />
                                Year {bid.freelancer.academicYear}
                              </Text>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        {isAccepted && <Tag color="success" icon={<CheckCircleOutlined />} style={{ borderRadius: 999, fontWeight: 700 }}>ACCEPTED</Tag>}
                        {isRejected && <Tag color="error" icon={<CloseCircleOutlined />} style={{ borderRadius: 999, fontWeight: 700 }}>NOT SELECTED</Tag>}
                        {isPending && <Tag color="gold" style={{ borderRadius: 999, fontWeight: 600 }}>PENDING</Tag>}
                      </div>
                    </div>

                    {/* Cover letter */}
                    {(bid.coverLetter || bid.proposal) && (
                      <div style={{
                        background: '#fff7ed', border: '1px solid #fed7aa',
                        borderRadius: 8, padding: '10px 12px', marginBottom: 12,
                      }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#ea580c', marginBottom: 4, letterSpacing: '0.05em' }}>COVER LETTER</div>
                        <Text style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.6 }}>
                          {bid.coverLetter || bid.proposal}
                        </Text>
                      </div>
                    )}

                    {/* Bottom row: amount + accept button */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <Space size={20}>
                        <span style={{ fontWeight: 700, color: '#E85D24', fontSize: '1.1rem' }}>
                          <DollarOutlined /> {bid.bidAmount ?? bid.amount ?? '—'}
                        </span>
                        {bid.deliveryTime && (
                          <Text style={{ color: '#6b7280', fontSize: '0.83rem' }}>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            {bid.deliveryTime}
                          </Text>
                        )}
                      </Space>

                      {/* Accept button */}
                      {isPending && !alreadyHasWinner && (
                        <Popconfirm
                          title="Accept this bid?"
                          description={
                            <span>
                              This will hire <strong>{bid.freelancer?.name || 'this freelancer'}</strong> for <strong>${bid.bidAmount}</strong>.
                              All other bids will be declined.
                            </span>
                          }
                          onConfirm={() => acceptBid(bid._id)}
                          okText="Yes, Accept"
                          cancelText="Cancel"
                          okButtonProps={{ style: { background: '#E85D24', borderColor: '#E85D24' } }}
                        >
                          <Button
                            type="primary"
                            icon={<CheckOutlined />}
                            loading={acceptingBid === bid._id}
                            style={{ background: '#E85D24', borderColor: '#E85D24', borderRadius: 8, fontWeight: 700 }}
                          >
                            Accept Bid
                          </Button>
                        </Popconfirm>
                      )}
                      {isPending && alreadyHasWinner && (
                        <Button disabled size="small" style={{ borderRadius: 8 }}>Bid already accepted</Button>
                      )}
                      {isAccepted && (
                        <Button icon={<CheckCircleOutlined />} style={{ borderRadius: 8, color: '#16a34a', borderColor: '#16a34a', fontWeight: 700 }} disabled>
                          Hired!
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default ViewBids;
