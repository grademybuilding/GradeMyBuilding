import { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Inspection {
  id: string;
  inspection_date: string;
  status: string;
  property: {
    address: string;
    city: string;
    state: string;
  } | null;
}

interface PhotoUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: File[], inspectionId: string, caption: string) => Promise<void>;
  isUploading: boolean;
  inspections?: Inspection[];
  selectedInspectionId?: string | null;
}

export function PhotoUploadModal({
  open,
  onOpenChange,
  onUpload,
  isUploading,
  inspections = [],
  selectedInspectionId = null
}: PhotoUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [inspectionId, setInspectionId] = useState(selectedInspectionId || '');
  const [caption, setCaption] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep local inspection selection in sync with the latest prop
  useEffect(() => {
    if (!open) return;

    console.debug('[PhotoUploadModal] sync inspectionId', {
      selectedInspectionId,
      currentInspectionId: inspectionId,
      inspectionsCount: inspections.length,
    });

    // If parent provides a selected inspection, always respect it.
    if (selectedInspectionId) {
      setInspectionId(selectedInspectionId);
      return;
    }

    // Otherwise, keep whatever user picked (do not auto-select first inspection).
  }, [open, selectedInspectionId, inspections.length]);

  const formatInspectionLabel = (inspection: Inspection) => {
    const address = inspection.property?.address || 'Unknown Address';
    const date = new Date(inspection.inspection_date).toLocaleDateString();
    return `${address} - ${date}`;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        validFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    console.debug('[PhotoUploadModal] submit', {
      inspectionId,
      selectedInspectionId,
      selectedFilesCount: selectedFiles.length,
      captionLength: caption.length,
    });

    if (selectedFiles.length === 0 || !inspectionId) return;

    await onUpload(selectedFiles, inspectionId, caption);

    // Clean up
    previews.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviews([]);
    setInspectionId(selectedInspectionId || '');
    setCaption('');
    onOpenChange(false);
  };

  const resetForm = () => {
    previews.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviews([]);
    setInspectionId(selectedInspectionId || '');
    setCaption('');
  };

  const handleClose = () => {
    console.debug('[PhotoUploadModal] close');
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        console.debug('[PhotoUploadModal] onOpenChange', { nextOpen });
        if (!nextOpen) {
          handleClose();
        } else {
          onOpenChange(true);
        }
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Inspection Photos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Inspection Selection */}
          <div className="space-y-2">
            <Label htmlFor="inspection">Inspection *</Label>
            <Select
              value={inspectionId}
              onValueChange={(val) => {
                console.debug('[PhotoUploadModal] inspection selected', { val });
                setInspectionId(val);
              }}
            >
              <SelectTrigger id="inspection">
                <SelectValue placeholder="Select an inspection" />
              </SelectTrigger>
              <SelectContent>
                {inspections.map(inspection => (
                  <SelectItem key={inspection.id} value={inspection.id}>
                    <div className="flex items-center gap-2">
                      <span>{formatInspectionLabel(inspection)}</span>
                      <Badge 
                        variant={inspection.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {inspection.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Caption Input */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption / Description</Label>
            <Textarea
              id="caption"
              placeholder="Add a description for these photos..."
              value={caption}
              onChange={e => setCaption(e.target.value)}
              rows={2}
            />
          </div>

          {/* Drop Zone */}
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50',
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => handleFileSelect(e.target.files)}
            />
            <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Drag & drop images here, or click to select
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports JPG, PNG, GIF, WEBP
            </p>
          </div>

          {/* Preview Grid */}
          {previews.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Photos ({previews.length})</Label>
              <div className="grid grid-cols-3 gap-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-square group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedFiles.length === 0 || !inspectionId || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
