import React, { useRef, useState } from 'react';
import {
    Button, Card, Tag, Popconfirm, Empty, Spin,
    message, Select, Typography, Row, Col, Tooltip
} from 'antd';
import {
    UploadOutlined, DeleteOutlined, EyeOutlined,
    DownloadOutlined, FileOutlined, MedicineBoxOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    useGetMedicalRecordsQuery,
    useUploadMedicalRecordMutation,
    useDeleteMedicalRecordMutation,
} from '../../redux/api/medicalRecordApi';

const { Option } = Select;
const { Title, Text } = Typography;

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
    const [category, setCategory] = useState('Other');

    const { data: recordsData, isLoading } = useGetMedicalRecordsQuery();
    const [uploadRecord, { isLoading: uploading }] = useUploadMedicalRecordMutation();
    const [deleteRecord] = useDeleteMedicalRecordMutation();

    const records = recordsData?.data ?? [];

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);
        formData.append('description', 'Uploaded medical record');
        formData.append('date', new Date().toISOString());
        formData.append('category', category);

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

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <Title level={5} style={{ margin: 0 }}>
                    <MedicineBoxOutlined className="me-2" />
                    Medical Records
                </Title>
                <div className="d-flex align-items-center gap-2">
                    <Select
                        value={category}
                        onChange={setCategory}
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

            <Text type="secondary" style={{ fontSize: 12 }}>
                Supported: PDF, DOC, DOCX, JPG, PNG
            </Text>

            <div className="mt-3">
                {isLoading ? (
                    <div className="text-center py-4"><Spin /></div>
                ) : records.length === 0 ? (
                    <Empty description="No medical records yet. Upload your first document." />
                ) : (
                    <Row gutter={[16, 16]}>
                        {records.map((record) => (
                            <Col xs={24} sm={12} lg={8} key={record.id}>
                                <Card
                                    size="small"
                                    hoverable
                                    onClick={() => handleView(record.fileUrl)}
                                    extra={
                                        <Popconfirm
                                            title="Delete this record?"
                                            onConfirm={(e) => { e.stopPropagation(); handleDelete(record.id); }}
                                            onCancel={(e) => e.stopPropagation()}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <Button
                                                danger size="small"
                                                icon={<DeleteOutlined />}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </Popconfirm>
                                    }
                                >
                                    <div className="d-flex align-items-start gap-2 mb-2">
                                        <FileOutlined style={{ fontSize: 24, color: '#1677ff', marginTop: 2 }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <Text
                                                strong
                                                style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                title={record.title}
                                            >
                                                {record.title}
                                            </Text>
                                            {record.description && (
                                                <p className="form-text mb-1">{record.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <Tag color={CATEGORY_COLORS[record.category] ?? 'default'}>
                                            {record.category}
                                        </Tag>
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            {dayjs(record.date).format('MMM D, YYYY')}
                                        </Text>
                                    </div>
                                    <div className="d-flex gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
                                        <Tooltip title="View">
                                            <Button
                                                size="small" icon={<EyeOutlined />}
                                                onClick={() => handleView(record.fileUrl)}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Download">
                                            <Button
                                                size="small" icon={<DownloadOutlined />}
                                                onClick={() => handleDownload(record.fileUrl, record.title)}
                                            />
                                        </Tooltip>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </div>
    );
};

export default MedicalRecords;
