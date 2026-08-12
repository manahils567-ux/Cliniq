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
    critical: 'var(--c-danger)',
    high: 'var(--c-accent)',
    moderate: 'var(--c-signal)',
    low: 'var(--c-accent)',
    info: 'var(--c-text-muted)',
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
                borderLeft: `4px solid ${SEVERITY_COLOR[insight.severity] ?? 'var(--c-text-muted)'}`,
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
const HealthInsights = ({ onGoToRecords = () => {} }) => {
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
            <div className="cq-stats">
                {[
                    { key: 'analyzed', label: 'Reports analyzed', value: summary.analyzedRecords ?? 0, icon: <HeartOutlined />, tone: 'ink' },
                    { key: 'total',    label: 'Total insights',   value: summary.total ?? 0,           icon: <BulbOutlined />, tone: 'ink' },
                    { key: 'unread',   label: 'Unread',           value: summary.unread ?? 0,          icon: <BellOutlined />, tone: 'accent' },
                    { key: 'critical', label: 'Needs attention',  value: summary.critical ?? 0,        icon: <ExclamationCircleOutlined />, tone: summary.critical ? 'danger' : 'ink' },
                ].map((s) => (
                    <div key={s.key} className="cq-stat">
                        <span className={`cq-stat__icon cq-stat__icon--${s.tone}`}>{s.icon}</span>
                        <div className="cq-stat__label">{s.label}</div>
                        <div className={`cq-stat__value cq-stat__value--${s.tone}`}>{s.value}</div>
                    </div>
                ))}
            </div>

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
                insights.length === 0 ? (
                    <div className="cq-insights-empty">
                        <div className="cq-insights-empty__title">Nothing to review yet</div>
                        <p className="cq-insights-empty__body">
                            Upload a lab report, prescription or discharge summary and it is analysed
                            on arrival. Values outside their reference range are flagged here, with
                            reminders for anything that needs following up.
                        </p>
                        <Button type="primary" icon={<BellOutlined />} onClick={onGoToRecords}>
                            Upload your first document
                        </Button>
                    </div>
                ) : (
                    <Empty description="Nothing in this view." />
                )
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
