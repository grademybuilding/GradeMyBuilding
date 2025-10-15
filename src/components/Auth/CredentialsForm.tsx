import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppRole } from '@/contexts/AuthContext';
import { getRoleRequiresLicense } from './RoleSelector';

interface CredentialsData {
  full_name: string;
  phone: string;
  company_name: string;
  company_email: string;
  license_number: string;
  license_state: string;
}

interface CredentialsFormProps {
  role: AppRole;
  data: CredentialsData;
  onChange: (data: CredentialsData) => void;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export function CredentialsForm({ role, data, onChange }: CredentialsFormProps) {
  const requiresLicense = getRoleRequiresLicense(role);

  const handleChange = (field: keyof CredentialsData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="full_name">Full Name *</Label>
        <Input
          id="full_name"
          value={data.full_name}
          onChange={(e) => handleChange('full_name', e.target.value)}
          placeholder="John Doe"
          required
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={data.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div>
        <Label htmlFor="company_name">Company Name *</Label>
        <Input
          id="company_name"
          value={data.company_name}
          onChange={(e) => handleChange('company_name', e.target.value)}
          placeholder="Acme Inspections LLC"
          required
        />
      </div>

      <div>
        <Label htmlFor="company_email">Company Email</Label>
        <Input
          id="company_email"
          type="email"
          value={data.company_email}
          onChange={(e) => handleChange('company_email', e.target.value)}
          placeholder="contact@company.com"
        />
      </div>

      {requiresLicense && (
        <>
          <div>
            <Label htmlFor="license_number">License Number *</Label>
            <Input
              id="license_number"
              value={data.license_number}
              onChange={(e) => handleChange('license_number', e.target.value)}
              placeholder="LIC-123456"
              required
            />
          </div>

          <div>
            <Label htmlFor="license_state">License State *</Label>
            <select
              id="license_state"
              value={data.license_state}
              onChange={(e) => handleChange('license_state', e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value="">Select state...</option>
              {US_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}
