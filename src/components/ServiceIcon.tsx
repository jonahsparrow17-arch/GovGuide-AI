import React from 'react';
import { FileText, CreditCard, Building, Car, CheckSquare, ShieldCheck, Compass, HelpCircle, FileCheck, UserCheck } from 'lucide-react';

interface ServiceIconProps {
  name: string;
  className?: string;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({ name, className = "w-6 h-6" }) => {
  switch (name) {
    case 'FileText':
      return <FileText className={className} />;
    case 'CreditCard':
      return <CreditCard className={className} />;
    case 'Building':
      return <Building className={className} />;
    case 'Car':
      return <Car className={className} />;
    case 'CheckSquare':
      return <CheckSquare className={className} />;
    case 'FileCheck':
      return <FileCheck className={className} />;
    case 'UserCheck':
      return <UserCheck className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};
