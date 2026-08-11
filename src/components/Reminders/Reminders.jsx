import React, { useState } from 'react';
import {
    Button, Form, Input, Select, DatePicker, Modal,
    Card, Tag, Popconfirm, Empty, Spin, message, Row, Col, Typography
} from 'antd';
import { PlusOutlined, DeleteOutlined, BellOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    useGetRemindersQuery,
    useCreateReminderMutation,
    useDeleteReminderMutation,
} from '../../redux/api/reminderApi';

const { Option } = Select;
const { Title, Text } = Typography;

const TYPE_COLORS = { medicine: 'blue', checkup: 'green', appointment: 'purple' };

const Reminders = () => {
    const [form] = Form.useForm();
    const [modalOpen, setModalOpen] = useState(false);

    const { data: remindersData, isLoading } = useGetRemindersQuery();
    const [createReminder, { isLoading: creating }] = useCreateReminderMutation();
    const [deleteReminder] = useDeleteReminderMutation();

    const reminders = remindersData?.data ?? [];

    const handleCreate = async (values) => {
        try {
            const payload = {
                ...values,
                startDate: values.startDate.toISOString(),
                endDate: values.endDate ? values.endDate.toISOString() : undefined,
            };
            await createReminder(payload).unwrap();
            message.success('Reminder created — you will receive an email notification.');
            form.resetFields();
            setModalOpen(false);
        } catch {
            message.error('Failed to create reminder. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteReminder(id).unwrap();
            message.success('Reminder deleted.');
        } catch {
            message.error('Failed to delete reminder.');
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Title level={5} style={{ margin: 0 }}>
                    <BellOutlined className="me-2" />
                    My Reminders
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalOpen(true)}
                >
                    Add Reminder
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-4"><Spin /></div>
            ) : reminders.length === 0 ? (
                <Empty description="No reminders yet. Add one to get email notifications." />
            ) : (
                <Row gutter={[16, 16]}>
                    {reminders.map((r) => (
                        <Col xs={24} sm={12} lg={8} key={r.id}>
                            <Card
                                size="small"
                                extra={
                                    <Popconfirm
                                        title="Delete this reminder?"
                                        onConfirm={() => handleDelete(r.id)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button danger size="small" icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                }
                            >
                                <div className="d-flex align-items-start gap-2 mb-2">
                                    <BellOutlined style={{ color: '#1677ff', marginTop: 3 }} />
                                    <div>
                                        <Text strong>{r.title}</Text>
                                        {r.description && (
                                            <p className="form-text mb-1">{r.description}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="d-flex flex-wrap gap-1 mb-2">
                                    <Tag color={TYPE_COLORS[r.type] ?? 'default'}>{r.type}</Tag>
                                    <Tag color="orange">{r.frequency}</Tag>
                                </div>
                                <div className="d-flex align-items-center gap-1">
                                    <ClockCircleOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {dayjs(r.startDate).format('MMM D, YYYY h:mm A')}
                                    </Text>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            <Modal
                title="New Reminder"
                open={modalOpen}
                onCancel={() => { setModalOpen(false); form.resetFields(); }}
                footer={null}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter a title' }]}>
                        <Input placeholder="e.g. Take Paracetamol" />
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={2} placeholder="Optional details" />
                    </Form.Item>

                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="type" label="Type" initialValue="medicine" rules={[{ required: true }]}>
                                <Select>
                                    <Option value="medicine">Medicine</Option>
                                    <Option value="checkup">Checkup</Option>
                                    <Option value="appointment">Appointment</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="frequency" label="Frequency" initialValue="once" rules={[{ required: true }]}>
                                <Select>
                                    <Option value="once">Once</Option>
                                    <Option value="daily">Daily</Option>
                                    <Option value="weekly">Weekly</Option>
                                    <Option value="monthly">Monthly</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="startDate" label="Start Date & Time" rules={[{ required: true, message: 'Please select a date' }]}>
                                <DatePicker showTime style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="endDate" label="End Date (optional)">
                                <DatePicker showTime style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2">
                        <Button onClick={() => { setModalOpen(false); form.resetFields(); }}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={creating}>
                            Create Reminder
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default Reminders;
