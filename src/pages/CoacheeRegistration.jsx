import React, { useState } from "react";
import { mindflow } from "@/api/mindflowClient";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function CoacheeRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    phone: ""
  });
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [preferredAreas, setPreferredAreas] = useState([]);
  const [newArea, setNewArea] = useState("");

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const user = await mindflow.auth.me();
      
      await mindflow.entities.CoacheeProfile.create({
        user_id: user.id,
        ...data,
        status: "pending"
      });

      await mindflow.auth.updateMe({
        user_type: "coachee",
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
      goals,
      preferred_areas: preferredAreas
    });
  };

  const addGoal = () => {
    if (newGoal && !goals.includes(newGoal)) {
      setGoals([...goals, newGoal]);
      setNewGoal("");
    }
  };

  const addArea = () => {
    if (newArea && !preferredAreas.includes(newArea)) {
      setPreferredAreas([...preferredAreas, newArea]);
      setNewArea("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Registrazione Coachee
          </h1>
          <p className="text-gray-600">Inizia il tuo percorso di crescita personale</p>
        </motion.div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-indigo-600" />
              Informazioni Personali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Nome Completo *</Label>
                <Input
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="Es. Marco Bianchi"
                />
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
                <Label>I Tuoi Obiettivi</Label>
                <p className="text-sm text-gray-600 mb-2">
                  Cosa vorresti ottenere attraverso il coaching?
                </p>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Es. Migliorare la mia carriera"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                  />
                  <Button type="button" onClick={addGoal}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {goals.map((goal, i) => (
                    <Badge key={i} className="bg-indigo-100 text-indigo-700">
                      {goal}
                      <button
                        type="button"
                        onClick={() => setGoals(goals.filter((_, idx) => idx !== i))}
                        className="ml-2"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Aree di Interesse</Label>
                <p className="text-sm text-gray-600 mb-2">
                  In quali aree vorresti ricevere supporto?
                </p>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    placeholder="Es. Sviluppo personale"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArea())}
                  />
                  <Button type="button" onClick={addArea}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {preferredAreas.map((area, i) => (
                    <Badge key={i} variant="secondary">
                      {area}
                      <button
                        type="button"
                        onClick={() => setPreferredAreas(preferredAreas.filter((_, idx) => idx !== i))}
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