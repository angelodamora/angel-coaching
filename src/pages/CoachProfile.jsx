import React, { useState, useEffect } from "react";
import { mindflow } from "@/api/mindflowClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Award, Plus, X, Save, Sparkles, FileText, Upload, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function CoachProfile() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    experience_years: "",
    hourly_rate: "",
    profile_image_url: ""
  });
  const [specializations, setSpecializations] = useState([]);
  const [newSpecialization, setNewSpecialization] = useState("");
  const [certifications, setCertifications] = useState([]);
  const [newCertification, setNewCertification] = useState("");
  const [languages, setLanguages] = useState([]);
  const [newLanguage, setNewLanguage] = useState("");
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showNewAgreement, setShowNewAgreement] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState(null);
  const [agreementForm, setAgreementForm] = useState({
    title: "",
    description: "",
    status: "active",
    valid_until: ""
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await mindflow.auth.me();
    setUser(userData);
  };

  const { data: coachProfile } = useQuery({
    queryKey: ['coach-profile', user?.id],
    queryFn: async () => {
      const profiles = await mindflow.entities.CoachProfile.filter({ user_id: user?.id });
      return profiles[0];
    },
    enabled: !!user
  });

  const { data: coachingAgreements } = useQuery({
    queryKey: ['coaching-agreements', user?.id],
    queryFn: () => mindflow.entities.CoachingAgreement.filter({ coach_id: user?.id }),
    initialData: [],
    enabled: !!user
  });

  const { data: myCoachees } = useQuery({
    queryKey: ['my-coachees', user?.id],
    queryFn: async () => {
      const appointments = await mindflow.entities.Appointment.filter({ coach_id: user?.id });
      const coacheeMap = {};
      
      appointments.forEach(apt => {
        if (!coacheeMap[apt.coachee_id]) {
          coacheeMap[apt.coachee_id] = {
            id: apt.coachee_id,
            name: apt.coachee_name
          };
        }
      });
      
      return Object.values(coacheeMap);
    },
    initialData: [],
    enabled: !!user
  });

  useEffect(() => {
    if (coachProfile) {
      setFormData({
        full_name: coachProfile.full_name || "",
        bio: coachProfile.bio || "",
        experience_years: coachProfile.experience_years || "",
        hourly_rate: coachProfile.hourly_rate || "",
        profile_image_url: coachProfile.profile_image_url || ""
      });
      setSpecializations(coachProfile.specializations || []);
      setCertifications(coachProfile.certifications || []);
      setLanguages(coachProfile.languages || []);
    }
  }, [coachProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      await mindflow.entities.CoachProfile.update(coachProfile.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-profile'] });
      setIsEditing(false);
      toast.success("Profilo aggiornato con successo!");
    }
  });

  const togglePublishMutation = useMutation({
    mutationFn: async () => {
      await mindflow.entities.CoachProfile.update(coachProfile.id, {
        is_published: !coachProfile.is_published
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-profile'] });
      toast.success(coachProfile.is_published ? "Profilo nascosto ai coachee" : "Profilo pubblicato e visibile ai coachee!");
    }
  });

  const createAgreementMutation = useMutation({
    mutationFn: async (data) => {
      await mindflow.entities.CoachingAgreement.create({
        ...data,
        coach_id: user.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching-agreements'] });
      setShowNewAgreement(false);
      setAgreementForm({
        title: "",
        description: "",
        status: "active",
        valid_until: ""
      });
      toast.success("Agreement creato!");
    }
  });

  const updateAgreementMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await mindflow.entities.CoachingAgreement.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching-agreements'] });
      setEditingAgreement(null);
      toast.success("Agreement aggiornato!");
    }
  });

  const deleteAgreementMutation = useMutation({
    mutationFn: async (id) => {
      await mindflow.entities.CoachingAgreement.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching-agreements'] });
      toast.success("Agreement eliminato!");
    }
  });

  const toggleAgreementStatus = async (agreement) => {
    try {
      await mindflow.entities.CoachingAgreement.update(agreement.id, {
        status: agreement.status === 'active' ? 'inactive' : 'active'
      });
      queryClient.invalidateQueries({ queryKey: ['coaching-agreements'] });
      toast.success("Stato aggiornato!");
    } catch (error) {
      toast.error("Errore aggiornamento");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate({
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

  const generateBioWithAI = async () => {
    setAiGenerating(true);
    try {
      const hasBio = formData.bio && formData.bio.trim() !== "";
      
      const prompt = hasBio 
        ? `Sei un consulente di marketing e devi migliorare la biografia fornita, verifica se contiene tutte le caratteristiche di un grande coach e prima di procedere chiedi le caratteristiche che devono essere incluse, le aree di competenza, le esperienze e la tipologia di risultati raggiunti, quindi crea una pagina di biografia accattivante e unica.

Biografia attuale:
${formData.bio}

Informazioni aggiuntive fornite dal coach:
${aiInput}

Genera la biografia migliorata:`
        : `Sei un consulente di marketing e devi scrivere la biografia e le caratteristiche di un grande coach, prima di procedere chiedi le caratteristiche che devono essere incluse, le aree di competenza, le esperienze e la tipologia di risultati raggiunti, quindi crea una pagina di biografia accattivante e unica.

Informazioni fornite dal coach:
${aiInput}

Genera la biografia:`;

      const result = await mindflow.integrations.Core.InvokeLLM({
        prompt: prompt
      });

      setFormData({...formData, bio: result});
      setShowAIDialog(false);
      setAiInput("");
      toast.success("Biografia generata con successo!");
    } catch (error) {
      console.error(error);
      toast.error("Errore nella generazione della biografia");
    } finally {
      setAiGenerating(false);
    }
  };

  if (!coachProfile) {
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
          <p className="text-gray-600">Gestisci le tue informazioni professionali e documenti</p>
        </motion.div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profilo</TabsTrigger>
            <TabsTrigger value="documents">I Miei Documenti</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informazioni Profilo
              </div>
              <div className="flex gap-2">
                {!isEditing && coachProfile.status === 'approved' && (
                  <Button 
                    onClick={() => togglePublishMutation.mutate()}
                    disabled={togglePublishMutation.isPending}
                    className={coachProfile.is_published 
                      ? "bg-orange-600 hover:bg-orange-700" 
                      : "bg-green-600 hover:bg-green-700"
                    }
                  >
                    {coachProfile.is_published ? "Nascondi Profilo" : "Pubblica Profilo"}
                  </Button>
                )}
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    Modifica Profilo
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-24 h-24 border-4 border-indigo-100">
                    <AvatarImage src={coachProfile.profile_image_url} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-2xl">
                      {coachProfile.full_name?.[0] || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{coachProfile.full_name}</h2>
                    <div className="flex gap-2 mt-1">
                      <Badge className={
                        coachProfile.status === 'approved' ? 'bg-green-100 text-green-700' :
                        coachProfile.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }>
                        {coachProfile.status}
                      </Badge>
                      {coachProfile.status === 'approved' && (
                        <Badge className={
                          coachProfile.is_published 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-700'
                        }>
                          {coachProfile.is_published ? 'Pubblicato' : 'Non Pubblicato'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-600">Biografia</Label>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{coachProfile.bio}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-600">Esperienza</Label>
                    <p className="mt-1 text-xl font-semibold">{coachProfile.experience_years} anni</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Tariffa Oraria</Label>
                    <p className="mt-1 text-xl font-semibold">€{coachProfile.hourly_rate}</p>
                  </div>
                </div>

                {specializations.length > 0 && (
                  <div>
                    <Label className="text-gray-600 mb-2 block">Specializzazioni</Label>
                    <div className="flex flex-wrap gap-2">
                      {specializations.map((spec, i) => (
                        <Badge key={i} className="bg-indigo-100 text-indigo-700">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {certifications.length > 0 && (
                  <div>
                    <Label className="text-gray-600 mb-2 block">Certificazioni</Label>
                    <div className="flex flex-wrap gap-2">
                      {certifications.map((cert, i) => (
                        <Badge key={i} variant="secondary">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {languages.length > 0 && (
                  <div>
                    <Label className="text-gray-600 mb-2 block">Lingue</Label>
                    <div className="flex flex-wrap gap-2">
                      {languages.map((lang, i) => (
                        <Badge key={i} variant="outline">
                          {lang}
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
                  <div className="flex items-center justify-between mb-2">
                    <Label>Biografia</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAIDialog(true)}
                      className="gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      {formData.bio ? "Migliora con AI" : "Genera con AI"}
                    </Button>
                  </div>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={5}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>Anni di Esperienza</Label>
                    <Input
                      type="number"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({...formData, experience_years: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Tariffa Oraria (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Specializzazioni</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newSpecialization}
                      onChange={(e) => setNewSpecialization(e.target.value)}
                      placeholder="Aggiungi specializzazione"
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
                      placeholder="Aggiungi certificazione"
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
                  <Label>Lingue</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="Aggiungi lingua"
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
          </TabsContent>

          <TabsContent value="documents">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Coaching Agreements
                  </div>
                  <Dialog open={showNewAgreement} onOpenChange={setShowNewAgreement}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuovo Agreement
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Crea Nuovo Coaching Agreement</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Titolo Documento</Label>
                          <Input
                            value={agreementForm.title}
                            onChange={(e) => setAgreementForm({...agreementForm, title: e.target.value})}
                            placeholder="Es: Template Agreement Coaching 2026"
                            required
                          />
                        </div>

                        <div>
                          <Label>Descrizione</Label>
                          <Textarea
                            value={agreementForm.description}
                            onChange={(e) => setAgreementForm({...agreementForm, description: e.target.value})}
                            rows={5}
                            placeholder="Descrivi i termini e le condizioni dell'agreement..."
                          />
                        </div>

                        <div>
                          <Label>Data Validità</Label>
                          <Input
                            type="date"
                            value={agreementForm.valid_until}
                            onChange={(e) => setAgreementForm({...agreementForm, valid_until: e.target.value})}
                          />
                        </div>

                        <div className="flex gap-3 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setShowNewAgreement(false)}
                          >
                            Annulla
                          </Button>
                          <Button
                            onClick={() => createAgreementMutation.mutate(agreementForm)}
                            disabled={!agreementForm.title}
                          >
                            Crea Agreement
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {coachingAgreements.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      Nessun Agreement
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Crea il tuo primo coaching agreement
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {coachingAgreements.map((agreement) => (
                      <Card 
                        key={agreement.id} 
                        className="border-2 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setEditingAgreement(agreement)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold mb-1">{agreement.title}</h3>
                              {agreement.coachee_name && (
                                <p className="text-sm text-gray-600 mb-2">
                                  Coachee: {agreement.coachee_name}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleAgreementStatus(agreement)}
                              >
                                {agreement.status === 'active' ? 'Disattiva' : 'Attiva'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteAgreementMutation.mutate(agreement.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className={
                              agreement.status === 'active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }>
                              {agreement.status === 'active' ? 'Attivo' : 'Disattivo'}
                            </Badge>
                            {agreement.valid_until && (
                              <Badge variant="outline">
                                Valido fino: {new Date(agreement.valid_until).toLocaleDateString('it-IT')}
                              </Badge>
                            )}
                            {agreement.total_hours && (
                              <Badge variant="outline">
                                {agreement.total_hours}h previste
                              </Badge>
                            )}
                          </div>

                          {agreement.description && (
                            <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                              {agreement.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Agreement Dialog */}
        <Dialog open={!!editingAgreement} onOpenChange={() => setEditingAgreement(null)}>
          <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Modifica Agreement: {editingAgreement?.title}
              </DialogTitle>
            </DialogHeader>
            {editingAgreement && (
              <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                <div>
                  <Label>Titolo Documento</Label>
                  <Input
                    value={editingAgreement.title}
                    onChange={(e) => setEditingAgreement({...editingAgreement, title: e.target.value})}
                    className="text-lg font-semibold"
                  />
                </div>

                <div className="flex-1">
                  <Label className="mb-2 block">Contenuto Agreement</Label>
                  <div className="border rounded-lg overflow-hidden bg-white" style={{ height: '500px' }}>
                    <ReactQuill
                      theme="snow"
                      value={editingAgreement.description || ""}
                      onChange={(content) => setEditingAgreement({...editingAgreement, description: content})}
                      style={{ height: '440px' }}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                          [{ 'font': [] }],
                          [{ 'size': ['small', false, 'large', 'huge'] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'color': [] }, { 'background': [] }],
                          [{ 'align': [] }],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          [{ 'indent': '-1'}, { 'indent': '+1' }],
                          ['blockquote', 'code-block'],
                          ['link'],
                          ['clean']
                        ]
                      }}
                      placeholder="Inserisci il testo completo del contratto di coaching...

Esempio:

CONTRATTO DI COACHING

Tra il Coach [Nome] e il Coachee [Nome]

ARTICOLO 1 - OGGETTO DEL CONTRATTO
Il presente contratto ha per oggetto...
"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Data Validità</Label>
                    <Input
                      type="date"
                      value={editingAgreement.valid_until || ""}
                      onChange={(e) => setEditingAgreement({...editingAgreement, valid_until: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Stato</Label>
                    <Select
                      value={editingAgreement.status}
                      onValueChange={(value) => setEditingAgreement({...editingAgreement, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Attivo</SelectItem>
                        <SelectItem value="inactive">Disattivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setEditingAgreement(null)}
                  >
                    Annulla
                  </Button>
                  <Button
                    onClick={() => updateAgreementMutation.mutate({
                      id: editingAgreement.id,
                      data: {
                        title: editingAgreement.title,
                        description: editingAgreement.description,
                        valid_until: editingAgreement.valid_until,
                        status: editingAgreement.status
                      }
                    })}
                    disabled={!editingAgreement.title}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salva Modifiche
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* AI Biography Dialog */}
        <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                {formData.bio ? "Migliora Biografia con AI" : "Genera Biografia con AI"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>
                  Fornisci informazioni per generare una biografia professionale
                </Label>
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  Descrivi le tue caratteristiche, aree di competenza, esperienze significative e i risultati che hai aiutato i tuoi clienti a raggiungere.
                </p>
                <Textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  rows={8}
                  placeholder="Esempio: Ho 10 anni di esperienza nel coaching aziendale, specializzato in leadership e sviluppo organizzativo. Ho aiutato oltre 200 manager a migliorare le loro competenze di leadership, con un aumento medio della produttività del team del 35%. Certificato ICF..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAIDialog(false);
                    setAiInput("");
                  }}
                >
                  Annulla
                </Button>
                <Button
                  onClick={generateBioWithAI}
                  disabled={aiGenerating || !aiInput.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {aiGenerating ? "Generazione..." : "Genera Biografia"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}