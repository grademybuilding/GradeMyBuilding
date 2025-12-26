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

        {/* Radon-Specific Fields - Only show when Radon is selected */}
        {isSelected('inspectionCategories', 'Radon') && (
          <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
            <Label className="text-base font-semibold flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">R</span>
              Radon Monitor Details
            </Label>
            
            {/* General Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="radonStartTime">Start Time</Label>
                <Input
                  id="radonStartTime"
                  type="time"
                  value={formData.radonStartTime || ''}
                  onChange={(e) => onChange('radonStartTime', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="radonEndTime">End Time</Label>
                <Input
                  id="radonEndTime"
                  type="time"
                  value={formData.radonEndTime || ''}
                  onChange={(e) => onChange('radonEndTime', e.target.value)}
                />
              </div>
            </div>

            {/* Monitor Location */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Monitor Location</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Basement', 'Lower Level', 'Main Level'].map((location) => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={`monitor-location-${location}`}
                      checked={isSelected('radonMonitorLocation', location)}
                      onCheckedChange={() => handleMultiSelect('radonMonitorLocation', location)}
                    />
                    <Label htmlFor={`monitor-location-${location}`} className="text-sm">
                      {location}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Method */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Method</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="radon-method-continuous"
                  checked={isSelected('radonMethod', 'Continuous')}
                  onCheckedChange={() => handleMultiSelect('radonMethod', 'Continuous')}
                />
                <Label htmlFor="radon-method-continuous" className="text-sm">
                  Continuous
                </Label>
              </div>
            </div>

            {/* Measurement Interval & Elapsed Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="radonMeasurementInterval">Measurement Interval (hr)</Label>
                <Input
                  id="radonMeasurementInterval"
                  type="number"
                  placeholder="e.g., 1"
                  value={formData.radonMeasurementInterval || ''}
                  onChange={(e) => onChange('radonMeasurementInterval', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="radonElapsedTime">Elapsed Time (days)</Label>
                <Input
                  id="radonElapsedTime"
                  type="number"
                  placeholder="e.g., 2"
                  value={formData.radonElapsedTime || ''}
                  onChange={(e) => onChange('radonElapsedTime', e.target.value)}
                />
              </div>
            </div>

            {/* Monitor Type Info */}
            <Label className="text-sm font-semibold pt-2">Monitor Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="radonSerialNumber">Serial Number</Label>
                <Input
                  id="radonSerialNumber"
                  placeholder="Enter serial number"
                  value={formData.radonSerialNumber || ''}
                  onChange={(e) => onChange('radonSerialNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="radonModelNumber">Model Number</Label>
                <Input
                  id="radonModelNumber"
                  placeholder="Enter model number"
                  value={formData.radonModelNumber || ''}
                  onChange={(e) => onChange('radonModelNumber', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Well-Specific Fields - Only show when Well is selected */}
        {isSelected('inspectionCategories', 'Well') && (
          <div className="space-y-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
            <Label className="text-base font-semibold flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">W</span>
              Well System Details
            </Label>

            {/* Utilities On */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Utilities On</Label>
              <div className="flex gap-4 flex-wrap">
                {['On', 'Off'].map((option) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="wellUtilitiesOn"
                      value={option}
                      checked={formData.wellUtilitiesOn === option}
                      onChange={(e) => onChange('wellUtilitiesOn', e.target.value)}
                      className="h-4 w-4 text-primary border-input focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Property Occupied */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Property Occupied</Label>
              <div className="flex gap-4 flex-wrap">
                {['Yes', 'No'].map((option) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="wellPropertyOccupied"
                      value={option}
                      checked={formData.wellPropertyOccupied === option}
                      onChange={(e) => onChange('wellPropertyOccupied', e.target.value)}
                      className="h-4 w-4 text-primary border-input focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Weather */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Weather</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Sunny', 'Cloudy', 'Rainy', 'Partly Sunny', 'Partly Cloudy', 'Snow'].map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={`well-weather-${condition}`}
                      checked={isSelected('wellWeather', condition)}
                      onCheckedChange={() => handleMultiSelect('wellWeather', condition)}
                    />
                    <Label htmlFor={`well-weather-${condition}`} className="text-sm cursor-pointer">
                      {condition}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Soil Conditions */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Soil Conditions</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Dry', 'Wet', 'Semi Wet', 'Frozen'].map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={`well-soil-${condition}`}
                      checked={isSelected('wellSoilConditions', condition)}
                      onCheckedChange={() => handleMultiSelect('wellSoilConditions', condition)}
                    />
                    <Label htmlFor={`well-soil-${condition}`} className="text-sm cursor-pointer">
                      {condition}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Location of Well Head */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Location of Well Head</Label>
              <p className="text-xs text-muted-foreground">We reference where the well head in conjunction to the property. Grading should be considered near the well head. Water should not pool around casing, but go around it or away.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Front of House', 'Right of House', 'Left of House', 'Back of House', 'Basement'].map((location) => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={`well-location-${location}`}
                      checked={isSelected('wellHeadLocation', location)}
                      onCheckedChange={() => handleMultiSelect('wellHeadLocation', location)}
                    />
                    <Label htmlFor={`well-location-${location}`} className="text-sm cursor-pointer">
                      {location}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Water Flow Information */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Water Flow Information</Label>
              <p className="text-xs text-muted-foreground">The pressure should be between 40 and 60 pounds per square inch (psi). As the well pump cycles on and off, it is normal for the pressure to vary from low (pump cut-in) to high (pump cut-out) pressure.</p>
              <div className="flex gap-4 flex-wrap">
                {['Adequate', 'Inadequate'].map((option) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="wellWaterFlow"
                      value={option}
                      checked={formData.wellWaterFlow === option}
                      onChange={(e) => onChange('wellWaterFlow', e.target.value)}
                      className="h-4 w-4 text-primary border-input focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Well Setbacks */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Well Setbacks</Label>
              <p className="text-xs text-muted-foreground">Septic 25 plus feet, Building 10 plus feet</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Septic System', 'Buildings', 'Other'].map((setback) => (
                  <div key={setback} className="flex items-center space-x-2">
                    <Checkbox
                      id={`well-setback-${setback}`}
                      checked={isSelected('wellSetbacks', setback)}
                      onCheckedChange={() => handleMultiSelect('wellSetbacks', setback)}
                    />
                    <Label htmlFor={`well-setback-${setback}`} className="text-sm cursor-pointer">
                      {setback}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Comments */}
            <div className="space-y-2">
              <Label htmlFor="wellFinalComments" className="text-sm font-medium">Final Comments</Label>
              <Textarea
                id="wellFinalComments"
                placeholder="Enter any final comments about the well system..."
                value={formData.wellFinalComments || ''}
                onChange={(e) => onChange('wellFinalComments', e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Items to be further evaluated prior to grading a building by a qualified plumber include: Well pressure system, sample faucet, etc.
              </p>
            </div>
          </div>
        )}

        {/* Water Testing-Specific Fields - Only show when Water Testing is selected */}
        {isSelected('inspectionCategories', 'Water Testing') && (
          <div className="space-y-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
            <Label className="text-base font-semibold flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">W</span>
              Water Testing Details
            </Label>
            
            {/* Test Information Section */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-foreground/80">Test Information</Label>
              
              {/* Delayed Test */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="water-testing-delayed"
                  className="mt-0.5"
                  checked={formData.waterTestingDelayed || false}
                  onCheckedChange={(checked) => onChange('waterTestingDelayed', checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="water-testing-delayed" className="text-sm font-medium cursor-pointer">Delayed Test</Label>
                  <p className="text-xs text-muted-foreground">The test was delayed due to closed building conditions not met 12 hours to start of test.</p>
                </div>
              </div>

              {/* Testing Method */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Testing Method</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['17 in One Water Test Strips', 'Coliform 48 Hour Test Kit'].map((method) => (
                    <div key={method} className="flex items-center space-x-2">
                      <Checkbox
                        id={`water-method-${method}`}
                        checked={isSelected('waterTestingMethod', method)}
                        onCheckedChange={() => handleMultiSelect('waterTestingMethod', method)}
                      />
                      <Label htmlFor={`water-method-${method}`} className="text-sm">
                        {method}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fireplace Flue Open */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="water-testing-flue-open"
                  className="mt-0.5"
                  checked={formData.waterTestingFlueOpen || false}
                  onCheckedChange={(checked) => onChange('waterTestingFlueOpen', checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="water-testing-flue-open" className="text-sm font-medium cursor-pointer">Fireplace Flue Open</Label>
                  <p className="text-xs text-muted-foreground">The fireplace flue damper could not be operated. Closed building conditions may not be fully met.</p>
                </div>
              </div>

              {/* Testing Device Information */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="water-testing-device"
                  className="mt-0.5"
                  checked={formData.waterTestingDeviceChecked || false}
                  onCheckedChange={(checked) => onChange('waterTestingDeviceChecked', checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="water-testing-device" className="text-sm font-medium cursor-pointer">Testing Device Information</Label>
                  <p className="text-xs text-muted-foreground">Best Prod 17 in One Test Kit for Water, Metric Coliform Bacteria Test Kit</p>
                </div>
              </div>

              {/* Windows Were Opened */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="water-testing-windows"
                  className="mt-0.5"
                  checked={formData.waterTestingWindowsOpened || false}
                  onCheckedChange={(checked) => onChange('waterTestingWindowsOpened', checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="water-testing-windows" className="text-sm font-medium cursor-pointer">Windows Were Opened</Label>
                  <p className="text-xs text-muted-foreground">The windows were opened during the inspection preventing a true analysis.</p>
                </div>
              </div>

              {/* Testing Locations */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Testing Locations</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Kitchen Sink', 'Bathroom Sink'].map((location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={`water-location-${location}`}
                        checked={isSelected('waterTestingLocations', location)}
                        onCheckedChange={() => handleMultiSelect('waterTestingLocations', location)}
                      />
                      <Label htmlFor={`water-location-${location}`} className="text-sm">
                        {location}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Abnormal Smell or Taste */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Abnormal Smell or Taste</Label>
                <div className="flex gap-4 flex-wrap">
                  {['Yes', 'No', 'N/A'].map((option) => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="waterAbnormalSmellTaste"
                        value={option}
                        checked={formData.waterAbnormalSmellTaste === option}
                        onChange={(e) => onChange('waterAbnormalSmellTaste', e.target.value)}
                        className="h-4 w-4 text-primary border-input focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Window Mounted AC */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="water-testing-ac"
                  checked={formData.waterTestingWindowAC || false}
                  onCheckedChange={(checked) => onChange('waterTestingWindowAC', checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="water-testing-ac" className="text-sm font-medium">Window Mounted Air Conditioner</Label>
                  <p className="text-xs text-muted-foreground">One or more window mounted air conditioners were in place. Slight air blowby may have occurred.</p>
                </div>
              </div>

              {/* Start/End Days */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="waterTestStartDay">Start Day</Label>
                  <Input
                    id="waterTestStartDay"
                    type="text"
                    placeholder="e.g., Monday"
                    value={formData.waterTestStartDay || ''}
                    onChange={(e) => onChange('waterTestStartDay', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waterTestEndDay">End Day</Label>
                  <Input
                    id="waterTestEndDay"
                    type="text"
                    placeholder="e.g., Wednesday"
                    value={formData.waterTestEndDay || ''}
                    onChange={(e) => onChange('waterTestEndDay', e.target.value)}
                  />
                </div>
              </div>

              {/* Test Kit Moved */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="water-testing-kit-moved"
                  checked={formData.waterTestingKitMoved || false}
                  onCheckedChange={(checked) => onChange('waterTestingKitMoved', checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="water-testing-kit-moved" className="text-sm font-medium">Test Kit Moved</Label>
                  <p className="text-xs text-muted-foreground">The test kit was moved during the inspection. Tampering with the test kit voids the results. Recommend re-testing.</p>
                </div>
              </div>

              {/* Current Mitigation Installed */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="water-testing-mitigation"
                  checked={formData.waterTestingMitigation || false}
                  onCheckedChange={(checked) => onChange('waterTestingMitigation', checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="water-testing-mitigation" className="text-sm font-medium">Current Mitigation Installed</Label>
                  <p className="text-xs text-muted-foreground">A current water treatment/mitigation system was in place which could change results.</p>
                </div>
              </div>

              {/* COVID-19 */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="water-testing-covid"
                  checked={formData.waterTestingCovid || false}
                  onCheckedChange={(checked) => onChange('waterTestingCovid', checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="water-testing-covid" className="text-sm font-medium">COVID-19</Label>
                  <p className="text-xs text-muted-foreground">Due to the COVID-19 pandemic, the inspector shall wear a mask IAW CDC guidelines while indoors or in close proximity of personnel.</p>
                </div>
              </div>

              {/* Testing Device Information Input */}
              <div className="space-y-2">
                <Label htmlFor="waterTestingDeviceInfo">Testing Device Information (Details)</Label>
                <Input
                  id="waterTestingDeviceInfo"
                  placeholder="e.g., Best Prod 17 in One Test Kit for Water"
                  value={formData.waterTestingDeviceInfo || ''}
                  onChange={(e) => onChange('waterTestingDeviceInfo', e.target.value)}
                />
              </div>
            </div>

            {/* EPA Resources Info Block */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">EPA Resources</Label>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                For information about certified water testing laboratories, visit:{' '}
                <a 
                  href="https://www.epa.gov/dwlabcert/contact-information-certification-programs-and-certified-laboratories-drinking-water" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-900 dark:hover:text-blue-100"
                >
                  EPA Certified Laboratories for Drinking Water
                </a>
              </p>
            </div>

            {/* Recommendations Section */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <Label className="text-sm font-semibold text-foreground/80">Recommendations</Label>

              {/* Substance Levels Within Range */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="water-levels-normal"
                  checked={formData.waterLevelsWithinRange || false}
                  onCheckedChange={(checked) => onChange('waterLevelsWithinRange', checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="water-levels-normal" className="text-sm font-medium">Substance Levels Within Range</Label>
                  <p className="text-xs text-muted-foreground">Test strip results showed the water substances to be within range and not abnormal.</p>
                </div>
              </div>

              {/* Substance Levels Slightly Abnormal */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="water-levels-slight"
                  checked={formData.waterLevelsSlightlyAbnormal || false}
                  onCheckedChange={(checked) => onChange('waterLevelsSlightlyAbnormal', checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="water-levels-slight" className="text-sm font-medium">Substance Levels Slightly Abnormal</Label>
                  <p className="text-xs text-muted-foreground">The water test results for some substances were slightly abnormal. Follow-up laboratory testing from a qualified contractor is recommended.</p>
                </div>
              </div>

              {/* Laboratory Testing Not Used */}
              <div className="space-y-2">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="water-lab-not-used"
                    checked={formData.waterLabNotUsed || false}
                    onCheckedChange={(checked) => onChange('waterLabNotUsed', checked)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="water-lab-not-used" className="text-sm font-medium">Laboratory Testing Not Used</Label>
                    <p className="text-xs text-muted-foreground">A lab was not used for the water testing. The test strips are only a baseline test and may produce average or in some cases, inaccurate readings.</p>
                  </div>
                </div>
              </div>

              {/* Substance Levels Highly Abnormal */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="water-levels-high"
                  checked={formData.waterLevelsHighlyAbnormal || false}
                  onCheckedChange={(checked) => onChange('waterLevelsHighlyAbnormal', checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="water-levels-high" className="text-sm font-medium">Substance Levels Highly Abnormal</Label>
                  <p className="text-xs text-muted-foreground">The water test results for some substances were highly abnormal. Follow-up laboratory testing from a qualified contractor is recommended soon to verify the baseline readings.</p>
                </div>
              </div>
            </div>
          </div>
        )}

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