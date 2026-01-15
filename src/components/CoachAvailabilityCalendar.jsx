import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function CoachAvailabilityCalendar({ coachId, onDateSelect, onSlotSelect, selectedDate, multiSelect = false, selectedSlots = [] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Query per ottenere tutti gli slot del mese corrente
  const { data: monthSlots } = useQuery({
    queryKey: ['month-slots', coachId, currentMonth.getMonth(), currentMonth.getFullYear()],
    queryFn: async () => {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      // Ottieni tutti gli slot del mese
      const allSlots = await base44.entities.TimeSlot.filter({ 
        coach_id: coachId,
        is_available: true
      });
      
      // Filtra per il mese corrente
      const monthSlots = allSlots.filter(slot => {
        const slotDate = new Date(slot.date);
        return slotDate >= startDate && slotDate <= endDate;
      });
      
      // Raggruppa per data
      const slotsByDate = {};
      monthSlots.forEach(slot => {
        if (!slotsByDate[slot.date]) {
          slotsByDate[slot.date] = [];
        }
        slotsByDate[slot.date].push(slot);
      });
      
      return slotsByDate;
    },
    initialData: {},
    enabled: !!coachId
  });

  // Query per gli slot del giorno selezionato
  const { data: daySlots, isLoading: loadingSlots } = useQuery({
    queryKey: ['day-slots', coachId, selectedDate],
    queryFn: async () => {
      const slots = await base44.entities.TimeSlot.filter({ 
        coach_id: coachId,
        date: selectedDate,
        is_available: true
      });
      return slots.sort((a, b) => a.start_time.localeCompare(b.start_time));
    },
    initialData: [],
    enabled: !!coachId && !!selectedDate
  });

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Padding per i giorni del mese precedente
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Giorni del mese corrente
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getSlotCount = (date) => {
    const dateStr = formatDate(date);
    return monthSlots[dateStr]?.length || 0;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return formatDate(date) === selectedDate;
  };

  const handleDateClick = (date) => {
    if (isPast(date)) return;
    const dateStr = formatDate(date);
    onDateSelect(dateStr);
  };

  const days = getDaysInMonth();
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

  return (
    <div className="space-y-6">
      {/* Calendario Mensile */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Seleziona una Data
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-lg font-semibold min-w-[150px] text-center">
                {currentMonth.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
              </span>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Header giorni settimana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Griglia giorni */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }
              
              const slotCount = getSlotCount(date);
              const hasSlots = slotCount > 0;
              const past = isPast(date);
              const today = isToday(date);
              const selected = isSelected(date);
              
              return (
                <motion.button
                  key={index}
                  whileHover={!past ? { scale: 1.05 } : {}}
                  whileTap={!past ? { scale: 0.95 } : {}}
                  onClick={() => handleDateClick(date)}
                  disabled={past}
                  className={`
                    aspect-square p-2 rounded-lg border-2 transition-all relative
                    ${past ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                    ${!past && !hasSlots ? 'bg-white border-gray-200 hover:border-gray-300' : ''}
                    ${!past && hasSlots && !selected ? 'bg-green-50 border-green-200 hover:border-green-400 hover:bg-green-100' : ''}
                    ${selected ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : ''}
                    ${today && !selected ? 'border-indigo-400 border-4' : ''}
                  `}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className={`text-sm font-semibold ${selected ? 'text-white' : ''}`}>
                      {date.getDate()}
                    </span>
                    {hasSlots && !selected && (
                      <Badge className="mt-1 text-xs bg-green-600 text-white px-1 py-0">
                        {slotCount}
                      </Badge>
                    )}
                    {hasSlots && selected && (
                      <Badge className="mt-1 text-xs bg-white text-indigo-600 px-1 py-0">
                        {slotCount}
                      </Badge>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
          
          {/* Legenda */}
          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-50 border-2 border-green-200"></div>
              <span className="text-sm text-gray-600">Disponibile</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-indigo-600"></div>
              <span className="text-sm text-gray-600">Selezionato</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white border-4 border-indigo-400"></div>
              <span className="text-sm text-gray-600">Oggi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-200"></div>
              <span className="text-sm text-gray-600">Non disponibile</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slot del giorno selezionato */}
      {selectedDate && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Orari Disponibili - {new Date(selectedDate).toLocaleDateString('it-IT', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSlots ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 mt-3">Caricamento orari...</p>
              </div>
            ) : daySlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Nessun orario disponibile</p>
                <p className="text-sm mt-1">Seleziona un'altra data</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {daySlots.map((slot) => {
                  const isSelected = multiSelect && selectedSlots.some(s => s.id === slot.id);
                  return (
                    <motion.button
                      key={slot.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onSlotSelect(slot)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-green-400 bg-green-100 ring-2 ring-green-300'
                          : 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`font-bold text-lg ${isSelected ? 'text-green-900' : 'text-indigo-900'}`}>
                          {slot.start_time}
                        </div>
                        <div className={`text-xs mt-1 ${isSelected ? 'text-green-700' : 'text-indigo-700'}`}>
                          {slot.duration_minutes} minuti
                        </div>
                        {isSelected && (
                          <Badge className="mt-1 bg-green-600 text-white text-xs">Selezionato</Badge>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}