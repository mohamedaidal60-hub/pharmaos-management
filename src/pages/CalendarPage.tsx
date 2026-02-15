import { motion } from "framer-motion";
import { CalendarDays, Plus, Clock, Users, BookOpen } from "lucide-react";
import { calendarEvents } from "@/data/mockData";
import { useState } from "react";
import { toast } from "sonner";

const typeConfig: Record<string, { label: string; color: string }> = {
  task: { label: "Tâche", color: "bg-primary" },
  meeting: { label: "Réunion", color: "bg-info" },
  training: { label: "Formation", color: "bg-warning" },
};

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Generate simple calendar grid for December 2024
  const daysInMonth = 31;
  const firstDayOffset = 6; // Dec 1, 2024 is Sunday → offset 6
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const getEventsForDay = (day: number) => {
    const dateStr = `2024-12-${String(day).padStart(2, "0")}`;
    return calendarEvents.filter((e) => e.date === dateStr);
  };

  return (
    <div className="space-y-6">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Calendrier</h1>
          <p className="page-subtitle">Planification des rendez-vous, réunions et tâches</p>
        </div>
        <button
          onClick={() => toast.info("Fonctionnalité de planification bientôt disponible")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Nouvel événement
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5 lg:col-span-2">
          <h3 className="font-display font-semibold mb-4">Décembre 2024</h3>
          <div className="grid grid-cols-7 gap-1">
            {dayNames.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
            ))}
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOffset }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {days.map((day) => {
              const events = getEventsForDay(day);
              const dateStr = `2024-12-${String(day).padStart(2, "0")}`;
              const isSelected = selectedDate === dateStr;
              const isToday = day === 14;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`aspect-square rounded-lg text-sm flex flex-col items-center justify-center gap-0.5 transition-colors relative ${isSelected ? "bg-primary text-primary-foreground" :
                      isToday ? "bg-primary/10 text-primary font-bold" :
                        "hover:bg-muted"
                    }`}
                >
                  {day}
                  {events.length > 0 && (
                    <div className="flex gap-0.5 absolute bottom-1">
                      {events.map((e) => (
                        <div key={e.id} className={`h-1 w-1 rounded-full ${isSelected ? "bg-primary-foreground" : typeConfig[e.type]?.color || "bg-primary"}`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Events Sidebar */}
        <div className="space-y-3">
          <div className="glass-card p-5">
            <h3 className="font-display font-semibold text-sm mb-3">Événements à venir</h3>
            <div className="space-y-2">
              {calendarEvents.map((event) => {
                const config = typeConfig[event.type];
                return (
                  <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${config?.color || "bg-primary"}`} />
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <CalendarDays size={10} />
                        <span>{event.date}</span>
                        <Clock size={10} />
                        <span>{event.time}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block ${event.type === "task" ? "badge-primary" :
                          event.type === "meeting" ? "badge-info" : "badge-warning"
                        }`}>
                        {config?.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="glass-card p-4">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Légende</h4>
            <div className="space-y-1.5">
              {Object.entries(typeConfig).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <div className={`h-2 w-2 rounded-full ${config.color}`} />
                  <span>{config.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
