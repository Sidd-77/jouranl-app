import React, { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Trash2, Edit, Save } from "lucide-react";

// Define the Task interface
interface Task {
  id: string;
  text: string;
  completed: boolean;
  order?: number;
}

import { syncTasks, fetchTasks } from "@/lib/utils";

const TasksComponent: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskText, setEditTaskText] = useState<string>("");

  // Fetch tasks on initial load
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const fetchedTasks: Task[] = await fetchTasks();
        // Sort tasks by order if available
        const sortedTasks = fetchedTasks.sort((a, b) => 
          (a.order ?? 0) - (b.order ?? 0)
        );
        setTasks(sortedTasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    };

    loadTasks();
  }, []);

  // Sync tasks after any modification
  const updateTasks = async (updatedTasks: Task[]) => {
    try {
      // Add order to tasks based on their current index
      const tasksWithOrder = updatedTasks.map((task, index) => ({
        ...task,
        order: index
      }));

      setTasks(tasksWithOrder);
      await syncTasks(tasksWithOrder);
    } catch (error) {
      console.error("Failed to sync tasks:", error);
    }
  };

  // Add a new task
  const addTask = async () => {
    if (newTask.trim()) {
      const newTaskItem: Task = {
        id: `task-${Date.now()}`,
        text: newTask.trim(),
        completed: false,
      };
      const updatedTasks = [...tasks, newTaskItem];
      await updateTasks(updatedTasks);
      setNewTask("");
    }
  };

  // Move task up in the list
  const moveTaskUp = async (index: number) => {
    if (index > 0) {
      const newTasks = [...tasks];
      [newTasks[index], newTasks[index - 1]] = [
        newTasks[index - 1],
        newTasks[index],
      ];
      await updateTasks(newTasks);
    }
  };

  // Move task down in the list
  const moveTaskDown = async (index: number) => {
    if (index < tasks.length - 1) {
      const newTasks = [...tasks];
      [newTasks[index], newTasks[index + 1]] = [
        newTasks[index + 1],
        newTasks[index],
      ];
      await updateTasks(newTasks);
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (id: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    await updateTasks(updatedTasks);
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    await updateTasks(updatedTasks);
  };

  // Start editing a task
  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTaskText(task.text);
  };

  // Save edited task
  const saveEditedTask = async () => {
    if (editTaskText.trim()) {
      const updatedTasks = tasks.map((task) =>
        task.id === editingTaskId
          ? { ...task, text: editTaskText.trim() }
          : task
      );
      await updateTasks(updatedTasks);
      setEditingTaskId(null);
    }
  };

  return (
    <Card className="w-full h-full border rounded-lg">
      <CardContent className="space-y-4 p-4 bg-gray-200">
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter a new task"
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            className="flex-grow bg-white"
          />
          <Button onClick={addTask} className="w-full sm:w-auto px-4">
            Add Task
          </Button>
        </div>
      </CardContent>
      <CardContent className="space-y-4 p-2">
        <div className="space-y-2 overflow-auto">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md"
            >
              {/* Reorder Controls */}
              <div className="flex flex-col">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveTaskUp(index)}
                  disabled={index === 0}
                  className="h-6 w-6"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveTaskDown(index)}
                  disabled={index === tasks.length - 1}
                  className="h-6 w-6"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Checkbox */}
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTaskCompletion(task.id)}
              />

              {/* Task Text or Edit Input */}
              {editingTaskId === task.id ? (
                <div className="flex items-center space-x-2 flex-grow">
                  <Input
                    value={editTaskText}
                    onChange={(e) => setEditTaskText(e.target.value)}
                    className="flex-grow"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={saveEditedTask}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <span
                  className={`flex-grow ${
                    task.completed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {task.text}
                </span>
              )}

              {/* Action Buttons */}
              {editingTaskId !== task.id && (
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => startEditing(task)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TasksComponent;