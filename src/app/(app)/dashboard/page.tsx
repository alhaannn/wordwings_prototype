'use client';
import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from 'recharts';
import { BookUp, CircleDollarSign, Medal, Trophy } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { allBadges } from '@/lib/data';
import { subDays, subHours, subMonths, subWeeks, startOfHour, startOfDay, startOfWeek, startOfMonth, format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import type { Badge } from '@/lib/types';
import { Footer } from '@/components/Footer';

const timeZone = 'Asia/Kolkata';

const formatInTimeZone = (date: Date, fmt: string) => {
  return format(toZonedTime(date, timeZone), fmt, { timeZone });
};

export default function DashboardPage() {
  const { wordCoins, masteredWords, unlockedBadgeIds } = useAppContext();
  
  const unlockedBadges = useMemo(() => {
    return allBadges
      .filter(b => unlockedBadgeIds.has(b.id))
      .map(b => ({ ...b, unlocked: true, date: new Date().toLocaleDateString('en-CA') })); // Date can be stored if needed
  }, [unlockedBadgeIds]);

  const chartData = useMemo(() => {
    if (masteredWords.size === 0) {
      return [];
    }

    const now = new Date();
    const wordsArray = Array.from(masteredWords.entries());
    const firstMasteryDate = new Date(wordsArray[0][1]);
    const accountAgeDays = (now.getTime() - firstMasteryDate.getTime()) / (1000 * 3600 * 24);

    let startDate: Date;
    let period: 'hour' | 'day' | 'week' | 'month';
    let periods: { start: Date, label: string }[] = [];

    if (accountAgeDays <= 1) { // Last 12 hours
      period = 'hour';
      startDate = subHours(now, 11);
      for (let i = 0; i < 12; i++) {
        const hourStart = startOfHour(subHours(now, i));
        periods.push({ start: hourStart, label: formatInTimeZone(hourStart, 'ha') });
      }
    } else if (accountAgeDays <= 7) { // Last 7 days
      period = 'day';
      startDate = subDays(now, 6);
      for (let i = 0; i < 7; i++) {
        const dayStart = startOfDay(subDays(now, i));
        periods.push({ start: dayStart, label: formatInTimeZone(dayStart, 'eee') });
      }
    } else if (accountAgeDays <= 30) { // Last 4 weeks
      period = 'week';
      startDate = subWeeks(now, 3);
      for (let i = 0; i < 4; i++) {
        const weekStart = startOfWeek(subWeeks(now, i));
        periods.push({ start: weekStart, label: `Week of ${formatInTimeZone(weekStart, 'MMM d')}` });
      }
    } else { // Last 12 months
      period = 'month';
      startDate = subMonths(now, 11);
      for (let i = 0; i < 12; i++) {
        const monthStart = startOfMonth(subMonths(now, i));
        periods.push({ start: monthStart, label: formatInTimeZone(monthStart, 'MMM') });
      }
    }
    
    periods.reverse();

    const getPeriodStart = (date: Date) => {
      if (period === 'hour') return startOfHour(date);
      if (period === 'day') return startOfDay(date);
      if (period === 'week') return startOfWeek(date);
      return startOfMonth(date);
    };

    const groupedData = new Map<string, number>();
    periods.forEach(p => groupedData.set(p.start.toISOString(), 0));

    for (const [, timestamp] of wordsArray) {
      const date = new Date(timestamp);
      if (date >= startDate) {
        const periodStart = getPeriodStart(date).toISOString();
        if(groupedData.has(periodStart)) {
            groupedData.set(periodStart, (groupedData.get(periodStart) || 0) + 1);
        }
      }
    }

    return periods.map(p => ({
      label: p.label,
      mastered: groupedData.get(p.start.toISOString()) || 0,
    }));

  }, [masteredWords]);


  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            Dashboard
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">WordCoins</CardTitle>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wordCoins}</div>
              <p className="text-xs text-muted-foreground">
                Your current balance
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Words Mastered</CardTitle>
              <BookUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{masteredWords.size}</div>
              <p className="text-xs text-muted-foreground">
                Total unique words learned
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
              <Medal className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unlockedBadges.length}</div>
              <p className="text-xs text-muted-foreground">
                Your special achievements
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Vocabulary Growth</CardTitle>
              <CardDescription>
                Your progress in mastering new words.
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false}>
                    <Label value="Words Mastered" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#888888' }} />
                  </YAxis>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                    }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Bar dataKey="mastered" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              ) : (
                  <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-[350px]">
                      <p>Start learning words to see your progress here!</p>
                  </div>
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>
                Your collection of earned badges.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unlockedBadges.length > 0 ? (
                <div className="space-y-4">
                  {unlockedBadges.map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <div key={badge.id} className="flex items-start gap-4">
                        <div className="p-2 bg-accent rounded-full">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{badge.name}</p>
                          <p className="text-sm text-muted-foreground">{badge.description}</p>
                          <p className="text-xs text-muted-foreground">Unlocked on: {badge.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-8">
                    <Trophy className="h-12 w-12 mb-4" />
                    <p className="font-semibold">No Badges Yet</p>
                    <p className="text-sm">Keep learning to unlock new achievements!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
