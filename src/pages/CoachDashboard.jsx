import React, { useState, useEffect } from "react";
import { mindflow } from "@/api/mindflowClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CoachDashboard() {
  const [user, setUser] = useState(null);
  const [coachProfile, setCoachProfile] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await mindflow.auth.me();
    setUser(userData);

    const profiles = await mindflow.entities.CoachProfile.filter({ user_id: userData.id });
    if (profiles.length > 0) {
      setCoachProfile(profiles[0]);
    }
  };

  const { data: appointments } = useQuery({
    queryKey: ['coach-appointments', user?.id],
    queryFn: () => mindflow.entities.Appointment.filter({ coach_id: user?.id }),
    initialData: [],
    enabled: !!user
  });

  const { data: messages } = useQuery({
    queryKey: ['coach-messages', user?.id],
    queryFn: () => mindflow.entities.Message.filter({ receiver_id: user?.id, is_read: false }),
    initialData: [],
    enabled: !!user
  });

  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.date === today;
  });

  const upcomingAppointments = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.date > today && apt.status !== 'cancelled';
  }).slice(0, 5);

  const stats = [
    {
      title: "Appuntamenti Oggi",
      value: todayAppointments.length,
      icon: Calendar,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Appuntamenti In Programma",
      value: upcomingAppointments.length,
      icon: Clock,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Messaggi Non Letti",
      value: messages.length,
      icon: MessageSquare,
      color: "from-pink-500 to-pink-600"
    },
    {
      title: "Appuntamenti Completati",
      value: appointments.filter(a => a.status === 'completed').length,
      icon: CheckCircle2,
      color: "from-green-500 to-green-600"
    }
  ];

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Benvenuto, {user?.full_name || 'Coach'}!
          </h1>
          <p className="text-gray-600">Ecco una panoramica della tua attività</p>
        </motion.div>

        {coachProfile?.status === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="mb-6 border-2 border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-orange-900">Profilo In Attesa di Approvazione</h3>
                    <p className="text-sm text-orange-700">
                      Il tuo profilo è in fase di revisione da parte del team. Riceverai una notifica una volta approvato.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.title}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Appointments */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Appuntamenti di Oggi</span>
                <Link to={createPageUrl("CoachCalendar")}>
                  <Button variant="outline" size="sm">
                    Vedi Calendario
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nessun appuntamento oggi</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((apt) => (
                    <div key={apt.id} className="p-4 bg-indigo-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{apt.coachee_name}</h4>
                          <p className="text-sm text-gray-600">
                            {apt.start_time} - {apt.end_time}
                          </p>
                        </div>
                        <Badge className={
                          apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          apt.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {apt.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Prossimi Appuntamenti</span>
                <Link to={createPageUrl("CoachAppointments")}>
                  <Button variant="outline" size="sm">
                    Vedi Tutti
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nessun appuntamento in programma</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{apt.coachee_name}</h4>
                          <p className="text-sm text-gray-600">
                            {apt.date} • {apt.start_time}
                          </p>
                        </div>
                        <Badge variant="outline">{apt.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}