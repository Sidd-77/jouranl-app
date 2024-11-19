"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import { Sidebar } from "./Sidebar";
import { Editor } from "./Editor";
import DatePickerButton from "./DatePicker";
import { Loader2, Save, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type EntryState = {
  content: string;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedContent: string;
  lastSavedAt: string | null;
};

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<Record<string, EntryState>>({});
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const activeSave = useRef<{ date: string; promise: Promise<void> } | null>(
    null
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMobileDateSelect = async (newDate: string) => {
    await handleDateSelect(newDate);
    setIsSidebarOpen(false);
  };

  const currentEntry = entries[selectedDate] || {
    content: "",
    isDirty: false,
    isSaving: false,
    lastSavedContent: "",
    lastSavedAt: null,
  };

  const saveEntry = useCallback(async (date: string, content: string) => {
    if (activeSave.current?.date === date) {
      await activeSave.current.promise;
    }

    const savePromise = (async () => {
      try {
        const response = await fetch("/api/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, content }),
        });

        if (!response.ok) {
          throw new Error("Failed to save entry");
        }

        setEntries((prev) => ({
          ...prev,
          [date]: {
            ...prev[date],
            isDirty: false,
            isSaving: false,
            lastSavedContent: content,
            lastSavedAt: new Date().toISOString(),
          },
        }));
      } catch (error) {
        console.error("Error saving entry:", error);
        setEntries((prev) => ({
          ...prev,
          [date]: {
            ...prev[date],
            isSaving: false,
          },
        }));
      }
    })();

    activeSave.current = { date, promise: savePromise };
    await savePromise;

    if (activeSave.current?.date === date) {
      activeSave.current = null;
    }
  }, []);

  const fetchEntry = useCallback(async (date: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/entries/${date}`);
      if (response.ok) {
        const data = await response.json();
        const content = data.content || "";

        setEntries((prev) => ({
          ...prev,
          [date]: {
            content,
            isDirty: false,
            isSaving: false,
            lastSavedContent: content,
            lastSavedAt: new Date().toISOString(),
          },
        }));
      } else {
        setEntries((prev) => ({
          ...prev,
          [date]: {
            content: "",
            isDirty: false,
            isSaving: false,
            lastSavedContent: "",
            lastSavedAt: null,
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching entry:", error);

      setEntries((prev) => ({
        ...prev,
        [date]: {
          content: "",
          isDirty: false,
          isSaving: false,
          lastSavedContent: "",
          lastSavedAt: null,
        },
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDateSelect = useCallback(
    async (newDate: string) => {
      if (currentEntry.isDirty || currentEntry.isSaving) {
        await saveEntry(selectedDate, currentEntry.content);
      }

      setSelectedDate(newDate);

      if (!entries[newDate]) {
        fetchEntry(newDate);
      }
    },
    [selectedDate, currentEntry, entries, saveEntry, fetchEntry]
  );

  const handleContentChange = useCallback(
    (newContent: string) => {
      setEntries((prev) => ({
        ...prev,
        [selectedDate]: {
          ...prev[selectedDate],
          content: newContent,
          isDirty: newContent !== prev[selectedDate]?.lastSavedContent,
        },
      }));
    },
    [selectedDate]
  );

  const handleManualSave = useCallback(async () => {
    if (currentEntry.isDirty && !currentEntry.isSaving) {
      setEntries((prev) => ({
        ...prev,
        [selectedDate]: {
          ...prev[selectedDate],
          isSaving: true,
        },
      }));
      await saveEntry(selectedDate, currentEntry.content);
    }
  }, [
    currentEntry.isDirty,
    currentEntry.isSaving,
    currentEntry.content,
    selectedDate,
    saveEntry,
  ]);

  const toggleAutoSave = useCallback(() => {
    setAutoSaveEnabled((prev) => !prev);
  }, [autoSaveEnabled]);

  // Auto-save effect
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (autoSaveEnabled && currentEntry.isDirty && !currentEntry.isSaving) {
      timeoutId = setTimeout(() => {
        setEntries((prev) => ({
          ...prev,
          [selectedDate]: {
            ...prev[selectedDate],
            isSaving: true,
          },
        }));
        saveEntry(selectedDate, currentEntry.content);
      }, 10000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [
    currentEntry.isDirty,
    currentEntry.isSaving,
    currentEntry.content,
    selectedDate,
    saveEntry,
    autoSaveEnabled,
  ]);

  useEffect(() => {
    if (!entries[selectedDate]) {
      fetchEntry(selectedDate);
    }
  }, [selectedDate, entries, fetchEntry]);


  return (
    <div className="flex flex-col h-screen bg-white md:flex-row">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden"
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
        <DatePickerButton
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="md:hidden"
        >
          Logout
        </Button>
      </div>

      {/* Sidebar - hidden by default on mobile, shown when toggled */}
      <div
        className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0 md:transform-none
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
      >
        <Sidebar
          selectedDate={selectedDate}
          onDateSelect={handleMobileDateSelect}
        />
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden md:flex p-8 pb-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">
              {format(new Date(selectedDate), "MMMM d, yyyy")}
            </h1>
            {(isLoading || currentEntry.isSaving) && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isLoading ? "Loading..." : "Saving..."}
              </div>
            )}
            {currentEntry.isDirty && !currentEntry.isSaving && (
              <div className="text-sm text-amber-600">Unsaved changes</div>
            )}
            {!currentEntry.isDirty && currentEntry.lastSavedAt && (
              <div className="text-sm text-gray-500">
                Last saved at{" "}
                {format(new Date(currentEntry.lastSavedAt), "HH:mm:ss")}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAutoSave}
              className={autoSaveEnabled ? "bg-green-50" : "bg-gray-50"}
            >
              Auto-save: {autoSaveEnabled ? "ON" : "OFF"}
            </Button>
            <Button
              onClick={handleManualSave}
              disabled={!currentEntry.isDirty || currentEntry.isSaving}
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              Save now
            </Button>
            <DatePickerButton
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />
            <Button onClick={handleLogout}>Logout</Button>
          </div>
        </div>

        {/* Mobile Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 md:hidden">
          <div className="flex items-center gap-2">
            {(isLoading || currentEntry.isSaving) && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                {isLoading ? "Loading..." : "Saving..."}
              </div>
            )}
            {currentEntry.isDirty && !currentEntry.isSaving && (
              <div className="text-sm text-amber-600">Unsaved changes</div>
            )}
          </div>
          <Button
            onClick={handleManualSave}
            disabled={!currentEntry.isDirty || currentEntry.isSaving}
            size="sm"
            variant="ghost"
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 px-4 md:px-8 pb-4 md:pb-8 overflow-auto">
          <Editor
            content={currentEntry.content}
            onChange={handleContentChange}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}
