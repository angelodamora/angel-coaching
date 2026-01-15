import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar as CalendarIcon, Clock, Plus, X, Edit2, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AdminCoachSchedules() {
  const queryClient = useQueryClient();
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [newSlot, setNewSlot] = useState({
    start_time: "09:00",
    duration_minutes: 30
  });

  const { data: coaches } = useQuery({
    queryKey: ['approved-coaches'],
    queryFn: () => base44.entities.CoachProfile.filter({ status: 'approved' }),
    initialData: [],
  });

  const { data: timeSlots } = useQuery({
    queryKey: ['coach-time-slots', selectedCoach, selectedDate],
    queryFn: () => base44.entities.TimeSlot.filter({ 
      coach_id: selectedCoach,
      date: selectedDate 
    }),
    initialData: [],
    enabled: !!selectedCoach
  });

  const { data: appointments } = useQuery({
    queryKey: ['coach-appointments-admin', selectedCoach, selectedDate],
    queryFn: () => base44.entities.Appointment.filter({ 
      coach_id: selectedCoach,
      date: selectedDate 
    }),
    initialData: [],
    enabled: !!selectedCoach
  });

  const createSlotMutation = useMutation({
    mutationFn: async (slotData) => {
      const endTime = calculateEndTime(slotData.start_time, slotData.duration_minutes);
      await base44.entities.TimeSlot.create({
        coach_id: selectedCoach,
        date: selectedDate,
        start_time: slotData.start_time,
        end_time: endTime,
        duration_minutes: slotData.duration_minutes,
        is_available: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-time-slots'] });
      setIsAddingSlot(false);
      setNewSlot({ start_time: "09:00", duration_minutes: 30 });
      toast.success("Slot aggiunto con successo!");
    }
  });

  const updateSlotMutation = useMutation({
    mutationFn: async ({ slotId, slotData }) => {
      const endTime = calculateEndTime(slotData.start_time, slotData.duration_minutes);
      await base44.entities.TimeSlot.update(slotId, {
        start_time: slotData.start_time,
        end_time: endTime,
        duration_minutes: slotData.duration_minutes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-time-slots'] });
      setEditingSlot(null);
      toast.success("Slot aggiornato!");
    }
  });

  const deleteSlotMutation = useMutation({
    mutationFn: (slotId) => base44.entities.TimeSlot.delete(slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-time-slots'] });
      toast.success("Slot eliminato");
    }
  });

  const calculateEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        options.push(time);
      }
    }
    return options;
  };

  const handleAddSlot = () => {
    createSlotMutation.mutate(newSlot);
  };

  const handleUpdateSlot = (slotId, slotData) => {
    updateSlotMutation.mutate({ slotId, slotData });
  };

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Gestione Orari Coach
          </h1>
          <p className="text-gray-600">Visualizza e modifica gli orari di disponibilità dei coach</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lista Coach */}
          <Card className="shadow-lg lg:col-span-1">
            <CardHeader>
              <CardTitle>Coach Attivi</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {coaches.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>Nessun coach approvato</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {coaches.map((coach) => (
                      <button
                        key={coach.id}
                        onClick={() => setSelectedCoach(coach.user_id)}
                        className={`w-full p-4 text-left rounded-lg transition-colors ${
                          selectedCoach === coach.user_id
                            ? 'bg-indigo-50 border-2 border-indigo-200'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <h4 className="font-semibold">{coach.full_name}</h4>
                        <p className="text-sm text-gray-600">
                          {coach.specializations?.[0] || 'Coach'}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Calendario e Slot */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedCoach ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Seleziona un Coach
                  </h3>
                  <p className="text-gray-500">
                    Scegli un coach dalla lista per visualizzare e gestire i suoi orari
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5" />
                        Seleziona Data
                      </div>
                      <Dialog open={isAddingSlot} onOpenChange={setIsAddingSlot}>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                            <Plus className="w-4 h-4 mr-2" />
                            Aggiungi Slot
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Nuovo Slot di Disponibilità</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Ora Inizio</Label>
                              <Select
                                value={newSlot.start_time}
                                onValueChange={(value) => setNewSlot({...newSlot, start_time: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {generateTimeOptions().map(time => (
                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Durata</Label>
                              <Select
                                value={String(newSlot.duration_minutes)}
                                onValueChange={(value) => setNewSlot({...newSlot, duration_minutes: parseInt(value)})}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="30">30 minuti</SelectItem>
                                  <SelectItem value="45">45 minuti</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button 
                              onClick={handleAddSlot}
                              disabled={createSlotMutation.isPending}
                              className="w-full"
                            >
                              Crea Slot
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="max-w-xs"
                    />
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Slot del {selectedDate}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {timeSlots.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>Nessuno slot configurato per questa data</p>
                        <p className="text-sm mt-2">Clicca su "Aggiungi Slot" per iniziare</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <AnimatePresence>
                          {timeSlots.map((slot) => {
                            const appointment = appointments.find(a => a.appointment_id === slot.id);
                            const isBooked = !slot.is_available || appointment;
                            const isEditing = editingSlot?.id === slot.id;

                            return (
                              <motion.div
                                key={slot.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`p-4 rounded-lg border-2 ${
                                  isBooked 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-white border-gray-200'
                                }`}
                              >
                                {isEditing ? (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <Label className="text-xs">Ora Inizio</Label>
                                        <Select
                                          value={editingSlot.start_time}
                                          onValueChange={(value) => setEditingSlot({...editingSlot, start_time: value})}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {generateTimeOptions().map(time => (
                                              <SelectItem key={time} value={time}>{time}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label className="text-xs">Durata</Label>
                                        <Select
                                          value={String(editingSlot.duration_minutes)}
                                          onValueChange={(value) => setEditingSlot({...editingSlot, duration_minutes: parseInt(value)})}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="30">30 min</SelectItem>
                                            <SelectItem value="45">45 min</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleUpdateSlot(slot.id, {
                                          start_time: editingSlot.start_time,
                                          duration_minutes: editingSlot.duration_minutes
                                        })}
                                        disabled={updateSlotMutation.isPending}
                                        className="flex-1"
                                      >
                                        <Save className="w-3 h-3 mr-1" />
                                        Salva
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditingSlot(null)}
                                      >
                                        Annulla
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-4 h-4 text-indigo-600" />
                                        <span className="font-semibold text-lg">
                                          {slot.start_time} - {slot.end_time}
                                        </span>
                                        <Badge variant="outline" className="text-xs">
                                          {slot.duration_minutes} min
                                        </Badge>
                                      </div>
                                      
                                      {isBooked && appointment && (
                                        <div className="mt-2 pt-2 border-t border-green-300">
                                          <Badge className="bg-green-600 text-white mb-1">
                                            Prenotato
                                          </Badge>
                                          <p className="text-sm font-medium text-green-900">
                                            {appointment.coachee_name}
                                          </p>
                                          <p className="text-xs text-green-700">
                                            Stato: {appointment.status}
                                          </p>
                                        </div>
                                      )}
                                      
                                      {!isBooked && (
                                        <Badge className="bg-blue-100 text-blue-700">
                                          Disponibile
                                        </Badge>
                                      )}
                                    </div>

                                    {!isBooked && (
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setEditingSlot({
                                            id: slot.id,
                                            start_time: slot.start_time,
                                            duration_minutes: slot.duration_minutes
                                          })}
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-red-600 border-red-200 hover:bg-red-50"
                                          onClick={() => deleteSlotMutation.mutate(slot.id)}
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Riepilogo Settimanale */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Riepilogo Settimana</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WeekSummary 
                      coachId={selectedCoach} 
                      currentDate={selectedDate}
                      onDateSelect={setSelectedDate}
                    />
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente per il riepilogo settimanale
function WeekSummary({ coachId, currentDate, onDateSelect }) {
  const getWeekDates = (date) => {
    const current = new Date(date);
    const week = [];
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1); // Lunedì
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(current);
      d.setDate(diff + i);
      week.push(d.toISOString().split('T')[0]);
    }
    return week;
  };

  const weekDates = getWeekDates(currentDate);

  const { data: weekSlots } = useQuery({
    queryKey: ['week-slots', coachId, weekDates[0]],
    queryFn: async () => {
      const allSlots = await Promise.all(
        weekDates.map(date => 
          base44.entities.TimeSlot.filter({ coach_id: coachId, date })
        )
      );
      return allSlots;
    },
    enabled: !!coachId
  });

  const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDates.map((date, index) => {
        const slots = weekSlots?.[index] || [];
        const availableCount = slots.filter(s => s.is_available).length;
        const bookedCount = slots.filter(s => !s.is_available).length;
        const isToday = date === currentDate;

        return (
          <button
            key={date}
            onClick={() => onDateSelect(date)}
            className={`p-3 rounded-lg border-2 transition-all hover:shadow-md ${
              isToday 
                ? 'bg-indigo-50 border-indigo-300' 
                : 'bg-white border-gray-200 hover:border-indigo-200'
            }`}
          >
            <div className="text-xs font-semibold text-gray-500 mb-1">
              {dayNames[index]}
            </div>
            <div className="text-lg font-bold mb-2">
              {new Date(date).getDate()}
            </div>
            <div className="space-y-1">
              {availableCount > 0 && (
                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {availableCount} liberi
                </div>
              )}
              {bookedCount > 0 && (
                <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  {bookedCount} prenotati
                </div>
              )}
              {slots.length === 0 && (
                <div className="text-xs text-gray-400">
                  Nessuno slot
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}