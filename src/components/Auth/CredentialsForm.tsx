import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppRole, UserCredentials } from '@/types/auth';
import { getRoleRequiresLicense } from './RoleSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const createCredentialsSchema = (requiresLicense: boolean) =>
  z.object({
    full_name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters'),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format (e.g., +12345678901)')
      .optional()
      .or(z.literal('')),
    company_name: z
      .string()
      .min(2, 'Company name is required')
      .max(100, 'Company name must be less than 100 characters'),
    company_email: z
      .string()
      .email('Invalid company email')
      .max(255, 'Email must be less than 255 characters')
      .optional()
      .or(z.literal('')),
    license_number: requiresLicense
      ? z.string().min(3, 'License number is required for this role')
      : z.string().optional().or(z.literal('')),
    license_state: requiresLicense
      ? z.string().length(2, 'Use 2-letter state code (e.g., CA, NY)')
      : z.string().optional().or(z.literal('')),
  });

interface CredentialsFormProps {
  role: AppRole;
  onSubmit: (credentials: UserCredentials) => void;
  onBack: () => void;
}

export function CredentialsForm({ role, onSubmit, onBack }: CredentialsFormProps) {
  const requiresLicense = getRoleRequiresLicense(role);
  const schema = createCredentialsSchema(requiresLicense);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserCredentials>({
    resolver: zodResolver(schema),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Credentials</CardTitle>
        <CardDescription>
          Please provide your professional information for verification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              {...register('full_name')}
              placeholder="John Doe"
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="+12345678901"
              type="tel"
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name *</Label>
            <Input
              id="company_name"
              {...register('company_name')}
              placeholder="Acme Inspections Inc."
            />
            {errors.company_name && (
              <p className="text-sm text-destructive">{errors.company_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_email">Company Email</Label>
            <Input
              id="company_email"
              {...register('company_email')}
              placeholder="john@company.com"
              type="email"
            />
            {errors.company_email && (
              <p className="text-sm text-destructive">{errors.company_email.message}</p>
            )}
          </div>

          {requiresLicense && (
            <>
              <div className="space-y-2">
                <Label htmlFor="license_number">License Number *</Label>
                <Input
                  id="license_number"
                  {...register('license_number')}
                  placeholder="LIC-12345"
                />
                {errors.license_number && (
                  <p className="text-sm text-destructive">{errors.license_number.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_state">License State *</Label>
                <Input
                  id="license_state"
                  {...register('license_state')}
                  placeholder="CA"
                  maxLength={2}
                />
                {errors.license_state && (
                  <p className="text-sm text-destructive">{errors.license_state.message}</p>
                )}
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button type="submit" className="flex-1">
              Continue
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
