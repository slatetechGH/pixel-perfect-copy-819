import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ExternalLink } from "lucide-react";

const Settings = () => (
  <DashboardLayout title="Settings" subtitle="Business profile & configuration">
    <div className="max-w-2xl space-y-6">
      <Card className="border-0 shadow-card">
        <CardHeader className="px-6 pt-6 pb-4">
          <CardTitle className="text-[15px] font-medium">Business Profile</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-label text-muted-foreground">Business Name</Label>
              <Input defaultValue="The Harbour Fish Co." className="mt-1.5" />
            </div>
            <div>
              <Label className="text-label text-muted-foreground">Business Type</Label>
              <Input defaultValue="Fishmonger" className="mt-1.5" readOnly />
            </div>
          </div>
          <div>
            <Label className="text-label text-muted-foreground">Subdomain</Label>
            <div className="flex items-center gap-2 mt-1.5">
              <Input defaultValue="harbour-fish" className="flex-1" />
              <span className="text-[13px] text-muted-foreground">.slate.com</span>
            </div>
          </div>
          <div>
            <Label className="text-label text-muted-foreground">Contact Email</Label>
            <Input defaultValue="hello@harbourfish.co.uk" className="mt-1.5" />
          </div>
          <Button size="sm">Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-card">
        <CardHeader className="px-6 pt-6 pb-4">
          <CardTitle className="text-[15px] font-medium">Stripe Connect</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="text-[14px] font-medium text-foreground">Connected</p>
                <p className="text-[12px] text-muted-foreground">Payouts enabled • acct_1Abc...xyz</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-1.5" /> Stripe Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-card">
        <CardHeader className="px-6 pt-6 pb-4">
          <CardTitle className="text-[15px] font-medium">Slate Plan</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary mb-1">
                Growth
              </span>
              <p className="text-[13px] text-muted-foreground">£79/month • Up to 500 subscribers • 2.5% transaction fee</p>
            </div>
            <Button variant="outline" size="sm">Upgrade</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);

export default Settings;
