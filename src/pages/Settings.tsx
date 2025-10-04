import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

const Settings = () => {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoStart, setAutoStart] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedWorkTime = localStorage.getItem("workTime");
    const savedBreakTime = localStorage.getItem("breakTime");
    const savedSound = localStorage.getItem("soundEnabled");
    const savedAutoStart = localStorage.getItem("autoStart");

    if (savedWorkTime) setWorkMinutes(parseInt(savedWorkTime) / 60);
    if (savedBreakTime) setBreakMinutes(parseInt(savedBreakTime) / 60);
    if (savedSound) setSoundEnabled(savedSound === "true");
    if (savedAutoStart) setAutoStart(savedAutoStart === "true");
  }, []);

  const saveSettings = () => {
    localStorage.setItem("workTime", (workMinutes * 60).toString());
    localStorage.setItem("breakTime", (breakMinutes * 60).toString());
    localStorage.setItem("soundEnabled", soundEnabled.toString());
    localStorage.setItem("autoStart", autoStart.toString());

    toast({
      title: "设置已保存",
      description: "你的偏好设置已更新",
    });
  };

  const resetData = () => {
    if (confirm("确定要清除所有数据吗？此操作不可恢复。")) {
      localStorage.removeItem("timePool");
      localStorage.removeItem("todos");
      localStorage.removeItem("characterImage");
      
      toast({
        title: "数据已清除",
        description: "所有数据已重置",
      });
    }
  };

  return (
    <div className="min-h-screen bg-secondary pb-24">
      <div className="max-w-lg mx-auto px-4 pt-12">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">设置</h1>
          <p className="text-sm text-muted-foreground mt-1">自定义你的番茄钟</p>
        </div>

        {/* Timer Settings */}
        <Card className="p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">计时器设置</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="work-time">工作时长（分钟）</Label>
              <Input
                id="work-time"
                type="number"
                min="1"
                max="60"
                value={workMinutes}
                onChange={(e) => setWorkMinutes(parseInt(e.target.value) || 1)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="break-time">休息时长（分钟）</Label>
              <Input
                id="break-time"
                type="number"
                min="1"
                max="30"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 1)}
                className="mt-2"
              />
            </div>
          </div>
        </Card>

        {/* General Settings */}
        <Card className="p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">通用设置</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sound">提示音</Label>
                <p className="text-sm text-muted-foreground">
                  计时结束时播放提示音
                </p>
              </div>
              <Switch
                id="sound"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-start">自动开始</Label>
                <p className="text-sm text-muted-foreground">
                  自动开始下一个番茄钟
                </p>
              </div>
              <Switch
                id="auto-start"
                checked={autoStart}
                onCheckedChange={setAutoStart}
              />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={saveSettings} className="w-full">
            保存设置
          </Button>
          <Button onClick={resetData} variant="destructive" className="w-full">
            清除所有数据
          </Button>
        </div>

        {/* App Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>原创角色番茄钟 v1.0.0</p>
          <p className="mt-1">专注工作，享受生活</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;
