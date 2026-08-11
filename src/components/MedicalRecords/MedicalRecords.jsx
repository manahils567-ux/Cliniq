import React, { useRef, useState, useMemo } from 'react';
import {
    Button, Card, Tag, Popconfirm, Empty, Spin,
    message, Select, Typography, Row, Col, Tooltip,
    Input, Modal, Checkbox, Space, Tabs
} from 'antd';
import {
    UploadOutlined, DeleteOutlined, EyeOutlined,
    DownloadOutlined, FileOutlined, MedicineBoxOutlined,
    RobotOutlined, ShareAltOutlined, SearchOutlined, ScanOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    useGetMedicalRecordsQuery,
    useUploadMedicalRecordMutation,
    useDeleteMedicalRecordMutation,
    useGenerateMedicalHistoryMutation,
    useShareMedicalRecordsMutation,
} from '../../redux/api/medicalRecordApi';
import { useGetPatientAppointmentsQuery } from '../../redux/api/appointmentApi';
import PrescriptionScanner from './PrescriptionScanner';

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

    // Queries & Mutations
    const { data: recordsData, isLoading } = useGetMedicalRecordsQuery();
    const { data: appointmentsData, isLoading: isLoadingAppointments } = useGetPatientAppointmentsQuery();
    const [uploadRecord, { isLoading: uploading }] = useUploadMedicalRecordMutation();
    const [deleteRecord] = useDeleteMedicalRecordMutation();
    const [generateMedicalHistory, { isLoading: generatingHistory }] = useGenerateMedicalHistoryMutation();
    const [shareMedicalRecords, { isLoading: sharingRecords }] = useShareMedicalRecordsMutation();

    const records = recordsData?.data ?? [];
    const appointments = appointmentsData ?? [];

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
            await uploadRecord(formData).unwrap();
            message.success('File uploaded successfully.');
        } catch {
            message.error('Upload failed. Please check your Cloudinary settings.');
        } finally {
            e.target.value = '';
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
                                style={{ borderColor: '#722ed1', color: '#722ed1', fontWeight: 500 }}
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
                    <Card size="small" style={{ marginBottom: 16, backgroundColor: '#fafafa' }}>
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
                                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
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
                                            <Card
                                                size="small"
                                                hoverable
                                                style={{
                                                    border: isSelected ? '2px solid #1677ff' : undefined,
                                                    backgroundColor: isSelected ? '#e6f4ff' : undefined,
                                                }}
                                                onClick={() => handleView(record.fileUrl)}
                                                extra={
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
                                                }
                                            >
                                                <div className="d-flex align-items-start gap-2 mb-2">
                                                    <FileOutlined style={{ fontSize: 24, color: '#1677ff', marginTop: 2 }} />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <Text strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={record.title}>
                                                            {record.title}
                                                        </Text>
                                                        {record.description && <p className="form-text mb-1">{record.description}</p>}
                                                    </div>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <Tag color={CATEGORY_COLORS[record.category] ?? 'default'}>{record.category}</Tag>
                                                    <Text type="secondary" style={{ fontSize: 11 }}>{dayjs(record.date).format('MMM D, YYYY')}</Text>
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
                                            </Card>
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
            key: 'scanner',
            label: <span><ScanOutlined /> Prescription Scanner</span>,
            children: <PrescriptionScanner />,
        },
    ];

    return (
        <div>
            <Tabs defaultActiveKey="records" items={tabItems} />

            {/* AI Medical History Modal */}
            <Modal
                title={
                    <span>
                        <RobotOutlined style={{ color: '#722ed1', marginRight: 8 }} />
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

            {/* Share with Doctor Modal */}
            <Modal
                title={
                    <span>
                        <ShareAltOutlined style={{ color: '#1677ff', marginRight: 8 }} />
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
