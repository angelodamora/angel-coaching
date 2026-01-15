
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  UserCheck,
  Clock,
  BarChart3,
  Home,
  Shield,
  History // Added History icon
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AdminRoleSwitcher from "@/components/AdminRoleSwitcher";
import CookieConsent from "@/components/CookieConsent";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [activeRole, setActiveRole] = useState(null);
  const [impersonateUserId, setImpersonateUserId] = useState(null);

  useEffect(() => {
    loadUser();
    loadUnreadMessages();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Carica il ruolo salvato dall'admin
      const savedRole = localStorage.getItem('admin_active_role');
      const savedUserId = localStorage.getItem('admin_impersonate_user');
      
      if (savedRole && (userData.role === 'admin' || userData.user_type === 'admin')) {
        setActiveRole(savedRole);
        if (savedUserId) {
          setImpersonateUserId(savedUserId);
        }
      } else {
        // Se non è admin o non c'è ruolo salvato, usa il ruolo dell'utente
        setActiveRole(userData.user_type || userData.role || 'coachee');
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadUnreadMessages = async () => {
    try {
      const userData = await base44.auth.me();
      const messages = await base44.entities.Message.filter({
        receiver_id: userData.id,
        is_read: false
      });
      setUnreadMessages(messages.length);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_active_role');
    localStorage.removeItem('admin_impersonate_user');
    base44.auth.logout();
  };

  const handleRoleChange = (newRole) => {
    console.log("Changing role to:", newRole);
    setActiveRole(newRole);
    setImpersonateUserId(null);
    
    // Reindirizza alla dashboard appropriata
    if (newRole === 'admin') {
      navigate(createPageUrl("AdminDashboard"));
    } else if (newRole === 'coach') {
      navigate(createPageUrl("CoachDashboard"));
    } else if (newRole === 'coachee') {
      navigate(createPageUrl("LandingPage"));
    }
  };

  const handleUserChange = (userId) => {
    console.log("Impersonating user:", userId);
    setImpersonateUserId(userId);
  };

  const getNavigationItems = () => {
    if (!user || !activeRole) return [];

    // Se è admin, usa il ruolo attivo per mostrare la navigazione
    // Coach e coachee vedono solo la loro vista, senza switcher
    const isAdmin = user.role === 'admin' || user.user_type === 'admin';
    const displayRole = isAdmin ? activeRole : (user.user_type || user.role);

    console.log("Current display role:", displayRole);

    if (displayRole === "admin") {
      return [
        { title: "Dashboard", url: createPageUrl("AdminDashboard"), icon: LayoutDashboard },
        { title: "Utenti", url: createPageUrl("UserManagement"), icon: Users },
        { title: "Richieste", url: createPageUrl("RegistrationRequests"), icon: UserCheck },
        { title: "Calendario", url: createPageUrl("AdminCalendar"), icon: Calendar },
        { title: "Orari Coach", url: createPageUrl("AdminCoachSchedules"), icon: Clock },
        { title: "Statistiche", url: createPageUrl("Statistics"), icon: BarChart3 },
        { title: "Documenti", url: createPageUrl("Documents"), icon: FileText },
      ];
    }

    if (displayRole === "coach") {
      return [
        { title: "Dashboard", url: createPageUrl("CoachDashboard"), icon: LayoutDashboard },
        { title: "Analytics", url: createPageUrl("CoachAnalytics"), icon: BarChart3 },
        { title: "I Miei Coachee", url: createPageUrl("CoacheeManagement"), icon: Users },
        { title: "Calendario", url: createPageUrl("CoachCalendar"), icon: Calendar },
        { title: "Storico Sessioni", url: createPageUrl("CoachSessionHistory"), icon: History },
        { title: "Appuntamenti", url: createPageUrl("CoachAppointments"), icon: Clock },
        { title: "Messaggi", url: createPageUrl("CoachMessages"), icon: MessageSquare, badge: unreadMessages },
        { title: "Profilo", url: createPageUrl("CoachProfile"), icon: Settings },
      ];
    }

    // Vista Coachee (default)
    return [
      { title: "Home", url: createPageUrl("LandingPage"), icon: Home },
      { title: "Coach", url: createPageUrl("CoachList"), icon: Users },
      { title: "Appuntamenti", url: createPageUrl("MyAppointments"), icon: Calendar },
      { title: "Messaggi", url: createPageUrl("CoacheeMessages"), icon: MessageSquare, badge: unreadMessages },
      { title: "Profilo", url: createPageUrl("CoacheeProfile"), icon: Settings },
    ];
  };

  const navigationItems = getNavigationItems();
  const isAdmin = user?.role === 'admin' || user?.user_type === 'admin';
  const isViewingAsOtherRole = isAdmin && activeRole !== 'admin';

  // Non renderizzare nulla finché non abbiamo caricato i dati
  if (!user || !activeRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      {/* Banner SOLO quando admin visualizza come altro ruolo */}
      {(user.role === 'admin' || user.user_type === 'admin') && isViewingAsOtherRole && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">
                Stai visualizzando come: {
                  activeRole === 'coach' ? 'Coach' : 'Coachee'
                }
                {impersonateUserId && ' (utente specifico)'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                handleRoleChange('admin');
                setImpersonateUserId(null);
                localStorage.removeItem('admin_impersonate_user');
              }}
              className="text-white hover:bg-white/20"
            >
              Torna ad Admin
            </Button>
          </div>
        </div>
      )}
      
      <div className={`min-h-screen flex w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 ${isViewingAsOtherRole ? 'pt-14' : ''}`}>
        <Sidebar className="border-r border-indigo-100 bg-white/80 backdrop-blur-xl">
          <SidebarHeader className="border-b border-indigo-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Angel Coaching
                </h2>
                <p className="text-xs text-gray-500">Piattaforma Coaching</p>
              </div>
            </div>

            {/* Role Indicator & Switcher SOLO per Admin */}
            {(user.role === 'admin' || user.user_type === 'admin') && (
              <div className="mt-4">
                <AdminRoleSwitcher 
                  onRoleChange={handleRoleChange} 
                  currentRole={activeRole}
                  onUserChange={handleUserChange}
                  selectedUserId={impersonateUserId}
                />
              </div>
            )}
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                Navigazione
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url ? 'bg-indigo-50 text-indigo-700 shadow-sm' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center justify-between gap-3 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </div>
                          {item.badge > 0 && (
                            <Badge className="bg-red-500 text-white">{item.badge}</Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-indigo-100 p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2">
                <Avatar className="h-10 w-10 border-2 border-indigo-100">
                  <AvatarImage src={user?.profile_image_url} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                    {user?.full_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {user?.full_name || "Utente"}
                  </p>
                  <p className="text-xs text-gray-500 truncate capitalize">
                    {isViewingAsOtherRole
                      ? `Admin (vista ${activeRole})`
                      : (user?.user_type || user?.role || "User")
                    }
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Esci
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/80 backdrop-blur-xl border-b border-indigo-100 px-6 py-4 md:hidden sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-indigo-50 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Angel Coaching
              </h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>

          <footer className="border-t border-indigo-100 bg-white/80 backdrop-blur-xl py-4 px-6">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
              <span>© 2026 Angel Coaching. Tutti i diritti riservati.</span>
              <span>•</span>
              <Link to={createPageUrl("PrivacyPolicy")} className="hover:text-indigo-600">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link to={createPageUrl("DataManagement")} className="hover:text-indigo-600">
                Gestione Dati GDPR
              </Link>
            </div>
          </footer>
          </main>
          </div>
          <CookieConsent />
          </SidebarProvider>
          );
          }
