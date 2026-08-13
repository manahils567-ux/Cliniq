import React, { useMemo, useState } from 'react';
import DashboardLayout from '../DashboardLayout/DashboardLayout';
import { Input, Button, message } from 'antd';
import { useChangePasswordMutation } from '../../../redux/api/authApi';
import './ChangePassword.css';

/**
 * Change password.
 *
 * Wired to PATCH /auth/change-password. That endpoint verifies the current
 * password with bcrypt and scopes the update to the token's own user, so the
 * id is never taken from the request body.
 *
 * The rules below are checked live as you type. The previous version listed
 * them statically under the fields, so a rejected password left you guessing
 * which one you had missed.
 */

const RULES = [
    { key: 'len', label: 'At least 8 characters', test: (v) => v.length >= 8 },
    { key: 'upper', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
    { key: 'lower', label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
    { key: 'digit', label: 'One number', test: (v) => /\d/.test(v) },
];

const Field = ({ label, value, onChange, placeholder, autoComplete }) => (
    <div className="cqpw__field">
        <label className="cqpw__label">{label}</label>
        <Input.Password
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoComplete={autoComplete}
        />
    </div>
);

const ChangePassword = () => {
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [confirm, setConfirm] = useState('');
    const [changePassword, { isLoading }] = useChangePasswordMutation();

    const met = useMemo(() => RULES.map((r) => r.test(next)), [next]);
    const score = met.filter(Boolean).length;
    const allMet = score === RULES.length;

    // Only complain about a mismatch once there is something to compare.
    const mismatch = confirm.length > 0 && next !== confirm;
    const canSubmit = current.length > 0 && allMet && !mismatch && confirm.length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        try {
            await changePassword({ currentPassword: current, newPassword: next }).unwrap();
            message.success('Password changed.');
            setCurrent(''); setNext(''); setConfirm('');
        } catch (err) {
            // The server distinguishes a wrong current password from a weak new
            // one; surface whichever it sent rather than a generic failure.
            message.error(err?.data?.message || 'Could not change your password.');
        }
    };

    return (
        <DashboardLayout>
            <form className="cqpw" onSubmit={handleSubmit}>
                <div className="cqpw__head">
                    <h1 className="cqpw__title">Change password</h1>
                    <p className="cqpw__sub">
                        Choose something you have not used elsewhere. You will stay signed
                        in on this device.
                    </p>
                </div>

                <Field
                    label="Current password"
                    value={current}
                    onChange={setCurrent}
                    placeholder="Your current password"
                    autoComplete="current-password"
                />

                <Field
                    label="New password"
                    value={next}
                    onChange={setNext}
                    placeholder="Your new password"
                    autoComplete="new-password"
                />

                <div className="cqpw__strength" aria-hidden="true">
                    {RULES.map((r, i) => (
                        <span
                            key={r.key}
                            className={`cqpw__seg${i < score ? ' is-on' : ''}${allMet ? ' is-full' : ''}`}
                        />
                    ))}
                </div>

                <ul className="cqpw__rules">
                    {RULES.map((r, i) => (
                        <li key={r.key} className={`cqpw__rule${met[i] ? ' is-met' : ''}`}>
                            <span className="cqpw__tick" aria-hidden="true">✓</span>
                            {r.label}
                        </li>
                    ))}
                </ul>

                <Field
                    label="Confirm new password"
                    value={confirm}
                    onChange={setConfirm}
                    placeholder="Type it again"
                    autoComplete="new-password"
                />

                {mismatch && <p className="cqpw__mismatch">Those do not match.</p>}

                <Button
                    className="cqpw__submit"
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    disabled={!canSubmit}
                >
                    Update password
                </Button>

            </form>
        </DashboardLayout>
    );
};

export default ChangePassword;
