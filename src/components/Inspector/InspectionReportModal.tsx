import { Loader2, Printer, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInspectionDetails } from "@/hooks/useInspections";
import InspectionReport from "./InspectionReport";

interface InspectionReportModalProps {
  inspectionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InspectionReportModal({ 
  inspectionId, 
  open, 
  onOpenChange 
}: InspectionReportModalProps) {
  const { 
    inspection, 
    checklistItems, 
    photos, 
    loading, 
    error 
  } = useInspectionDetails(open ? inspectionId : null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 print:max-w-none print:max-h-none print:p-0">
        {/* Header - Hidden in print */}
        <DialogHeader className="p-4 pb-0 no-print">
          <div className="flex items-center justify-between">
            <DialogTitle>Inspection Report</DialogTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrint}
                disabled={loading || !!error || !inspection}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="max-h-[calc(95vh-80px)] print:max-h-none print:overflow-visible">
          <div className="p-6 print:p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading report...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">Failed to load report</p>
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : inspection ? (
              <InspectionReport 
                inspection={inspection} 
                checklistItems={checklistItems} 
                photos={photos} 
              />
            ) : null}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
