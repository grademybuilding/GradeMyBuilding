import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, Plus, Trash2, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CustomerForm } from "./CustomerForm";

const invoiceSchema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
  inspection_id: z.string().optional(),
  issue_date: z.date(),
  due_date: z.date(),
  tax_rate: z.number().min(0).max(100),
  notes: z.string().optional(),
});

interface InvoiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId?: string | null;
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface Inspection {
  id: string;
  property_id: string;
  properties: {
    address: string;
  };
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export function InvoiceForm({ open, onOpenChange, invoiceId }: InvoiceFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0, total: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customer_id: "",
      inspection_id: "",
      issue_date: new Date(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      tax_rate: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      fetchCustomers();
      fetchInspections();
      if (invoiceId) {
        fetchInvoice();
      } else {
        generateInvoiceNumber();
      }
    }
  }, [open, invoiceId]);

  const fetchCustomers = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("customers")
      .select("id, name, email")
      .eq("inspector_id", user.id)
      .order("name");

    setCustomers(data || []);
  };

  const fetchInspections = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("inspections")
      .select(
        `
        id,
        property_id,
        properties (
          address
        )
      `,
      )
      .eq("inspector_id", user.id)
      .order("created_at", { ascending: false });

    setInspections(data || []);
  };

  const [invoiceNumber, setInvoiceNumber] = useState("");

  const generateInvoiceNumber = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { count } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("inspector_id", user.id);

    const nextNumber = (count || 0) + 1;
    setInvoiceNumber(`INV-${String(nextNumber).padStart(5, "0")}`);
  };

  const fetchInvoice = async () => {
    if (!invoiceId) return;

    const { data, error } = await supabase
      .from("invoices")
      .select(
        `
        *,
        invoice_items (*)
      `,
      )
      .eq("id", invoiceId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    form.reset({
      customer_id: data.customer_id,
      inspection_id: data.inspection_id || "",
      issue_date: new Date(data.issue_date),
      due_date: new Date(data.due_date),
      tax_rate: Number(data.tax_rate),
      notes: data.notes || "",
    });

    setInvoiceNumber(data.invoice_number);
    setLineItems(data.invoice_items || []);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const taxRate = form.watch("tax_rate") || 0;
    return (subtotal * taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems((items) =>
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unit_price") {
          updated.total = updated.quantity * updated.unit_price;
        }
        return updated;
      }),
    );
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const onSubmit = async (values: z.infer<typeof invoiceSchema>, status: string) => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const subtotal = calculateSubtotal();
      const taxAmount = calculateTax();
      const total = calculateTotal();

      const invoiceData = {
        invoice_number: invoiceNumber,
        inspector_id: user.id,
        customer_id: values.customer_id,
        inspection_id: values.inspection_id || null,
        status,
        issue_date: format(values.issue_date, "yyyy-MM-dd"),
        due_date: format(values.due_date, "yyyy-MM-dd"),
        subtotal,
        tax_rate: values.tax_rate,
        tax_amount: taxAmount,
        total,
        notes: values.notes || "",
      };

      let invoiceResult;
      if (invoiceId) {
        const { data, error } = await supabase
          .from("invoices")
          .update(invoiceData)
          .eq("id", invoiceId)
          .select()
          .single();

        if (error) throw error;
        invoiceResult = data;

        // Delete existing items
        await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
      } else {
        const { data, error } = await supabase.from("invoices").insert(invoiceData).select().single();

        if (error) throw error;
        invoiceResult = data;
      }

      // Insert line items
      const itemsData = lineItems.map((item) => ({
        invoice_id: invoiceResult.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      }));

      const { error: itemsError } = await supabase.from("invoice_items").insert(itemsData);

      if (itemsError) throw itemsError;

      toast({
        title: "Success",
        description: `Invoice ${status === "draft" ? "saved as draft" : "created and sent"}`,
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{invoiceId ? "Edit Invoice" : "New Invoice"}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{invoiceNumber}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer *</FormLabel>
                      <div className="flex gap-2">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id || ""}>
                                {customer.name} - {customer.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" size="icon" onClick={() => setIsCustomerFormOpen(true)}>
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="inspection_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to Inspection (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select inspection" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {inspections.map((inspection) => (
                            <SelectItem key={inspection.id} value={inspection.id}>
                              {inspection.properties.address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issue_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Issue Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Line Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                {lineItems.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                        placeholder="Item description"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateLineItem(item.id, "unit_price", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Total</Label>
                      <Input value={item.total.toFixed(2)} disabled />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tax Rate (%):</span>
                  <FormField
                    control={form.control}
                    name="tax_rate"
                    render={({ field }) => (
                      <Input
                        type="number"
                        className="w-24"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    )}
                  />
                </div>
                <div className="flex justify-between">
                  <span>Tax Amount:</span>
                  <span className="font-medium">${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Additional notes or terms" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={form.handleSubmit((values) => onSubmit(values, "draft"))}
                  disabled={loading}
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  onClick={form.handleSubmit((values) => onSubmit(values, "sent"))}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save & Send"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <CustomerForm
        open={isCustomerFormOpen}
        onOpenChange={(open) => {
          setIsCustomerFormOpen(open);
          if (!open) fetchCustomers();
        }}
      />
    </>
  );
}
