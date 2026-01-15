import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Users } from "lucide-react";

export default function AdminRoleSwitcher({ onRoleChange, currentRole, onUserChange, selectedUserId }) {
  const [role, setRole] = useState(currentRole);
  const [userId, setUserId] = useState(selectedUserId);

  useEffect(() => {
    setRole(currentRole);
  }, [currentRole]);

  useEffect(() => {
    setUserId(selectedUserId);
  }, [selectedUserId]);

  const { data: coaches } = useQuery({
    queryKey: ['coaches-list'],
    queryFn: async () => {
      const profiles = await base44.entities.CoachProfile.filter({ status: 'approved' });
      return profiles;
    },
    initialData: [],
    enabled: role === 'coach'
  });

  const { data: coachees } = useQuery({
    queryKey: ['coachees-list'],
    queryFn: async () => {
      const profiles = await base44.entities.CoacheeProfile.filter({ status: 'approved' });
      return profiles;
    },
    initialData: [],
    enabled: role === 'coachee'
  });

  const handleRoleChange = (newRole) => {
    console.log("AdminRoleSwitcher - Changing to:", newRole);
    setRole(newRole);
    setUserId(null);
    localStorage.setItem('admin_active_role', newRole);
    localStorage.removeItem('admin_impersonate_user');
    onRoleChange(newRole);
    if (onUserChange) onUserChange(null);
  };

  const handleUserChange = (newUserId) => {
    console.log("AdminRoleSwitcher - Impersonating user:", newUserId);
    setUserId(newUserId);
    if (newUserId) {
      localStorage.setItem('admin_impersonate_user', newUserId);
    } else {
      localStorage.removeItem('admin_impersonate_user');
    }
    if (onUserChange) onUserChange(newUserId);
  };

  const users = role === 'coach' ? coaches : role === 'coachee' ? coachees : [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600">Visualizza come:</span>
        <Badge className={`${
          role === 'admin' 
            ? 'bg-indigo-600' 
            : role === 'coach'
            ? 'bg-green-600'
            : 'bg-purple-600'
        } text-white`}>
          {role === 'admin' ? 'Admin' : role === 'coach' ? 'Coach' : 'Coachee'}
        </Badge>
      </div>
      
      <Select value={role} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-full bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </div>
          </SelectItem>
          <SelectItem value="coach">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Coach</span>
            </div>
          </SelectItem>
          <SelectItem value="coachee">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Coachee</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {role !== 'admin' && users.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-gray-600 mb-2 block">Seleziona utente:</span>
          <Select value={userId || "all"} onValueChange={(val) => handleUserChange(val === "all" ? null : val)}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Tutti gli utenti" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <span className="font-medium">Tutti gli utenti</span>
              </SelectItem>
              {users.map((user) => (
                <SelectItem key={user.user_id} value={user.user_id}>
                  {user.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {role !== 'admin' && (
        <p className="text-xs text-gray-500">
          📌 {userId ? `Stai visualizzando come ${users.find(u => u.user_id === userId)?.full_name}` : `Vista generica ${role}`}
        </p>
      )}
    </div>
  );
}