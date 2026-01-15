import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, Edit2, Mail, Phone, Shield, User, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { data: users } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const { data: coachProfiles } = useQuery({
    queryKey: ['all-coach-profiles'],
    queryFn: () => base44.entities.CoachProfile.list(),
    initialData: [],
  });

  const { data: coacheeProfiles } = useQuery({
    queryKey: ['all-coachee-profiles'],
    queryFn: () => base44.entities.CoacheeProfile.list(),
    initialData: [],
  });

  // Combina users con i loro profili
  const enrichedUsers = users.map(user => {
    const coachProfile = coachProfiles.find(cp => cp.user_id === user.id);
    const coacheeProfile = coacheeProfiles.find(cp => cp.user_id === user.id);
    
    return {
      ...user,
      coachProfile,
      coacheeProfile,
      displayName: coachProfile?.full_name || coacheeProfile?.full_name || user.full_name || user.email
    };
  });

  const filteredUsers = enrichedUsers.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || user.user_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, userData }) => {
      await base44.entities.User.update(userId, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      toast.success("Utente aggiornato!");
    }
  });

  const updateCoachProfileMutation = useMutation({
    mutationFn: async ({ profileId, profileData }) => {
      await base44.entities.CoachProfile.update(profileId, profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-coach-profiles'] });
      toast.success("Profilo coach aggiornato!");
    }
  });

  const updateCoacheeProfileMutation = useMutation({
    mutationFn: async ({ profileId, profileData }) => {
      await base44.entities.CoacheeProfile.update(profileId, profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-coachee-profiles'] });
      toast.success("Profilo coachee aggiornato!");
    }
  });

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      // Dati User
      user_type: user.user_type || 'coachee',
      registration_status: user.registration_status || 'approved',
      phone: user.phone || '',
      
      // Dati Coach Profile (se esiste)
      coach_full_name: user.coachProfile?.full_name || '',
      coach_bio: user.coachProfile?.bio || '',
      coach_experience_years: user.coachProfile?.experience_years || '',
      coach_hourly_rate: user.coachProfile?.hourly_rate || '',
      coach_status: user.coachProfile?.status || 'approved',
      
      // Dati Coachee Profile (se esiste)
      coachee_full_name: user.coacheeProfile?.full_name || '',
      coachee_phone: user.coacheeProfile?.phone || '',
      coachee_status: user.coacheeProfile?.status || 'approved',
    });
  };

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      // 1. Aggiorna User
      await updateUserMutation.mutateAsync({
        userId: editingUser.id,
        userData: {
          user_type: editForm.user_type,
          registration_status: editForm.registration_status,
          phone: editForm.phone
        }
      });

      // 2. Aggiorna Coach Profile se esiste
      if (editingUser.coachProfile) {
        await updateCoachProfileMutation.mutateAsync({
          profileId: editingUser.coachProfile.id,
          profileData: {
            full_name: editForm.coach_full_name,
            bio: editForm.coach_bio,
            experience_years: parseInt(editForm.coach_experience_years) || 0,
            hourly_rate: parseFloat(editForm.coach_hourly_rate) || 0,
            status: editForm.coach_status
          }
        });
      }

      // 3. Aggiorna Coachee Profile se esiste
      if (editingUser.coacheeProfile) {
        await updateCoacheeProfileMutation.mutateAsync({
          profileId: editingUser.coacheeProfile.id,
          profileData: {
            full_name: editForm.coachee_full_name,
            phone: editForm.coachee_phone,
            status: editForm.coachee_status
          }
        });
      }

      setEditingUser(null);
      toast.success("Utente aggiornato con successo!");
    } catch (error) {
      toast.error("Errore durante l'aggiornamento");
      console.error(error);
    }
  };

  const UserCard = ({ user }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-12 h-12 border-2 border-indigo-100">
                <AvatarImage src={user.coachProfile?.profile_image_url || user.coacheeProfile?.profile_image_url} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                  {user.displayName?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg">{user.displayName}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Phone className="w-4 h-4" />
                    {user.phone}
                  </div>
                )}
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditUser(user)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Modifica
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Modifica Utente: {user.email}</DialogTitle>
                </DialogHeader>
                
                {editingUser?.id === user.id && (
                  <Tabs defaultValue="user" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="user">Dati Base</TabsTrigger>
                      <TabsTrigger value="coach" disabled={!user.coachProfile}>
                        Profilo Coach
                      </TabsTrigger>
                      <TabsTrigger value="coachee" disabled={!user.coacheeProfile}>
                        Profilo Coachee
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="user" className="space-y-4">
                      <div>
                        <Label>Email (non modificabile)</Label>
                        <Input value={user.email} disabled className="bg-gray-50" />
                      </div>

                      <div>
                        <Label>Tipo Utente</Label>
                        <Select
                          value={editForm.user_type}
                          onValueChange={(value) => setEditForm({...editForm, user_type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="coach">Coach</SelectItem>
                            <SelectItem value="coachee">Coachee</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Stato Registrazione</Label>
                        <Select
                          value={editForm.registration_status}
                          onValueChange={(value) => setEditForm({...editForm, registration_status: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">In Attesa</SelectItem>
                            <SelectItem value="approved">Approvato</SelectItem>
                            <SelectItem value="rejected">Rifiutato</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Telefono</Label>
                        <Input
                          value={editForm.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          placeholder="+39 123 456 7890"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="coach" className="space-y-4">
                      {user.coachProfile && (
                        <>
                          <div>
                            <Label>Nome Completo</Label>
                            <Input
                              value={editForm.coach_full_name}
                              onChange={(e) => setEditForm({...editForm, coach_full_name: e.target.value})}
                            />
                          </div>

                          <div>
                            <Label>Biografia</Label>
                            <Textarea
                              value={editForm.coach_bio}
                              onChange={(e) => setEditForm({...editForm, coach_bio: e.target.value})}
                              rows={4}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Anni Esperienza</Label>
                              <Input
                                type="number"
                                value={editForm.coach_experience_years}
                                onChange={(e) => setEditForm({...editForm, coach_experience_years: e.target.value})}
                              />
                            </div>

                            <div>
                              <Label>Tariffa Oraria (€)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={editForm.coach_hourly_rate}
                                onChange={(e) => setEditForm({...editForm, coach_hourly_rate: e.target.value})}
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Stato Profilo</Label>
                            <Select
                              value={editForm.coach_status}
                              onValueChange={(value) => setEditForm({...editForm, coach_status: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">In Attesa</SelectItem>
                                <SelectItem value="approved">Approvato</SelectItem>
                                <SelectItem value="rejected">Rifiutato</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </TabsContent>

                    <TabsContent value="coachee" className="space-y-4">
                      {user.coacheeProfile && (
                        <>
                          <div>
                            <Label>Nome Completo</Label>
                            <Input
                              value={editForm.coachee_full_name}
                              onChange={(e) => setEditForm({...editForm, coachee_full_name: e.target.value})}
                            />
                          </div>

                          <div>
                            <Label>Telefono</Label>
                            <Input
                              value={editForm.coachee_phone}
                              onChange={(e) => setEditForm({...editForm, coachee_phone: e.target.value})}
                            />
                          </div>

                          <div>
                            <Label>Stato Profilo</Label>
                            <Select
                              value={editForm.coachee_status}
                              onValueChange={(value) => setEditForm({...editForm, coachee_status: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">In Attesa</SelectItem>
                                <SelectItem value="approved">Approvato</SelectItem>
                                <SelectItem value="rejected">Rifiutato</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </TabsContent>
                  </Tabs>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setEditingUser(null)}
                  >
                    Annulla
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600"
                  >
                    Salva Modifiche
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className={
              user.user_type === 'admin' ? 'bg-purple-100 text-purple-700' :
              user.user_type === 'coach' ? 'bg-indigo-100 text-indigo-700' :
              'bg-green-100 text-green-700'
            }>
              {user.user_type === 'admin' ? <Shield className="w-3 h-3 mr-1" /> :
               user.user_type === 'coach' ? <Award className="w-3 h-3 mr-1" /> :
               <User className="w-3 h-3 mr-1" />}
              {user.user_type}
            </Badge>

            <Badge className={
              user.registration_status === 'approved' ? 'bg-green-100 text-green-700' :
              user.registration_status === 'pending' ? 'bg-orange-100 text-orange-700' :
              'bg-red-100 text-red-700'
            }>
              {user.registration_status || 'N/A'}
            </Badge>

            {user.coachProfile && (
              <Badge variant="outline">
                Coach Profile: {user.coachProfile.status}
              </Badge>
            )}

            {user.coacheeProfile && (
              <Badge variant="outline">
                Coachee Profile: {user.coacheeProfile.status}
              </Badge>
            )}
          </div>

          {user.coachProfile && (
            <div className="mt-3 pt-3 border-t text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                {user.coachProfile.experience_years} anni esperienza · €{user.coachProfile.hourly_rate}/ora
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
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
            Gestione Utenti
          </h1>
          <p className="text-gray-600">Visualizza e modifica tutti gli utenti della piattaforma</p>
        </motion.div>

        {/* Filters */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Cerca per email o nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo Utente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli Utenti</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="coachee">Coachee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <span>Totale: {filteredUsers.length} utenti</span>
              <span>•</span>
              <span>Admin: {filteredUsers.filter(u => u.user_type === 'admin').length}</span>
              <span>•</span>
              <span>Coach: {filteredUsers.filter(u => u.user_type === 'coach').length}</span>
              <span>•</span>
              <span>Coachee: {filteredUsers.filter(u => u.user_type === 'coachee').length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredUsers.length === 0 ? (
              <Card className="md:col-span-2 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Nessun utente trovato
                  </h3>
                  <p className="text-gray-500">
                    Prova a modificare i filtri di ricerca
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}