import { useLang } from '../../context/LanguageContext';

export default function Loader({ label }) {
  const { t } = useLang();
  return (
    <div className="content">
      <div className="loader">
        <div className="spinner" />
        {label || t('common.loading')}
      </div>
    </div>
  );
}
