import React from 'react';
import { TrustStatus } from '../types';
import { CheckCircle2, Info, AlertTriangle, Clock, HelpCircle } from 'lucide-react';

interface TrustBadgeProps {
  status: TrustStatus;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  status,
  showDescription = false,
  size = 'md'
}) => {
  const getStatusConfig = (s: TrustStatus) => {
    switch (s) {
      case 'VERIFIED':
        return {
          label: 'VERIFIED',
          icon: CheckCircle2,
          bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dotColor: 'bg-emerald-500',
          description: 'Official government source confirms this information.'
        };
      case 'ACTIVE':
        return {
          label: 'ACTIVE',
          icon: Info,
          bgColor: 'bg-blue-50 text-blue-800 border-blue-200',
          dotColor: 'bg-blue-500',
          description: 'Existing active scheme with current official guidelines.'
        };
      case 'ANNOUNCED':
        return {
          label: 'ANNOUNCED',
          icon: Clock,
          bgColor: 'bg-amber-50 text-amber-800 border-amber-200',
          dotColor: 'bg-amber-500',
          description: 'Announced by government; operational rules may update.'
        };
      case 'DETAILS_PENDING':
        return {
          label: 'DETAILS PENDING',
          icon: AlertTriangle,
          bgColor: 'bg-orange-50 text-orange-800 border-orange-200',
          dotColor: 'bg-orange-500',
          description: 'Scheme announced; detailed procedural guidelines pending.'
        };
      case 'NEEDS_VERIFICATION':
        return {
          label: 'NEEDS VERIFICATION',
          icon: HelpCircle,
          bgColor: 'bg-rose-50 text-rose-800 border-rose-200',
          dotColor: 'bg-rose-500',
          description: 'Pending independent verification from official notifications.'
        };
      default:
        return {
          label: 'VERIFIED',
          icon: CheckCircle2,
          bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dotColor: 'bg-emerald-500',
          description: 'Official government source confirms this information.'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2'
  }[size];

  return (
    <div className="inline-flex flex-col gap-1">
      <span
        id={`trust-badge-${status.toLowerCase().replace(/_/g, '-')}`}
        className={`inline-flex items-center font-bold tracking-wide rounded-full border ${config.bgColor} ${sizeClasses}`}
        title={config.description}
      >
        <span className={`w-2 h-2 rounded-full ${config.dotColor} shrink-0 animate-pulse`} />
        <span>{config.label}</span>
      </span>
      {showDescription && (
        <span className="text-[11px] text-slate-500 font-normal">
          {config.description}
        </span>
      )}
    </div>
  );
};
