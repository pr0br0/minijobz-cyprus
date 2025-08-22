"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  CreditCard, 
  Receipt, 
  Crown, 
  Star, 
  Zap, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Plus,
  Info
} from "lucide-react";
import { toast } from "sonner";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  createdAt: string;
  jobId?: string;
  planType?: string;
  stripePaymentIntentId?: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  startsAt: string;
  endsAt: string;
  stripeSubscriptionId?: string;
}

const pricingPlans = {
  jobPosting: {
    name: "Single Job Posting",
    price: 20,
    description: "Post a job for 30 days",
    features: [
      "30-day job listing",
      "Basic visibility",
      "Application management",
      "Email notifications"
    ]
  },
  featured: {
    name: "Featured Job",
    price: 15,
    description: "Make your job stand out",
    features: [
      "Highlighted in search results",
      "Featured on homepage",
      "Priority placement",
      "Increased visibility"
    ]
  },
  urgent: {
    name: "Urgent Job",
    price: 10,
    description: "Fill your position quickly",
    features: [
      "Urgent badge",
      "Top search results",
      "Same-day processing",
      "Dedicated support"
    ]
  },
  basic: {
    name: "Basic Subscription",
    price: 50,
    description: "Perfect for small businesses",
    features: [
      "5 job postings per month",
      "Basic support",
      "Company profile",
      "Application tracking"
    ]
  },
  premium: {
    name: "Premium Subscription",
    price: 150,
    description: "For growing companies",
    features: [
      "Unlimited job postings",
      "Priority support",
      "Advanced analytics",
      "Featured jobs",
      "Candidate matching"
    ]
  }
};

export default function BillingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === "EMPLOYER") {
      fetchPaymentHistory();
      fetchSubscription();
    }
  }, [session]);

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch('/api/employer/payments');
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      toast.error("Failed to load payment history.");
    } finally {
      setPaymentsLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/employer/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription || null);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const handlePayment = async (paymentType: string, planType?: string, jobId?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentType,
          planType,
          jobId,
          successUrl: `${window.location.origin}/billing?success=true`,
          cancelUrl: `${window.location.origin}/billing?canceled=true`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const { clientSecret, paymentId } = await response.json();

      // Here you would typically use Stripe Elements to handle the payment
      // For now, we'll simulate the payment process
      toast.success("Payment initiated! Redirecting to payment gateway...");

      // In a real implementation, you would redirect to Stripe Checkout or use Stripe Elements
      // For demo purposes, we'll simulate a successful payment after 2 seconds
      setTimeout(() => {
        toast.success("Payment completed successfully!");
        fetchPaymentHistory();
        fetchSubscription();
      }, 2000);

    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (session?.user?.role !== "EMPLOYER") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Access Restricted</AlertTitle>
          <AlertDescription>
            This page is only accessible to employers. Please sign in with an employer account.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Payments</h1>
        <p className="text-gray-600">
          Manage your job postings, subscriptions, and payment history
        </p>
      </div>

      {/* Current Subscription */}
      {subscription && (
        <Card className="mb-8 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Crown className="w-5 h-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{subscription.plan} Plan</h3>
                <p className="text-gray-600">
                  {formatDate(subscription.startsAt)} - {formatDate(subscription.endsAt)}
                </p>
                <Badge className={subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {subscription.status}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {subscription.plan === 'BASIC' ? '€50' : '€150'}
                  <span className="text-sm font-normal text-gray-600">/month</span>
                </p>
                <Button variant="outline" size="sm">
                  Manage Subscription
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Pricing Plans */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
            <p className="text-gray-600">
              Select the option that best fits your hiring needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Job Posting */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  {pricingPlans.jobPosting.name}
                </CardTitle>
                <CardDescription>{pricingPlans.jobPosting.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">€{pricingPlans.jobPosting.price}</span>
                  <span className="text-gray-600">/posting</span>
                </div>
                <ul className="space-y-2 mb-4">
                  {pricingPlans.jobPosting.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handlePayment('JOB_POSTING')}
                  disabled={loading}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post a Job
                </Button>
              </CardContent>
            </Card>

            {/* Featured Job */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  {pricingPlans.featured.name}
                </CardTitle>
                <CardDescription>{pricingPlans.featured.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">€{pricingPlans.featured.price}</span>
                  <span className="text-gray-600">/upgrade</span>
                </div>
                <ul className="space-y-2 mb-4">
                  {pricingPlans.featured.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handlePayment('FEATURED_JOB')}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Upgrade Job
                </Button>
              </CardContent>
            </Card>

            {/* Urgent Job */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-600" />
                  {pricingPlans.urgent.name}
                </CardTitle>
                <CardDescription>{pricingPlans.urgent.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">€{pricingPlans.urgent.price}</span>
                  <span className="text-gray-600">/upgrade</span>
                </div>
                <ul className="space-y-2 mb-4">
                  {pricingPlans.urgent.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handlePayment('URGENT_JOB')}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Mark as Urgent
                </Button>
              </CardContent>
            </Card>

            {/* Basic Subscription */}
            <Card className="hover:shadow-lg transition-shadow border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Crown className="w-5 h-5" />
                  {pricingPlans.basic.name}
                </CardTitle>
                <CardDescription>{pricingPlans.basic.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">€{pricingPlans.basic.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-2 mb-4">
                  {pricingPlans.basic.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handlePayment('SUBSCRIPTION', 'BASIC')}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Subscribe Now
                </Button>
              </CardContent>
            </Card>

            {/* Premium Subscription */}
            <Card className="hover:shadow-lg transition-shadow border-purple-200 md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Crown className="w-5 h-5" />
                  {pricingPlans.premium.name}
                </CardTitle>
                <CardDescription>{pricingPlans.premium.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-3xl font-bold">€{pricingPlans.premium.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">Most Popular</Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <ul className="space-y-2">
                    {pricingPlans.premium.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <ul className="space-y-2">
                    {pricingPlans.premium.features.slice(3).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button 
                  onClick={() => handlePayment('SUBSCRIPTION', 'PREMIUM')}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Go Premium
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment History */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Payment History
              </CardTitle>
              <CardDescription>
                Your recent payments and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="space-y-3">
                  <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
                </div>
              ) : payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(payment.status)}
                          <span className="text-sm font-medium">
                            {payment.type.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {formatDate(payment.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          €{(payment.amount / 100).toFixed(2)}
                        </span>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No payment history yet</p>
                  <p className="text-sm text-gray-500">
                    Make your first payment to see it here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Security Notice */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            Secure Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>PCI Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>EU-Based Processing</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            All payments are processed securely through Stripe. We do not store your credit card information.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}