import React, { useState, useRef } from 'react';
import {
    Button, Card, Typography, Spin, Empty, Tag,
    Table, message, Upload, Alert, Divider
} from 'antd';
import {
    ScanOutlined, UploadOutlined, MedicineBoxOutlined,
    UserOutlined, CalendarOutlined, FileTextOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5050/api/v1';

const PrescriptionScanner = () => {
    const [scanning, setScanning]     = useState(false);
    const [result, setResult]         = useState(null);
    const [preview, setPreview]       = useState(null);
    const [error, setError]           = useState(null);
    const fileInputRef                = useRef(null);

    const token = localStorage.getItem('accessToken');

    const handleFile = async (file) => {
        // Validate type
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.type)) {
            message.error('Please upload a JPG, PNG or WEBP image of the prescription.');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);

        // Convert to base64 and send
        const toBase64 = (f) => new Promise((resolve, reject) => {
            const r = new FileReader();
            r.readAsDataURL(f);
            r.onload = () => resolve(r.result.split(',')[1]);
            r.onerror = reject;
        });

        setScanning(true);
        setResult(null);
        setError(null);

        try {
            const imageBase64 = await toBase64(file);
            const res = await axios.post(
                `${API_BASE}/ai/scan-prescription`,
                { imageBase64, mimeType: file.type },
                { headers: { Authorization: token, 'Content-Type': 'application/json' } }
            );

            const data = res.data?.data;
            if (!data || data.error) {
                setError('Could not extract prescription data. Please try a clearer image.');
            } else {
                setResult(data);
                if (data.medicines?.length > 0) {
                    message.success(`Found ${data.medicines.length} medicine(s) in the prescription!`);
                } else {
                    message.warning('No medicines detected. Try a clearer image.');
                }
            }
        } catch {
            setError('Scan failed. Please check your connection and try again.');
        } finally {
            setScanning(false);
        }
    };

    const medicineColumns = [
        {
            title: 'Medicine',
            dataIndex: 'name',
            key: 'name',
            render: (v) => <Text strong style={{ color: 'var(--c-accent)' }}>{v || '—'}</Text>,
        },
        {
            title: 'Dosage',
            dataIndex: 'dosage',
            key: 'dosage',
            render: (v) => <Tag color="blue">{v || '—'}</Tag>,
        },
        {
            title: 'Frequency',
            dataIndex: 'frequency',
            key: 'frequency',
            render: (v) => <Tag color="green">{v || '—'}</Tag>,
        },
        {
            title: 'Duration',
            dataIndex: 'duration',
            key: 'duration',
            render: (v) => <Tag color="orange">{v || '—'}</Tag>,
        },
        {
            title: 'Instructions',
            dataIndex: 'instructions',
            key: 'instructions',
            render: (v) => <Text type="secondary">{v || '—'}</Text>,
        },
    ];

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Title level={5} style={{ margin: 0 }}>
                    <ScanOutlined className="me-2" style={{ color: 'var(--c-accent)' }} />
                    AI Prescription Scanner
                </Title>
                <Tag color="purple">Powered by Gemini Vision</Tag>
            </div>

            <Alert
                message="Upload a photo or scan of any prescription — Gemini AI will extract all medicines, dosages, and instructions automatically."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            {/* Upload area */}
            <Card
                style={{
                    border: '2px dashed var(--c-border)',
                    borderRadius: 12,
                    textAlign: 'center',
                    marginBottom: 20,
                    cursor: 'pointer',
                    background: 'var(--c-bg)',
                }}
                onClick={() => !scanning && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); e.target.value = ''; }}
                />
                {scanning ? (
                    <div className="py-4">
                        <Spin size="large" />
                        <p className="mt-3" style={{ color: 'var(--c-accent)', fontWeight: 500 }}>
                            🔍 Gemini is reading your prescription...
                        </p>
                    </div>
                ) : preview ? (
                    <div>
                        <img
                            src={preview}
                            alt="prescription preview"
                            style={{ maxHeight: 220, maxWidth: '100%', borderRadius: 8, marginBottom: 12 }}
                        />
                        <p style={{ color: '#666', fontSize: 13 }}>
                            <UploadOutlined /> Click to scan a different prescription
                        </p>
                    </div>
                ) : (
                    <div className="py-4">
                        <ScanOutlined style={{ fontSize: 48, color: 'var(--c-accent)', marginBottom: 12, display: 'block' }} />
                        <Text strong style={{ fontSize: 16 }}>Click to upload prescription</Text>
                        <p style={{ color: '#999', marginTop: 4, fontSize: 13 }}>
                            JPG, PNG or WEBP — photo of a handwritten or printed prescription
                        </p>
                        <Button type="primary" icon={<UploadOutlined />} style={{ marginTop: 8 }}>
                            Choose Image
                        </Button>
                    </div>
                )}
            </Card>

            {/* Error */}
            {error && (
                <Alert type="error" message={error} showIcon closable onClose={() => setError(null)} style={{ marginBottom: 16 }} />
            )}

            {/* Results */}
            {result && (
                <div>
                    {/* Prescription meta info */}
                    <Card size="small" style={{ marginBottom: 16, background: 'var(--c-accent-wash)', border: '1px solid var(--c-accent-line)' }}>
                        <div className="d-flex flex-wrap gap-3">
                            {result.doctorName && (
                                <div>
                                    <UserOutlined style={{ color: 'var(--c-accent)', marginRight: 6 }} />
                                    <Text strong>Doctor: </Text>
                                    <Text>{result.doctorName}</Text>
                                </div>
                            )}
                            {result.patientName && (
                                <div>
                                    <UserOutlined style={{ color: 'var(--c-accent)', marginRight: 6 }} />
                                    <Text strong>Patient: </Text>
                                    <Text>{result.patientName}</Text>
                                </div>
                            )}
                            {result.date && (
                                <div>
                                    <CalendarOutlined style={{ color: 'var(--c-positive)', marginRight: 6 }} />
                                    <Text strong>Date: </Text>
                                    <Text>{result.date}</Text>
                                </div>
                            )}
                            {result.diagnosis && (
                                <div>
                                    <MedicineBoxOutlined style={{ color: 'var(--c-signal)', marginRight: 6 }} />
                                    <Text strong>Diagnosis: </Text>
                                    <Text>{result.diagnosis}</Text>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Medicines table */}
                    <Title level={5}>
                        <MedicineBoxOutlined style={{ color: 'var(--c-positive)', marginRight: 8 }} />
                        Extracted Medicines ({result.medicines?.length || 0})
                    </Title>

                    {result.medicines?.length > 0 ? (
                        <Table
                            dataSource={result.medicines.map((m, i) => ({ ...m, key: i }))}
                            columns={medicineColumns}
                            pagination={false}
                            size="small"
                            style={{ marginBottom: 16 }}
                        />
                    ) : (
                        <Empty description="No medicines detected in this prescription." />
                    )}

                    {/* Raw extracted text */}
                    {result.rawText && (
                        <>
                            <Divider />
                            <div>
                                <Text strong><FileTextOutlined className="me-2" />Raw Extracted Text</Text>
                                <Card size="small" style={{ marginTop: 8, background: 'var(--c-bg-alt)' }}>
                                    <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: 12, margin: 0, color: '#555' }}>
                                        {result.rawText}
                                    </Paragraph>
                                </Card>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default PrescriptionScanner;
