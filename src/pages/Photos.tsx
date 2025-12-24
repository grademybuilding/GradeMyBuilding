import { AuthenticatedLayout } from "@/components/Layout/AuthenticatedLayout";
import PhotoGallery from "@/components/Inspector/PhotoGallery";

export default function Photos() {
  return (
    <AuthenticatedLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <PhotoGallery />
      </div>
    </AuthenticatedLayout>
  );
}
