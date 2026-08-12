import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
    Button, Card, Tag, Popconfirm, Empty, Spin,
    message, Select, Typography, Row, Col, Tooltip,
    Input, Modal, Checkbox, Space, Tabs
} from 'antd';
import {
    UploadOutlined, DeleteOutlined, EyeOutlined,
    DownloadOutlined, FileOutlined, MedicineBoxOutlined,
    RobotOutlined, ShareAltOutlined, SearchOutlined, ScanOutlined,
    ExperimentOutlined, BellOutlined, ReloadOutlined, LoadingOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    useGetMedicalRecordsQuery,
    useUploadMedicalRecordMutation,
    useDeleteMedicalRecordMutation,
    useGenerateMedicalHistoryMutation,
    useShareMedicalRecordsMutation,
    useReanalyzeRecordMutation,
    useGetInsightSummaryQuery,
} from '../../redux/api/medicalRecordApi';
import { useGetPatientAppointmentsQuery } from '../../redux/api/appointmentApi';
import PrescriptionScanner from './PrescriptionScanner';
import RecordAnalysisView from './RecordAnalysisView';
import HealthInsights from './HealthInsights';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const CATEGORIES = ['Prescription', 'Lab Report', 'Vaccination', 'Surgery', 'Other'];

const CATEGORY_COLORS = {
    'Prescription': 'blue',
    'Lab Report': 'cyan',
    'Vaccination': 'green',
    'Surgery': 'red',
    'Other': 'default',
};

/**
 * A slip gets the amber binding rule only when its analysis produced something
 * actionable. Amber stays rare so a wall of slips reads at a glance.
 */
const recordHasFollowUp = (record) =>
    record?.analysisStatus === 'completed' && (record?.analysis?._count?.insights ?? 0) > 0;

const MedicalRecords = () => {
    const fileInputRef = useRef(null);
    const [uploadCategory, setUploadCategory] = useState('Other');

    // Search, Filter & Sort states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = Newest first, 'asc' = Oldest first

    // Record Selection & Sharing states
    const [selectedRecordIds, setSelectedRecordIds] = useState([]);
    const [shareModalVisible, setShareModalVisible] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

    // AI Medical History states
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [generatedHistory, setGeneratedHistory] = useState('');

    // AI document analysis states
    const [analysisRecord, setAnalysisRecord] = useState(null);
    const [activeTab, setActiveTab] = useState('records');

    // Queries & Mutations. Poll while any record is still being analysed so the
    // card flips from "Analyzing…" to a result without a manual refresh.
    const [pollingInterval, setPollingInterval] = useState(0);
    const { data: recordsData, isLoading } = useGetMedicalRecordsQuery(undefined, { pollingInterval });
    const { data: insightSummaryData } = useGetInsightSummaryQuery();
    const [reanalyzeRecord, { isLoading: reanalyzing }] = useReanalyzeRecordMutation();
    const { data: appointmentsData, isLoading: isLoadingAppointments } = useGetPatientAppointmentsQuery();
    const [uploadRecord, { isLoading: uploading }] = useUploadMedicalRecordMutation();
    const [deleteRecord] = useDeleteMedicalRecordMutation();
    const [generateMedicalHistory, { isLoading: generatingHistory }] = useGenerateMedicalHistoryMutation();
    const [shareMedicalRecords, { isLoading: sharingRecords }] = useShareMedicalRecordsMutation();

    const records = recordsData?.data ?? [];
    const appointments = appointmentsData ?? [];
    const insightSummary = insightSummaryData?.data ?? {};

    // Keep polling only while something is actually in flight.
    const pendingAnalysisCount = useMemo(
        () => records.filter((r) => r.analysisStatus === 'pending' || r.analysisStatus === 'processing').length,
        [records]
    );

    useEffect(() => {
        setPollingInterval(pendingAnalysisCount > 0 ? 4000 : 0);
    }, [pendingAnalysisCount]);

    // Filter and sort records
    const filteredRecords = useMemo(() => {
        let list = [...records];

        if (selectedCategory !== 'ALL') {
            list = list.filter((r) => r.category === selectedCategory);
        }

        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase().trim();
            list = list.filter((r) =>
                (r.title && r.title.toLowerCase().includes(query)) ||
                (r.description && r.description.toLowerCase().includes(query)) ||
                (r.category && r.category.toLowerCase().includes(query))
            );
        }

        list.sort((a, b) => {
            const dateA = dayjs(a.date || a.createdAt);
            const dateB = dayjs(b.date || b.createdAt);
            return sortOrder === 'desc' ? dateB.valueOf() - dateA.valueOf() : dateA.valueOf() - dateB.valueOf();
        });

        return list;
    }, [records, selectedCategory, searchTerm, sortOrder]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);
        formData.append('description', 'Uploaded medical record');
        formData.append('date', new Date().toISOString());
        formData.append('category', uploadCategory);

        try {
            const res = await uploadRecord(formData).unwrap();
            const willAnalyze = res?.data?.analysisStatus === 'pending';
            message.success(
                willAnalyze
                    ? 'Uploaded. AI is analysing this document now — results will appear shortly.'
                    : 'File uploaded successfully.'
            );
        } catch {
            message.error('Upload failed. Please check your Cloudinary settings.');
        } finally {
            e.target.value = '';
        }
    };

    const handleReanalyze = async (id) => {
        try {
            await reanalyzeRecord(id).unwrap();
            message.success('Document re-analysed.');
        } catch {
            message.error('Re-analysis failed. The stored file may be unreadable.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteRecord(id).unwrap();
            setSelectedRecordIds((prev) => prev.filter((rId) => rId !== id));
            message.success('Record deleted.');
        } catch {
            message.error('Failed to delete record.');
        }
    };

    const handleView = (fileUrl) => {
        window.open(fileUrl, '_blank');
    };

    const handleDownload = async (fileUrl, title) => {
        try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', title);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            message.error('Download failed.');
        }
    };

    // AI Medical History Handler
    const handleGenerateHistory = async () => {
        setHistoryModalVisible(true);
        setGeneratedHistory('');
        try {
            const res = await generateMedicalHistory().unwrap();
            setGeneratedHistory(res?.data?.summary || 'No summary generated.');
        } catch (err) {
            message.error('Failed to generate medical history summary.');
            setGeneratedHistory('An error occurred while generating your medical history. Please try again.');
        }
    };

    // Record Selection Handlers
    const handleSelectRecord = (id, checked) => {
        if (checked) {
            setSelectedRecordIds((prev) => [...prev, id]);
        } else {
            setSelectedRecordIds((prev) => prev.filter((item) => item !== id));
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedRecordIds(filteredRecords.map((r) => r.id));
        } else {
            setSelectedRecordIds([]);
        }
    };

    // Share Handler
    const handleShareSubmit = async () => {
        if (!selectedAppointmentId) {
            message.warning('Please select an appointment/doctor to share with.');
            return;
        }
        try {
            await shareMedicalRecords({
                recordIds: selectedRecordIds,
                appointmentId: selectedAppointmentId,
            }).unwrap();
            message.success('Medical records shared successfully with doctor!');
            setShareModalVisible(false);
            setSelectedRecordIds([]);
            setSelectedAppointmentId(null);
        } catch {
            message.error('Failed to share medical records.');
        }
    };

    const tabItems = [
        {
            key: 'records',
            label: <span><MedicineBoxOutlined /> My Records</span>,
            children: (
                <div>
                    {/* Header section */}
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <Title level={5} style={{ margin: 0 }}>
                            <MedicineBoxOutlined className="me-2" />
                            Medical Records & Reports
                        </Title>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <Button
                                type="default"
                                style={{ borderColor: 'var(--c-accent)', color: 'var(--c-accent)', fontWeight: 500 }}
                                icon={<RobotOutlined />}
                                onClick={handleGenerateHistory}
                            >
                                Generate Medical History
                            </Button>
                            <Select
                                value={uploadCategory}
                                onChange={setUploadCategory}
                                style={{ width: 140 }}
                                disabled={uploading}
                            >
                                {CATEGORIES.map((c) => (
                                    <Option key={c} value={c}>{c}</Option>
                                ))}
                            </Select>
                            <Button
                                type="primary"
                                icon={<UploadOutlined />}
                                loading={uploading}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {uploading ? 'Uploading…' : 'Upload File'}
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    {/* Toolbar */}
                    <Card size="small" style={{ marginBottom: 16, backgroundColor: 'var(--c-bg)' }}>
                        <Row gutter={[12, 12]} align="middle">
                            <Col xs={24} sm={10} md={8}>
                                <Input
                                    placeholder="Search by title, notes, type..."
                                    prefix={<SearchOutlined />}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    allowClear
                                />
                            </Col>
                            <Col xs={12} sm={7} md={5}>
                                <Select style={{ width: '100%' }} value={selectedCategory} onChange={setSelectedCategory}>
                                    <Option value="ALL">All Categories</Option>
                                    {CATEGORIES.map((c) => (<Option key={c} value={c}>{c}</Option>))}
                                </Select>
                            </Col>
                            <Col xs={12} sm={7} md={5}>
                                <Select style={{ width: '100%' }} value={sortOrder} onChange={setSortOrder}>
                                    <Option value="desc">Newest First</Option>
                                    <Option value="asc">Oldest First</Option>
                                </Select>
                            </Col>
                            <Col xs={24} md={6} style={{ textAlign: 'right' }}>
                                {selectedRecordIds.length > 0 && (
                                    <Button
                                        type="primary"
                                        style={{ backgroundColor: 'var(--c-positive)', borderColor: 'var(--c-positive)' }}
                                        icon={<ShareAltOutlined />}
                                        onClick={() => setShareModalVisible(true)}
                                    >
                                        Share ({selectedRecordIds.length}) with Doctor
                                    </Button>
                                )}
                            </Col>
                        </Row>
                    </Card>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <Text type="secondary" style={{ fontSize: 12 }}>Supported: PDF, DOC, DOCX, JPG, PNG</Text>
                        {filteredRecords.length > 0 && (
                            <Checkbox
                                checked={selectedRecordIds.length === filteredRecords.length && filteredRecords.length > 0}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                            >
                                Select All Filtered ({filteredRecords.length})
                            </Checkbox>
                        )}
                    </div>

                    {/* Records Grid */}
                    <div className="mt-2">
                        {isLoading ? (
                            <div className="text-center py-4"><Spin /></div>
                        ) : filteredRecords.length === 0 ? (
                            <Empty description={records.length === 0 ? "No medical records yet. Upload your first document." : "No records match your search/filter criteria."} />
                        ) : (
                            <Row gutter={[16, 16]}>
                                {filteredRecords.map((record) => {
                                    const isSelected = selectedRecordIds.includes(record.id);
                                    return (
                                        <Col xs={24} sm={12} lg={8} key={record.id}>
                                            <article
                                                className={`cq-slip${recordHasFollowUp(record) ? ' cq-slip--due' : ''}`}
                                                style={{
                                                    height: '100%',
                                                    cursor: 'pointer',
                                                    outline: isSelected ? '2px solid var(--c-ink)' : undefined,
                                                }}
                                                onClick={() => handleView(record.fileUrl)}
                                            >
                                                <div className="d-flex justify-content-between align-items-start gap-2">
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div className="cq-slip__type">{record.category}</div>
                                                        <div
                                                            className="cq-slip__title"
                                                            style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                            title={record.title}
                                                        >
                                                            {record.title}
                                                        </div>
                                                    </div>
                                                    <Space onClick={(e) => e.stopPropagation()}>
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onChange={(e) => handleSelectRecord(record.id, e.target.checked)}
                                                        />
                                                        <Popconfirm
                                                            title="Delete this record?"
                                                            onConfirm={(e) => { e.stopPropagation(); handleDelete(record.id); }}
                                                            onCancel={(e) => e.stopPropagation()}
                                                            okText="Yes" cancelText="No"
                                                        >
                                                            <Button danger size="small" icon={<DeleteOutlined />} />
                                                        </Popconfirm>
                                                    </Space>
                                                </div>

                                                <div className="cq-slip__meta d-flex justify-content-between align-items-center">
                                                    <span>{dayjs(record.date).format('MMM D, YYYY')}</span>
                                                    {recordHasFollowUp(record) && <span className="cq-due">Follow-up</span>}
                                                </div>

                                                {/* AI analysis status */}
                                                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                                    {(record.analysisStatus === 'pending' || record.analysisStatus === 'processing') && (
                                                        <Tag icon={<LoadingOutlined />} color="processing">AI analysing…</Tag>
                                                    )}
                                                    {record.analysisStatus === 'failed' && (
                                                        <Space size={4}>
                                                            <Tag color="warning">Analysis failed</Tag>
                                                            <Button size="small" type="link" icon={<ReloadOutlined />}
                                                                loading={reanalyzing}
                                                                onClick={() => handleReanalyze(record.id)}>
                                                                Retry
                                                            </Button>
                                                        </Space>
                                                    )}
                                                    {record.analysisStatus === 'completed' && record.analysis && (
                                                        <div>
                                                            <Space size={4} wrap>
                                                                <Tag color="magenta" icon={<ExperimentOutlined />}>
                                                                    {record.analysis._count?.metrics ?? 0} values
                                                                </Tag>
                                                                {(record.analysis._count?.insights ?? 0) > 0 && (
                                                                    <Tag color="gold" icon={<BellOutlined />}>
                                                                        {record.analysis._count.insights} insight(s)
                                                                    </Tag>
                                                                )}
                                                            </Space>
                                                            {record.analysis.plainSummary && (
                                                                <Paragraph
                                                                    ellipsis={{ rows: 2 }}
                                                                    style={{ fontSize: 12, marginTop: 6, marginBottom: 0, color: 'var(--c-text)' }}
                                                                >
                                                                    {record.analysis.plainSummary}
                                                                </Paragraph>
                                                            )}
                                                            <Button
                                                                size="small"
                                                                type="link"
                                                                style={{ paddingLeft: 0 }}
                                                                onClick={() => setAnalysisRecord(record)}
                                                            >
                                                                View full AI analysis →
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mt-2" onClick={(e) => e.stopPropagation()}>
                                                    <div className="d-flex gap-1">
                                                        <Tooltip title="View"><Button size="small" icon={<EyeOutlined />} onClick={() => handleView(record.fileUrl)} /></Tooltip>
                                                        <Tooltip title="Download"><Button size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(record.fileUrl, record.title)} /></Tooltip>
                                                    </div>
                                                    <Button size="small" type={isSelected ? "primary" : "default"} icon={<ShareAltOutlined />}
                                                        onClick={() => { setSelectedRecordIds([record.id]); setShareModalVisible(true); }}>
                                                        Share
                                                    </Button>
                                                </div>
                                            </article>
                                        </Col>
                                    );
                                })}
                            </Row>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'insights',
            label: (
                <span>
                    <BellOutlined /> Health Insights
                    {insightSummary.unread > 0 && (
                        <Tag color="red" style={{ marginLeft: 6 }}>{insightSummary.unread}</Tag>
                    )}
                </span>
            ),
            children: <HealthInsights onGoToRecords={() => setActiveTab('records')} />,
        },
    ];

    return (
        <div>
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

            {/* AI Medical History Modal */}
            <Modal
                title={
                    <span>
                        <RobotOutlined style={{ color: 'var(--c-accent)', marginRight: 8 }} />
                        AI Medical History Summary
                    </span>
                }
                open={historyModalVisible}
                onCancel={() => setHistoryModalVisible(false)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setHistoryModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={700}
            >
                {generatingHistory ? (
                    <div className="text-center py-5">
                        <Spin size="large" />
                        <p className="mt-3 text-muted">Analyzing your stored medical records context with Gemini AI...</p>
                    </div>
                ) : (
                    <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '8px 0' }}>
                        <Paragraph style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                            {generatedHistory}
                        </Paragraph>
                    </div>
                )}
            </Modal>

            {/* AI Document Analysis Modal */}
            <Modal
                title={
                    <span>
                        <ExperimentOutlined style={{ color: 'var(--c-accent)', marginRight: 8 }} />
                        AI Analysis — {analysisRecord?.title}
                    </span>
                }
                open={!!analysisRecord}
                onCancel={() => setAnalysisRecord(null)}
                footer={[
                    <Button
                        key="reanalyze"
                        icon={<ReloadOutlined />}
                        loading={reanalyzing}
                        onClick={() => handleReanalyze(analysisRecord.id)}
                    >
                        Re-analyse
                    </Button>,
                    <Button key="close" type="primary" onClick={() => setAnalysisRecord(null)}>
                        Close
                    </Button>,
                ]}
                width={900}
                styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
            >
                {analysisRecord && <RecordAnalysisView recordId={analysisRecord.id} />}
            </Modal>

            {/* Share with Doctor Modal */}
            <Modal
                title={
                    <span>
                        <ShareAltOutlined style={{ color: 'var(--c-accent)', marginRight: 8 }} />
                        Share Selected Records with Doctor
                    </span>
                }
                open={shareModalVisible}
                onOk={handleShareSubmit}
                confirmLoading={sharingRecords}
                onCancel={() => setShareModalVisible(false)}
                okText="Share Records"
            >
                <p>Select an appointment/doctor to share <strong>{selectedRecordIds.length}</strong> selected record(s) with:</p>
                {isLoadingAppointments ? (
                    <Spin />
                ) : appointments.length === 0 ? (
                    <Empty description="No appointments found. You need an active appointment to share records." />
                ) : (
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Choose appointment / doctor"
                        value={selectedAppointmentId}
                        onChange={setSelectedAppointmentId}
                    >
                        {appointments.map((apt) => (
                            <Option key={apt.id} value={apt.id}>
                                Dr. {apt.doctor?.firstName ?? ''} {apt.doctor?.lastName ?? ''} ({apt.doctor?.specialization || 'General'}) — {dayjs(apt.scheduleDate).format('MMM D, YYYY')} ({apt.scheduleTime})
                            </Option>
                        ))}
                    </Select>
                )}
            </Modal>
        </div>
    );
};

export default MedicalRecords;
