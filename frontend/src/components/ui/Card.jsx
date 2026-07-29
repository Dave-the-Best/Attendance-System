import { motion } from 'framer-motion';
import { useAppMotion } from '../../lib/motion';

export default function Card({ title, icon: Icon, action, children, className = '', index = 0 }) {
  const m = useAppMotion();
  return (
    <motion.section className={`card ${className}`} {...m.rise(index)}>
      {(title || action) && (
        <div className="card-head">
          <h3>
            {Icon && <Icon size={16} className="card-title-icon" />}
            {title}
          </h3>
          {action}
        </div>
      )}
      {children}
    </motion.section>
  );
}
