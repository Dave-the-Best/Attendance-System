import { motion } from 'framer-motion';
import { useAppMotion } from '../../lib/motion';
import AnimatedNumber from './AnimatedNumber';

const toneClass = {
  brand: 'ic-brand', ok: 'ic-ok', warn: 'ic-warn', info: 'ic-info', danger: 'ic-danger', idle: 'ic-brand',
};

export default function StatCard({ icon: Icon, label, value, tone = 'brand', foot, index = 0, animate = true }) {
  const m = useAppMotion();
  return (
    <motion.div className="stat" {...m.rise(index)} whileHover={m.reduce ? undefined : { y: -2 }}>
      <div className="stat-top">
        {Icon && (
          <div className={`stat-ico ${toneClass[tone] || 'ic-brand'}`}>
            <Icon size={17} />
          </div>
        )}
        <div className="stat-label">{label}</div>
      </div>
      <div className="stat-value">
        {animate && typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
      </div>
      {foot && <div className="stat-foot">{foot}</div>}
    </motion.div>
  );
}
