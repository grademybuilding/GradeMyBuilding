import { Badge } from '@/components/ui/badge';
import { AppRole } from '@/types/auth';
import { CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: AppRole;
  verified?: boolean;
  showVerificationStatus?: boolean;
}

const roleConfig: Record<AppRole, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  admin: { label: 'Admin', variant: 'destructive' },
  inspector: { label: 'Inspector', variant: 'default' },
  appraiser: { label: 'Appraiser', variant: 'default' },
  real_estate_agent: { label: 'Real Estate Agent', variant: 'secondary' },
  assessor: { label: 'Assessor', variant: 'secondary' },
  underwriter: { label: 'Underwriter', variant: 'outline' },
};

export function RoleBadge({ role, verified = false, showVerificationStatus = true }: RoleBadgeProps) {
  const config = roleConfig[role];

  return (
    <div className="flex items-center gap-2">
      <Badge variant={config.variant}>{config.label}</Badge>
      {showVerificationStatus && (
        <div className={cn('flex items-center gap-1 text-xs', verified ? 'text-green-600' : 'text-yellow-600')}>
          {verified ? (
            <>
              <CheckCircle className="h-3 w-3" />
              <span>Verified</span>
            </>
          ) : (
            <>
              <Clock className="h-3 w-3" />
              <span>Pending</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
