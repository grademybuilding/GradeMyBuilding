import { useNavigate } from "react-router-dom";
import { NewInspection } from "./NewInspection";

export default function NewInspectionPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/inspections");
  };

  return <NewInspection onBack={handleBack} />;
}

