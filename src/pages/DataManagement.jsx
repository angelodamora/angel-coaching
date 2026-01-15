import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Shield, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
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
} from "@/components/ui/alert-dialog";

export default function DataManagement() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const exportUserData = async () => {
    try {
      setLoading(true);
      toast.info("Raccolta dati in corso...");

      const userType = user.user_type || user.role;
      let profile = null;
      let appointments = [];
      let messages = [];

      if (userType === 'coach') {
        const profiles = await base44.entities.CoachProfile.filter({ user_id: user.id });
        profile = profiles[0];
        appointments = await base44.entities.Appointment.filter({ coach_id: user.id });
        const sentMessages = await base44.entities.Message.filter({ sender_id: user.id });
        const receivedMessages = await base44.entities.Message.filter({ receiver_id: user.id });
        messages = [...sentMessages, ...receivedMessages];
      } else if (userType === 'coachee') {
        const profiles = await base44.entities.CoacheeProfile.filter({ user_id: user.id });
        profile = profiles[0];
        appointments = await base44.entities.Appointment.filter({ coachee_id: user.id });
        const sentMessages = await base44.entities.Message.filter({ sender_id: user.id });
        const receivedMessages = await base44.entities.Message.filter({ receiver_id: user.id });
        messages = [...sentMessages, ...receivedMessages];
      }

      const exportData = {
        export_date: new Date().toISOString(),
        gdpr_compliance: "Regolamento UE 2016/679",
        user_account: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          user_type: userType,
          created_date: user.created_date,
        },
        profile: profile || null,
        appointments: appointments.map(apt => ({
          ...apt,
          _note: "Dati relativi agli appuntamenti"
        })),
        messages: messages.map(msg => ({
          ...msg,
          _note: "Messaggi scambiati sulla piattaforma"
        })),
        cookie_consent: JSON.parse(localStorage.getItem('cookie_consent') || 'null'),
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `angel_coaching_data_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Dati esportati con successo!");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Errore durante l'esportazione dei dati");
    } finally {
      setLoading(false);
    }
  };

  const deleteUserAccount = async () => {
    try {
      setLoading(true);
      toast.info("Eliminazione account in corso...");

      const userType = user.user_type || user.role;

      // Elimina profilo
      if (userType === 'coach') {
        const profiles = await base44.entities.CoachProfile.filter({ user_id: user.id });
        for (const profile of profiles) {
          await base44.entities.CoachProfile.delete(profile.id);
        }
        
        // Elimina slot
        const slots = await base44.entities.TimeSlot.filter({ coach_id: user.id });
        for (const slot of slots) {
          await base44.entities.TimeSlot.delete(slot.id);
        }

        // Elimina agreements
        const agreements = await base44.entities.CoachingAgreement.filter({ coach_id: user.id });
        for (const agreement of agreements) {
          await base44.entities.CoachingAgreement.delete(agreement.id);
        }
      } else if (userType === 'coachee') {
        const profiles = await base44.entities.CoacheeProfile.filter({ user_id: user.id });
        for (const profile of profiles) {
          await base44.entities.CoacheeProfile.delete(profile.id);
        }
      }

      // Elimina messaggi
      const sentMessages = await base44.entities.Message.filter({ sender_id: user.id });
      for (const msg of sentMessages) {
        await base44.entities.Message.delete(msg.id);
      }
      
      const receivedMessages = await base44.entities.Message.filter({ receiver_id: user.id });
      for (const msg of receivedMessages) {
        await base44.entities.Message.delete(msg.id);
      }

      // Cancella consenso cookie
      localStorage.removeItem('cookie_consent');

      toast.success("Account eliminato. Verrai disconnesso...");
      
      setTimeout(() => {
        base44.auth.logout();
      }, 2000);
      
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Errore durante l'eliminazione dell'account");
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Gestione Dati GDPR
          </h1>
          <p className="text-gray-600">Esercita i tuoi diritti sulla privacy</p>
        </motion.div>

        <div className="space-y-6">
          <Card className="shadow-lg border-2 border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                I Tuoi Diritti GDPR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                In conformità con il Regolamento Generale sulla Protezione dei Dati (GDPR UE 2016/679), 
                hai il diritto di accedere, esportare ed eliminare i tuoi dati personali.
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Diritto di accesso e portabilità dei dati (Art. 15 e 20 GDPR)</li>
                <li>Diritto alla cancellazione - "Diritto all'oblio" (Art. 17 GDPR)</li>
                <li>Diritto alla rettifica (Art. 16 GDPR)</li>
                <li>Diritto di opposizione (Art. 21 GDPR)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-600" />
                Esporta i Tuoi Dati
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Scarica una copia completa dei tuoi dati personali in formato JSON. 
                Include informazioni di profilo, appuntamenti, messaggi e preferenze.
              </p>
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h4 className="font-semibold text-sm text-indigo-900 mb-2">Dati inclusi nell'export:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Informazioni account e profilo</li>
                  <li>• Storico appuntamenti e sessioni</li>
                  <li>• Messaggi scambiati</li>
                  <li>• Preferenze e consensi</li>
                </ul>
              </div>
              <Button
                onClick={exportUserData}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Esportazione...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Esporta Tutti i Miei Dati
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Trash2 className="w-5 h-5" />
                Elimina Account e Dati
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-900">
                  <p className="font-semibold mb-1">Attenzione: Azione Irreversibile</p>
                  <p>
                    Eliminando il tuo account, tutti i tuoi dati personali verranno rimossi definitivamente 
                    dalla piattaforma entro 30 giorni, salvo obblighi legali di conservazione.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <p className="font-semibold">Saranno eliminati:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Account utente e credenziali di accesso</li>
                  <li>Profilo e informazioni personali</li>
                  <li>Storico appuntamenti e sessioni</li>
                  <li>Messaggi e comunicazioni</li>
                  <li>Preferenze e impostazioni</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600">
                <strong>Nota:</strong> I dati necessari per adempiere agli obblighi fiscali e contabili 
                saranno conservati in forma anonimizzata per il periodo previsto dalla legge (10 anni).
              </p>

              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Elimina il Mio Account
              </Button>
            </CardContent>
          </Card>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-6 h-6" />
                Conferma Eliminazione Account
              </AlertDialogTitle>
              <AlertDialogDescription>
                Questa azione è <strong>permanente e irreversibile</strong>. 
                Tutti i tuoi dati personali saranno eliminati definitivamente dalla piattaforma.
                <br /><br />
                Sei sicuro di voler procedere con l'eliminazione del tuo account?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteUserAccount}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? "Eliminazione..." : "Sì, Elimina Definitivamente"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}