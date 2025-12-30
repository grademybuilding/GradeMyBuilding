import { Loader2, Printer, AlertCircle, Download } from "lucide-react";
import { useState, useRef } from "react";
import { createRoot } from "react-dom/client";
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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!inspection) return;

    setDownloading(true);
    toast.info("Generating PDF...");

    try {
      // Create a temporary container for the PDF template
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
      tempContainer.style.backgroundColor = '#ffffff';
      document.body.appendChild(tempContainer);

      // Render the PDF template to the temporary container
      const root = createRoot(tempContainer);
      root.render(
        <InspectionReportPDF 
          inspection={inspection} 
          checklistItems={checklistItems} 
          photos={photos} 
        />
      );

      // Wait for render and images to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture the report as canvas
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Cleanup
      root.unmount();
      document.body.removeChild(tempContainer);

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename
      const address = inspection.properties?.address || 'inspection';
      const date = new Date(inspection.inspection_date).toISOString().split('T')[0];
      const filename = `Inspection_Report_${address.replace(/[^a-zA-Z0-9]/g, '_')}_${date}.pdf`;

      pdf.save(filename);
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
          <div className="flex items-center justify-between">
            <DialogTitle>Inspection Report</DialogTitle>
            <div className="flex items-center gap-2">
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrint}
                disabled={loading || !!error || !inspection}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
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
