import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ExternalLink } from "lucide-react";

const Settings = () => (
  <DashboardLayout title="Settings" subtitle="Business profile & configuration">
    <div className="max-w-2xl space-y-6">
      {/* Business Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Business Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Business Name</Label>
              <Input defaultValue="The Harbour Fish Co." className="mt-1" />
            </div>
            <div>
              <Label className="text-sm">Business Type</Label>
              <Input defaultValue="Fishmonger" className="mt-1" readOnly />
            </div>
          </div>
          <div>
            <Label className="text-sm">Subdomain</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input defaultValue="harbour-fish" className="flex-1" />
              <span className="text-sm text-muted-foreground">.localplate.com</span>
            </div>
          </div>
          <div>
            <Label className="text-sm">Contact Email</Label>
            <Input defaultValue="hello@harbourfish.co.uk" className="mt-1" />
          </div>
          <Button size="sm">Save Changes</Button>
        </CardContent>
      </Card>

      {/* Stripe */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Stripe Connect</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium text-foreground">Connected</p>
                <p className="text-xs text-muted-foreground">Payouts enabled • acct_1Abc...xyz</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-1" /> Stripe Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">LocalPlate Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-1">Growth</Badge>
              <p className="text-sm text-muted-foreground">£79/month • Up to 500 subscribers • 2.5% transaction fee</p>
            </div>
            <Button variant="outline" size="sm">Upgrade</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);

export default Settings;
