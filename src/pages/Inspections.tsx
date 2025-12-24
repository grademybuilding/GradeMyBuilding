import { AuthenticatedLayout } from "@/components/Layout/AuthenticatedLayout";
import InspectionsList from "@/components/Inspector/InspectionsList";
import { useNavigate } from "react-router-dom";

export default function Inspections() {
  const navigate = useNavigate();

  const handleTabChange = (tab: string) => {
    navigate(`/${tab === 'dashboard' ? 'dashboard' : tab}`);
  };

  return (
    <AuthenticatedLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <InspectionsList onTabChange={handleTabChange} />
      </div>
    </AuthenticatedLayout>
  );
}
