import { Injectable } from '@angular/core';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set, get, update } from 'firebase/database';
import { environment } from '../environments/environment';
import { initializeApp } from 'firebase/app';

// Initialize Firebase
const app = initializeApp(environment.firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  currentUser: any = null;

  constructor() {
    // Lyt efter auth state changes
    this.listenToAuthStateChanges();
  }

  // ===============================
  // Bruger- og Auth-funktioner
  // ===============================

  // Registrer bruger
  registerUser(email: string, password: string, name: string): Promise<any> {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const isAdmin = FirebaseService.isHardcodedAdmin(email);
        return this.saveUserData(user.uid, name, email, isAdmin).then(() => ({ uid: user.uid, isAdmin }));
      });
  }

  // Gem brugerdata
  private saveUserData(uid: string, name: string, email: string, isAdmin: boolean): Promise<void> {
    return set(ref(database, 'users/' + uid), {
      name,
      email,
      isAdmin,
      createdAt: new Date().toISOString()
    });
  }

  // Login bruger
  loginUser(email: string, password: string): Promise<any> {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Hent alle brugere
  getAllUsers(): Promise<any[]> {
    const usersRef = ref(database, 'users/');
    return get(usersRef).then((snapshot) => {
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        return Object.keys(usersData).map(uid => ({ uid, ...usersData[uid] }));
      }
      return [];
    });
  }

  // Giv admin-rettigheder
  grantAdminRights(uid: string): Promise<void> {
    return update(ref(database, 'users/' + uid), { isAdmin: true });
  }

  // Tjek om bruger er admin
  checkIfAdmin(uid: string): Promise<boolean> {
    const userRef = ref(database, 'users/' + uid);
    return get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        return userData.isAdmin || false;
      }
      return false;
    }).catch((error) => {
      console.error('Error checking admin status:', error);
      return false;
    });
  }

  // Lyt efter auth state changes
  private listenToAuthStateChanges() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUser = user;
      } else {
        this.currentUser = null;
      }
    });
  }

  // Hent nuværende loggede bruger
  getCurrentUser() {
    return this.currentUser;
  }

  // Logout
  logout(): Promise<void> {
    return auth.signOut();
  }

  // Hardcoded superuser
  private static isHardcodedAdmin(email: string): boolean {
    const adminEmails = ["selin@selin.dk"];
    return adminEmails.includes(email);
  }

  // Fjern admin-rettigheder
  revokeAdminRights(uid: string): Promise<void> {
    return update(ref(database, 'users/' + uid), { isAdmin: false });
  }

  // Slet bruger
  deleteUser(uid: string): Promise<void> {
    const userRef = ref(database, 'users/' + uid);
    return set(userRef, null);  // Sletter brugeren fra databasen
  }

  // ===============================
  // Globale funktioner for øvrige noder
  // ===============================

  // Opret et spil i "games" noden
  createGame(
    gameId: string,
    title: string,
    description: string,
    imageUrl: string,
    netlifyUrl: string,
    platform: string,  // Fx "Web", "Android" eller "Both"
    userId: string     // Reference til den bruger, der tilføjede spillet
  ): Promise<void> {
    return set(ref(database, `games/${gameId}`), {
      title,
      description,
      imageUrl,
      netlifyUrl,
      platform,
      users_Id: userId,
      createdAt: new Date().toISOString()
    });
  }

  // Opret en highscore i "highscores" noden
  createHighscore(
    highscoreId: string,
    userId: string,
    gameId: string,
    score: number
  ): Promise<void> {
    return set(ref(database, `highscores/${highscoreId}`), {
      users_Id: userId,
      games_Id: gameId,
      score,
      createdAt: new Date().toISOString()
    });
  }

  // Opret et forumindlæg i "forums" noden
  createForumPost(
    forumId: string,
    gameId: string,  // Hvis indlægget er spilspecifikt (ellers kan denne værdi være null eller en tom streng)
    userId: string,
    message: string
  ): Promise<void> {
    return set(ref(database, `forums/${forumId}`), {
      games_Id: gameId,
      users_Id: userId,
      message,
      timestamp: new Date().toISOString()
    });
  }

  // Opret settings i "settings" noden
  createSettings(
    settingsId: string,
    userId: string,
    navbarColor: string,
    navbarFontColor: string,
    backgroundColor: string
  ): Promise<void> {
    return set(ref(database, `settings/${settingsId}`), {
      users_Id: userId,
      navbarColor,
      navbarFontColor,
      backgroundColor
    });
  }

  // Opdater settings (eksempel)
  updateSettings(
    settingsId: string,
    updates: { navbarColor?: string; navbarFontColor?: string; backgroundColor?: string }
  ): Promise<void> {
    return update(ref(database, `settings/${settingsId}`), updates);
  }
}
