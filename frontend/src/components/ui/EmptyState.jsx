import { Inbox } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

export default function EmptyState({ icon: Icon = Inbox, title, hint, action }) {
  const { t } = useLang();
  return (
    <div className="empty">
      <div className="empty-ico">
        <Icon size={24} />
      </div>
      <h4>{title || t('empty.default')}</h4>
      {hint && <p>{hint}</p>}
      {action}
    </div>
  );
}
