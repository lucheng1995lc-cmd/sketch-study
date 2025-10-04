import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface TaskData {
  taskName: string;
  duration: number;
  sessions: number;
}

interface DayData {
  [taskId: string]: TaskData;
}

interface TimePoolData {
  [date: string]: DayData;
}

const TimePool = () => {
  const [timePoolData, setTimePoolData] = useState<TimePoolData>({});

  useEffect(() => {
    const data = localStorage.getItem("taskTimePool");
    if (data) setTimePoolData(JSON.parse(data));
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}小时${mins}分钟`;
    return `${mins}分钟`;
  };

  // Calculate statistics
  const calculateStats = () => {
    const today = new Date().toISOString().split("T")[0];
    const dates = Object.keys(timePoolData).sort();
    
    let totalDuration = 0;
    let totalSessions = 0;
    let todayDuration = 0;
    let todaySessions = 0;

    dates.forEach((date) => {
      const dayTasks = timePoolData[date];
      Object.values(dayTasks).forEach((task) => {
        totalDuration += task.duration;
        totalSessions += task.sessions;
        
        if (date === today) {
          todayDuration += task.duration;
          todaySessions += task.sessions;
        }
      });
    });

    const daysWithData = dates.length;
    const avgDuration = daysWithData > 0 ? totalDuration / daysWithData : 0;

    return {
      totalDuration,
      totalSessions,
      avgDuration,
      todayDuration,
      todaySessions,
    };
  };

  const stats = calculateStats();

  // Get today's task distribution
  const getTodayData = () => {
    const today = new Date().toISOString().split("T")[0];
    const todayTasks = timePoolData[today] || {};
    
    return Object.values(todayTasks).map((task) => ({
      name: task.taskName,
      时长: Math.floor(task.duration / 60),
    }));
  };

  // Get week's task distribution
  const getWeekData = () => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const taskTotals: { [taskName: string]: number } = {};

    Object.entries(timePoolData).forEach(([date, dayTasks]) => {
      const dateObj = new Date(date);
      if (dateObj >= weekAgo && dateObj <= today) {
        Object.values(dayTasks).forEach((task) => {
          if (!taskTotals[task.taskName]) {
            taskTotals[task.taskName] = 0;
          }
          taskTotals[task.taskName] += task.duration;
        });
      }
    });

    return Object.entries(taskTotals).map(([name, duration]) => ({
      name,
      时长: Math.floor(duration / 60),
    }));
  };

  // Get month's task distribution
  const getMonthData = () => {
    const today = new Date();
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const taskTotals: { [taskName: string]: number } = {};

    Object.entries(timePoolData).forEach(([date, dayTasks]) => {
      const dateObj = new Date(date);
      if (dateObj >= monthAgo && dateObj <= today) {
        Object.values(dayTasks).forEach((task) => {
          if (!taskTotals[task.taskName]) {
            taskTotals[task.taskName] = 0;
          }
          taskTotals[task.taskName] += task.duration;
        });
      }
    });

    return Object.entries(taskTotals).map(([name, duration]) => ({
      name,
      时长: Math.floor(duration / 60),
    }));
  };

  return (
    <div className="min-h-screen bg-secondary pb-24">
      <div className="max-w-lg mx-auto px-4 pt-12">
        {/* Header */}
        <h1 className="text-2xl font-bold text-foreground mb-6">数据统计</h1>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">累计专注</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalSessions}</p>
            <p className="text-xs text-muted-foreground mt-1">次</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">累计时长</p>
            <p className="text-2xl font-bold text-foreground">
              {Math.floor(stats.totalDuration / 3600)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">小时</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">日均时长</p>
            <p className="text-2xl font-bold text-foreground">
              {Math.floor(stats.avgDuration / 60)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">分钟</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">今日专注</p>
            <p className="text-2xl font-bold text-foreground">{stats.todaySessions}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatTime(stats.todayDuration)}
            </p>
          </Card>
        </div>

        {/* Task Distribution Charts */}
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">今日</TabsTrigger>
            <TabsTrigger value="week">本周</TabsTrigger>
            <TabsTrigger value="month">本月</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">今日任务时长分布</h3>
              {getTodayData().length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getTodayData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="时长" fill="hsl(var(--accent))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">今日暂无数据</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="week" className="mt-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">本周任务时长分布</h3>
              {getWeekData().length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getWeekData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="时长" fill="hsl(var(--accent))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">本周暂无数据</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="month" className="mt-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">本月任务时长分布</h3>
              {getMonthData().length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getMonthData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="时长" fill="hsl(var(--accent))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">本月暂无数据</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default TimePool;
