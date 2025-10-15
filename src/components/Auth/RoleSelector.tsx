import { ClipboardCheck, Calculator, Home, FileText, Shield, Crown } from 'lucide-react';
import { AppRole } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RoleOption {
  value: AppRole;
  label: string;
  description: string;
  icon: React.ReactNode;
  requiresLicense: boolean;
}

const roles: RoleOption[] = [
  {
    value: 'inspector',
    label: 'Inspector',
    description: 'Conduct property inspections and create detailed reports',
    icon: <ClipboardCheck className="h-8 w-8" />,
    requiresLicense: true,
  },
  {
    value: 'appraiser',
    label: 'Appraiser',
    description: 'Create property valuations based on inspection data',
    icon: <Calculator className="h-8 w-8" />,
    requiresLicense: true,
  },
  {
    value: 'real_estate_agent',
    label: 'Real Estate Agent',
    description: 'View inspections for properties you represent',
    icon: <Home className="h-8 w-8" />,
    requiresLicense: true,
  },
  {
    value: 'assessor',
    label: 'Assessor',
    description: 'Access inspection data for tax assessment purposes',
    icon: <FileText className="h-8 w-8" />,
    requiresLicense: false,
  },
  {
    value: 'underwriter',
    label: 'Underwriter',
    description: 'Review inspections for underwriting decisions',
    icon: <Shield className="h-8 w-8" />,
    requiresLicense: false,
  },
  {
    value: 'admin',
    label: 'Administrator',
    description: 'Full system access and user management',
    icon: <Crown className="h-8 w-8" />,
    requiresLicense: false,
  },
];

interface RoleSelectorProps {
  selectedRole: AppRole | null;
  onSelectRole: (role: AppRole) => void;
}

export function RoleSelector({ selectedRole, onSelectRole }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {roles.map((role) => (
        <Card
          key={role.value}
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-lg',
            selectedRole === role.value
              ? 'border-primary shadow-md bg-primary/5'
              : 'hover:border-primary/50'
          )}
          onClick={() => onSelectRole(role.value)}
        >
          <CardHeader>
            <div className={cn(
              'mb-2 flex h-12 w-12 items-center justify-center rounded-lg',
              selectedRole === role.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            )}>
              {role.icon}
            </div>
            <CardTitle className="text-lg">{role.label}</CardTitle>
            {role.requiresLicense && (
              <span className="text-xs text-muted-foreground">License required</span>
            )}
          </CardHeader>
          <CardContent>
            <CardDescription>{role.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function getRoleRequiresLicense(role: AppRole): boolean {
  const roleOption = roles.find((r) => r.value === role);
  return roleOption?.requiresLicense ?? false;
}
