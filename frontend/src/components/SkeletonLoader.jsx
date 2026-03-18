import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ width, height, borderRadius = '8px' }) => {
  return (
    <motion.div
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width: width || '100%',
        height: height || '20px',
        backgroundColor: 'var(--border)',
        borderRadius: borderRadius,
        marginBottom: '10px'
      }}
    />
  );
};

export const DashboardSkeleton = () => (
  <div style={{ padding: '2rem' }}>
    <SkeletonLoader width="300px" height="40px" />
    <SkeletonLoader width="200px" height="20px" />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
      <SkeletonLoader height="120px" />
      <SkeletonLoader height="120px" />
      <SkeletonLoader height="120px" />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
      <SkeletonLoader height="300px" />
      <SkeletonLoader height="300px" />
    </div>
  </div>
);

export default SkeletonLoader;
