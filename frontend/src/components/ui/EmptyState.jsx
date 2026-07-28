import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', hint }) {
  return (
    <div className="empty">
      <div className="empty-ico">
        <Icon size={26} />
      </div>
      <h4>{title}</h4>
      {hint && <div className="small">{hint}</div>}
    </div>
  );
}
