import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <LoadingSpinner size={40} />
    </div>
  );
}