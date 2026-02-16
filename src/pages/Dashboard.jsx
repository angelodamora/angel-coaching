import React, { useMemo } from "react";
import { mindflow } from "@/api/mindflowClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle
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
  Line
} from "recharts";

export default function Dashboard() {
  const { data: coaches } = useQuery({
    queryKey: ['coaches'],
    queryFn: () => mindflow.entities.CoachProfile.list(),
    initialData: [],
  });

  const { data: coachees } = useQuery({
    queryKey: ['coachees'],
    queryFn: () => mindflow.entities.CoacheeProfile.list(),
    initialData: [],
  });

  const { data: appointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => mindflow.entities.Appointment.list(),
    initialData: [],
  });

  // Calculate total distance - ensure it's always a number
  const totalDistance = useMemo(() => {
    if (!appointments || !Array.isArray(appointments)) {
      return 0;
    }
    
    const calculated = appointments.reduce((sum, apt) => {
      // Extract distance or duration from appointment
      const distance = apt?.distance ?? apt?.duration ?? 0;
      const numValue = Number(distance);
      return sum + (isNaN(numValue) ? 0 : numValue);
    }, 0);
    
    // Ensure it's always a valid number
    return isNaN(calculated) ? 0 : calculated;
  }, [appointments]);

  // Format distance with proper number validation
  const formattedDistance = useMemo(() => {
    const num = Number(totalDistance);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  }, [totalDistance]);

  const stats = [
    {
      title: "Totale Coach",
      value: coaches.filter(c => c.status === 'approved').length,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      pending: coaches.filter(c => c.status === 'pending').length
    },
    {
      title: "Totale Coachee",
      value: coachees.filter(c => c.status === 'approved').length,
      icon: UserCheck,
      color: "from-green-500 to-green-600",
      pending: coachees.filter(c => c.status === 'pending').length
    },
    {
      title: "Appuntamenti Totali",
      value: appointments.length,
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
      change: "+12%"
    },
    {
      title: "Distanza Totale",
      value: formattedDistance,
      icon: TrendingUp,
      color: "from-indigo-500 to-indigo-600",
      unit: "km"
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
            Dashboard
          </h1>
          <p className="text-gray-600">Panoramica generale della piattaforma</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-100">
                <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 bg-gradient-to-br ${stat.color} rounded-full opacity-10`} />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                    {stat.title}
                    <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value} {stat.unit || ''}
                  </div>
                  {stat.pending > 0 && (
                    <div className="text-sm text-orange-600 font-medium">
                      {stat.pending} in attesa di approvazione
                    </div>
                  )}
                  {stat.change && (
                    <div className="text-sm text-green-600 font-medium">
                      {stat.change} questo mese
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Appuntamenti per Stato</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'In attesa', value: appointments.filter(a => a.status === 'pending').length },
                    { name: 'Confermati', value: appointments.filter(a => a.status === 'confirmed').length },
                    { name: 'Completati', value: appointments.filter(a => a.status === 'completed').length },
                    { name: 'Cancellati', value: appointments.filter(a => a.status === 'cancelled').length },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Crescita Utenti</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={[
                    { name: 'Gen', coaches: 5, coachees: 12 },
                    { name: 'Feb', coaches: 8, coachees: 18 },
                    { name: 'Mar', coaches: 12, coachees: 25 },
                    { name: 'Apr', coaches: coaches.length, coachees: coachees.length },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="coaches" stroke="#6366f1" strokeWidth={2} />
                  <Line type="monotone" dataKey="coachees" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
