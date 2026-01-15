import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, CheckCircle2, Target, Briefcase, Activity, TrendingUp, Heart, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function CoacheeMatching() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [matchingData, setMatchingData] = useState({
    email: "",
    focus_area: "",
    role: "",
    readiness_level: 3,
    has_previous_experience: null,
    specific_challenges: "",
    first_name: "",
    last_name: "",
    country: "Italy",
    timezone: "(GMT+01:00) Rome",
    preferred_language: "Italian"
  });

  const focusAreas = [
    { value: "leadership", label: "Leadership & development", description: "Enhance your leadership capabilities and impact", icon: Target },
    { value: "career", label: "Career growth & transitions", description: "Navigate career changes and advancement opportunities", icon: TrendingUp },
    { value: "health", label: "Health & wellness", description: "Create better balance and well-being in your life", icon: Heart },
    { value: "productivity", label: "Productivity & accountability", description: "Optimize your effectiveness and achieve better results", icon: Activity },
    { value: "purpose", label: "Purpose & fulfillment", description: "Align your work with your values and find greater meaning", icon: CheckCircle2 },
    { value: "communication", label: "Communication & influence", description: "Strengthen your ability to connect and persuade", icon: MessageCircle }
  ];

  const roles = [
    { value: "executive", label: "Executive" },
    { value: "people_manager", label: "People Manager" },
    { value: "individual_contributor", label: "Individual Contributor" },
    { value: "self_employed", label: "Self-Employed" },
    { value: "other", label: "Other" }
  ];

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const profile = await base44.entities.CoacheeMatchingProfile.create({
        ...data,
        status: "completed"
      });
      return profile;
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      // Crea il profilo coachee
      await base44.entities.CoacheeProfile.create({
        user_id: data.user_id,
        full_name: `${data.first_name} ${data.last_name}`,
        goals: [focusAreas.find(f => f.value === data.focus_area)?.label],
        preferred_areas: [data.focus_area]
      });

      // Aggiorna lo stato del matching profile
      await base44.entities.CoacheeMatchingProfile.update(data.profile_id, {
        status: "registered"
      });
    },
    onSuccess: () => {
      toast.success("Registrazione completata! Benvenuto in Angel Coaching.");
      navigate(createPageUrl("CoachList"));
    }
  });

  const handleNext = () => {
    if (step === 0 && !matchingData.email) {
      toast.error("Inserisci la tua email per continuare");
      return;
    }
    if (step === 1 && !matchingData.focus_area) {
      toast.error("Seleziona un'area di focus");
      return;
    }
    if (step === 2 && !matchingData.role) {
      toast.error("Seleziona il tuo ruolo");
      return;
    }
    if (step === 4 && matchingData.has_previous_experience === null) {
      toast.error("Indica se hai esperienza precedente");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = async () => {
    if (!matchingData.first_name || !matchingData.last_name) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    try {
      // Prima salva il matching profile
      const profile = await saveMutation.mutateAsync(matchingData);
      
      // Poi reindirizza alla registrazione con i dati pre-compilati
      const params = new URLSearchParams({
        email: matchingData.email,
        first_name: matchingData.first_name,
        last_name: matchingData.last_name,
        matching_profile_id: profile.id
      });
      
      base44.auth.redirectToLogin(createPageUrl("CoachList") + `?${params.toString()}`);
    } catch (error) {
      console.error(error);
      toast.error("Errore durante la registrazione");
    }
  };

  const progress = ((step + 1) / 7) * 100;

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Trova il Tuo Coach Ideale
              </h2>
              <p className="text-gray-600">
                Inizia inserendo la tua email per ricevere i match personalizzati
              </p>
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="il.tuo.email@esempio.it"
                value={matchingData.email}
                onChange={(e) => setMatchingData({...matchingData, email: e.target.value})}
                className="text-lg p-6 mt-2"
              />
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">What best describes what you want to work on with a coach?</h2>
              <p className="text-gray-600">We want to understand why you're here and what coaching can help you accomplish.</p>
            </div>
            <div className="space-y-3">
              {focusAreas.map((area) => (
                <motion.button
                  key={area.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMatchingData({...matchingData, focus_area: area.value})}
                  className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                    matchingData.focus_area === area.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      matchingData.focus_area === area.value ? 'bg-indigo-600' : 'bg-gray-100'
                    }`}>
                      <area.icon className={`w-6 h-6 ${
                        matchingData.focus_area === area.value ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{area.label}</h3>
                      <p className="text-sm text-gray-600">{area.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">What best describes your role?</h2>
              <p className="text-gray-600">Your role will assist us in connecting you with a coach who has a strong track record in coaching individuals at your level.</p>
            </div>
            <div className="space-y-3">
              {roles.map((role) => (
                <motion.button
                  key={role.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMatchingData({...matchingData, role: role.value})}
                  className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                    matchingData.role === role.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{role.label}</h3>
                    {matchingData.role === role.value && (
                      <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">How ready are you to start coaching?</h2>
              <p className="text-gray-600">Understanding your readiness helps us personalize your experience.</p>
            </div>
            <div className="space-y-8">
              <div className="flex justify-between items-center px-4">
                {[1, 2, 3, 4, 5].map((level) => (
                  <motion.button
                    key={level}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMatchingData({...matchingData, readiness_level: level})}
                    className={`w-16 h-16 rounded-full border-4 font-bold text-xl transition-all ${
                      matchingData.readiness_level === level
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-indigo-300'
                    }`}
                  >
                    {level}
                  </motion.button>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-600 px-4">
                <span>I'm just browsing</span>
                <span>Ready to start</span>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Have you worked with a coach before?</h2>
              <p className="text-gray-600">This helps us match you with a coach who best fits your level of familiarity and needs.</p>
            </div>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMatchingData({...matchingData, has_previous_experience: true})}
                className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                  matchingData.has_previous_experience === true
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <h3 className="font-semibold text-lg mb-1">Yes</h3>
                <p className="text-sm text-gray-600">I have previous coaching experience</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMatchingData({...matchingData, has_previous_experience: false})}
                className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                  matchingData.has_previous_experience === false
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <h3 className="font-semibold text-lg mb-1">No</h3>
                <p className="text-sm text-gray-600">This will be my first coaching experience</p>
              </motion.button>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">What specific challenges would you like to address?</h2>
              <p className="text-gray-600">The more detail you provide about your situation, the better we can match you with a coach who has deep experience in your exact challenges.</p>
            </div>
            <Textarea
              placeholder="I don't know yet..."
              value={matchingData.specific_challenges}
              onChange={(e) => setMatchingData({...matchingData, specific_challenges: e.target.value})}
              rows={8}
              className="text-base"
            />
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                You're almost matched
              </h2>
              <p className="text-gray-600">Just a few details so we can connect you with coaches in your time zone who speak your preferred language.</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First name *</Label>
                  <Input
                    value={matchingData.first_name}
                    onChange={(e) => setMatchingData({...matchingData, first_name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Last name *</Label>
                  <Input
                    value={matchingData.last_name}
                    onChange={(e) => setMatchingData({...matchingData, last_name: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Country *</Label>
                <Select
                  value={matchingData.country}
                  onValueChange={(value) => setMatchingData({...matchingData, country: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Italy">Italy</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Spain">Spain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Your time zone *</Label>
                <Select
                  value={matchingData.timezone}
                  onValueChange={(value) => setMatchingData({...matchingData, timezone: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="(GMT+01:00) Rome">(GMT+01:00) Rome</SelectItem>
                    <SelectItem value="(GMT+00:00) London">(GMT+00:00) London</SelectItem>
                    <SelectItem value="(GMT-05:00) New York">(GMT-05:00) New York</SelectItem>
                    <SelectItem value="(GMT+01:00) Paris">(GMT+01:00) Paris</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Preferred coaching language *</Label>
                <Select
                  value={matchingData.preferred_language}
                  onValueChange={(value) => setMatchingData({...matchingData, preferred_language: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Italian">Italian</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <p className="text-sm text-gray-700">
                  <strong>Why?</strong> This information will help us match you with a Coach.
                </p>
                <a href="#" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">
                  Learn more about the privacy of your data
                </a>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <Card className="shadow-2xl border-2 border-indigo-100">
          <CardHeader>
            <div className="space-y-4">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Step {step + 1} of 7</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            <div className="flex justify-between mt-8 pt-6 border-t">
              {step > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              
              {step < 6 ? (
                <Button
                  onClick={handleNext}
                  className="ml-auto bg-gradient-to-r from-indigo-600 to-purple-600 gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={saveMutation.isPending}
                  className="ml-auto bg-gradient-to-r from-green-600 to-emerald-600 gap-2"
                >
                  {saveMutation.isPending ? "Processing..." : "Complete & Find Coaches"}
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}