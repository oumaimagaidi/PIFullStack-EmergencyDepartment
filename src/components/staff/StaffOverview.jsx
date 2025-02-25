import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const StaffOverview = () => {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="glass-card hover-scale">
        <CardHeader>
          <CardTitle>Staff Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>Total Staff: 24</div>
            <div>Doctors: 8</div>
            <div>Nurses: 12</div>
            <div>Admin: 4</div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card hover-scale">
        <CardHeader>
          <CardTitle>Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>Emergency: 6 staff</div>
            <div>ICU: 8 staff</div>
            <div>General: 5 staff</div>
            <div>Surgery: 5 staff</div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card hover-scale">
        <CardHeader>
          <CardTitle>Current Shift</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>On Duty: 12</div>
            <div>Off Duty: 8</div>
            <div>On Leave: 4</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffOverview;