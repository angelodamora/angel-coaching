import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Download, Trash2, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Informativa sulla Privacy
              </h1>
              <p className="text-sm text-gray-600">Ultimo aggiornamento: 6 Gennaio 2026</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                1. Titolare del Trattamento
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-gray-700">
                Angel Coaching (di seguito "noi", "nostro" o "Angel Coaching") è il titolare del trattamento dei dati personali 
                raccolti attraverso la piattaforma Angel Coaching (la "Piattaforma").
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Email di contatto:</strong> privacy@angelcoaching.it
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-600" />
                2. Dati Personali Raccolti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Dati di Registrazione:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Nome completo</li>
                  <li>Indirizzo email</li>
                  <li>Numero di telefono (opzionale)</li>
                  <li>Informazioni professionali (per i coach)</li>
                  <li>Obiettivi e aree di interesse (per i coachee)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Dati di Utilizzo:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Informazioni sugli appuntamenti e sessioni</li>
                  <li>Messaggi scambiati tra coach e coachee</li>
                  <li>Note e documenti condivisi</li>
                  <li>Dati di navigazione e utilizzo della piattaforma</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                3. Base Giuridica e Finalità del Trattamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Esecuzione del Contratto (Art. 6.1.b GDPR):</h3>
                <p className="text-gray-700">
                  Trattiamo i tuoi dati per fornirti i servizi della piattaforma, gestire gli appuntamenti, 
                  facilitare la comunicazione tra coach e coachee, e per l'amministrazione del tuo account.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Consenso (Art. 6.1.a GDPR):</h3>
                <p className="text-gray-700">
                  Per l'invio di comunicazioni di marketing e newsletter (puoi revocare il consenso in qualsiasi momento).
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Legittimo Interesse (Art. 6.1.f GDPR):</h3>
                <p className="text-gray-700">
                  Per migliorare la piattaforma, prevenire frodi, e garantire la sicurezza dei nostri servizi.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Obblighi Legali (Art. 6.1.c GDPR):</h3>
                <p className="text-gray-700">
                  Per adempiere agli obblighi fiscali, contabili e di legge applicabili.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                4. Conservazione dei Dati
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-3">
                Conserviamo i tuoi dati personali per il tempo necessario a fornire i nostri servizi e per adempiere agli obblighi legali:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li><strong>Dati account attivi:</strong> Per tutta la durata del rapporto contrattuale</li>
                <li><strong>Dati account cancellati:</strong> 30 giorni per consentire il ripristino, poi cancellati definitivamente</li>
                <li><strong>Dati fiscali/contabili:</strong> 10 anni come previsto dalla normativa italiana</li>
                <li><strong>Dati di marketing:</strong> Fino alla revoca del consenso</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-600" />
                5. I Tuoi Diritti (Artt. 15-22 GDPR)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-3">
                Hai diritto a:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Accesso:</strong> Ottenere conferma e copia dei tuoi dati personali</li>
                <li><strong>Rettifica:</strong> Correggere dati inesatti o incompleti</li>
                <li><strong>Cancellazione:</strong> Richiedere la cancellazione dei tuoi dati ("diritto all'oblio")</li>
                <li><strong>Limitazione:</strong> Limitare il trattamento in determinate circostanze</li>
                <li><strong>Portabilità:</strong> Ricevere i tuoi dati in formato strutturato e trasferirli ad altro titolare</li>
                <li><strong>Opposizione:</strong> Opporti al trattamento per motivi legittimi</li>
                <li><strong>Revoca del consenso:</strong> Revocare il consenso senza pregiudicare la liceità del trattamento precedente</li>
              </ul>

              <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-sm text-gray-700">
                  <strong>Per esercitare i tuoi diritti:</strong> Accedi alle impostazioni del tuo profilo dove troverai le funzioni per 
                  esportare ed eliminare i tuoi dati, oppure contattaci a <strong>privacy@angelcoaching.it</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                6. Sicurezza dei Dati
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-3">
                Implementiamo misure tecniche e organizzative appropriate per proteggere i tuoi dati personali:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Crittografia dei dati in transito (HTTPS/TLS)</li>
                <li>Crittografia dei dati sensibili a riposo</li>
                <li>Controlli di accesso e autenticazione</li>
                <li>Backup regolari e piani di disaster recovery</li>
                <li>Monitoraggio e registrazione degli accessi</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-600" />
                7. Cookie e Tecnologie Simili
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cookie Essenziali:</h3>
                  <p className="text-gray-700">
                    Necessari per il funzionamento della piattaforma (autenticazione, sicurezza, preferenze).
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cookie Analitici:</h3>
                  <p className="text-gray-700">
                    Ci aiutano a comprendere come gli utenti utilizzano la piattaforma per migliorare i nostri servizi 
                    (richiedono il tuo consenso).
                  </p>
                </div>

                <p className="text-sm text-gray-600 mt-4">
                  Puoi gestire le tue preferenze sui cookie in qualsiasi momento dalle impostazioni del browser.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                8. Modifiche all'Informativa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Ci riserviamo il diritto di modificare questa informativa in qualsiasi momento. 
                Le modifiche sostanziali saranno comunicate via email. Ti invitiamo a consultare regolarmente 
                questa pagina per rimanere aggiornato.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-indigo-200 bg-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                9. Reclami all'Autorità Garante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-3">
                Hai il diritto di proporre reclamo all'Autorità Garante per la Protezione dei Dati Personali se ritieni 
                che il trattamento dei tuoi dati violi il GDPR.
              </p>
              <div className="space-y-1 text-sm text-gray-700">
                <p><strong>Garante per la Protezione dei Dati Personali</strong></p>
                <p>Piazza Venezia, 11 - 00187 Roma</p>
                <p>Tel: +39 06.696771</p>
                <p>Email: garante@gpdp.it</p>
                <p>Sito web: www.garanteprivacy.it</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}