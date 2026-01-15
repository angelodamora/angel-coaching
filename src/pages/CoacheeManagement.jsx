import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Search, Calendar, FileText, Clock, Target, MessageSquare, HelpCircle, ArrowRight, CheckCircle, Save } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export default function CoacheeManagement() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCoachee, setSelectedCoachee] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editingSession, setEditingSession] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: appointments } = useQuery({
    queryKey: ['coach-all-appointments', user?.id],
    queryFn: () => base44.entities.Appointment.filter({ coach_id: user?.id }),
    initialData: [],
    enabled: !!user
  });

  const { data: agreements } = useQuery({
    queryKey: ['all-agreements', user?.id],
    queryFn: () => base44.entities.CoachingAgreement.filter({ coach_id: user?.id }),
    initialData: [],
    enabled: !!user
  });

  const { data: coacheeAgreements } = useQuery({
    queryKey: ['coachee-agreements', user?.id],
    queryFn: () => base44.entities.CoacheeAgreement.filter({ coach_id: user?.id }),
    initialData: [],
    enabled: !!user
  });

  const updateAgreementMutation = useMutation({
    mutationFn: async ({ coacheeId, coacheeName, agreementId }) => {
      const existingAssignments = coacheeAgreements.filter(ca => ca.coachee_id === coacheeId);
      for (const assignment of existingAssignments) {
        await base44.entities.CoacheeAgreement.delete(assignment.id);
      }
      
      if (agreementId && agreementId !== "none") {
        const selectedAgreement = agreements.find(a => a.id === agreementId);
        await base44.entities.CoacheeAgreement.create({
          coach_id: user.id,
          coachee_id: coacheeId,
          coachee_name: coacheeName,
          agreement_template_id: agreementId,
          agreement_title: selectedAgreement?.title,
          coaching_status: "agreement_signed"
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coachee-agreements'] });
      toast.success("Agreement aggiornato!");
    }
  });

  const updateCoachingStatusMutation = useMutation({
    mutationFn: async ({ coacheeAgreementId, status }) => {
      await base44.entities.CoacheeAgreement.update(coacheeAgreementId, { 
        coaching_status: status
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coachee-agreements'] });
      toast.success("Stato aggiornato!");
    }
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await base44.entities.Appointment.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-all-appointments'] });
      setEditingSession(null);
      setSelectedAppointment(null);
      toast.success("Dettagli sessione salvati!");
    }
  });

  const getCoacheeAppointments = (coacheeId) => {
    return appointments
      .filter(apt => apt.coachee_id === coacheeId)
      .sort((a, b) => new Date(a.date + ' ' + a.start_time) - new Date(b.date + ' ' + b.start_time));
  };

  const handleViewAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleSaveSession = () => {
    if (!editingSession) return;
    
    const { id, ...data } = editingSession;
    updateAppointmentMutation.mutate({ id, data });
  };

  const coacheeData = appointments.reduce((acc, apt) => {
    if (!acc[apt.coachee_id]) {
      const coacheeAgreement = coacheeAgreements.find(ca => ca.coachee_id === apt.coachee_id);
      const agreementTemplate = coacheeAgreement ? agreements.find(a => a.id === coacheeAgreement.agreement_template_id) : null;
      
      acc[apt.coachee_id] = {
        id: apt.coachee_id,
        name: apt.coachee_name,
        appointments: [],
        completedSessions: 0,
        upcomingSessions: 0,
        totalSessions: 0,
        hoursCompleted: 0,
        hoursPlanned: 0,
        coacheeAgreement: coacheeAgreement,
        agreementTemplate: agreementTemplate,
        nextAppointment: null
      };
    }
    
    acc[apt.coachee_id].appointments.push(apt);
    acc[apt.coachee_id].totalSessions++;
    
    const hours = apt.duration_minutes / 60;
    
    if (apt.status === 'completed') {
      acc[apt.coachee_id].completedSessions++;
      acc[apt.coachee_id].hoursCompleted += hours;
    } else if (apt.status === 'confirmed' || apt.status === 'pending') {
      acc[apt.coachee_id].upcomingSessions++;
      acc[apt.coachee_id].hoursPlanned += hours;
      
      if (!acc[apt.coachee_id].nextAppointment || new Date(apt.date) < new Date(acc[apt.coachee_id].nextAppointment.date)) {
        acc[apt.coachee_id].nextAppointment = apt;
      }
    }
    
    return acc;
  }, {});

  const coachees = Object.values(coacheeData).filter(coachee =>
    coachee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            I Miei Coachee
          </h1>
          <p className="text-gray-600">Visualizza lo storico delle sessioni e i progressi</p>
        </motion.div>

        <Card className="mb-6 shadow-lg">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Cerca coachee per nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabella Coachee */}
        <Card className="shadow-xl">
          <CardContent className="p-0">
            {coachees.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nessun coachee trovato
                </h3>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Coachee</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Agreement</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Stato</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Sessioni</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Ore</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Prossimo</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {coachees.map((coachee) => (
                      <tr key={coachee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                                {coachee.name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold">{coachee.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Select
                            value={coachee.coacheeAgreement?.agreement_template_id || "none"}
                            onValueChange={(value) => {
                              updateAgreementMutation.mutate({
                                coacheeId: coachee.id,
                                coacheeName: coachee.name,
                                agreementId: value
                              });
                            }}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nessuno</SelectItem>
                              {agreements.filter(a => a.status === 'active').map(a => (
                                <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-6 py-4">
                          {coachee.coacheeAgreement && (
                            <Select
                              value={coachee.coacheeAgreement.coaching_status}
                              onValueChange={(value) => {
                                updateCoachingStatusMutation.mutate({
                                  coacheeAgreementId: coachee.coacheeAgreement.id,
                                  status: value
                                });
                              }}
                            >
                              <SelectTrigger className="w-[160px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="agreement_signed">Firmato</SelectItem>
                                <SelectItem value="intake_session">Intake</SelectItem>
                                <SelectItem value="ongoing_sessions">In Corso</SelectItem>
                                <SelectItem value="completed">Completato</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold">{coachee.completedSessions}/{coachee.totalSessions}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-green-600">{coachee.hoursCompleted.toFixed(1)}h</span>
                        </td>
                        <td className="px-6 py-4">
                          {coachee.nextAppointment ? (
                            <div className="text-sm">
                              <div>{new Date(coachee.nextAppointment.date).toLocaleDateString('it-IT')}</div>
                              <div className="text-gray-500">{coachee.nextAppointment.start_time}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCoachee(coachee)}
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Timeline
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline Dialog */}
        <Dialog open={!!selectedCoachee} onOpenChange={() => setSelectedCoachee(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline Sessioni - {selectedCoachee?.name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedCoachee && (
              <ScrollArea className="h-[70vh] pr-4">
                <div className="space-y-4 py-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600">{selectedCoachee.totalSessions}</div>
                        <div className="text-sm text-gray-600">Totali</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">{selectedCoachee.completedSessions}</div>
                        <div className="text-sm text-gray-600">Completate</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-indigo-600">{selectedCoachee.hoursCompleted.toFixed(1)}h</div>
                        <div className="text-sm text-gray-600">Ore</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Timeline */}
                  <div className="relative">
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    <div className="space-y-6">
                      {getCoacheeAppointments(selectedCoachee.id).map((apt, index) => {
                        const isCompleted = apt.status === 'completed';
                        const isPast = new Date(apt.date + ' ' + apt.start_time) < new Date();
                        
                        return (
                          <motion.div
                            key={apt.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative pl-16"
                          >
                            <div className={`absolute left-6 w-5 h-5 rounded-full border-4 ${
                              isCompleted ? 'bg-green-500 border-green-200' : 
                              isPast ? 'bg-gray-400 border-gray-200' : 
                              'bg-indigo-500 border-indigo-200'
                            }`}></div>

                            <Card 
                              className={`cursor-pointer transition-all hover:shadow-lg ${
                                isCompleted ? 'border-green-300' : 'border-gray-200'
                              }`}
                              onClick={() => handleViewAppointmentDetails(apt)}
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-3">
                                    <Badge className={isCompleted ? 'bg-green-500' : ''}>
                                      {apt.status}
                                    </Badge>
                                    <span className={`font-semibold ${isPast && !isCompleted ? 'line-through text-gray-400' : ''}`}>
                                      {format(new Date(apt.date), 'dd MMMM yyyy', { locale: it })}
                                    </span>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {apt.start_time} - {apt.end_time}
                                  </span>
                                </div>
                                
                                {(apt.session_goals || apt.topics_discussed) && (
                                  <div className="mt-3 pt-3 border-t text-sm text-gray-700">
                                    {apt.session_goals && (
                                      <p className="mb-1">
                                        <strong>Obiettivi:</strong> {apt.session_goals.substring(0, 80)}...
                                      </p>
                                    )}
                                    <Button variant="link" className="p-0 h-auto text-indigo-600">
                                      Visualizza dettagli →
                                    </Button>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Appointment Details Dialog */}
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                Dettagli Sessione - {selectedAppointment && format(new Date(selectedAppointment.date), 'dd MMMM yyyy', { locale: it })}
              </DialogTitle>
            </DialogHeader>
            
            {selectedAppointment && (
              <ScrollArea className="h-[70vh] pr-4">
                <div className="space-y-6 py-4">
                  {/* Info */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Coachee</p>
                      <p className="font-semibold">{selectedAppointment.coachee_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Orario</p>
                      <p className="font-semibold">{selectedAppointment.start_time} - {selectedAppointment.end_time}</p>
                    </div>
                  </div>

                  <Separator />

                  {editingSession ? (
                    <div className="space-y-6">
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-indigo-600" />
                          Obiettivi Sessione
                        </Label>
                        <Textarea
                          value={editingSession.session_goals}
                          onChange={(e) => setEditingSession({...editingSession, session_goals: e.target.value})}
                          rows={4}
                          placeholder="Quali erano gli obiettivi?"
                        />
                      </div>

                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          Temi Discussi
                        </Label>
                        <Textarea
                          value={editingSession.topics_discussed}
                          onChange={(e) => setEditingSession({...editingSession, topics_discussed: e.target.value})}
                          rows={5}
                        />
                      </div>

                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <HelpCircle className="w-4 h-4 text-purple-600" />
                          Domande Principali
                        </Label>
                        <Textarea
                          value={editingSession.key_questions}
                          onChange={(e) => setEditingSession({...editingSession, key_questions: e.target.value})}
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <ArrowRight className="w-4 h-4 text-green-600" />
                          Follow-up
                        </Label>
                        <Textarea
                          value={editingSession.follow_up_actions}
                          onChange={(e) => setEditingSession({...editingSession, follow_up_actions: e.target.value})}
                          rows={4}
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={() => setEditingSession(null)}>Annulla</Button>
                        <Button onClick={handleSaveSession} className="bg-indigo-600">
                          <Save className="w-4 h-4 mr-2" />
                          Salva
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="w-5 h-5 text-indigo-600" />
                          <h3 className="font-semibold text-lg">Obiettivi Sessione</h3>
                        </div>
                        <Card className="bg-indigo-50 border-indigo-200">
                          <CardContent className="p-4">
                            <p className="whitespace-pre-wrap">{selectedAppointment.session_goals || "Non registrato"}</p>
                          </CardContent>
                        </Card>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-lg">Temi Discussi</h3>
                        </div>
                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="p-4">
                            <p className="whitespace-pre-wrap">{selectedAppointment.topics_discussed || "Non registrato"}</p>
                          </CardContent>
                        </Card>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <HelpCircle className="w-5 h-5 text-purple-600" />
                          <h3 className="font-semibold text-lg">Domande Principali</h3>
                        </div>
                        <Card className="bg-purple-50 border-purple-200">
                          <CardContent className="p-4">
                            <p className="whitespace-pre-wrap">{selectedAppointment.key_questions || "Non registrato"}</p>
                          </CardContent>
                        </Card>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <ArrowRight className="w-5 h-5 text-green-600" />
                          <h3 className="font-semibold text-lg">Follow-up</h3>
                        </div>
                        <Card className="bg-green-50 border-green-200">
                          <CardContent className="p-4">
                            <p className="whitespace-pre-wrap">{selectedAppointment.follow_up_actions || "Non registrato"}</p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="flex justify-end pt-4 border-t">
                        <Button
                          onClick={() => setEditingSession({
                            id: selectedAppointment.id,
                            session_goals: selectedAppointment.session_goals || "",
                            topics_discussed: selectedAppointment.topics_discussed || "",
                            key_questions: selectedAppointment.key_questions || "",
                            follow_up_actions: selectedAppointment.follow_up_actions || ""
                          })}
                          className="bg-indigo-600"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Modifica
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}