import { AuthenticatedLayout } from "@/components/Layout/AuthenticatedLayout";
import InvoiceManager from "@/components/Inspector/InvoiceManager";

export default function Invoices() {
  return (
    <AuthenticatedLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <InvoiceManager />
      </div>
    </AuthenticatedLayout>
  );
}
