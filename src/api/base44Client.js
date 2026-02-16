// Retrocompatibilità: re-export da mindflowClient
// Questo file mantiene la compatibilità con il codice esistente che usa base44
import { mindflow, base44 } from './mindflowClient';

export { mindflow, base44 };
export default mindflow;
