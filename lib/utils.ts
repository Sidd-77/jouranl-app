import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { Task } from "@/types/task"; // Adjust import path as needed

export async function syncTasks(tasks: Task[]) {
  try {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tasks }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to sync tasks");
    }

    return await response.json();
  } catch (error) {
    console.error("Tasks sync error:", error);
    throw error;
  }
}

export async function fetchTasks(): Promise<Task[]> {
  try {
    const response = await fetch("/api/tasks");

    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch tasks error:", error);
    throw error;
  }
}
