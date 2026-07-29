import { motion } from 'framer-motion';
import { useAppMotion } from '../../lib/motion';

export default function PageTransition({ children }) {
  const m = useAppMotion();
  return (
    <motion.div className="content" {...m.page}>
      {children}
    </motion.div>
  );
}
