import { Badge } from '@/components/ui/badge';
import { AppRole } from '@/contexts/AuthContext';
import { CheckCircle, Clock } from 'lucide-react';

interface RoleBadgeProps {
  role: AppRole;
  verified?: boolean;
}

const roleColors: Record<AppRole, string> = {
  admin: 'bg-purple-500 text-white hover:bg-purple-600',
  inspector: 'bg-blue-500 text-white hover:bg-blue-600',
  appraiser: 'bg-green-500 text-white hover:bg-green-600',
  real_estate_agent: 'bg-orange-500 text-white hover:bg-orange-600',
  assessor: 'bg-cyan-500 text-white hover:bg-cyan-600',
  underwriter: 'bg-pink-500 text-white hover:bg-pink-600',
};

const roleLabels: Record<AppRole, string> = {
  admin: 'Admin',
  inspector: 'Inspector',
  appraiser: 'Appraiser',
  real_estate_agent: 'Real Estate Agent',
  assessor: 'Assessor',
  underwriter: 'Underwriter',
};

export function RoleBadge({ role, verified = false }: RoleBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <Badge className={roleColors[role]}>
        {roleLabels[role]}
      </Badge>
      {verified ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <Clock className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  );
}
