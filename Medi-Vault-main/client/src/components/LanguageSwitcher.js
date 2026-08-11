import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (event) => {
    const language = event.target.value;
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  return (
    <div className="language-switcher-container">
      <select
        value={i18n.language}
        onChange={changeLanguage}
        className="language-select"
        aria-label="Select language"
      >
        <option value="en">English</option>
        <option value="hi">हिंदी</option>
        <option value="kn">ಕನ್ನಡ</option>
        <option value="ta">தமிழ்</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;