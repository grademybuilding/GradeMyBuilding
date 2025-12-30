import { Loader2, AlertCircle, Download } from "lucide-react";
import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
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
import InspectionReportPDF from "./InspectionReportPDF";
import { toast } from "sonner";

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

  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!inspection) return;

    setDownloading(true);
    toast.info("Generating PDF...");

    try {
      // Generate PDF using @react-pdf/renderer
      const blob = await pdf(
        <InspectionReportPDF 
          inspection={inspection} 
          checklistItems={checklistItems} 
          photos={photos} 
        />
      ).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Generate filename
      const address = inspection.properties?.address || 'inspection';
      const date = new Date(inspection.inspection_date).toISOString().split('T')[0];
      const filename = `Inspection_Report_${address.replace(/[^a-zA-Z0-9]/g, '_')}_${date}.pdf`;

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Report downloaded successfully!");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF. Please try the Print option instead.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 print:max-w-none print:max-h-none print:p-0">
        {/* Header - Hidden in print */}
        <DialogHeader className="p-4 pb-0 no-print">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle>Inspection Report</DialogTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
              disabled={loading || !!error || !inspection || downloading}
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download PDF
            </Button>
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
