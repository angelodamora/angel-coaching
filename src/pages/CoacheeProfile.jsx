import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Plus, X, Save } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function CoacheeProfile() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: ""
  });
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [preferredAreas, setPreferredAreas] = useState([]);
  const [newArea, setNewArea] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: coacheeProfile } = useQuery({
    queryKey: ['coachee-profile', user?.id],
    queryFn: async () => {
      const profiles = await base44.entities.CoacheeProfile.filter({ user_id: user?.id });
      return profiles[0];
    },
    enabled: !!user
  });

  useEffect(() => {
    if (coacheeProfile) {
      setFormData({
        full_name: coacheeProfile.full_name || "",
        phone: coacheeProfile.phone || ""
      });
      setGoals(coacheeProfile.goals || []);
      setPreferredAreas(coacheeProfile.preferred_areas || []);
    }
  }, [coacheeProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.CoacheeProfile.update(coacheeProfile.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coachee-profile'] });
      setIsEditing(false);
      toast.success("Profilo aggiornato con successo!");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate({
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

  if (!coacheeProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Il Mio Profilo
          </h1>
          <p className="text-gray-600">Gestisci le tue informazioni personali</p>
        </motion.div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informazioni Profilo
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Modifica Profilo
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-24 h-24 border-4 border-indigo-100">
                    <AvatarImage src={coacheeProfile.profile_image_url} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl">
                      {coacheeProfile.full_name?.[0] || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{coacheeProfile.full_name}</h2>
                    <Badge className={
                      coacheeProfile.status === 'approved' ? 'bg-green-100 text-green-700' :
                      coacheeProfile.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }>
                      {coacheeProfile.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-600">Telefono</Label>
                  <p className="mt-1 text-gray-900">{coacheeProfile.phone}</p>
                </div>

                {goals.length > 0 && (
                  <div>
                    <Label className="text-gray-600 mb-2 block">I Miei Obiettivi</Label>
                    <div className="flex flex-wrap gap-2">
                      {goals.map((goal, i) => (
                        <Badge key={i} className="bg-indigo-100 text-indigo-700">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {preferredAreas.length > 0 && (
                  <div>
                    <Label className="text-gray-600 mb-2 block">Aree di Interesse</Label>
                    <div className="flex flex-wrap gap-2">
                      {preferredAreas.map((area, i) => (
                        <Badge key={i} variant="secondary">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label>Nome Completo</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label>Telefono</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label>I Miei Obiettivi</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="Aggiungi obiettivo"
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
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      placeholder="Aggiungi area"
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

                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Annulla
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salva Modifiche
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}