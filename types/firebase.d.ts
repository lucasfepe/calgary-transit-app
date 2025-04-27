// firebase.d.ts
import { Auth } from '@firebase/auth';

declare module '../firebaseConfig' {
  export const auth: Auth;
}