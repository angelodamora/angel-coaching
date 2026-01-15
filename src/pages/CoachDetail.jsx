import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  Award,
  Clock,
  Video,
  Calendar,
  MessageSquare,
  ArrowLeft,
  Languages,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

export default function CoachDetail() {
  const navigate = useNavigate();
  const [coachId, setCoachId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
      navigate(createPageUrl("CoachList"));
      return;
    }
    setCoachId(id);
  }, []);

  const { data: coach, isLoading } = useQuery({
    queryKey: ['coach', coachId],
    queryFn: async () => {
      const coaches = await base44.entities.CoachProfile.filter({ id: coachId });
      return coaches[0];
    },
    enabled: !!coachId,
  });

  const handleBookSession = () => {
    if (!coach?.user_id) return;
    navigate(createPageUrl("BookAppointment") + `?coachId=${coach.user_id}`);
  };

  if (isLoading || !coach) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate(createPageUrl("CoachList"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna ai Coach
        </Button>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-8 overflow-hidden shadow-2xl border-indigo-100">
            <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
            <CardContent className="p-8 -mt-16">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                  <AvatarImage src={coach.profile_image_url} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-4xl">
                    {coach.full_name?.[0] || "C"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{coach.full_name}</h1>
                      <div className="flex items-center gap-2 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < (coach.rating || 5) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-gray-600">
                          ({coach.rating || 5.0}) · {coach.experience_years} anni di esperienza
                        </span>
                      </div>
                    </div>
                    
                    {coach.hourly_rate && (
                      <div className="text-right bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 rounded-xl">
                        <div className="text-3xl font-bold text-indigo-600">
                          €{coach.hourly_rate}
                        </div>
                        <div className="text-sm text-gray-600">per sessione</div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {coach.specializations?.map((spec, i) => (
                      <Badge key={i} className="bg-indigo-100 text-indigo-700">
                        {spec}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleBookSession}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Prenota Sessione
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Invia Messaggio
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Tabs */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="about">Informazioni</TabsTrigger>
            <TabsTrigger value="certifications">Certificazioni</TabsTrigger>
            <TabsTrigger value="languages">Lingue</TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Chi Sono</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {coach.bio || "Informazioni non disponibili"}
                </p>

                {coach.video_intro_url && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Video className="w-5 h-5 text-indigo-600" />
                      Video di Presentazione
                    </h3>
                    <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                      <video
                        src={coach.video_intro_url}
                        controls
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">Certificazioni e Qualifiche</h2>
                {coach.certifications && coach.certifications.length > 0 ? (
                  <div className="space-y-4">
                    {coach.certifications.map((cert, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{cert}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Nessuna certificazione specificata</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="languages">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">Lingue Parlate</h2>
                {coach.languages && coach.languages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {coach.languages.map((lang, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg">
                        <Languages className="w-6 h-6 text-indigo-600" />
                        <span className="font-semibold">{lang}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Nessuna lingua specificata</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}