import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  timerType: "countdown" | "countup";
}

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newTimerType, setNewTimerType] = useState<"countdown" | "countup">("countdown");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("todos");
    if (saved) setTodos(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!newTitle.trim()) {
      toast({
        title: "请输入任务标题",
        variant: "destructive",
      });
      return;
    }

    const todo: Todo = {
      id: Date.now().toString(),
      title: newTitle,
      completed: false,
      priority: newPriority,
      dueDate: newDueDate || undefined,
      timerType: newTimerType,
    };

    setTodos([todo, ...todos]);
    setNewTitle("");
    setNewPriority("medium");
    setNewDueDate("");
    setNewTimerType("countdown");
    setIsDialogOpen(false);
    
    toast({
      title: "任务已添加",
      description: newTitle,
    });
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
    toast({
      title: "任务已删除",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-accent";
      case "medium":
        return "text-warning";
      case "low":
        return "text-primary";
      default:
        return "text-muted-foreground";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "高";
      case "medium":
        return "中";
      case "low":
        return "低";
      default:
        return "";
    }
  };

  const startFocus = (todo: Todo) => {
    navigate("/", { state: { task: todo } });
  };

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  return (
    <div className="min-h-screen bg-secondary pb-24">
      <div className="max-w-lg mx-auto px-4 pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">任务列表</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTodos.length} 个待完成
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="rounded-full h-12 w-12">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加新任务</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="任务标题"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <Select value={newPriority} onValueChange={(value: any) => setNewPriority(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">高优先级</SelectItem>
                    <SelectItem value="medium">中优先级</SelectItem>
                    <SelectItem value="low">低优先级</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newTimerType} onValueChange={(value: any) => setNewTimerType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择计时类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="countdown">倒计时</SelectItem>
                    <SelectItem value="countup">正计时</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
                <Button onClick={addTodo} className="w-full">
                  添加任务
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Todos */}
        {activeTodos.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">待完成</h2>
            <div className="space-y-2">
              {activeTodos.map((todo) => (
                <Card key={todo.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium text-foreground">
                        {todo.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                          {getPriorityText(todo.priority)}优先级
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {todo.timerType === "countdown" ? "倒计时" : "正计时"}
                        </span>
                        {todo.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(todo.dueDate).toLocaleDateString("zh-CN")}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="icon"
                      onClick={() => startFocus(todo)}
                      className="shrink-0"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTodo(todo.id)}
                      className="shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Todos */}
        {completedTodos.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">已完成</h2>
            <div className="space-y-2">
              {completedTodos.map((todo) => (
                <Card key={todo.id} className="p-4 opacity-60">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium text-foreground line-through">
                        {todo.title}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTodo(todo.id)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {todos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">还没有任务，点击右上角添加吧</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default TodoList;
