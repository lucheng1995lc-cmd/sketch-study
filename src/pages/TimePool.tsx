import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const TimePool = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekData, setWeekData] = useState<any[]>([]);

  useEffect(() => {
    loadWeekData();
  }, [selectedDate]);

  const loadWeekData = () => {
    const timePool = JSON.parse(localStorage.getItem("timePool") || "{}");
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(selectedDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayData = timePool[dateStr] || { work: 0, break: 0 };
      
      data.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        工作: Math.round(dayData.work / 60),
        休息: Math.round(dayData.break / 60),
      });
    }
    
    setWeekData(data);
  };

  const changeWeek = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  };

  const totalWork = weekData.reduce((sum, day) => sum + day.工作, 0);
  const totalBreak = weekData.reduce((sum, day) => sum + day.休息, 0);
  const totalMinutes = totalWork + totalBreak;

  return (
    <div className="min-h-screen bg-secondary pb-24">
      <div className="max-w-lg mx-auto px-4 pt-12">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">时间池</h1>
          <p className="text-sm text-muted-foreground mt-1">查看你的时间使用情况</p>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeWeek(-1)}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-lg font-medium">{formatDate(selectedDate)}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeWeek(1)}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">总时长</p>
            <p className="text-2xl font-bold text-foreground">{totalMinutes}</p>
            <p className="text-xs text-muted-foreground">分钟</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">工作</p>
            <p className="text-2xl font-bold text-accent">{totalWork}</p>
            <p className="text-xs text-muted-foreground">分钟</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">休息</p>
            <p className="text-2xl font-bold text-timer-break">{totalBreak}</p>
            <p className="text-xs text-muted-foreground">分钟</p>
          </Card>
        </div>

        {/* Chart */}
        <Card className="p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">本周统计</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="工作" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              <Bar dataKey="休息" fill="hsl(var(--timer-break))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Daily Details */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">每日详情</h2>
          <div className="space-y-3">
            {weekData.map((day, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{day.date}</span>
                <div className="flex gap-4">
                  <span className="text-sm">
                    <span className="text-accent font-medium">{day.工作}</span>
                    <span className="text-muted-foreground ml-1">分钟</span>
                  </span>
                  <span className="text-sm">
                    <span className="text-timer-break font-medium">{day.休息}</span>
                    <span className="text-muted-foreground ml-1">分钟</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default TimePool;
