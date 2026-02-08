import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (event) => {
    const selectedLanguage = event.target.value;
    i18n.changeLanguage(selectedLanguage);
    
    // Crucial: Update the text direction for Arabic
    document.body.dir = i18n.dir(selectedLanguage);
    document.documentElement.lang = selectedLanguage;
  };

  return (
    <div className="language-selector">
      <select value={i18n.language} onChange={changeLanguage}>
        <option value="en">English 🇬🇧</option>
        <option value="ar">العربية 🇸🇦</option>
        <option value="de">Deutsch 🇩🇪</option>
      </select>
    </div>
  );
};

export default LanguageSelector;