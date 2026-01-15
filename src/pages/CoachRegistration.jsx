import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Award, Plus, X, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function CoachRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    bio: "",
    experience_years: "",
    hourly_rate: "",
    phone: "",
    profile_image_url: "",
    video_intro_url: ""
  });
  const [specializations, setSpecializations] = useState([]);
  const [newSpecialization, setNewSpecialization] = useState("");
  const [certifications, setCertifications] = useState([]);
  const [newCertification, setNewCertification] = useState("");
  const [languages, setLanguages] = useState([]);
  const [newLanguage, setNewLanguage] = useState("");

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      
      await base44.entities.CoachProfile.create({
        user_id: user.id,
        ...data,
        status: "pending"
      });

      await base44.auth.updateMe({
        user_type: "coach",
        registration_status: "pending",
        phone: data.phone
      });
    },
    onSuccess: () => {
      toast.success("Richiesta inviata! Attendi l'approvazione dell'admin.");
      navigate(createPageUrl("LandingPage"));
    },
    onError: (error) => {
      toast.error("Errore durante la registrazione");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate({
      ...formData,
      experience_years: parseInt(formData.experience_years),
      hourly_rate: parseFloat(formData.hourly_rate),
      specializations,
      certifications,
      languages
    });
  };

  const addSpecialization = () => {
    if (newSpecialization && !specializations.includes(newSpecialization)) {
      setSpecializations([...specializations, newSpecialization]);
      setNewSpecialization("");
    }
  };

  const addCertification = () => {
    if (newCertification && !certifications.includes(newCertification)) {
      setCertifications([...certifications, newCertification]);
      setNewCertification("");
    }
  };

  const addLanguage = () => {
    if (newLanguage && !languages.includes(newLanguage)) {
      setLanguages([...languages, newLanguage]);
      setNewLanguage("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Registrazione Coach
          </h1>
          <p className="text-gray-600">Completa il tuo profilo per diventare un coach Angel Coaching</p>
        </motion.div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-indigo-600" />
              Informazioni Professionali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Nome Completo *</Label>
                  <Input
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="Es. Dr. Maria Rossi"
                  />
                </div>

                <div>
                  <Label>Email *</Label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@esempio.com"
                  />
                </div>
              </div>

              <div>
                <Label>Telefono *</Label>
                <Input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+39 123 456 7890"
                />
              </div>

              <div>
                <Label>Biografia *</Label>
                <Textarea
                  required
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Racconta la tua esperienza e cosa ti rende unico come coach..."
                  rows={5}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Anni di Esperienza *</Label>
                  <Input
                    required
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({...formData, experience_years: e.target.value})}
                    placeholder="Es. 10"
                  />
                </div>

                <div>
                  <Label>Tariffa Oraria (€) *</Label>
                  <Input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                    placeholder="Es. 80"
                  />
                </div>
              </div>

              <div>
                <Label>Specializzazioni</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    placeholder="Es. Life Coaching"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                  />
                  <Button type="button" onClick={addSpecialization}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {specializations.map((spec, i) => (
                    <Badge key={i} className="bg-indigo-100 text-indigo-700">
                      {spec}
                      <button
                        type="button"
                        onClick={() => setSpecializations(specializations.filter((_, idx) => idx !== i))}
                        className="ml-2"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Certificazioni</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="Es. ICF Certified Coach"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                  />
                  <Button type="button" onClick={addCertification}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {certifications.map((cert, i) => (
                    <Badge key={i} variant="secondary">
                      {cert}
                      <button
                        type="button"
                        onClick={() => setCertifications(certifications.filter((_, idx) => idx !== i))}
                        className="ml-2"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Lingue Parlate</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Es. Italiano"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                  />
                  <Button type="button" onClick={addLanguage}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang, i) => (
                    <Badge key={i} variant="outline">
                      {lang}
                      <button
                        type="button"
                        onClick={() => setLanguages(languages.filter((_, idx) => idx !== i))}
                        className="ml-2"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl("LandingPage"))}
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  {registerMutation.isPending ? "Invio..." : "Invia Richiesta"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}