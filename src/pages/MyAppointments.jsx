import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MyAppointments() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: appointments } = useQuery({
    queryKey: ['my-appointments', user?.id],
    queryFn: () => base44.entities.Appointment.filter({ coachee_id: user?.id }),
    initialData: [],
    enabled: !!user
  });

  // Cancellazione appuntamento (libera lo slot)
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
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
      toast.success("Appuntamento cancellato");
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
            <div>
              <h3 className="text-xl font-bold mb-1">{appointment.coach_name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Calendar className="w-4 h-4" />
                {new Date(appointment.date).toLocaleDateString('it-IT', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                {appointment.start_time} - {appointment.end_time} ({appointment.duration_minutes} min)
              </div>
            </div>
            <Badge className={
              appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
              appointment.status === 'pending' ? 'bg-orange-100 text-orange-700' :
              appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }>
              {appointment.status === 'pending' ? 'In Attesa Conferma' :
               appointment.status === 'confirmed' ? 'Confermato' :
               appointment.status === 'completed' ? 'Completato' :
               'Cancellato'}
            </Badge>
          </div>

          {appointment.notes && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700"><strong>Le tue note:</strong> {appointment.notes}</p>
            </div>
          )}

          {appointment.session_notes && (
            <div className="mb-4 p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
              <p className="text-sm font-semibold text-indigo-900 mb-1">Note del Coach:</p>
              <p className="text-sm text-gray-700">{appointment.session_notes}</p>
            </div>
          )}

          {!isPast && appointment.status === 'pending' && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-orange-800 font-medium">In attesa di conferma</p>
                <p className="text-xs text-orange-700 mt-1">Il coach confermerà presto la tua prenotazione</p>
              </div>
            </div>
          )}

          {!isPast && appointment.status === 'confirmed' && (
            <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-green-800 font-medium">Appuntamento confermato!</p>
                <p className="text-xs text-green-700 mt-1">Ti aspettiamo alla sessione</p>
              </div>
            </div>
          )}

          {!isPast && (appointment.status === 'pending' || appointment.status === 'confirmed') && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancella Appuntamento
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Conferma Cancellazione</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sei sicuro di voler cancellare questo appuntamento con {appointment.coach_name}?
                    Questa azione non può essere annullata. Lo slot tornerà disponibile.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => cancelMutation.mutate(appointment)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Conferma Cancellazione
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
          <p className="text-gray-600">Gestisci le tue sessioni di coaching</p>
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
                      <p className="text-gray-500 mb-6">
                        Inizia il tuo percorso prenotando una sessione
                      </p>
                      <Button
                        onClick={() => window.location.href = createPageUrl("CoachList")}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600"
                      >
                        Trova un Coach
                      </Button>
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
      </div>
    </div>
  );
}