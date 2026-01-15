
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

export default function CoachAppointments() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [sessionNotes, setSessionNotes] = useState({
    topics: "",
    progress: "",
    recommendations: "",
    next_steps: ""
  });
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: appointments } = useQuery({
    queryKey: ['coach-appointments', user?.id],
    queryFn: () => base44.entities.Appointment.filter({ coach_id: user?.id }),
    initialData: [],
    enabled: !!user
  });

  const confirmMutation = useMutation({
    mutationFn: async (appointmentId) => {
      await base44.entities.Appointment.update(appointmentId, {
        status: "confirmed"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-appointments'] });
      toast.success("Appuntamento confermato!");
    }
  });

  const completeMutation = useMutation({
    mutationFn: async ({ appointmentId, notes }) => {
      const formattedNotes = `
📋 TOPICS DISCUSSI:
${notes.topics}

📈 PROGRESSI:
${notes.progress}

💡 RACCOMANDAZIONI:
${notes.recommendations}

🎯 PROSSIMI PASSI:
${notes.next_steps}
      `.trim();

      await base44.entities.Appointment.update(appointmentId, {
        status: "completed",
        session_notes: formattedNotes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-appointments'] });
      setSelectedAppointment(null);
      setSessionNotes({
        topics: "",
        progress: "",
        recommendations: "",
        next_steps: ""
      });
      toast.success("Sessione completata!");
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (appointment) => {
      // 1. Cancella l'appuntamento
      await base44.entities.Appointment.update(appointment.id, {
        status: "cancelled"
      });

      // 2. Libera lo slot rimettendolo disponibile
      const slots = await base44.entities.TimeSlot.filter({
        appointment_id: appointment.id
      });

      if (slots.length > 0) {
        await base44.entities.TimeSlot.update(slots[0].id, {
          is_available: true,
          appointment_id: null
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['coach-time-slots'] });
      setAppointmentToCancel(null);
      toast.success("Appuntamento cancellato e slot liberato");
    }
  });

  const upcomingAppointments = appointments.filter(apt =>
    apt.status !== 'cancelled' && apt.status !== 'completed'
  );

  const pastAppointments = appointments.filter(apt =>
    apt.status === 'completed' || apt.status === 'cancelled'
  );

  const AppointmentCard = ({ appointment, isPast = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-12 h-12 border-2 border-indigo-100">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                  {appointment.coachee_name?.[0] || "C"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold mb-1">{appointment.coachee_name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(appointment.date).toLocaleDateString('it-IT', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                  })}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {appointment.start_time} - {appointment.end_time}
                </div>
              </div>
            </div>
            <Badge className={
              appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
              appointment.status === 'pending' ? 'bg-orange-100 text-orange-700' :
              appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }>
              {appointment.status === 'pending' ? 'In Attesa' :
               appointment.status === 'confirmed' ? 'Confermato' :
               appointment.status === 'completed' ? 'Completato' :
               'Cancellato'}
            </Badge>
          </div>

          {appointment.notes && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <Label className="text-sm font-semibold text-gray-700 mb-1">Note del Coachee:</Label>
              <p className="text-sm text-gray-700">{appointment.notes}</p>
            </div>
          )}

          {appointment.session_notes && (
            <div className="mb-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
              <Label className="text-sm font-semibold text-indigo-900 mb-2 block">Note della Sessione:</Label>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{appointment.session_notes}</div>
            </div>
          )}

          {!isPast && appointment.status === 'pending' && (
            <div className="flex gap-3">
              <Button
                onClick={() => confirmMutation.mutate(appointment.id)}
                className="bg-green-600 hover:bg-green-700 flex-1"
                disabled={confirmMutation.isPending}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Conferma
              </Button>
              <Button
                onClick={() => setAppointmentToCancel(appointment)}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancella
              </Button>
            </div>
          )}

          {!isPast && appointment.status === 'confirmed' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Completa Sessione
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Completa Sessione con {appointment.coachee_name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>📋 Topics Discussi *</Label>
                    <Textarea
                      value={sessionNotes.topics}
                      onChange={(e) => setSessionNotes({...sessionNotes, topics: e.target.value})}
                      placeholder="Es: Gestione del tempo, obiettivi professionali, work-life balance..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>📈 Progressi Osservati</Label>
                    <Textarea
                      value={sessionNotes.progress}
                      onChange={(e) => setSessionNotes({...sessionNotes, progress: e.target.value})}
                      placeholder="Descrivi i progressi del coachee rispetto alle sessioni precedenti..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>💡 Raccomandazioni</Label>
                    <Textarea
                      value={sessionNotes.recommendations}
                      onChange={(e) => setSessionNotes({...sessionNotes, recommendations: e.target.value})}
                      placeholder="Suggerimenti, risorse, tecniche da provare..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>🎯 Prossimi Passi</Label>
                    <Textarea
                      value={sessionNotes.next_steps}
                      onChange={(e) => setSessionNotes({...sessionNotes, next_steps: e.target.value})}
                      placeholder="Azioni concrete da intraprendere prima della prossima sessione..."
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={() => completeMutation.mutate({
                      appointmentId: appointment.id,
                      notes: sessionNotes
                    })}
                    disabled={completeMutation.isPending || !sessionNotes.topics}
                    className="w-full"
                  >
                    {completeMutation.isPending ? "Salvataggio..." : "Salva e Completa"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {appointment.rescheduled_count > 0 && (
            <div className="mt-3 text-sm text-gray-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Ripianificato {appointment.rescheduled_count} {appointment.rescheduled_count === 1 ? 'volta' : 'volte'}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            I Miei Appuntamenti
          </h1>
          <p className="text-gray-600">Gestisci le sessioni con i tuoi coachee</p>
        </motion.div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="upcoming">
              In Programma ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Passati ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <div className="grid md:grid-cols-2 gap-6">
              <AnimatePresence>
                {upcomingAppointments.length === 0 ? (
                  <Card className="md:col-span-2 shadow-lg">
                    <CardContent className="p-12 text-center">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        Nessun appuntamento in programma
                      </h3>
                      <p className="text-gray-500">
                        Gli appuntamenti prenotati appariranno qui
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  upcomingAppointments.map((apt) => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="grid md:grid-cols-2 gap-6">
              <AnimatePresence>
                {pastAppointments.length === 0 ? (
                  <Card className="md:col-span-2 shadow-lg">
                    <CardContent className="p-12 text-center">
                      <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600">
                        Nessun appuntamento passato
                      </h3>
                    </CardContent>
                  </Card>
                ) : (
                  pastAppointments.map((apt) => (
                    <AppointmentCard key={apt.id} appointment={apt} isPast={true} />
                  ))
                )}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>

        {/* Alert Dialog per Conferma Cancellazione */}
        <AlertDialog open={!!appointmentToCancel} onOpenChange={() => setAppointmentToCancel(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conferma Cancellazione</AlertDialogTitle>
              <AlertDialogDescription>
                Sei sicuro di voler cancellare questo appuntamento con {appointmentToCancel?.coachee_name}?
                Lo slot tornerà disponibile per altre prenotazioni.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => appointmentToCancel && cancelMutation.mutate(appointmentToCancel)}
                className="bg-red-600 hover:bg-red-700"
              >
                Conferma Cancellazione
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
