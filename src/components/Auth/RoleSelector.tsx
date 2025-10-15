import { ClipboardCheck, Calculator, Home, FileText, Shield, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AppRole } from '@/contexts/AuthContext';

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
    description: 'Conduct property inspections and create reports',
    icon: <ClipboardCheck className="h-8 w-8" />,
    requiresLicense: true
  },
  {
    value: 'appraiser',
    label: 'Appraiser',
    description: 'Create property valuations based on inspection data',
    icon: <Calculator className="h-8 w-8" />,
    requiresLicense: true
  },
  {
    value: 'real_estate_agent',
    label: 'Real Estate Agent',
    description: 'View inspections for properties you represent',
    icon: <Home className="h-8 w-8" />,
    requiresLicense: true
  },
  {
    value: 'assessor',
    label: 'Assessor',
    description: 'Access inspection data for tax assessment',
    icon: <FileText className="h-8 w-8" />,
    requiresLicense: false
  },
  {
    value: 'underwriter',
    label: 'Underwriter',
    description: 'Review inspections for underwriting decisions',
    icon: <Shield className="h-8 w-8" />,
    requiresLicense: false
  },
  {
    value: 'admin',
    label: 'Administrator',
    description: 'Full system access and management',
    icon: <Crown className="h-8 w-8" />,
    requiresLicense: false
  }
];

interface RoleSelectorProps {
  selectedRole: AppRole | null;
  onSelect: (role: AppRole) => void;
}

export function RoleSelector({ selectedRole, onSelect }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {roles.map((role) => (
        <Card
          key={role.value}
          className={cn(
            "cursor-pointer transition-all duration-200 hover:shadow-lg",
            selectedRole === role.value
              ? "border-primary bg-primary/5"
              : "hover:border-primary/50"
          )}
          onClick={() => onSelect(role.value)}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-lg",
                selectedRole === role.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}>
                {role.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{role.label}</h3>
                <p className="text-sm text-muted-foreground">{role.description}</p>
                {role.requiresLicense && (
                  <p className="text-xs text-primary mt-2">* License required</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function getRoleRequiresLicense(role: AppRole): boolean {
  const roleOption = roles.find(r => r.value === role);
  return roleOption?.requiresLicense ?? false;
}
