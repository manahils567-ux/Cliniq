import React from 'react';
import {
    Alert, Card, Col, Descriptions, Empty, Row, Spin, Table, Tag, Typography, Divider,
} from 'antd';
import {
    ExperimentOutlined, WarningOutlined, BulbOutlined, FileTextOutlined,
} from '@ant-design/icons';
import { useGetRecordAnalysisQuery } from '../../redux/api/medicalRecordApi';

const { Title, Text, Paragraph } = Typography;

export const METRIC_STATUS_COLORS = {
    normal: 'green',
    low: 'orange',
    high: 'orange',
    critical: 'red',
    unknown: 'default',
};

export const DOC_TYPE_LABELS = {
    lab_report: 'Lab Report',
    prescription: 'Prescription',
    imaging: 'Imaging / Radiology',
    discharge_summary: 'Discharge Summary',
    vaccination: 'Vaccination',
    other: 'Other Document',
};

const StringList = ({ items, icon, emptyText }) => {
    if (!items || items.length === 0) {
        return <Text type="secondary">{emptyText}</Text>;
    }
    return (
        <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
            {items.map((item, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                    {icon} {item}
                </li>
            ))}
        </ul>
    );
};

/** Renders the stored AI analysis for a single medical record. */
const RecordAnalysisView = ({ recordId }) => {
    const { data, isLoading, isError } = useGetRecordAnalysisQuery(recordId, { skip: !recordId });
    const analysis = data?.data;

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <Spin size="large" />
                <p className="mt-3 text-muted">Loading analysis…</p>
            </div>
        );
    }

    if (isError || !analysis) {
        return <Empty description="No analysis available for this document yet." />;
    }

    if (analysis.status === 'failed') {
        return (
            <Alert
                type="warning"
                showIcon
                message="Analysis could not be completed"
                description={
                    analysis.errorCode === 'SERVICE_UNAVAILABLE'
                        ? 'The AI service is not configured. Check that GEMINI_API_KEY is set on the server.'
                        : 'The document could not be read. Try re-uploading a clearer photo or scan.'
                }
            />
        );
    }

    const metrics = analysis.metrics ?? [];
    const abnormal = metrics.filter((m) => m.status !== 'normal' && m.status !== 'unknown');

    const columns = [
        {
            title: 'Measurement',
            dataIndex: 'name',
            key: 'name',
            render: (name) => <Text strong>{name}</Text>,
        },
        {
            title: 'Value',
            key: 'value',
            render: (_, r) => (
                <span>
                    {r.value} {r.unit ? <Text type="secondary">{r.unit}</Text> : null}
                </span>
            ),
        },
        {
            title: 'Reference Range',
            dataIndex: 'referenceRange',
            key: 'referenceRange',
            render: (v) => v || <Text type="secondary">—</Text>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={METRIC_STATUS_COLORS[status] ?? 'default'}>{String(status).toUpperCase()}</Tag>
            ),
        },
    ];

    return (
        <div>
            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <Card size="small">
                        <Descriptions size="small" column={{ xs: 1, sm: 2 }}>
                            <Descriptions.Item label="Document type">
                                <Tag color="blue">{DOC_TYPE_LABELS[analysis.documentType] ?? analysis.documentType}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Measurements found">{metrics.length}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                {abnormal.length > 0 && (
                    <Col xs={24}>
                        <Alert
                            type={abnormal.some((m) => m.status === 'critical') ? 'error' : 'warning'}
                            showIcon
                            message={`${abnormal.length} value${abnormal.length > 1 ? 's' : ''} outside the normal range`}
                            description={abnormal.map((m) => `${m.name} (${m.value}${m.unit ? ' ' + m.unit : ''})`).join(', ')}
                        />
                    </Col>
                )}

                <Col xs={24}>
                    <Card size="small" title={<span><FileTextOutlined /> What this document says</span>}>
                        {analysis.plainSummary && (
                            <Paragraph style={{ fontSize: 15, lineHeight: 1.7 }}>{analysis.plainSummary}</Paragraph>
                        )}
                        {analysis.summary && analysis.summary !== analysis.plainSummary && (
                            <>
                                <Divider style={{ margin: '12px 0' }} />
                                <Text type="secondary" style={{ fontSize: 12 }}>CLINICAL SUMMARY</Text>
                                <Paragraph style={{ marginTop: 6 }}>{analysis.summary}</Paragraph>
                            </>
                        )}
                    </Card>
                </Col>

                {metrics.length > 0 && (
                    <Col xs={24}>
                        <Card size="small" title={<span><ExperimentOutlined /> Extracted measurements</span>}>
                            <Table
                                size="small"
                                rowKey="id"
                                dataSource={metrics}
                                columns={columns}
                                pagination={false}
                                scroll={{ x: 'max-content' }}
                                rowClassName={(r) => (r.status === 'critical' ? 'ant-table-row-critical' : '')}
                            />
                        </Card>
                    </Col>
                )}

                <Col xs={24} md={12}>
                    <Card size="small" title={<span><WarningOutlined /> Points of attention</span>} style={{ height: '100%' }}>
                        <StringList
                            items={analysis.concerns}
                            icon="⚠️"
                            emptyText="Nothing in this document was flagged for attention."
                        />
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card size="small" title={<span><BulbOutlined /> Suggestions</span>} style={{ height: '100%' }}>
                        <StringList items={analysis.suggestions} icon="💡" emptyText="No suggestions were generated." />
                    </Card>
                </Col>

                {analysis.findings?.length > 0 && (
                    <Col xs={24}>
                        <Card size="small" title="Findings">
                            <StringList items={analysis.findings} icon="•" emptyText="No findings recorded." />
                        </Card>
                    </Col>
                )}
            </Row>

            <Alert
                className="mt-3"
                type="info"
                showIcon
                message="This is an AI-generated reading, not a medical diagnosis."
                description="Always confirm these results with your doctor before acting on them."
            />
        </div>
    );
};

export default RecordAnalysisView;
