import React, { useState, useEffect } from "react";
import { mindflow } from "@/api/mindflowClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, Clock, X, CalendarRange } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format, addDays, eachDayOfInterval, getDay } from "date-fns";

export default function CoachCalendar() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [newSlot, setNewSlot] = useState({
    start_time: "09:00",
    duration_minutes: 30
  });
  const [bulkSlots, setBulkSlots] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    days_of_week: [],
    start_time: "09:00",
    end_time: "17:00",
    duration_minutes: 45,
    break_minutes: 15
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await mindflow.auth.me();
    setUser(userData);
  };

  const { data: timeSlots } = useQuery({
    queryKey: ['time-slots', user?.id, selectedDate],
    queryFn: () => mindflow.entities.TimeSlot.filter({ 
      coach_id: user?.id,
      date: selectedDate 
    }),
    initialData: [],
    enabled: !!user
  });

  const { data: appointments } = useQuery({
    queryKey: ['appointments', user?.id, selectedDate],
    queryFn: () => mindflow.entities.Appointment.filter({ 
      coach_id: user?.id,
      date: selectedDate 
    }),
    initialData: [],
    enabled: !!user
  });

  const createSlotMutation = useMutation({
    mutationFn: async (slotData) => {
      const endTime = calculateEndTime(slotData.start_time, slotData.duration_minutes);
      await mindflow.entities.TimeSlot.create({
        coach_id: user.id,
        date: selectedDate,
        start_time: slotData.start_time,
        end_time: endTime,
        duration_minutes: slotData.duration_minutes,
        is_available: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots'] });
      setIsAddingSlot(false);
      setNewSlot({ start_time: "09:00", duration_minutes: 30 });
      toast.success("Slot aggiunto con successo!");
    }
  });

  const createBulkSlotsMutation = useMutation({
    mutationFn: async (bulkData) => {
      const slots = [];
      const days = eachDayOfInterval({
        start: new Date(bulkData.start_date),
        end: new Date(bulkData.end_date)
      });

      for (const day of days) {
        const dayOfWeek = getDay(day);
        if (!bulkData.days_of_week.includes(dayOfWeek)) continue;

        let currentTime = bulkData.start_time;
        const endTime = bulkData.end_time;

        while (true) {
          const slotEndTime = calculateEndTime(currentTime, bulkData.duration_minutes);
          if (slotEndTime > endTime) break;

          slots.push({
            coach_id: user.id,
            date: format(day, 'yyyy-MM-dd'),
            start_time: currentTime,
            end_time: slotEndTime,
            duration_minutes: bulkData.duration_minutes,
            is_available: true
          });

          currentTime = calculateEndTime(currentTime, bulkData.duration_minutes + bulkData.break_minutes);
        }
      }

      await mindflow.entities.TimeSlot.bulkCreate(slots);
      return slots.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['time-slots'] });
      setShowBulkAdd(false);
      setBulkSlots({
        start_date: new Date().toISOString().split('T')[0],
        end_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        days_of_week: [],
        start_time: "09:00",
        end_time: "17:00",
        duration_minutes: 45,
        break_minutes: 15
      });
      toast.success(`${count} slot creati con successo!`);
    }
  });

  const deleteSlotMutation = useMutation({
    mutationFn: (slotId) => mindflow.entities.TimeSlot.delete(slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots'] });
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

  const handleAddSlot = () => {
    createSlotMutation.mutate(newSlot);
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

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Il Mio Calendario
          </h1>
          <p className="text-gray-600">Gestisci le tue disponibilità con blocchi personalizzabili</p>
        </motion.div>

        <Card className="shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Seleziona Data
              </div>
              <div className="flex gap-2">
                <Dialog open={showBulkAdd} onOpenChange={setShowBulkAdd}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-indigo-200">
                      <CalendarRange className="w-4 h-4 mr-2" />
                      Disponibilità Multiple
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Crea Blocchi di Disponibilità</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Data Inizio</Label>
                          <Input
                            type="date"
                            value={bulkSlots.start_date}
                            onChange={(e) => setBulkSlots({...bulkSlots, start_date: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Data Fine</Label>
                          <Input
                            type="date"
                            value={bulkSlots.end_date}
                            onChange={(e) => setBulkSlots({...bulkSlots, end_date: e.target.value})}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="mb-3 block">Giorni della Settimana</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { value: 1, label: 'Lunedì' },
                            { value: 2, label: 'Martedì' },
                            { value: 3, label: 'Mercoledì' },
                            { value: 4, label: 'Giovedì' },
                            { value: 5, label: 'Venerdì' },
                            { value: 6, label: 'Sabato' },
                            { value: 0, label: 'Domenica' }
                          ].map((day) => (
                            <div key={day.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`day-${day.value}`}
                                checked={bulkSlots.days_of_week.includes(day.value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setBulkSlots({
                                      ...bulkSlots,
                                      days_of_week: [...bulkSlots.days_of_week, day.value]
                                    });
                                  } else {
                                    setBulkSlots({
                                      ...bulkSlots,
                                      days_of_week: bulkSlots.days_of_week.filter(d => d !== day.value)
                                    });
                                  }
                                }}
                              />
                              <label htmlFor={`day-${day.value}`} className="text-sm cursor-pointer">
                                {day.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Ora Inizio</Label>
                          <Input
                            type="time"
                            value={bulkSlots.start_time}
                            onChange={(e) => setBulkSlots({...bulkSlots, start_time: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Ora Fine</Label>
                          <Input
                            type="time"
                            value={bulkSlots.end_time}
                            onChange={(e) => setBulkSlots({...bulkSlots, end_time: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Durata Sessione (minuti)</Label>
                          <Select
                            value={bulkSlots.duration_minutes.toString()}
                            onValueChange={(value) => setBulkSlots({...bulkSlots, duration_minutes: parseInt(value)})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 minuti</SelectItem>
                              <SelectItem value="45">45 minuti</SelectItem>
                              <SelectItem value="60">60 minuti</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Pausa tra Sessioni (minuti)</Label>
                          <Select
                            value={bulkSlots.break_minutes.toString()}
                            onValueChange={(value) => setBulkSlots({...bulkSlots, break_minutes: parseInt(value)})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Nessuna pausa</SelectItem>
                              <SelectItem value="15">15 minuti</SelectItem>
                              <SelectItem value="30">30 minuti</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setShowBulkAdd(false)}>
                          Annulla
                        </Button>
                        <Button
                          onClick={() => createBulkSlotsMutation.mutate(bulkSlots)}
                          disabled={bulkSlots.days_of_week.length === 0 || createBulkSlotsMutation.isPending}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600"
                        >
                          {createBulkSlotsMutation.isPending ? "Creazione..." : "Crea Slot"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isAddingSlot} onOpenChange={setIsAddingSlot}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Slot Singolo
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
                            <SelectItem value="60">60 minuti</SelectItem>
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
              </div>
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

        <div className="grid gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Slot Disponibili - {selectedDate}</CardTitle>
            </CardHeader>
            <CardContent>
              {timeSlots.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Nessuno slot configurato per questa data</p>
                  <p className="text-sm mt-2">Clicca su "Disponibilità Multiple" per creare blocchi o "Slot Singolo" per slot individuali</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {timeSlots.map((slot) => {
                    const appointment = appointments.find(a => a.appointment_id === slot.id);
                    const isBooked = !slot.is_available || appointment;

                    return (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 rounded-lg border-2 ${
                          isBooked 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-indigo-50 border-indigo-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold text-lg">
                              {slot.start_time} - {slot.end_time}
                            </div>
                            <div className="text-sm text-gray-600">
                              {slot.duration_minutes} minuti
                            </div>
                          </div>
                          {!isBooked && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteSlotMutation.mutate(slot.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        {isBooked && appointment && (
                          <div className="mt-3 pt-3 border-t border-green-300">
                            <div className="text-sm font-medium text-green-900">
                              Prenotato da: {appointment.coachee_name}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}