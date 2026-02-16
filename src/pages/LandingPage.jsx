import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { mindflow } from "@/api/mindflowClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Target,
  Award,
  Users,
  Calendar,
  MessageSquare,
  TrendingUp,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Shield,
  Heart,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await mindflow.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        const user = await mindflow.auth.me();
        const userType = user.user_type || user.role;
        if (userType === 'admin') {
          navigate(createPageUrl("AdminDashboard"));
        } else if (userType === 'coach') {
          navigate(createPageUrl("CoachDashboard"));
        } else {
          navigate(createPageUrl("CoachList"));
        }
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    mindflow.auth.redirectToLogin();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const features = [
    {
      icon: Target,
      title: "Coaching Personalizzato",
      description: "Coach esperti e qualificati per il tuo percorso di crescita"
    },
    {
      icon: Calendar,
      title: "Flessibilità Totale",
      description: "Prenota sessioni quando vuoi, gestisci il tuo calendario"
    },
    {
      icon: MessageSquare,
      title: "Supporto Continuo",
      description: "Resta in contatto con il tuo coach tramite messaggistica"
    },
    {
      icon: TrendingUp,
      title: "Risultati Misurabili",
      description: "Monitora i tuoi progressi e raggiungi i tuoi obiettivi"
    }
  ];

  const benefits = [
    "Coach certificati e qualificati",
    "Prenotazione semplice e veloce",
    "Sessioni online o in presenza",
    "Supporto dedicato 24/7",
    "Monitoraggio progressi",
    "Piani personalizzati"
  ];

  return (
    <div className="min-h-screen">
      {/* Header Navigation */}
      <header className="absolute top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Angel Coaching</span>
          </div>
          <Button
            onClick={handleLogin}
            variant="outline"
            className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 backdrop-blur-sm bg-white/10"
          >
            Accedi
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-24 md:py-32 px-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-yellow-300" />
          </div>
        </div>
        <div className="absolute bottom-20 right-10 animate-pulse">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-pink-300" />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full mb-8 border border-white/30 shadow-xl"
            >
              <Award className="w-5 h-5 text-yellow-300" />
              <span className="text-sm md:text-base font-semibold">Piattaforma di Coaching #1 in Italia</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              Trasforma la Tua Vita con
              <span className="block mt-2 bg-gradient-to-r from-yellow-200 via-orange-200 to-pink-200 bg-clip-text text-transparent animate-pulse">
                Angel Coaching
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl mb-12 text-white/90 max-w-4xl mx-auto leading-relaxed font-light">
              Connettiti con coach professionisti certificati che ti accompagneranno nel tuo percorso di crescita personale e professionale
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Link to={createPageUrl("CoacheeMatching")}>
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 text-lg px-10 py-7 rounded-xl font-semibold">
                  Trova il Tuo Coach
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </Link>
              <Link to={createPageUrl("CoachRegistration")}>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 hover:scale-105 transition-all duration-300 text-lg px-10 py-7 rounded-xl font-semibold backdrop-blur-sm bg-white/10">
                  Diventa Coach
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16"
            >
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
                <div className="text-sm md:text-base text-white/80">Coach Certificati</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">10k+</div>
                <div className="text-sm md:text-base text-white/80">Clienti Soddisfatti</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
                <div className="text-sm md:text-base text-white/80">Tasso di Successo</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-white to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-block mb-4">
              <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold">
                ✨ Caratteristiche
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Perché Scegliere Angel Coaching
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Una piattaforma completa progettata per il tuo successo personale e professionale
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-indigo-300 bg-white/80 backdrop-blur-sm group">
                  <CardHeader>
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300"
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-2xl mb-3">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block mb-6">
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                  💎 Vantaggi Esclusivi
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Tutto Ciò di Cui Hai Bisogno in Un'Unica Piattaforma
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Angel Coaching ti offre strumenti professionali e supporto dedicato per trasformare i tuoi obiettivi in realtà
              </p>
              
              <div className="space-y-5">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="flex items-center gap-4 bg-gradient-to-r from-green-50 to-transparent p-4 rounded-xl hover:from-green-100 transition-colors duration-300"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg md:text-xl text-gray-800 font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-10"
              >
                <Link to={createPageUrl("CoacheeRegistration")}>
                  <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                    Inizia Gratis Oggi
                    <Zap className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[3rem] shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users className="w-40 h-40 text-white opacity-20" />
                </div>
                {/* Decorative elements */}
                <div className="absolute top-10 right-10 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Star className="w-12 h-12 text-yellow-300" />
                </div>
              </div>
              
              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1, repeat: Infinity, repeatType: "reverse" }}
                className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-2xl p-6 max-w-xs"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-pink-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">+500 Coach</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-sm text-gray-600 font-medium">4.9/5</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4">
              <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold">
                ⭐ Testimonianze
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Storie di Successo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Scopri come Angel Coaching ha trasformato la vita di migliaia di persone
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Marco R.", role: "Imprenditore", text: "Angel Coaching mi ha aiutato a raggiungere obiettivi che pensavo impossibili. Il mio coach ha capito perfettamente le mie esigenze e mi ha guidato passo dopo passo.", rating: 5 },
              { name: "Laura S.", role: "Manager", text: "Un'esperienza incredibile! La piattaforma è intuitiva e i coach sono professionisti eccellenti. Ho finalmente trovato l'equilibrio tra vita e lavoro.", rating: 5 },
              { name: "Giuseppe M.", role: "Libero Professionista", text: "Consiglio Angel Coaching a chiunque voglia crescere professionalmente. Il supporto costante e la qualità del servizio sono davvero unici.", rating: 5 }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-indigo-200 bg-white">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 text-lg leading-relaxed italic">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="inline-block mb-6"
            >
              <Sparkles className="w-16 h-16 text-yellow-300" />
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Pronto a Trasformare la Tua Vita?
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Unisciti a oltre 10.000 persone che hanno già iniziato il loro percorso di crescita con Angel Coaching
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to={createPageUrl("CoacheeRegistration")}>
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 hover:scale-105 shadow-2xl text-xl px-12 py-8 rounded-2xl font-bold transition-all duration-300">
                  Inizia Gratis Ora
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
              <Link to={createPageUrl("CoacheeMatching")}>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 hover:scale-105 text-xl px-12 py-8 rounded-2xl font-bold backdrop-blur-sm bg-white/10 transition-all duration-300">
                  Esplora i Coach
                </Button>
              </Link>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 text-white/80 text-sm"
            >
              ✨ Nessuna carta di credito richiesta • Inizia in meno di 2 minuti
            </motion.p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}