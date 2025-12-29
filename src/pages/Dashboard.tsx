import { useState, useEffect } from "react";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { RecentInspections } from "@/components/Dashboard/RecentInspections";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { StatsCardSkeleton } from "@/components/Skeletons";
import { Building, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalInspections: number;
  completedToday: number;
  inProgress: number;
  issuesFound: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      // Get all inspections for this user
      const { data: inspections, error } = await supabase
        .from('inspections')
        .select('id, status, created_at, poor_count, replace_count')
        .eq('inspector_id', session.user.id);

      if (error) throw error;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const totalInspections = inspections?.length || 0;
      const completedToday = inspections?.filter(i => {
        const createdAt = new Date(i.created_at);
        return i.status === 'completed' && createdAt >= today;
      }).length || 0;
      const inProgress = inspections?.filter(i => 
        i.status === 'draft' || i.status === 'in_progress'
      ).length || 0;
      const issuesFound = inspections?.reduce((sum, i) => 
        sum + (i.poor_count || 0) + (i.replace_count || 0), 0
      ) || 0;

      setStats({
        totalInspections,
        completedToday,
        inProgress,
        issuesFound
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalInspections: 0,
        completedToday: 0,
        inProgress: 0,
        issuesFound: 0
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">GradeMyBuilding - Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, Inspector</p>
      </div>

      <QuickActions />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Inspections"
              value={stats?.totalInspections ?? 0}
              icon={Building}
            />
            <StatsCard
              title="Completed Today"
              value={stats?.completedToday ?? 0}
              icon={CheckCircle}
              variant="success"
            />
            <StatsCard
              title="In Progress"
              value={stats?.inProgress ?? 0}
              icon={Clock}
              variant="accent"
            />
            <StatsCard
              title="Issues Found"
              value={stats?.issuesFound ?? 0}
              icon={AlertTriangle}
            />
          </>
        )}
      </div>

      {/* Recent Inspections */}
      <RecentInspections />
    </div>
  );
}
