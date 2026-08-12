import React, { useMemo, useState } from 'react';
import {
    Alert, Badge, Button, Card, Col, Empty, Row, Segmented, Space, Spin, Statistic, Tag,
    Typography, message, Popconfirm,
} from 'antd';
import {
    BellOutlined, CheckCircleOutlined, CloseOutlined, ExclamationCircleOutlined,
    BulbOutlined, CalendarOutlined, HeartOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    useGetHealthInsightsQuery,
    useGetInsightSummaryQuery,
    useUpdateInsightMutation,
    useAcceptInsightReminderMutation,
} from '../../redux/api/medicalRecordApi';

const { Title, Text, Paragraph } = Typography;

const SEVERITY_COLOR = {
    critical: '#cf1322',
    high: '#d4380d',
    moderate: '#d46b08',
    low: '#1677ff',
    info: '#8c8c8c',
};

const SEVERITY_TAG = {
    critical: 'red',
    high: 'volcano',
    moderate: 'orange',
    low: 'blue',
    info: 'default',
};

const TYPE_ICON = {
    alert: <ExclamationCircleOutlined />,
    suggestion: <BulbOutlined />,
    followup: <CalendarOutlined />,
    reminder: <BellOutlined />,
};

const InsightCard = ({ insight, onAccept, onDismiss, accepting }) => {
    const reminder = insight.suggestedReminder;
    const isDismissed = insight.status === 'dismissed';
    const isAccepted = insight.status === 'accepted';

    return (
        <Card
            size="small"
            style={{
                borderLeft: `4px solid ${SEVERITY_COLOR[insight.severity] ?? '#8c8c8c'}`,
                opacity: isDismissed ? 0.55 : 1,
            }}
        >
            <div className="d-flex justify-content-between align-items-start gap-2">
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Space size={6} wrap>
                        <Text strong style={{ fontSize: 15 }}>
                            {TYPE_ICON[insight.type]} {insight.title}
                        </Text>
                        <Tag color={SEVERITY_TAG[insight.severity] ?? 'default'}>{insight.severity}</Tag>
                        {insight.category && <Tag>{insight.category}</Tag>}
                        {isAccepted && <Tag color="green" icon={<CheckCircleOutlined />}>Reminder set</Tag>}
                    </Space>

                    <Paragraph style={{ marginTop: 8, marginBottom: 8 }}>{insight.message}</Paragraph>

                    {insight.record && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            From: {insight.record.title}
                            {insight.record.date ? ` · ${dayjs(insight.record.date).format('MMM D, YYYY')}` : ''}
                        </Text>
                    )}

                    {reminder && !isAccepted && (
                        <Alert
                            className="mt-2"
                            type="info"
                            style={{ padding: '6px 10px' }}
                            message={
                                <Text style={{ fontSize: 13 }}>
                                    <BellOutlined /> Suggested reminder: <strong>{reminder.title}</strong>
                                    {reminder.frequency ? ` — ${reminder.frequency}` : ''}
                                    {Number.isFinite(reminder.startOffsetDays)
                                        ? `, starting in ${reminder.startOffsetDays} day(s)`
                                        : ''}
                                </Text>
                            }
                        />
                    )}
                </div>
            </div>

            {!isDismissed && (
                <div className="d-flex justify-content-end gap-2 mt-2">
                    {reminder && !isAccepted && (
                        <Button
                            type="primary"
                            size="small"
                            icon={<BellOutlined />}
                            loading={accepting}
                            onClick={() => onAccept(insight.id)}
                        >
                            Set this reminder
                        </Button>
                    )}
                    <Popconfirm title="Dismiss this insight?" onConfirm={() => onDismiss(insight.id)} okText="Yes" cancelText="No">
                        <Button size="small" icon={<CloseOutlined />}>Dismiss</Button>
                    </Popconfirm>
                </div>
            )}
        </Card>
    );
};

/** Feed of AI-derived alerts, suggestions and reminder proposals from a patient's reports. */
const HealthInsights = () => {
    const [filter, setFilter] = useState('active');

    const { data: insightsData, isLoading } = useGetHealthInsightsQuery(undefined);
    const { data: summaryData } = useGetInsightSummaryQuery();
    const [updateInsight] = useUpdateInsightMutation();
    const [acceptReminder, { isLoading: accepting }] = useAcceptInsightReminderMutation();

    const insights = insightsData?.data ?? [];
    const summary = summaryData?.data ?? {};

    const visible = useMemo(() => {
        if (filter === 'all') return insights;
        if (filter === 'dismissed') return insights.filter((i) => i.status === 'dismissed');
        if (filter === 'alerts') return insights.filter((i) => i.type === 'alert' && i.status !== 'dismissed');
        return insights.filter((i) => i.status !== 'dismissed');
    }, [insights, filter]);

    const handleAccept = async (id) => {
        try {
            await acceptReminder(id).unwrap();
            message.success('Reminder created — you will be emailed when it is due.');
        } catch (err) {
            message.error(err?.response?.data?.message || 'Could not create the reminder.');
        }
    };

    const handleDismiss = async (id) => {
        try {
            await updateInsight({ id, status: 'dismissed' }).unwrap();
            message.success('Insight dismissed.');
        } catch {
            message.error('Could not dismiss this insight.');
        }
    };

    if (isLoading) {
        return <div className="text-center py-5"><Spin size="large" /></div>;
    }

    return (
        <div>
            <Row gutter={[16, 16]} className="mb-3">
                <Col xs={12} md={6}>
                    <Card size="small">
                        <Statistic title="Reports analyzed" value={summary.analyzedRecords ?? 0} prefix={<HeartOutlined />} />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card size="small">
                        <Statistic title="Total insights" value={summary.total ?? 0} prefix={<BulbOutlined />} />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card size="small">
                        <Statistic title="Unread" value={summary.unread ?? 0} valueStyle={{ color: '#1677ff' }} />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card size="small">
                        <Statistic
                            title="Needs attention"
                            value={summary.critical ?? 0}
                            valueStyle={{ color: summary.critical ? '#cf1322' : undefined }}
                            prefix={<ExclamationCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <Title level={5} style={{ margin: 0 }}>
                    <BellOutlined className="me-2" />
                    Health Insights & Alerts
                </Title>
                <Segmented
                    value={filter}
                    onChange={setFilter}
                    options={[
                        { label: 'Active', value: 'active' },
                        { label: 'Alerts', value: 'alerts' },
                        { label: 'Dismissed', value: 'dismissed' },
                        { label: 'All', value: 'all' },
                    ]}
                />
            </div>

            {visible.length === 0 ? (
                <Empty
                    description={
                        insights.length === 0
                            ? 'No insights yet. Upload a lab report or prescription and the AI will analyse it automatically.'
                            : 'Nothing in this view.'
                    }
                />
            ) : (
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    {visible.map((insight) => (
                        <InsightCard
                            key={insight.id}
                            insight={insight}
                            onAccept={handleAccept}
                            onDismiss={handleDismiss}
                            accepting={accepting}
                        />
                    ))}
                </Space>
            )}
        </div>
    );
};

export default HealthInsights;
