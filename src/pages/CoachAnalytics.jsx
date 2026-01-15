import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, DollarSign, Users, Award, Calendar, MessageSquare, Star } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

export default function CoachAnalytics() {
  const [user, setUser] = useState(null);
  const [timePeriod, setTimePeriod] = useState("30");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: coachProfile } = useQuery({
    queryKey: ['coach-profile', user?.id],
    queryFn: async () => {
      const profiles = await base44.entities.CoachProfile.filter({ user_id: user?.id });
      return profiles[0];
    },
    enabled: !!user
  });

  const { data: allAppointments } = useQuery({
    queryKey: ['coach-analytics-appointments', user?.id],
    queryFn: () => base44.entities.Appointment.filter({ coach_id: user?.id }),
    initialData: [],
    enabled: !!user
  });

  const { data: allMessages } = useQuery({
    queryKey: ['coach-analytics-messages', user?.id],
    queryFn: async () => {
      const sent = await base44.entities.Message.filter({ sender_id: user?.id });
      const received = await base44.entities.Message.filter({ receiver_id: user?.id });
      return [...sent, ...received];
    },
    initialData: [],
    enabled: !!user
  });

  // Filter by time period
  const getFilteredAppointments = () => {
    const days = parseInt(timePeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return allAppointments.filter(apt => new Date(apt.date) >= cutoffDate);
  };

  const appointments = getFilteredAppointments();

  // Calculate metrics
  const completedSessions = appointments.filter(apt => apt.status === 'completed').length;
  
  const totalEarnings = appointments
    .filter(apt => apt.status === 'completed')
    .reduce((sum, apt) => sum + (coachProfile?.hourly_rate || 0) * apt.duration_minutes / 60, 0);

  const uniqueCoachees = [...new Set(appointments.map(apt => apt.coachee_id))].length;

  const averageRating = 4.7; // Placeholder - can be implemented with a rating system

  // Engagement calculation
  const coacheeEngagement = {};
  appointments.forEach(apt => {
    if (!coacheeEngagement[apt.coachee_id]) {
      coacheeEngagement[apt.coachee_id] = {
        name: apt.coachee_name,
        sessions: 0,
        messages: 0
      };
    }
    coacheeEngagement[apt.coachee_id].sessions++;
  });

  allMessages.forEach(msg => {
    const coacheeId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
    if (coacheeEngagement[coacheeId]) {
      coacheeEngagement[coacheeId].messages++;
    }
  });

  const engagementData = Object.values(coacheeEngagement).map(c => ({
    name: c.name,
    sessions: c.sessions,
    messages: c.messages,
    engagement: c.sessions * 5 + c.messages
  })).sort((a, b) => b.engagement - a.engagement).slice(0, 10);

  // Sessions over time
  const sessionsOverTime = {};
  appointments.forEach(apt => {
    const monthYear = new Date(apt.date).toLocaleDateString('it-IT', { month: 'short', year: 'numeric' });
    if (!sessionsOverTime[monthYear]) {
      sessionsOverTime[monthYear] = { completed: 0, cancelled: 0, total: 0 };
    }
    sessionsOverTime[monthYear].total++;
    if (apt.status === 'completed') sessionsOverTime[monthYear].completed++;
    if (apt.status === 'cancelled') sessionsOverTime[monthYear].cancelled++;
  });

  const timelineData = Object.entries(sessionsOverTime).map(([month, data]) => ({
    month,
    completed: data.completed,
    cancelled: data.cancelled
  }));

  // Status distribution
  const statusCounts = appointments.reduce((acc, apt) => {
    acc[apt.status] = (acc[apt.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status === 'completed' ? 'Completate' :
          status === 'confirmed' ? 'Confermate' :
          status === 'pending' ? 'In Attesa' :
          status === 'cancelled' ? 'Cancellate' : status,
    value: count
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  // Earnings over time
  const earningsOverTime = {};
  appointments.filter(apt => apt.status === 'completed').forEach(apt => {
    const monthYear = new Date(apt.date).toLocaleDateString('it-IT', { month: 'short', year: 'numeric' });
    const earning = (coachProfile?.hourly_rate || 0) * apt.duration_minutes / 60;
    earningsOverTime[monthYear] = (earningsOverTime[monthYear] || 0) + earning;
  });

  const earningsData = Object.entries(earningsOverTime).map(([month, earnings]) => ({
    month,
    earnings: earnings.toFixed(2)
  }));

  const metrics = [
    {
      title: "Sessioni Completate",
      value: completedSessions,
      change: "+12% vs periodo precedente",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Guadagno Totale",
      value: `€${totalEarnings.toFixed(2)}`,
      change: "+€245 vs periodo precedente",
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Coachee Attivi",
      value: uniqueCoachees,
      change: `${uniqueCoachees} coachee unici`,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Valutazione Media",
      value: averageRating,
      change: "⭐ Eccellente",
      icon: Award,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    }
  ];

  if (!user || !coachProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600">Monitora le tue performance e i tuoi risultati</p>
            </div>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Ultimi 7 giorni</SelectItem>
                <SelectItem value="30">Ultimi 30 giorni</SelectItem>
                <SelectItem value="90">Ultimi 3 mesi</SelectItem>
                <SelectItem value="365">Ultimo anno</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${metric.bgColor} rounded-xl flex items-center justify-center`}>
                      <metric.icon className={`w-6 h-6 ${metric.color}`} />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</p>
                    <p className="text-xs text-gray-500">{metric.change}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Sessions Timeline */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Sessioni nel Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" name="Completate" />
                  <Bar dataKey="cancelled" fill="#ef4444" name="Cancellate" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Distribuzione Stato Sessioni
              </CardTitle>
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
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Earnings Over Time */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                Guadagni nel Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `€${value}`} />
                  <Legend />
                  <Line type="monotone" dataKey="earnings" stroke="#3b82f6" strokeWidth={3} name="Guadagni (€)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Coachee Engagement */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Top Coachee per Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {engagementData.map((coachee, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{coachee.name}</p>
                        <p className="text-xs text-gray-600">
                          {coachee.sessions} sessioni • {coachee.messages} messaggi
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-700">
                      {coachee.engagement} punti
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rating Placeholder Section */}
        <Card className="shadow-lg border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              Sistema di Valutazione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-5xl font-bold text-yellow-600">{averageRating}</div>
                  <div className="flex flex-col">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">Valutazione media (placeholder)</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-2">
                  Il sistema di valutazione consente ai coachee di recensire le sessioni completate.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Nota:</strong> Questa è una funzionalità placeholder. 
                  Implementa un sistema di rating per tracciare le valutazioni reali dei coachee.
                </p>
              </div>
              <div className="space-y-2 w-full md:w-64">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm font-medium w-8">{stars}⭐</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${stars === 5 ? 85 : stars === 4 ? 12 : 3}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 w-8">{stars === 5 ? '85%' : stars === 4 ? '12%' : '3%'}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}