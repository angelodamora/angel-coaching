import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, Calendar, Clock, Euro } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import CoachAvailabilityCalendar from "@/components/CoachAvailabilityCalendar";

export default function BookAppointment() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [coachId, setCoachId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [notes, setNotes] = useState("");
  const [user, setUser] = useState(null);
  const [coachProfile, setCoachProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enableMultiBooking, setEnableMultiBooking] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('coachId');
    if (!id) {
      toast.error("Coach non trovato");
      navigate(createPageUrl("CoachList"));
      return;
    }
    setCoachId(id);
    loadData(id);
  }, []);

  const loadData = async (id) => {
    try {
      setLoading(true);
      const userData = await base44.auth.me();
      setUser(userData);
      
      const coaches = await base44.entities.CoachProfile.filter({ user_id: id });
      if (coaches.length > 0) {
        setCoachProfile(coaches[0]);
      } else {
        toast.error("Coach non trovato");
        navigate(createPageUrl("CoachList"));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Errore durante il caricamento");
    } finally {
      setLoading(false);
    }
  };

  const bookMultipleMutation = useMutation({
    mutationFn: async () => {
      const coacheeProfiles = await base44.entities.CoacheeProfile.filter({ user_id: user.id });
      const coacheeName = coacheeProfiles.length > 0 ? coacheeProfiles[0].full_name : user.full_name;
      
      const appointments = [];
      
      for (const slot of selectedSlots) {
        const appointment = await base44.entities.Appointment.create({
          coach_id: coachId,
          coach_name: coachProfile.full_name,
          coachee_id: user.id,
          coachee_name: coacheeName,
          date: selectedDate,
          start_time: slot.start_time,
          end_time: slot.end_time,
          duration_minutes: slot.duration_minutes,
          status: "pending",
          notes: notes,
          rescheduled_count: 0
        });

        await base44.entities.TimeSlot.update(slot.id, {
          is_available: false,
          appointment_id: appointment.id
        });

        appointments.push(appointment);
      }

      return appointments;
    },
    onSuccess: (appointments) => {
      toast.success(`${appointments.length} appuntamenti prenotati con successo! In attesa di conferma dal coach.`);
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['month-slots'] });
      queryClient.invalidateQueries({ queryKey: ['day-slots'] });
      navigate(createPageUrl("MyAppointments"));
    },
    onError: (error) => {
      toast.error("Errore durante la prenotazione. Riprova.");
      console.error(error);
    }
  });

  const handleBook = () => {
    if (selectedSlots.length === 0) {
      toast.error("Seleziona almeno uno slot orario");
      return;
    }
    bookMultipleMutation.mutate();
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlots([]);
  };

  const handleSlotSelect = (slot) => {
    if (!enableMultiBooking) {
      setSelectedSlots([slot]);
    } else {
      setSelectedSlots(prev => {
        const exists = prev.find(s => s.id === slot.id);
        if (exists) {
          return prev.filter(s => s.id !== slot.id);
        } else {
          return [...prev, slot].sort((a, b) => a.start_time.localeCompare(b.start_time));
        }
      });
    }
  };

  const totalCost = selectedSlots.reduce((sum, slot) => {
    return sum + (coachProfile?.hourly_rate * slot.duration_minutes / 60);
  }, 0);

  const totalDuration = selectedSlots.reduce((sum, slot) => sum + slot.duration_minutes, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!coachProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Coach non trovato</p>
            <Button onClick={() => navigate(createPageUrl("CoachList"))}>
              Torna alla lista coach
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="outline"
          onClick={() => navigate(createPageUrl("CoachList"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Indietro
        </Button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Prenota Sessioni
          </h1>
          <p className="text-gray-600">
            Seleziona data e orari per le tue sessioni di coaching
          </p>
          
          <div className="flex items-center space-x-2 mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <Checkbox
              id="multi-booking"
              checked={enableMultiBooking}
              onCheckedChange={setEnableMultiBooking}
            />
            <label
              htmlFor="multi-booking"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Abilita prenotazione multipla (seleziona più slot in un'unica operazione)
            </label>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CoachAvailabilityCalendar
              coachId={coachId}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onSlotSelect={handleSlotSelect}
              multiSelect={enableMultiBooking}
              selectedSlots={selectedSlots}
            />
          </div>

          <div className="space-y-6">
            <Card className="shadow-lg sticky top-6">
              <CardHeader>
                <CardTitle>Il Tuo Coach</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-16 h-16 border-2 border-indigo-100">
                    <AvatarImage src={coachProfile.profile_image_url} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xl">
                      {coachProfile.full_name?.[0] || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg">{coachProfile.full_name}</h3>
                    <p className="text-sm text-gray-600">
                      {coachProfile.experience_years} anni di esperienza
                    </p>
                  </div>
                </div>

                {coachProfile.specializations && coachProfile.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {coachProfile.specializations.slice(0, 3).map((spec, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                )}

                {coachProfile.hourly_rate && (
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Euro className="w-4 h-4" />
                      <span>Tariffa oraria</span>
                    </div>
                    <div className="text-2xl font-bold text-indigo-600">
                      €{coachProfile.hourly_rate}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {(selectedDate || selectedSlots.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Riepilogo Prenotazione</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedDate && (
                      <div>
                        <Label className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4" />
                          Data
                        </Label>
                        <div className="font-semibold text-lg">
                          {new Date(selectedDate).toLocaleDateString('it-IT', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    )}

                    {selectedSlots.length > 0 ? (
                      <>
                        <div>
                          <Label className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4" />
                            Slot Selezionati ({selectedSlots.length})
                          </Label>
                          <div className="space-y-2">
                            {selectedSlots.map((slot) => (
                              <div key={slot.id} className="p-2 bg-indigo-50 rounded-lg border border-indigo-200">
                                <div className="font-medium">
                                  {slot.start_time} - {slot.end_time}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {slot.duration_minutes} minuti
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Durata Totale:</span>
                            <span className="font-semibold">{totalDuration} minuti</span>
                          </div>
                          {coachProfile?.hourly_rate && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Costo Totale:</span>
                              <span className="text-2xl font-bold text-indigo-600">
                                €{totalCost.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div>
                          <Label>Note (opzionale)</Label>
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Aggiungi note o argomenti specifici da trattare..."
                            rows={3}
                            className="mt-1"
                          />
                        </div>

                        <Button
                          onClick={handleBook}
                          disabled={bookMultipleMutation.isPending}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-lg py-6"
                        >
                          {bookMultipleMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Prenotazione...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-5 h-5 mr-2" />
                              Conferma {selectedSlots.length > 1 ? `${selectedSlots.length} Prenotazioni` : 'Prenotazione'}
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-gray-500 text-center">
                          {selectedSlots.length > 1 ? 'Le prenotazioni saranno' : 'La prenotazione sarà'} in attesa di conferma da parte del coach
                        </p>
                      </>
                    ) : selectedDate ? (
                      <div className="text-center py-6 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Seleziona {enableMultiBooking ? 'uno o più slot' : 'uno slot'} per continuare</p>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {!selectedDate && selectedSlots.length === 0 && (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Inizia Selezionando una Data
                  </h3>
                  <p className="text-sm text-gray-500">
                    Scegli una data dal calendario per vedere gli orari disponibili
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}