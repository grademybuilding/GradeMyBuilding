import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ClipboardCheck } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface InspectionDetailsProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export function InspectionDetails({ formData, onChange }: InspectionDetailsProps) {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          Inspection Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="inspectionType">Inspection Type *</Label>
            <Select value={formData.inspectionType || ''} onValueChange={(value) => onChange('inspectionType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select inspection type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pre-purchase">Pre-Purchase</SelectItem>
                <SelectItem value="annual">Annual Inspection</SelectItem>
                <SelectItem value="safety">Safety Inspection</SelectItem>
                <SelectItem value="insurance">Insurance Inspection</SelectItem>
                <SelectItem value="compliance">Code Compliance</SelectItem>
                <SelectItem value="warranty">Warranty Inspection</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Inspection Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.inspectionDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.inspectionDate ? format(formData.inspectionDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.inspectionDate}
                  onSelect={(date) => onChange('inspectionDate', date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="inspectorName">Inspector Name *</Label>
            <Input
              id="inspectorName"
              placeholder="John Doe"
              value={formData.inspectorName || ''}
              onChange={(e) => onChange('inspectorName', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="license">License Number</Label>
            <Input
              id="license"
              placeholder="INS123456"
              value={formData.license || ''}
              onChange={(e) => onChange('license', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime || ''}
              onChange={(e) => onChange('startTime', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="estimatedDuration">Est. Duration (hours)</Label>
            <Select value={formData.estimatedDuration || ''} onValueChange={(value) => onChange('estimatedDuration', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="3">3 hours</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="6">6 hours</SelectItem>
                <SelectItem value="8">Full day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}