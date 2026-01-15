import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Star,
  Award,
  Clock,
  Video,
  Filter,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CoachList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");

  const { data: coaches, isLoading } = useQuery({
    queryKey: ['coaches'],
    queryFn: () => base44.entities.CoachProfile.filter({ status: 'approved', is_published: true }),
    initialData: [],
  });

  const filteredCoaches = coaches.filter(coach => {
    const matchesSearch = coach.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coach.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpec = selectedSpecialization === "all" || 
                       coach.specializations?.includes(selectedSpecialization);
    const matchesExp = selectedExperience === "all" ||
                      (selectedExperience === "0-5" && coach.experience_years <= 5) ||
                      (selectedExperience === "5-10" && coach.experience_years > 5 && coach.experience_years <= 10) ||
                      (selectedExperience === "10+" && coach.experience_years > 10);
    
    return matchesSearch && matchesSpec && matchesExp;
  });

  const handleCoachClick = (coachId) => {
    navigate(createPageUrl("CoachDetail") + `?id=${coachId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Trova il Tuo Coach Ideale
          </h1>
          <p className="text-gray-600 text-lg">
            Esplora i nostri coach professionisti e trova quello perfetto per te
          </p>
        </motion.div>

        {/* Filters */}
        <Card className="mb-8 shadow-lg border-indigo-100">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Cerca per nome o esperienza..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                <SelectTrigger>
                  <SelectValue placeholder="Specializzazione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le Specializzazioni</SelectItem>
                  <SelectItem value="Life Coaching">Life Coaching</SelectItem>
                  <SelectItem value="Business Coaching">Business Coaching</SelectItem>
                  <SelectItem value="Career Coaching">Career Coaching</SelectItem>
                  <SelectItem value="Health Coaching">Health Coaching</SelectItem>
                  <SelectItem value="Mindfulness">Mindfulness</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                <SelectTrigger>
                  <SelectValue placeholder="Esperienza" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Qualsiasi Esperienza</SelectItem>
                  <SelectItem value="0-5">0-5 anni</SelectItem>
                  <SelectItem value="5-10">5-10 anni</SelectItem>
                  <SelectItem value="10+">10+ anni</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Coaches Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredCoaches.map((coach, index) => (
                <motion.div
                  key={coach.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-indigo-200 h-full">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-indigo-100">
                          <AvatarImage src={coach.profile_image_url} />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-2xl">
                            {coach.full_name?.[0] || "C"}
                          </AvatarFallback>
                        </Avatar>
                        
                        <h3 className="text-xl font-bold mb-1">{coach.full_name}</h3>
                        
                        <div className="flex items-center justify-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < (coach.rating || 5) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">
                            ({coach.rating || 5.0})
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-indigo-500" />
                          <span>{coach.experience_years} anni di esperienza</span>
                        </div>

                        {coach.specializations && coach.specializations.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {coach.specializations.slice(0, 3).map((spec, i) => (
                              <Badge key={i} variant="secondary" className="bg-indigo-50 text-indigo-700">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <p className="text-sm text-gray-600 line-clamp-3">
                          {coach.bio}
                        </p>

                        {coach.hourly_rate && (
                          <div className="text-center py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                            <span className="text-2xl font-bold text-indigo-600">
                              €{coach.hourly_rate}
                            </span>
                            <span className="text-sm text-gray-600">/ora</span>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => handleCoachClick(coach.id)}
                        className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      >
                        Visualizza Profilo
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && filteredCoaches.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nessun coach trovato</h3>
            <p className="text-gray-600">Prova a modificare i filtri di ricerca</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}