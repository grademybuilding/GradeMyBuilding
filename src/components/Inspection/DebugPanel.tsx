import { useState } from "react";
import { ChevronDown, ChevronUp, X, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DebugPanelProps {
  inspectionId: string | null;
  status: 'draft' | 'completed';
  lastSaved: Date | null;
  saving: boolean;
  debugInfo: {
    lastOperation: string;
    lastPayload: any;
    lastResponse: any;
    lastVerification: any;
    errors: string[];
  };
}

export function DebugPanel({ 
  inspectionId, 
  status, 
  lastSaved, 
  saving,
  debugInfo 
}: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-background shadow-lg"
      >
        <Bug className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] bg-background border border-border rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 bg-muted/50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Bug className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Debug Panel</span>
          <span className={cn(
            "px-2 py-0.5 text-xs rounded-full",
            status === 'completed' 
              ? "bg-green-500/20 text-green-600" 
              : saving 
                ? "bg-yellow-500/20 text-yellow-600"
                : "bg-blue-500/20 text-blue-600"
          )}>
            {saving ? 'Saving...' : status}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Summary (always visible) */}
      <div className="p-3 border-b border-border text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Inspection ID:</span>
          <span className="font-mono">{inspectionId?.slice(0, 8) || 'None'}...</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Last Saved:</span>
          <span>{lastSaved ? lastSaved.toLocaleTimeString() : 'Never'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Last Operation:</span>
          <span className={cn(
            "font-medium",
            debugInfo.lastOperation === 'UPDATE' && "text-blue-500",
            debugInfo.lastOperation === 'CREATE' && "text-green-500"
          )}>
            {debugInfo.lastOperation || 'None'}
          </span>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="max-h-80 overflow-y-auto">
          {/* Errors */}
          {debugInfo.errors.length > 0 && (
            <div className="p-3 border-b border-border">
              <h4 className="text-xs font-semibold text-destructive mb-2">Errors ({debugInfo.errors.length})</h4>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {debugInfo.errors.slice(-5).map((err, i) => (
                  <p key={i} className="text-xs text-destructive font-mono bg-destructive/10 p-1 rounded">
                    {err}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Last Payload */}
          {debugInfo.lastPayload && (
            <div className="p-3 border-b border-border">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">Last Payload</h4>
              <pre className="text-[10px] font-mono bg-muted p-2 rounded overflow-x-auto max-h-32 overflow-y-auto">
                {JSON.stringify({
                  status: debugInfo.lastPayload.status,
                  checklist_ratings: `[${Object.keys(debugInfo.lastPayload.checklist_ratings || {}).length} items]`,
                  checklist_notes: `[${Object.keys(debugInfo.lastPayload.checklist_notes || {}).length} items]`,
                  checklist_data: `[${Object.keys(debugInfo.lastPayload.checklist_data || {}).length} keys]`,
                }, null, 2)}
              </pre>
            </div>
          )}

          {/* Last Response */}
          {debugInfo.lastResponse && (
            <div className="p-3 border-b border-border">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">Last Response</h4>
              <pre className="text-[10px] font-mono bg-muted p-2 rounded overflow-x-auto max-h-32 overflow-y-auto">
                {JSON.stringify(debugInfo.lastResponse, null, 2)}
              </pre>
            </div>
          )}

          {/* Last Verification */}
          {debugInfo.lastVerification && (
            <div className="p-3">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                Verification {debugInfo.lastVerification.verified ? '✅' : '❌'}
              </h4>
              {debugInfo.lastVerification.differences?.length > 0 && (
                <div className="text-xs text-destructive mb-2">
                  {debugInfo.lastVerification.differences.map((d: string, i: number) => (
                    <p key={i}>{d}</p>
                  ))}
                </div>
              )}
              {debugInfo.lastVerification.dbRow && (
                <pre className="text-[10px] font-mono bg-muted p-2 rounded overflow-x-auto max-h-32 overflow-y-auto">
                  {JSON.stringify({
                    id: debugInfo.lastVerification.dbRow.id,
                    status: debugInfo.lastVerification.dbRow.status,
                    checklist_ratings: `[${Object.keys(debugInfo.lastVerification.dbRow.checklist_ratings || {}).length} items]`,
                    checklist_data: `[${Object.keys(debugInfo.lastVerification.dbRow.checklist_data || {}).length} keys]`,
                  }, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer hint */}
      <div className="p-2 bg-muted/30 text-[10px] text-muted-foreground text-center">
        Check browser console for detailed logs
      </div>
    </div>
  );
}
