import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';

const toneClass = {
  brand: 'ic-brand',
  ok: 'ic-ok',
  warn: 'ic-warn',
  info: 'ic-info',
  danger: 'ic-danger',
  idle: 'ic-brand',
};

export default function StatCard({ icon: Icon, label, value, tone = 'brand', foot, index = 0, animate = true }) {
  return (
    <motion.div
      className="stat"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
    >
      <div className="stat-top">
        <div className="stat-label">{label}</div>
        {Icon && (
          <div className={`stat-ico ${toneClass[tone] || 'ic-brand'}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
      <div className="stat-value">
        {animate && typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
      </div>
      {foot && <div className="stat-foot">{foot}</div>}
    </motion.div>
  );
}
