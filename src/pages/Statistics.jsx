import React from "react";
import { mindflow } from "@/api/mindflowClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function Statistics() {
  const { data: appointments } = useQuery({
    queryKey: ['all-appointments'],
    queryFn: () => mindflow.entities.Appointment.list(),
    initialData: [],
  });

  const { data: coaches } = useQuery({
    queryKey: ['all-coaches'],
    queryFn: () => mindflow.entities.CoachProfile.list(),
    initialData: [],
  });

  const { data: coachees } = useQuery({
    queryKey: ['all-coachees'],
    queryFn: () => mindflow.entities.CoacheeProfile.list(),
    initialData: [],
  });

  const stats = {
    totalCoaches: coaches.filter(c => c.status === 'approved').length,
    totalCoachees: coachees.filter(c => c.status === 'approved').length,
    totalAppointments: appointments.length,
    confirmedAppointments: appointments.filter(a => a.status === 'confirmed').length,
    completedAppointments: appointments.filter(a => a.status === 'completed').length,
    cancelledAppointments: appointments.filter(a => a.status === 'cancelled').length,
  };

  const statusData = [
    { name: 'Confermati', value: stats.confirmedAppointments, color: '#10b981' },
    { name: 'Completati', value: stats.completedAppointments, color: '#3b82f6' },
    { name: 'Cancellati', value: stats.cancelledAppointments, color: '#ef4444' },
    { name: 'In Attesa', value: appointments.filter(a => a.status === 'pending').length, color: '#f59e0b' },
  ];

  const topCoaches = React.useMemo(() => {
    const coachAppointments = new Map();
    appointments.forEach(apt => {
      const count = coachAppointments.get(apt.coach_id) || 0;
      coachAppointments.set(apt.coach_id, count + 1);
    });
    
    return Array.from(coachAppointments.entries())
      .map(([coachId, count]) => {
        const coach = coaches.find(c => c.user_id === coachId);
        return {
          name: coach?.full_name || 'Sconosciuto',
          appointments: count
        };
      })
      .sort((a, b) => b.appointments - a.appointments)
      .slice(0, 5);
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
            Statistiche
          </h1>
          <p className="text-gray-600">Analisi completa della piattaforma</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stats.totalCoaches}
                </div>
                <div className="text-sm text-gray-600">Totale Coach</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stats.totalCoachees}
                </div>
                <div className="text-sm text-gray-600">Totale Coachee</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stats.totalAppointments}
                </div>
                <div className="text-sm text-gray-600">Appuntamenti Totali</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Appuntamenti per Stato</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Top 5 Coach per Appuntamenti</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCoaches}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="appointments" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.completedAppointments}
              </div>
              <div className="text-sm text-gray-600">Sessioni Completate</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.confirmedAppointments}
              </div>
              <div className="text-sm text-gray-600">Appuntamenti Confermati</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {((stats.completedAppointments / stats.totalAppointments) * 100 || 0).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Tasso di Completamento</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}