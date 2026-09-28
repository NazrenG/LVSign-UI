import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout";
import { SearchInput, SectionHeading, StatGroup } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { AGREEMENTS } from "@/data/agreements";
import { CURRENT_USER } from "@/data/people";
import {
  getDashboardStats,
  getRecentlyCompleted,
  getSentByUser,
  getWaitingForUser,
} from "@/features/agreements";
import { QuickActions } from "@/features/dashboard/components/QuickActions";
import { RecentlyCompletedList } from "@/features/dashboard/components/RecentlyCompletedList";
import { SentByYouList } from "@/features/dashboard/components/SentByYouList";

import { WaitingForYouCard } from "@/features/dashboard/components/WaitingForYouCard";
import {
  formatLongDate,
  getFirstName,
  getGreeting,
  pluralize,
} from "@/utils/formatters";

export function HomePage() {
  const today = new Date();
  const waitingForYou = getWaitingForUser(AGREEMENTS, CURRENT_USER.id);
  const sentByYou = getSentByUser(AGREEMENTS, CURRENT_USER.id);
  const recentlyCompleted = getRecentlyCompleted(AGREEMENTS, 2);

  const subtitle = waitingForYou.length
    ? `${formatLongDate(today)} · ${pluralize(waitingForYou.length, "document")} ${waitingForYou.length === 1 ? "needs" : "need"} your signature`
    : formatLongDate(today);

  return (
    <>
      <PageHeader
        title={`${getGreeting(today)}, ${getFirstName(CURRENT_USER.name)}`}
        subtitle={subtitle}
        actions={
          <SearchInput
            placeholder="Search documents and people"
            className="w-full md:w-96"
          />
        }
      />

      <div className="space-y-7">
        <QuickActions
          waitingCount={waitingForYou.length}
          firstWaitingId={waitingForYou[0]?.id}
        />
        <StatGroup
          stats={getDashboardStats(AGREEMENTS, CURRENT_USER.id, today)}
        />

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-7">
          <div className="space-y-8">
            <section>
              <SectionHeading title="Waiting for you" />
              <div className="space-y-4">
                {waitingForYou.map((agreement) => (
                  <WaitingForYouCard key={agreement.id} agreement={agreement} />
                ))}
              </div>
            </section>

            <section>
              <SectionHeading title="Recently completed" />
              <RecentlyCompletedList agreements={recentlyCompleted} />
            </section>
          </div>

          <section>
            <SectionHeading
              title="Sent by you"
              action={
                <Link
                  to={ROUTES.agreements}
                  className="text-[15px] font-medium text-primary hover:underline"
                >
                  View all agreements
                </Link>
              }
            />
            <SentByYouList agreements={sentByYou} />
          </section>
        </div>
      </div>
    </>
  );
}
