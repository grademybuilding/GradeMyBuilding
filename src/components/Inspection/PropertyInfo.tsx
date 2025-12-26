import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGooglePlacesAutocomplete } from "@/hooks/useGooglePlacesAutocomplete";
import { useCallback, useEffect } from "react";

interface PropertyInfoProps {
  formData: any;
  onChange: (field: string, value: string) => void;
  validationErrors?: Record<string, string>;
}

export function PropertyInfo({ formData, onChange, validationErrors = {} }: PropertyInfoProps) {
  const handlePlaceSelect = useCallback((components: { address: string; city: string; state: string; zipCode: string }) => {
    onChange('address', components.address);
    onChange('city', components.city);
    onChange('state', components.state);
    onChange('zipCode', components.zipCode);
  }, [onChange]);

  const { inputRef } = useGooglePlacesAutocomplete({
    onPlaceSelect: handlePlaceSelect,
  });

  // Sync the input ref value with formData when it changes externally
  useEffect(() => {
    if (inputRef.current && formData.address !== undefined) {
      inputRef.current.value = formData.address || '';
    }
  }, [formData.address, inputRef]);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Property Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="address">Property Address *</Label>
            <Input
              ref={inputRef}
              id="address"
              placeholder="Start typing an address..."
              defaultValue={formData.address || ''}
              onChange={(e) => onChange('address', e.target.value)}
              className={cn(validationErrors.address && "border-destructive focus-visible:ring-destructive")}
              autoComplete="off"
            />
            {validationErrors.address && (
              <p className="text-sm text-destructive">{validationErrors.address}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="Downtown"
              value={formData.city || ''}
              onChange={(e) => onChange('city', e.target.value)}
              className={cn(validationErrors.city && "border-destructive focus-visible:ring-destructive")}
            />
            {validationErrors.city && (
              <p className="text-sm text-destructive">{validationErrors.city}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              placeholder="CA"
              value={formData.state || ''}
              onChange={(e) => onChange('state', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">Zip Code</Label>
            <Input
              id="zipCode"
              placeholder="12345 or 12345-6789"
              value={formData.zipCode || ''}
              onChange={(e) => {
                // Allow only digits and hyphen, max 10 chars (12345-6789)
                const value = e.target.value.replace(/[^\d-]/g, '').slice(0, 10);
                onChange('zipCode', value);
              }}
              maxLength={10}
              pattern="^\d{5}(-\d{4})?$"
              className={cn(validationErrors.zipCode && "border-destructive focus-visible:ring-destructive")}
            />
            {validationErrors.zipCode && (
              <p className="text-sm text-destructive">{validationErrors.zipCode}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="propertyType">Property Type *</Label>
            <Select value={formData.propertyType || ''} onValueChange={(value) => onChange('propertyType', value)}>
              <SelectTrigger className={cn(validationErrors.propertyType && "border-destructive focus:ring-destructive")}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="mixed-use">Mixed Use</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.propertyType && (
              <p className="text-sm text-destructive">{validationErrors.propertyType}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="yearBuilt">Year Built</Label>
            <Input
              id="yearBuilt"
              type="number"
              placeholder="2020"
              value={formData.yearBuilt || ''}
              onChange={(e) => onChange('yearBuilt', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="squareFootage">Square Footage</Label>
            <Input
              id="squareFootage"
              type="number"
              placeholder="2500"
              value={formData.squareFootage || ''}
              onChange={(e) => onChange('squareFootage', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownerContact">Owner/Contact Information</Label>
          <Textarea
            id="ownerContact"
            placeholder="Owner name, phone, email..."
            value={formData.ownerContact || ''}
            onChange={(e) => onChange('ownerContact', e.target.value)}
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}