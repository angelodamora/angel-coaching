import { createClient } from '@mindflow/sdk';

// Create a client with authentication required
// appId può essere configurato tramite variabile d'ambiente o passato dinamicamente
const appId = import.meta.env.VITE_APP_ID || "68f8ea6151e7f9d5ce21bc30";

export const mindflow = createClient({
  appId: appId,
  requiresAuth: true // Ensure authentication is required for all operations
});

// Export per retrocompatibilità con base44
export const base44 = mindflow;
export default mindflow;
