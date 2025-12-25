"use client";

import { useState, useMemo, useEffect } from "react";
import { format, startOfToday, isBefore, isAfter, subDays } from "date-fns";
import { Mountain, Frown, TrendingUp, Award } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, type CalendarProps } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ClimbData = Record<string, boolean>;

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

export function HabitTracker() {
  const [climbs, setClimbs] = useState<ClimbData>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  useEffect(() => {
    try {
      localStorage.setItem("peak-progress-climbs", JSON.stringify(climbs));
    } catch (error) {
      console.error("Failed to save climbs to localStorage", error);
    }
  }, [climbs]);

  const handleUpdateClimb = (date: Date, climbed: boolean) => {
    const dateKey = format(date, "yyyy-MM-dd");
    setClimbs((prev) => ({ ...prev, [dateKey]: climbed }));
    setSelectedDate(null);
  };
  
  const { totalClimbs, currentStreak } = useMemo(() => {
    const totalClimbs = Object.values(climbs).filter(Boolean).length;
    let streak = 0;
    let checkDay = startOfToday();
    
    if (!climbs.hasOwnProperty(format(checkDay, 'yyyy-MM-dd'))) {
        checkDay = subDays(checkDay, 1);
    }
    
    while(climbs[format(checkDay, 'yyyy-MM-dd')] === true) {
        streak++;
        checkDay = subDays(checkDay, 1);
    }

    return { totalClimbs, currentStreak: streak };
  }, [climbs]);

  const CustomDayContent: CalendarProps['components']['DayContent'] = ({ date }) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const climbed = climbs[dateKey];
    const isPast = isBefore(date, startOfToday());
    
    let icon = null;
    if (climbed === true) {
      icon = <Mountain className="h-5 w-5 text-primary" />;
    } else if ((isPast && climbed === undefined) || climbed === false) {
      icon = <Frown className="h-5 w-5 text-muted-foreground" />;
    }
    
    return (
        <div className="relative h-full w-full flex items-center justify-center">
            {date.getDate()}
            {icon && <div className="absolute inset-0 flex items-center justify-center opacity-30 -z-10">{icon}</div>}
        </div>
    );
  };
  
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
                <CardContent className="p-1 sm:p-2">
                     <Calendar
                        onDayClick={(day) => {
                            if (day && !isAfter(day, startOfToday())) {
                                setSelectedDate(day);
                            }
                        }}
                        disabled={(date) => isAfter(date, startOfToday())}
                        components={{ DayContent: CustomDayContent }}
                        className="w-full"
                        classNames={{
                            day: "h-12 w-12 sm:h-14 sm:w-14 text-base rounded-md focus:bg-accent/50",
                            day_selected: "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            day_today: "bg-primary/10 text-primary ring-1 ring-primary",
                            head_cell: "w-12 sm:w-14",
                            caption_label: "font-headline text-lg",
                            nav_button: "h-8 w-8",
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
                                <Frown className="mr-2 h-4 w-4" /> No, not this time.
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