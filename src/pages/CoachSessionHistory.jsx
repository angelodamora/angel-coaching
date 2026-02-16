import React, { useState, useEffect } from "react";
import { mindflow } from "@/api/mindflowClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Search, FileText, TrendingUp, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CoachSessionHistory() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await mindflow.auth.me();
    setUser(userData);
  };

  const { data: completedAppointments } = useQuery({
    queryKey: ['coach-completed-sessions', user?.id],
    queryFn: () => mindflow.entities.Appointment.filter({ 
      coach_id: user?.id,
      status: 'completed'
    }),
    initialData: [],
    enabled: !!user
  });

  // Raggruppa per coachee
  const sessionsByCoachee = completedAppointments.reduce((acc, apt) => {
    if (!acc[apt.coachee_id]) {
      acc[apt.coachee_id] = {
        coachee_id: apt.coachee_id,
        coachee_name: apt.coachee_name,
        sessions: []
      };
    }
    acc[apt.coachee_id].sessions.push(apt);
    return acc;
  }, {});

  // Filtra per ricerca e mese
  const filteredSessions = completedAppointments.filter(session => {
    const matchesSearch = session.coachee_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesMonth = true;
    if (selectedMonth !== "all") {
      const sessionDate = new Date(session.date);
      const currentYear = new Date().getFullYear();
      matchesMonth = sessionDate.getMonth() === parseInt(selectedMonth) && 
                     sessionDate.getFullYear() === currentYear;
    }
    
    return matchesSearch && matchesMonth;
  });

  const months = [
    { value: "all", label: "Tutti i Mesi" },
    { value: "0", label: "Gennaio" },
    { value: "1", label: "Febbraio" },
    { value: "2", label: "Marzo" },
    { value: "3", label: "Aprile" },
    { value: "4", label: "Maggio" },
    { value: "5", label: "Giugno" },
    { value: "6", label: "Luglio" },
    { value: "7", label: "Agosto" },
    { value: "8", label: "Settembre" },
    { value: "9", label: "Ottobre" },
    { value: "10", label: "Novembre" },
    { value: "11", label: "Dicembre" }
  ];

  const stats = {
    total: completedAppointments.length,
    thisMonth: completedAppointments.filter(apt => {
      const date = new Date(apt.date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    uniqueCoachees: Object.keys(sessionsByCoachee).length,
    totalHours: completedAppointments.reduce((sum, apt) => sum + (apt.duration_minutes / 60), 0)
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
            Storico Sessioni
          </h1>
          <p className="text-gray-600">Tutte le sessioni completate con i tuoi coachee</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-indigo-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Sessioni Totali</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.thisMonth}</div>
              <div className="text-sm text-gray-600">Questo Mese</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.uniqueCoachees}</div>
              <div className="text-sm text-gray-600">Coachee Unici</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalHours.toFixed(1)}h</div>
              <div className="text-sm text-gray-600">Ore Totali</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Cerca per nome coachee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona mese" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="all">
              Tutte ({filteredSessions.length})
            </TabsTrigger>
            <TabsTrigger value="by-coachee">
              Per Coachee ({stats.uniqueCoachees})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-4">
              <AnimatePresence>
                {filteredSessions.length === 0 ? (
                  <Card className="shadow-lg">
                    <CardContent className="p-12 text-center">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        Nessuna sessione trovata
                      </h3>
                      <p className="text-gray-500">
                        Le sessioni completate appariranno qui
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredSessions
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((session) => (
                      <motion.div
                        key={session.id}
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
                                    {session.coachee_name?.[0] || "C"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="text-xl font-bold mb-1">{session.coachee_name}</h3>
                                  <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {new Date(session.date).toLocaleDateString('it-IT', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                      })}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {session.start_time} - {session.end_time}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <Badge className="bg-blue-100 text-blue-700">
                                {session.duration_minutes} min
                              </Badge>
                            </div>

                            {session.notes && (
                              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <Label className="text-sm font-semibold text-gray-700 mb-1 block">Note del Coachee:</Label>
                                <p className="text-sm text-gray-700">{session.notes}</p>
                              </div>
                            )}

                            {session.session_notes && (
                              <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                                <Label className="text-sm font-semibold text-indigo-900 mb-2 block">Note della Sessione:</Label>
                                <div className="text-sm text-gray-700 whitespace-pre-wrap">{session.session_notes}</div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="by-coachee">
            <div className="space-y-6">
              {Object.values(sessionsByCoachee).map((coacheeData) => (
                <Card key={coacheeData.coachee_id} className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12 border-2 border-indigo-100">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                            {coacheeData.coachee_name?.[0] || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-bold">{coacheeData.coachee_name}</h3>
                          <p className="text-sm text-gray-600">
                            {coacheeData.sessions.length} {coacheeData.sessions.length === 1 ? 'sessione' : 'sessioni'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {coacheeData.sessions.reduce((sum, s) => sum + s.duration_minutes, 0)} min totali
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-3">
                        {coacheeData.sessions
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((session, idx) => (
                            <div key={session.id} className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline">Sessione #{coacheeData.sessions.length - idx}</Badge>
                                <div className="text-sm text-gray-600">
                                  {new Date(session.date).toLocaleDateString('it-IT')}
                                </div>
                              </div>
                              {session.session_notes && (
                                <div className="mt-2 p-3 bg-white rounded border-l-4 border-indigo-500">
                                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {session.session_notes}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}