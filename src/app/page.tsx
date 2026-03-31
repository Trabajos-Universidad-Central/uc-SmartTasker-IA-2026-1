'use client';

import { WelcomeHeader } from '@/components/dashboard/welcome-header';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { UpcomingEvents } from '@/components/dashboard/upcoming-events';
import { PendingTasks } from '@/components/dashboard/pending-tasks';
import { AiRecommendations } from '@/components/dashboard/ai-recommendations';
import { Categories } from '@/components/dashboard/categories';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <WelcomeHeader />
        <QuickActions />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <UpcomingEvents />
        </div>

        <div className="lg:col-span-1">
          <PendingTasks />
        </div>

        <div className="lg:col-span-1 space-y-8">
          <Categories />
          <AiRecommendations />
        </div>
      </div>
    </div>
  );
}
