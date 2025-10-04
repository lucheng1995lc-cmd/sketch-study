import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

const Home = () => {
  const [workTime, setWorkTime] = useState(25 * 60);
  const [breakTime, setBreakTime] = useState(5 * 60);
  const [timeLeft, setTimeLeft] = useState(workTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [characterImage, setCharacterImage] = useState<string>("");
  const { toast } = useToast();
  const intervalRef = useRef<number>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedImage = localStorage.getItem("characterImage");
    if (savedImage) setCharacterImage(savedImage);
    
    const savedWorkTime = localStorage.getItem("workTime");
    const savedBreakTime = localStorage.getItem("breakTime");
    if (savedWorkTime) setWorkTime(parseInt(savedWorkTime));
    if (savedBreakTime) setBreakTime(parseInt(savedBreakTime));
  }, []);

  useEffect(() => {
    setTimeLeft(isWorkSession ? workTime : breakTime);
  }, [workTime, breakTime, isWorkSession]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    
    // Save session to time pool
    const today = new Date().toISOString().split("T")[0];
    const timePool = JSON.parse(localStorage.getItem("timePool") || "{}");
    const sessionTime = isWorkSession ? workTime : breakTime;
    
    if (!timePool[today]) timePool[today] = { work: 0, break: 0 };
    if (isWorkSession) {
      timePool[today].work += sessionTime;
    } else {
      timePool[today].break += sessionTime;
    }
    localStorage.setItem("timePool", JSON.stringify(timePool));

    toast({
      title: isWorkSession ? "工作完成！" : "休息结束！",
      description: isWorkSession ? "该休息一下了" : "继续努力工作吧",
    });
    
    setIsWorkSession(!isWorkSession);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCharacterImage(result);
        localStorage.setItem("characterImage", result);
        toast({
          title: "角色上传成功！",
          description: "你的原创角色已设置为背景",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = isWorkSession
    ? ((workTime - timeLeft) / workTime) * 100
    : ((breakTime - timeLeft) / breakTime) * 100;

  return (
    <div className="min-h-screen bg-secondary pb-24">
      <div className="max-w-lg mx-auto px-4 pt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">番茄钟</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isWorkSession ? "专注工作时间" : "休息时间"}
          </p>
        </div>

        {/* Timer Circle */}
        <div className="relative flex items-center justify-center mb-12">
          <div className="relative w-80 h-80">
            {/* Background Circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="160"
                cy="160"
                r="140"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/30"
              />
              <circle
                cx="160"
                cy="160"
                r="140"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 140}`}
                strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className={`transition-all duration-300 ${
                  isWorkSession ? "text-accent" : "text-timer-break"
                }`}
              />
            </svg>

            {/* Character Image or Placeholder */}
            <div className="absolute inset-4 rounded-full overflow-hidden bg-card flex items-center justify-center">
              {characterImage ? (
                <img
                  src={characterImage}
                  alt="Character"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-8">
                  <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">点击下方按钮</p>
                  <p className="text-sm text-muted-foreground">上传角色图片</p>
                </div>
              )}
            </div>

            {/* Timer Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center bg-card/90 backdrop-blur-sm px-8 py-4 rounded-2xl">
                <div className="text-5xl font-bold text-foreground">
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <Button
            size="lg"
            variant={isRunning ? "outline" : "default"}
            className="w-16 h-16 rounded-full"
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-16 h-16 rounded-full"
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(isWorkSession ? workTime : breakTime);
            }}
          >
            <RotateCcw className="w-6 h-6" />
          </Button>
        </div>

        {/* Upload Button */}
        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            上传角色图片
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
