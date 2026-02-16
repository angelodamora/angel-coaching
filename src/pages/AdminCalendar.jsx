import React, { useState } from "react";
import { mindflow } from "@/api/mindflowClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: appointments } = useQuery({
    queryKey: ['admin-appointments', selectedDate],
    queryFn: () => mindflow.entities.Appointment.filter({ date: selectedDate }),
    initialData: [],
  });

  const { data: coaches } = useQuery({
    queryKey: ['coaches'],
    queryFn: () => mindflow.entities.CoachProfile.list(),
    initialData: [],
  });

  const appointmentsByCoach = React.useMemo(() => {
    const map = new Map();
    appointments.forEach(apt => {
      if (!map.has(apt.coach_id)) {
        const coach = coaches.find(c => c.user_id === apt.coach_id);
        map.set(apt.coach_id, {
          coachName: coach?.full_name || apt.coach_name,
          appointments: []
        });
      }
      map.get(apt.coach_id).appointments.push(apt);
    });
    return Array.from(map.values());
  }, [appointments, coaches]);

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Calendario Globale
          </h1>
          <p className="text-gray-600">Visualizza tutti gli appuntamenti dei coach</p>
        </motion.div>

        <Card className="shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Seleziona Data
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

        <div className="space-y-6">
          {appointmentsByCoach.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="p-12 text-center">
                <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nessun appuntamento
                </h3>
                <p className="text-gray-500">
                  Non ci sono appuntamenti programmati per questa data
                </p>
              </CardContent>
            </Card>
          ) : (
            appointmentsByCoach.map((coach, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      {coach.coachName}
                      <Badge variant="secondary" className="ml-2">
                        {coach.appointments.length} appuntamenti
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {coach.appointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-100"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Clock className="w-4 h-4 text-indigo-600" />
                              {apt.start_time} - {apt.end_time}
                            </div>
                            <Badge className={
                              apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              apt.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                              apt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }>
                              {apt.status}
                            </Badge>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {apt.coachee_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {apt.duration_minutes} minuti
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}