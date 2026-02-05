import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getUser } from '@/lib/supabase-server';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card';
import { CircularProgress, ProgressBar } from '@/components/Progress';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Stats | The Session',
  description: 'Track your contributions, achievements, and progress on The Session',
};

export const dynamic = 'force-dynamic';

async function getUserStats(userId: string) {
  const supabase = await createServerSupabaseClient();

  // Get user profile with points and level
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // Get contribution counts
  const [pricesResult, reviewsResult, photosResult] = await Promise.all([
    supabase.from('prices').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('pub_photos').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);

  // Get leaderboard rank
  const { data: leaderboard } = await supabase
    .from('profiles')
    .select('id, points')
    .order('points', { ascending: false })
    .limit(1000);

  const rank = leaderboard?.findIndex(p => p.id === userId) ?? -1;

  // Calculate level progress
  const level = Math.floor((profile?.points || 0) / 100) + 1;
  const pointsInLevel = (profile?.points || 0) % 100;
  const nextLevelPoints = 100;

  // Mock activity data (in production, query actual activity)
  const activityData = Array.from({ length: 12 }, (_, i) => ({
    week: `Week ${i + 1}`,
    contributions: Math.floor(Math.random() * 20),
  }));

  return {
    profile,
    stats: {
      prices_count: pricesResult.count || 0,
      reviews_count: reviewsResult.count || 0,
      photos_count: photosResult.count || 0,
      verifications_count: 0, // Would need separate tracking
    },
    level,
    pointsInLevel,
    nextLevelPoints,
    rank: rank >= 0 ? rank + 1 : null,
    totalUsers: leaderboard?.length || 0,
    activityData,
  };
}

export default async function StatsPage() {
  const user = await getUser();
  if (!user) {
    redirect('/auth/login?returnUrl=/stats');
  }

  const data = await getUserStats(user.id);

  // Calculate total points from contributions
  const totalContributions =
    data.stats.prices_count +
    data.stats.reviews_count +
    data.stats.photos_count +
    data.stats.verifications_count;

  // Calculate streak (mock - in production, calculate from actual activity)
  const streakDays = 7;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon="🏆"
          value={data.level}
          label="Level"
          sublabel={`${data.profile?.points || 0} points`}
          gradient="from-amber-600 to-amber-700"
        />
        <StatCard
          icon="🔥"
          value={streakDays}
          label="Day Streak"
          sublabel="Keep it going!"
          gradient="from-red-600 to-orange-600"
        />
        {data.rank && (
          <StatCard
            icon="#️⃣"
            value={data.rank}
            label="Leaderboard Rank"
            sublabel={`Top ${Math.round((data.rank / data.totalUsers) * 100)}%`}
            gradient="from-irish-green-600 to-irish-green-700"
          />
        )}
      </div>

      {/* Level progress */}
      <Card className="mb-6 bg-gradient-to-br from-stout-800 to-stout-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Level {data.level} Progress</CardTitle>
              <p className="text-sm text-stout-400 mt-1">
                {data.nextLevelPoints - data.pointsInLevel} points to Level {data.level + 1}
              </p>
            </div>
            <CircularProgress
              value={data.pointsInLevel}
              max={data.nextLevelPoints}
              size={80}
              color="green"
            >
              <div className="text-center">
                <div className="text-lg font-bold text-cream-100">{data.level}</div>
              </div>
            </CircularProgress>
          </div>
        </CardHeader>
        <CardContent>
          <ProgressBar
            value={data.pointsInLevel}
            max={data.nextLevelPoints}
            showLabel
            color="green"
          />
        </CardContent>
      </Card>

      {/* Contribution breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Contributions</CardTitle>
          <p className="text-sm text-stout-400 mt-1">
            Total: {totalContributions} contributions
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ContributionRow
              icon="💰"
              label="Prices Submitted"
              value={data.stats.prices_count}
              points={data.stats.prices_count * 5}
              color="green"
            />
            <ContributionRow
              icon="✍️"
              label="Reviews Written"
              value={data.stats.reviews_count}
              points={data.stats.reviews_count * 10}
              color="blue"
            />
            <ContributionRow
              icon="📸"
              label="Photos Uploaded"
              value={data.stats.photos_count}
              points={data.stats.photos_count * 3}
              color="purple"
            />
            <ContributionRow
              icon="✅"
              label="Price Verifications"
              value={data.stats.verifications_count}
              points={data.stats.verifications_count * 2}
              color="amber"
            />
          </div>
        </CardContent>
      </Card>

      {/* Activity chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Activity Over Time</CardTitle>
          <p className="text-sm text-stout-400 mt-1">Last 12 weeks</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-48">
            {data.activityData.map((week, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full bg-stout-700 rounded-t">
                  <div
                    className="bg-irish-green-600 rounded-t transition-all hover:bg-irish-green-500"
                    style={{
                      height: `${Math.max((week.contributions / 20) * 100, 5)}%`,
                    }}
                    title={`${week.contributions} contributions`}
                  />
                </div>
                <span className="text-xs text-stout-500 rotate-45 origin-top-left">
                  W{i + 1}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <p className="text-sm text-stout-400 mt-1">
            {achievementsData.filter(a => isAchievementUnlocked(a, data.stats)).length} of{' '}
            {achievementsData.length} unlocked
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievementsData.map(achievement => {
              const unlocked = isAchievementUnlocked(achievement, data.stats);
              return (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  unlocked={unlocked}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Components

interface StatCardProps {
  icon: string;
  value: number;
  label: string;
  sublabel: string;
  gradient: string;
}

function StatCard({ icon, value, label, sublabel, gradient }: StatCardProps) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-lg p-6 text-white shadow-lg`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold mb-1">{value.toLocaleString()}</div>
      <div className="text-sm font-medium opacity-90">{label}</div>
      <div className="text-xs opacity-75 mt-1">{sublabel}</div>
    </div>
  );
}

interface ContributionRowProps {
  icon: string;
  label: string;
  value: number;
  points: number;
  color: 'green' | 'blue' | 'purple' | 'amber';
}

function ContributionRow({ icon, label, value, points, color }: ContributionRowProps) {
  const colorClasses = {
    green: 'text-irish-green-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    amber: 'text-amber-500',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-stout-700/50 rounded-lg">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="font-medium text-cream-100">{label}</div>
          <div className="text-sm text-stout-400">
            {value} submission{value !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
      <div className={`text-right ${colorClasses[color]}`}>
        <div className="text-lg font-bold">+{points}</div>
        <div className="text-xs text-stout-400">points</div>
      </div>
    </div>
  );
}

// Achievements data
const achievementsData = [
  {
    id: 'first_price',
    name: 'First Price',
    description: 'Submit your first price',
    icon: '🥇',
    requirement: (stats: any) => stats.prices_count >= 1,
  },
  {
    id: 'price_master',
    name: 'Price Master',
    description: 'Submit 50 prices',
    icon: '💰',
    requirement: (stats: any) => stats.prices_count >= 50,
  },
  {
    id: 'first_review',
    name: 'Critic',
    description: 'Write your first review',
    icon: '✍️',
    requirement: (stats: any) => stats.reviews_count >= 1,
  },
  {
    id: 'review_master',
    name: 'Super Critic',
    description: 'Write 20 reviews',
    icon: '📝',
    requirement: (stats: any) => stats.reviews_count >= 20,
  },
  {
    id: 'photographer',
    name: 'Photographer',
    description: 'Upload 10 photos',
    icon: '📸',
    requirement: (stats: any) => stats.photos_count >= 10,
  },
  {
    id: 'week_streak',
    name: 'Committed',
    description: '7 day contribution streak',
    icon: '🔥',
    requirement: (stats: any) => false, // Would check actual streak
  },
];

function isAchievementUnlocked(achievement: typeof achievementsData[0], stats: any) {
  return achievement.requirement(stats);
}

interface AchievementBadgeProps {
  achievement: typeof achievementsData[0];
  unlocked: boolean;
}

function AchievementBadge({ achievement, unlocked }: AchievementBadgeProps) {
  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${
        unlocked
          ? 'bg-irish-green-950/30 border-irish-green-600 shadow-lg shadow-irish-green-600/20'
          : 'bg-stout-900 border-stout-700 opacity-50'
      }`}
    >
      <div className={`text-4xl mb-2 ${unlocked ? 'animate-bounce-slow' : 'grayscale'}`}>
        {achievement.icon}
      </div>
      <div className="font-semibold text-cream-100 mb-1">{achievement.name}</div>
      <div className="text-xs text-stout-400">{achievement.description}</div>
      {unlocked && (
        <div className="mt-2 text-xs text-irish-green-500 font-medium flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Unlocked
        </div>
      )}
    </div>
  );
}
