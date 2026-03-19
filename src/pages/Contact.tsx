import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PublicHeader } from "@/components/Layout/PublicHeader";
import { EmbeddedChat } from "@/components/AIChat/EmbeddedChat";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Building2, Briefcase, Tag, MessageSquare, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const roleOptions = ["Inspector", "Appraiser", "Real Estate Agent", "Assessor", "Underwriter", "Other"] as const;


const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Full name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  company: z.string().trim().max(100).optional().or(z.literal("")),
  role: z.string().min(1, "Please select a role"),
  category: z.string().min(1, "Please select a category"),
  message: z.string().trim().min(20, "Message must be at least 20 characters").max(2000),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      role: "",
      category: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("contact-form", {
        body: {
          name: data.name,
          email: data.email,
          company: data.company || "",
          role: data.role,
          category: data.category,
          message: data.message,
        },
      });

      if (error) throw error;

      toast.success("Thanks! Beena will reply to your email shortly with helpful information. Our team may also follow up personally.");
      form.reset();
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero */}
      <section className="py-10 md:py-14">
        <div className="container px-4 md:px-6 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground">
            Get instant answers from our AI Inspector Assistant, or send us a message.
          </p>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="pb-12 md:pb-16">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* LEFT: Embedded AI Chat (60%) */}
            <div>
              <EmbeddedChat />
            </div>

            {/* RIGHT: Contact Form (40%) */}
            <div>
              <Card className="shadow-lg h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Send Us a Message
                  </CardTitle>
                  <CardDescription>
                    We'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              Full Name *
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                              Email Address *
                            </FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                              Company Name
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Acme Inc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1.5">
                              <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                              Role *
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {roleOptions.map((r) => (
                                  <SelectItem key={r} value={r}>{r}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1.5">
                              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                              Question Category *
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categoryOptions.map((c) => (
                                  <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1.5">
                              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                              Message *
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us more about your question (min 20 characters)…"
                                className="min-h-[100px] resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Sending…" : "Send Message"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Other ways to reach us */}
      <section className="border-t border-border bg-muted/30 py-10">
        <div className="container px-4 md:px-6">
          <h2 className="text-xl font-semibold text-center mb-6">Other ways to reach us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
            <div>
              <Mail className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="font-medium text-sm">Email</p>
              <a href="mailto:beena@agentmail.to" className="text-sm text-primary hover:underline">
                beena@agentmail.to
              </a>
            </div>
            <div>
              <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="font-medium text-sm">Response Time</p>
              <p className="text-sm text-muted-foreground">
                Beena responds instantly. Our team follows up within 24 hours.
              </p>
            </div>
            <div>
              <ArrowRight className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="font-medium text-sm">Ready to get started?</p>
              <Link to="/auth" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                Create your free inspector account <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
