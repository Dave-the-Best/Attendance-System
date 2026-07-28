import { motion } from 'framer-motion';

export default function Card({ title, icon: Icon, action, children, className = '', index = 0 }) {
  return (
    <motion.section
      className={`card ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      {(title || action) && (
        <div className="card-head">
          <h3>
            {Icon && <Icon size={18} className="card-title-icon" />}
            {title}
          </h3>
          {action}
        </div>
      )}
      {children}
    </motion.section>
  );
}
