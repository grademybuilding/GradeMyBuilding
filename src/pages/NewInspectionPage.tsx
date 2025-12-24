import { useNavigate, useSearchParams } from "react-router-dom";
import { NewInspection } from "./NewInspection";

export default function NewInspectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get inspection ID from URL query param for resume functionality
  const inspectionId = searchParams.get('id') || undefined;

  const handleBack = () => {
    navigate("/inspections");
  };

  return <NewInspection onBack={handleBack} inspectionId={inspectionId} />;
}
