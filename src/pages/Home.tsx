import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Pause, StopCircle, Music, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { useLocation } from "react-router-dom";

interface Task {
  id: string;
  title: string;
  timerType: "countdown" | "countup";
}

const Home = () => {
  const location = useLocation();
  const task = location.state?.task as Task | undefined;
  
  const [workTime, setWorkTime] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [characterImage, setCharacterImage] = useState<string>("");
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const { toast } = useToast();
  const intervalRef = useRef<number>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedImage = localStorage.getItem("characterImage");
    if (savedImage) setCharacterImage(savedImage);
    
    const savedWorkTime = localStorage.getItem("workTime");
    if (savedWorkTime) setWorkTime(parseInt(savedWorkTime));
  }, []);

  useEffect(() => {
    if (task) {
      setCurrentTask(task);
      setTimeLeft(task.timerType === "countdown" ? workTime : 0);
      setIsRunning(true);
      setSessionStartTime(Date.now());
    }
  }, [task]);

  useEffect(() => {
    if (isRunning && currentTask) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (currentTask.timerType === "countdown") {
            if (prev <= 1) {
              handleSessionComplete();
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, currentTask]);

  const handleSessionComplete = () => {
    if (!currentTask) return;
    
    setIsRunning(false);
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    
    // Save session to time pool by task
    const today = new Date().toISOString().split("T")[0];
    const timePool = JSON.parse(localStorage.getItem("taskTimePool") || "{}");
    
    if (!timePool[today]) timePool[today] = {};
    if (!timePool[today][currentTask.id]) {
      timePool[today][currentTask.id] = {
        taskName: currentTask.title,
        duration: 0,
        sessions: 0,
      };
    }
    
    timePool[today][currentTask.id].duration += sessionDuration;
    timePool[today][currentTask.id].sessions += 1;
    
    localStorage.setItem("taskTimePool", JSON.stringify(timePool));

    toast({
      title: "专注完成！",
      description: `${currentTask.title} - ${formatTime(sessionDuration)}`,
    });
    
    setCurrentTask(null);
    setTimeLeft(0);
  };

  const handleStop = () => {
    if (!currentTask || !isRunning) return;
    
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    
    // Save partial session
    const today = new Date().toISOString().split("T")[0];
    const timePool = JSON.parse(localStorage.getItem("taskTimePool") || "{}");
    
    if (!timePool[today]) timePool[today] = {};
    if (!timePool[today][currentTask.id]) {
      timePool[today][currentTask.id] = {
        taskName: currentTask.title,
        duration: 0,
        sessions: 0,
      };
    }
    
    timePool[today][currentTask.id].duration += sessionDuration;
    timePool[today][currentTask.id].sessions += 1;
    
    localStorage.setItem("taskTimePool", JSON.stringify(timePool));
    
    setIsRunning(false);
    setCurrentTask(null);
    setTimeLeft(0);
    
    toast({
      title: "专注已停止",
      description: `${currentTask.title} - ${formatTime(sessionDuration)}`,
    });
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

  const progress = currentTask?.timerType === "countdown" && workTime > 0
    ? ((workTime - timeLeft) / workTime) * 100
    : 0;

  return (
    <div className="relative min-h-screen pb-24">
      {/* Full Screen Background Image */}
      {characterImage && (
        <div className="fixed inset-0 z-0">
          <img
            src={characterImage}
            alt="Character"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {!characterImage && (
        <div className="fixed inset-0 z-0 bg-secondary" />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-lg mx-auto px-4 pt-12">
        {/* Timer Circle */}
        <div className="relative flex items-center justify-center mb-12 mt-20">
          <div className="relative w-80 h-80">
            {/* Background Circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="160"
                cy="160"
                r="140"
                fill="none"
                stroke="white"
                strokeWidth="8"
                opacity="0.3"
              />
              {currentTask?.timerType === "countdown" && (
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 140}`}
                  strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              )}
            </svg>

            {/* Timer Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                {currentTask ? (
                  <>
                    <p className="text-white text-xl font-medium mb-2">
                      {currentTask.title}
                    </p>
                    <div className="text-white text-5xl font-bold mb-2">
                      {formatTime(timeLeft)}
                    </div>
                    {isRunning && (
                      <p className="text-white text-sm">专注中</p>
                    )}
                  </>
                ) : (
                  <p className="text-white text-lg">请从任务列表选择任务开始专注</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <Button
            size="lg"
            variant="secondary"
            className="w-16 h-16 rounded-full"
            onClick={() => setIsRunning(!isRunning)}
            disabled={!currentTask}
          >
            <Pause className="w-6 h-6" />
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="w-16 h-16 rounded-full"
          >
            <Music className="w-6 h-6" />
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="w-16 h-16 rounded-full"
            onClick={handleStop}
            disabled={!currentTask}
          >
            <StopCircle className="w-6 h-6" />
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
            variant="secondary"
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
