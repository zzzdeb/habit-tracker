
"use client";

import { useState, useMemo, useEffect } from "react";
import { format, startOfToday, isBefore, isAfter, subDays, isValid } from "date-fns";
import { TrendingUp, Award, Check, X, Mountain, ThumbsDown } from "lucide-react";
import { DayPicker, DayProps } from "react-day-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * @typedef {Record<string, boolean>} ClimbData
 * A record of climb statuses, where the key is the date string "yyyy-MM-dd"
 * and the value is a boolean indicating if a climb was completed.
 */
type ClimbData = Record<string, boolean>;

/**
 * A card component to display a single statistic.
 * @param {object} props - The component props.
 * @param {string} props.title - The title of the stat card.
 * @param {string | number} props.value - The value to be displayed.
 * @param {string} props.caption - A descriptive caption for the value.
 * @param {React.ElementType} props.icon - The icon component to display.
 */
function StatCard({ title, value, caption, icon: Icon }: { title: string; value: string | number; caption: string; icon: React.ElementType }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{caption}</p>
      </CardContent>
    </Card>
  );
}

/**
 * HabitTracker is the main component for tracking daily "climbs".
 * It displays a calendar for logging daily progress, statistics for the current
 * streak and total climbs, and uses localStorage to persist data.
 */
export function HabitTracker() {
  // State for storing climb data, keyed by date.
  const [climbs, setClimbs] = useState<ClimbData>({});
  // State for the currently selected date in the calendar.
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Load climb data from localStorage on initial component mount.
  useEffect(() => {
    try {
      const savedClimbs = localStorage.getItem("peak-progress-climbs");
      if (savedClimbs) {
        setClimbs(JSON.parse(savedClimbs));
      }
    } catch (error) {
      console.error("Failed to load climbs from localStorage", error);
    }
  }, []);

  // Save climb data to localStorage whenever it changes.
  useEffect(() => {
    try {
      localStorage.setItem("peak-progress-climbs", JSON.stringify(climbs));
    } catch (error) {
      console.error("Failed to save climbs to localStorage", error);
    }
  }, [climbs]);

  /**
   * Updates the climb status for a given date.
   * @param {Date} date - The date to update.
   * @param {boolean} climbed - The new climb status.
   */
  const handleUpdateClimb = (date: Date, climbed: boolean) => {
    const dateKey = format(date, "yyyy-MM-dd");
    setClimbs((prev) => ({ ...prev, [dateKey]: climbed }));
    setSelectedDate(null);
  };

  // Memoized calculation for total climbs and current streak.
  const { totalClimbs, currentStreak } = useMemo(() => {
    const totalClimbs = Object.values(climbs).filter(Boolean).length;
    let streak = 0;
    let checkDay = startOfToday();

    // If today hasn't been logged, start streak check from yesterday.
    if (climbs[format(checkDay, 'yyyy-MM-dd')] === undefined) {
      checkDay = subDays(checkDay, 1);
    }

    // Iterate backwards to calculate the current streak.
    while (climbs[format(checkDay, 'yyyy-MM-dd')] === true) {
      streak++;
      checkDay = subDays(checkDay, 1);
    }

    return { totalClimbs, currentStreak: streak };
  }, [climbs]);

  /**
   * Custom renderer for the day button in the DayPicker calendar.
   * It displays indicators for climbed or missed days.
   * @param {DayProps} props - Props provided by DayPicker for each day button.
   */
  /**
   * Custom renderer for each day in the DayPicker calendar.
   * It displays indicators for climbed or missed days.
   * @param {DayProps} props - Props provided by DayPicker for each day.
   */
  function CustomDay(props: DayProps) {
    // @ts-ignore - DayProps structure changed in v9
    const { date, displayMonth } = props.day;
    const { className, style, ...tdProps } = props;

    if (!date || !displayMonth) {
      return <td className={className} style={style} {...tdProps}></td>;
    }
    const isOutside = date.getMonth() !== displayMonth.getMonth();

    if (isOutside) {
      return <td className={className} style={style} {...tdProps}></td>;
    }

    const dateKey = format(date, "yyyy-MM-dd");
    const climbed = climbs[dateKey];
    const isPast = isBefore(date, startOfToday());

    let indicator = null;
    if (climbed === true) {
      indicator = <Check className="absolute bottom-1 left-1/2 -translate-x-1/2 h-4 w-4 text-primary" />;
    } else if (climbed === false || (isPast && climbed === undefined)) {
      indicator = <X className="absolute bottom-1 left-1/2 -translate-x-1/2 h-4 w-4 text-destructive" />;
    }

    return (
      <td className={cn(className, "relative p-0")} style={style} {...tdProps}>
        <button
          className="h-12 w-12 sm:h-14 sm:w-14 text-base rounded-md focus:bg-accent/50 focus:outline-none focus:ring-1 focus:ring-ring flex items-center justify-center relative"
          onClick={() => {
            if (date && !isAfter(date, startOfToday())) {
              setSelectedDate(date);
            }
          }}
          disabled={isAfter(date, startOfToday())}
        >
          <span>{format(date, "d")}</span>
          {indicator}
        </button>
      </td>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <div className="container mx-auto p-4 py-8 sm:p-6 lg:p-8">
        <header className="text-center mb-10">
          <h1 className="font-headline text-4xl sm:text-5xl font-bold tracking-tight text-primary">
            Peak Progress
          </h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto">
            Our family's daily mountain climb challenge. Mark each day to watch our progress grow.
          </p>
        </header>

        <main className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <StatCard title="Current Streak" value={`${currentStreak} days`} caption="Consecutive climbs." icon={TrendingUp} />
            <StatCard title="Total Climbs" value={totalClimbs} caption="Summits reached this year." icon={Award} />
          </div>

          <Card className="shadow-xl border-border/50">
            <CardContent className="flex justify-center p-1 sm:p-2">
              <DayPicker
                components={{
                  Day: CustomDay
                }}
                className="w-full"
                classNames={{
                  day_outside: 'text-muted-foreground/50',
                  day_today: "bg-primary/10 text-primary ring-1 ring-primary",
                  head_cell: "w-12 sm:w-14",
                  caption_label: "font-headline text-lg",
                  nav_button: "h-8 w-8",
                  day: "h-12 w-12 sm:h-14 sm:w-14 text-base rounded-md focus:bg-accent/50 focus:outline-none focus:ring-1 focus:ring-ring",
                }}
              />
            </CardContent>
          </Card>

          {selectedDate && (
            <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl">Log for {format(selectedDate, "MMMM d, yyyy")}</DialogTitle>
                  <DialogDescription>
                    Did the family conquer the mountain on this day?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
                  <Button
                    onClick={() => handleUpdateClimb(selectedDate, true)}
                    className="w-full"
                  >
                    <Mountain className="mr-2 h-4 w-4" /> Yes, we climbed!
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleUpdateClimb(selectedDate, false)}
                    className="w-full"
                  >
                    <ThumbsDown className="mr-2 h-4 w-4" /> No, not this time.
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </main>
      </div>
    </div>
  );
}
