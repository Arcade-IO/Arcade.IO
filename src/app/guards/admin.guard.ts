import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { getAuth } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private firebaseService: FirebaseService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      this.router.navigate(['/admin-login']);
      return false;
    }

    const isAdmin = await this.firebaseService.checkIfAdmin(user.uid);
    if (!isAdmin) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
