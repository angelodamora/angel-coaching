import React, { useState } from "react";
import { mindflow } from "@/api/mindflowClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Award,
  User,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function RegistrationRequests() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("coaches");
  const [emailDialog, setEmailDialog] = useState(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const { data: coaches } = useQuery({
    queryKey: ['coach-requests'],
    queryFn: () => mindflow.entities.CoachProfile.filter({ status: 'pending' }),
    initialData: [],
  });

  const { data: coachees } = useQuery({
    queryKey: ['coachee-requests'],
    queryFn: () => mindflow.entities.CoacheeProfile.filter({ status: 'pending' }),
    initialData: [],
  });

  const openEmailDialog = (coach) => {
    const registrationLink = `${window.location.origin}/`;
    const defaultSubject = "Benvenuto in Angel Coaching - Registrazione Approvata!";
    const defaultBody = `Caro/a ${coach.full_name},

Siamo entusiasti di informarti che la tua richiesta di registrazione come coach è stata approvata!

Benvenuto/a nella famiglia di Angel Coaching. Siamo felici di averti con noi e non vediamo l'ora di vedere il valore che porterai ai nostri coachee.

Prossimi passi:
1. Accedi alla piattaforma usando il link qui sotto
2. Completa il tuo profilo coach
3. Inizia a gestire i tuoi appuntamenti

Link di accesso: ${registrationLink}

Se hai domande o hai bisogno di assistenza, non esitare a contattarci.

Cordiali saluti,
Il Team di Angel Coaching`;

    setEmailSubject(defaultSubject);
    setEmailBody(defaultBody);
    setEmailDialog(coach);
  };

  const approveCoachMutation = useMutation({
    mutationFn: async ({ coach, subject, body }) => {
      await mindflow.entities.CoachProfile.update(coach.id, { status: 'approved' });
      await mindflow.entities.User.update(coach.user_id, { 
        registration_status: 'approved',
        user_type: 'coach'
      });

      if (coach.email) {
        const registrationLink = `${window.location.origin}/`;
        const htmlBody = body.split('\n').map(line => {
          if (line.includes('Link di accesso:')) {
            return `<div style="text-align: center; margin: 30px 0;">
              <a href="${registrationLink}" 
                 style="background-color: #4F46E5; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold; 
                        display: inline-block;">
                Accedi alla Piattaforma
              </a>
            </div>`;
          }
          return `<p>${line}</p>`;
        }).join('');

        await mindflow.integrations.Core.SendEmail({
          to: coach.email,
          subject: subject,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #4F46E5; text-align: center;">Benvenuto in Angel Coaching!</h1>
              ${htmlBody}
              <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
              <p style="font-size: 12px; color: #6B7280; text-align: center;">
                Questa è una email automatica, per favore non rispondere.
              </p>
            </div>
          `
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-requests'] });
      setEmailDialog(null);
      toast.success("Coach approvato con successo! Email di benvenuto inviata.");
    },
  });

  const rejectCoachMutation = useMutation({
    mutationFn: async (id) => {
      await mindflow.entities.CoachProfile.update(id, { status: 'rejected' });
      const coach = coaches.find(c => c.id === id);
      if (coach) {
        await mindflow.entities.User.update(coach.user_id, { 
          registration_status: 'rejected'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-requests'] });
      toast.success("Richiesta rifiutata");
    },
  });

  const approveCoacheeMutation = useMutation({
    mutationFn: async (id) => {
      await mindflow.entities.CoacheeProfile.update(id, { status: 'approved' });
      const coachee = coachees.find(c => c.id === id);
      if (coachee) {
        await mindflow.entities.User.update(coachee.user_id, { 
          registration_status: 'approved',
          user_type: 'coachee'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coachee-requests'] });
      toast.success("Coachee approvato con successo!");
    },
  });

  const rejectCoacheeMutation = useMutation({
    mutationFn: async (id) => {
      await mindflow.entities.CoacheeProfile.update(id, { status: 'rejected' });
      const coachee = coachees.find(c => c.id === id);
      if (coachee) {
        await mindflow.entities.User.update(coachee.user_id, { 
          registration_status: 'rejected'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coachee-requests'] });
      toast.success("Richiesta rifiutata");
    },
  });

  const RequestCard = ({ request, type, onApprove, onReject }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 border-2 border-indigo-100">
              <AvatarImage src={request.profile_image_url} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xl">
                {request.full_name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold">{request.full_name}</h3>
                  <Badge className="bg-orange-100 text-orange-700 mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    In attesa
                  </Badge>
                </div>
              </div>

              {type === 'coach' && (
                <div className="space-y-2 mb-4">
                  {request.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-indigo-500" />
                      {request.email}
                    </div>
                  )}
                  {request.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-indigo-500" />
                      {request.phone}
                    </div>
                  )}
                  {request.experience_years && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award className="w-4 h-4 text-indigo-500" />
                      {request.experience_years} anni di esperienza
                    </div>
                  )}
                  {request.specializations && request.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {request.specializations.map((spec, i) => (
                        <Badge key={i} variant="secondary">{spec}</Badge>
                      ))}
                    </div>
                  )}
                  {request.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-2">{request.bio}</p>
                  )}
                </div>
              )}

              {type === 'coachee' && (
                <div className="space-y-2 mb-4">
                  {request.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-indigo-500" />
                      {request.phone}
                    </div>
                  )}
                  {request.goals && request.goals.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {request.goals.map((goal, i) => (
                        <Badge key={i} variant="secondary">{goal}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => onApprove(request)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approva
                </Button>
                <Button
                  onClick={() => onReject(request.id)}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rifiuta
                </Button>
              </div>
            </div>
          </div>
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
            Richieste di Registrazione
          </h1>
          <p className="text-gray-600">Gestisci le richieste di coach e coachee</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="coaches">
              Coach ({coaches.length})
            </TabsTrigger>
            <TabsTrigger value="coachees">
              Coachee ({coachees.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="coaches">
            <div className="space-y-4">
              <AnimatePresence>
                {coaches.length === 0 ? (
                  <Card className="shadow-lg">
                    <CardContent className="p-12 text-center">
                      <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        Nessuna richiesta in attesa
                      </h3>
                      <p className="text-gray-500">
                        Tutte le richieste di registrazione coach sono state elaborate
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  coaches.map((coach) => (
                    <RequestCard
                      key={coach.id}
                      request={coach}
                      type="coach"
                      onApprove={(coach) => openEmailDialog(coach)}
                      onReject={(id) => rejectCoachMutation.mutate(id)}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="coachees">
            <div className="space-y-4">
              <AnimatePresence>
                {coachees.length === 0 ? (
                  <Card className="shadow-lg">
                    <CardContent className="p-12 text-center">
                      <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        Nessuna richiesta in attesa
                      </h3>
                      <p className="text-gray-500">
                        Tutte le richieste di registrazione coachee sono state elaborate
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  coachees.map((coachee) => (
                    <RequestCard
                      key={coachee.id}
                      request={coachee}
                      type="coachee"
                      onApprove={(id) => approveCoacheeMutation.mutate(id)}
                      onReject={(id) => rejectCoacheeMutation.mutate(id)}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>

        {/* Email Preview Dialog */}
        <Dialog open={!!emailDialog} onOpenChange={() => setEmailDialog(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Mail className="w-6 h-6 text-indigo-600" />
                Anteprima Email di Benvenuto
              </DialogTitle>
              <DialogDescription>
                Rivedi e modifica l'email prima di inviarla a {emailDialog?.full_name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-indigo-700 mb-2">
                  <Mail className="w-4 h-4" />
                  <span className="font-semibold">Destinatario:</span>
                </div>
                <div className="text-gray-900 font-medium">{emailDialog?.email}</div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-2 block">Oggetto</Label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="text-base"
                  placeholder="Oggetto dell'email"
                />
              </div>

              <div>
                <Label className="text-base font-semibold mb-2 block">Corpo dell'email</Label>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={16}
                  className="text-base font-mono"
                  placeholder="Corpo dell'email"
                />
                <p className="text-sm text-gray-500 mt-2">
                  💡 Il link "Accedi alla Piattaforma" verrà automaticamente formattato come pulsante nell'email
                </p>
              </div>

              <div className="flex gap-4 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setEmailDialog(null)}
                  disabled={approveCoachMutation.isPending}
                >
                  Annulla
                </Button>
                <Button
                  onClick={() => approveCoachMutation.mutate({
                    coach: emailDialog,
                    subject: emailSubject,
                    body: emailBody
                  })}
                  disabled={approveCoachMutation.isPending || !emailSubject || !emailBody}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {approveCoachMutation.isPending ? "Invio in corso..." : "Approva e Invia Email"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}