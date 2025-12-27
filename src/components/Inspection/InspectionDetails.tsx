import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, ClipboardCheck } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface InspectionDetailsProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  validationErrors?: Record<string, string>;
}

const inspectionCategories = [
  'Residential', 'Commercial', 'Sewer', 'Spa/Swimming Pool', 'Radon', 'Well', 'Water Testing', 'Green Features'
];

const weatherConditions = [
  'Clear', 'Cloudy', 'Dry', 'Heavy Rain', 'Hot', 'Humid', 'Light Rain', 'Recent Rain', 'Snow'
];

const occupancyOptions = [
  'Utilities Off', 'Furnished', 'Occupied', 'Vacant'
];

const attendanceOptions = [
  'Listing Agent', 'Buyer\'s Agent', 'Home Owner', 'Buyer', 'Seller'
];

const residentialBuildingTypes = [
  'Detached', 'Single Family', 'Multi-Family', 'Attached', 'Condominium', 
  'Townhouse', 'Modular', 'Manufactured'
];

const commercialBuildingTypes = [
  'Office', 'Industrial', 'Retail', 'Restaurant', 'Shopping Center', 
  'Specialty', 'Health Care', 'Hospitality', 'Sports & Entertainment'
];

export function InspectionDetails({ formData, onChange, validationErrors = {} }: InspectionDetailsProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  // Auto-fill current date and time when component mounts (if not already set)
  useEffect(() => {
    if (!formData.inspectionDate) {
      onChange('inspectionDate', new Date());
    }
    if (!formData.startTime) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      onChange('startTime', `${hours}:${minutes}`);
    }
  }, []); // Run only on mount
  
  const handleMultiSelect = (field: string, option: string) => {
    const current = formData[field] || [];
    const updated = current.includes(option)
      ? current.filter((item: string) => item !== option)
      : [...current, option];
    onChange(field, updated);
  };

  const isSelected = (field: string, option: string) => {
    return (formData[field] || []).includes(option);
  };

  const handleDateSelect = (date: Date | undefined) => {
    onChange('inspectionDate', date);
    if (date) {
      setDatePickerOpen(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          Inspection Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Inspection Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Inspection Date *</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.inspectionDate && "text-muted-foreground",
                    validationErrors.inspectionDate && "border-destructive"
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
                  onSelect={handleDateSelect}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {validationErrors.inspectionDate && (
              <p className="text-sm text-destructive">{validationErrors.inspectionDate}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime || ''}
              onChange={(e) => onChange('startTime', e.target.value)}
            />
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
              className={cn(validationErrors.inspectorName && "border-destructive focus-visible:ring-destructive")}
            />
            {validationErrors.inspectorName && (
              <p className="text-sm text-destructive">{validationErrors.inspectorName}</p>
            )}
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

        {/* Inspection Categories */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Inspection Level</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {inspectionCategories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={isSelected('inspectionCategories', category)}
                  onCheckedChange={() => handleMultiSelect('inspectionCategories', category)}
                />
                <Label htmlFor={`category-${category}`} className="text-sm">
                  {category}
                </Label>
          </div>
            ))}
          </div>
        </div>


        {/* Weather Conditions */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Weather Conditions</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {weatherConditions.map((condition) => (
              <div key={condition} className="flex items-center space-x-2">
                <Checkbox
                  id={`weather-${condition}`}
                  checked={isSelected('weatherConditions', condition)}
                  onCheckedChange={() => handleMultiSelect('weatherConditions', condition)}
                />
                <Label htmlFor={`weather-${condition}`} className="text-sm">
                  {condition}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Temperature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature (Approximate)</Label>
            <Input
              id="temperature"
              type="number"
              placeholder="72"
              value={formData.temperature || ''}
              onChange={(e) => onChange('temperature', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperatureUnit">Temperature Unit</Label>
            <Select value={formData.temperatureUnit || 'F'} onValueChange={(value) => onChange('temperatureUnit', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="F">Fahrenheit (°F)</SelectItem>
                <SelectItem value="C">Celsius (°C)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Occupancy */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Occupancy</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {occupancyOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`occupancy-${option}`}
                  checked={isSelected('occupancy', option)}
                  onCheckedChange={() => handleMultiSelect('occupancy', option)}
                />
                <Label htmlFor={`occupancy-${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* In Attendance */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">In Attendance</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {attendanceOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`attendance-${option}`}
                  checked={isSelected('attendance', option)}
                  onCheckedChange={() => handleMultiSelect('attendance', option)}
                />
                <Label htmlFor={`attendance-${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Building Type - Residential */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Residential Building Type</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {residentialBuildingTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`residential-${type}`}
                  checked={isSelected('residentialBuildingTypes', type)}
                  onCheckedChange={() => handleMultiSelect('residentialBuildingTypes', type)}
                />
                <Label htmlFor={`residential-${type}`} className="text-sm">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Building Type - Commercial */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Commercial Building Type</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {commercialBuildingTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`commercial-${type}`}
                  checked={isSelected('commercialBuildingTypes', type)}
                  onCheckedChange={() => handleMultiSelect('commercialBuildingTypes', type)}
                />
                <Label htmlFor={`commercial-${type}`} className="text-sm">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}