import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Select, Button, notification, Tag, DatePicker } from 'antd';
import {
  FileTextOutlined, TagOutlined, ClockCircleOutlined,
  DollarOutlined, CalendarOutlined,
} from '@ant-design/icons';
import Navbar from '../components/Navbar';
import axiosInstance from '../api/axiosInstance';

const { TextArea } = Input;
const { Option } = Select;

const BLOCKED_KEYWORDS = ['assignment', 'exam', 'sessional'];

const PostProject = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const showPolicyBlock = (keyword) => {
    api.error({
      message: 'Academic Honesty Policy Violation',
      description: (
        <span>
          Your project description contains the term <strong>"{keyword}"</strong>.
          SkillBridge does not allow postings related to academic assignments,
          exams, or sessional work. Please revise your description.
        </span>
      ),
      placement: 'topRight',
      duration: 6,
    });
  };

  const handleSubmit = async (values) => {
    const combined = `${values.title || ''} ${values.description || ''}`.toLowerCase();
    for (const kw of BLOCKED_KEYWORDS) {
      if (combined.includes(kw)) {
        showPolicyBlock(kw);
        return;
      }
    }

    try {
      setLoading(true);
      await axiosInstance.post('/projects/', {
        title: values.title,
        description: values.description,
        budget: values.budget ? Number(values.budget) : undefined,
        requiredSkills: values.requiredSkills || [],
        deadline: values.deadline ? values.deadline.toISOString() : undefined,
        category: values.category,
      });
      api.success({
        message: 'Project Posted!',
        description: 'Your project is now live and accepting bids.',
        placement: 'topRight',
        duration: 4,
      });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      api.error({
        message: 'Failed to Post Project',
        description: err.message,
        placement: 'topRight',
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  const tagRenderer = (color) => (props) => (
    <Tag
      color={color}
      closable={props.closable}
      onClose={props.onClose}
      style={{ borderRadius: 6 }}
    >
      {props.label}
    </Tag>
  );

  const labelStyle = { fontWeight: 600, color: '#374151' };
  const sectionBoxStyle = {
    background: '#fafafa',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '1.25rem',
    marginBottom: 24,
  };

  return (
    <div className="sb-page">
      {contextHolder}
      <Navbar />
      <div className="sb-container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.5px' }}>
              Post a New Project
            </h1>
            <p style={{ color: '#6b7280', marginTop: 4 }}>
              Fill in the details below to attract the right freelancers.
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            style={{
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              padding: '2rem',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <Form.Item
              name="title"
              label={<span style={labelStyle}><FileTextOutlined style={{ marginRight: 6, color: '#E85D24' }} />Project Title</span>}
              rules={[{ required: true, message: 'Please enter a project title' }]}
            >
              <Input id="post-title" placeholder="Add Title" size="large" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              name="description"
              label={<span style={labelStyle}><FileTextOutlined style={{ marginRight: 6, color: '#E85D24' }} />Project Description</span>}
              rules={[
                { required: true, message: 'Please write a project summary' },
                { min: 30, message: 'Description must be at least 30 characters' },
              ]}
            >
              <TextArea
                id="post-description"
                placeholder="Write a summary about the job..."
                rows={8}
                style={{ borderRadius: 8, resize: 'vertical' }}
              />
            </Form.Item>

            <Form.Item
              name="category"
              label={<span style={labelStyle}><TagOutlined style={{ marginRight: 6, color: '#E85D24' }} />Category</span>}
              rules={[{ required: true, message: 'Please select a category' }]}
            >
              <Select id="post-category" placeholder="Select a category" size="large" style={{ borderRadius: 8 }}>
                <Option value="tutoring">Tutoring</Option>
                <Option value="design">Design & Creative</Option>
                <Option value="development">Development</Option>
                <Option value="writing">Writing & Translation</Option>
              </Select>
            </Form.Item>

            <div style={sectionBoxStyle}>
              <p style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151', marginBottom: 16 }}>
                Skills and Expertise
              </p>
              <Form.Item
                name="requiredSkills"
                label={<span style={{ ...labelStyle, fontSize: '0.9rem' }}>Required Skills</span>}
                style={{ marginBottom: 0 }}
              >
                <Select
                  id="post-required-skills"
                  mode="tags"
                  placeholder="e.g. React, Python, Figma — press Enter to add"
                  size="large"
                  tokenSeparators={[',']}
                  tagRender={tagRenderer('orange')}
                />
              </Form.Item>
            </div>

            <div style={sectionBoxStyle}>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="budget"
                  label={<span style={{ ...labelStyle, fontSize: '0.85rem' }}><DollarOutlined style={{ marginRight: 4, color: '#E85D24' }} />Project budget ($)</span>}
                  rules={[
                    { required: true, message: 'Please enter a budget' },
                    { pattern: /^\d+(\.\d{1,2})?$/, message: 'Enter a valid number' },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <Input id="post-budget" placeholder="e.g. 500" prefix="$" style={{ borderRadius: 8 }} />
                </Form.Item>
                <Form.Item
                  name="deadline"
                  label={<span style={{ ...labelStyle, fontSize: '0.85rem' }}><CalendarOutlined style={{ marginRight: 4, color: '#E85D24' }} />Deadline</span>}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker id="post-deadline" style={{ borderRadius: 8, width: '100%' }} />
                </Form.Item>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <Button
                id="post-delete-btn"
                onClick={() => { form.resetFields(); }}
                size="large"
                danger
                style={{ borderRadius: 8, fontWeight: 600, minWidth: 110 }}
              >
                DELETE
              </Button>
              <Button
                id="post-confirm-btn"
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                style={{ background: '#E85D24', borderColor: '#E85D24', borderRadius: 8, fontWeight: 600, minWidth: 130 }}
              >
                {loading ? 'Posting...' : 'CONFIRM'}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default PostProject;
