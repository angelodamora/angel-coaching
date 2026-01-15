import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Cookie } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      essential: true,
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <Card className="max-w-4xl mx-auto shadow-2xl border-2 border-indigo-200 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    Rispettiamo la Tua Privacy
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Utilizziamo cookie essenziali per il funzionamento della piattaforma e cookie analitici per migliorare la tua esperienza. 
                    I tuoi dati sono trattati secondo il Regolamento GDPR (UE) 2016/679.
                  </p>
                  <Link 
                    to={createPageUrl("PrivacyPolicy")} 
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    Leggi la nostra Informativa sulla Privacy
                  </Link>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <Button
                    variant="outline"
                    onClick={handleReject}
                    className="border-gray-300"
                  >
                    Solo Essenziali
                  </Button>
                  <Button
                    onClick={handleAccept}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600"
                  >
                    Accetta Tutti
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}