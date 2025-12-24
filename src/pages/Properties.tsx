import { AuthenticatedLayout } from "@/components/Layout/AuthenticatedLayout";
import PropertiesList from "@/components/Inspector/PropertiesList";

export default function Properties() {
  return (
    <AuthenticatedLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <PropertiesList />
      </div>
    </AuthenticatedLayout>
  );
}
