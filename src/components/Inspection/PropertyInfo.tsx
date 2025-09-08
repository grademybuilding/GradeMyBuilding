import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MapPin } from "lucide-react";

interface PropertyInfoProps {
  formData: any;
  onChange: (field: string, value: string) => void;
}

export function PropertyInfo({ formData, onChange }: PropertyInfoProps) {
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
              id="address"
              placeholder="123 Main Street"
              value={formData.address || ''}
              onChange={(e) => onChange('address', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="Downtown"
              value={formData.city || ''}
              onChange={(e) => onChange('city', e.target.value)}
            />
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
              placeholder="12345"
              value={formData.zipCode || ''}
              onChange={(e) => onChange('zipCode', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="propertyType">Property Type *</Label>
            <Select value={formData.propertyType || ''} onValueChange={(value) => onChange('propertyType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="mixed-use">Mixed Use</SelectItem>
              </SelectContent>
            </Select>
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