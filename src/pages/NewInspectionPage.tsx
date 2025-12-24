import { useNavigate } from "react-router-dom";
import { AuthenticatedLayout } from "@/components/Layout/AuthenticatedLayout";
import { NewInspection } from "./NewInspection";

export default function NewInspectionPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/inspections');
  };

  return (
    <AuthenticatedLayout>
      <NewInspection onBack={handleBack} />
    </AuthenticatedLayout>
  );
}
