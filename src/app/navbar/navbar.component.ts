import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service'; // Update the path if necessary
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [CommonModule,RouterModule],  
  
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  async checkLoginStatus() {
    const user = this.firebaseService.getCurrentUser();
    this.isLoggedIn = !!user;  // If user exists, set isLoggedIn to true

    if (this.isLoggedIn && user) {
      this.isAdmin = await this.firebaseService.checkIfAdmin(user.uid);
    }
  }

  // Logout function
  async logout() {
    await this.firebaseService.logout();
    this.isLoggedIn = false;
    this.isAdmin = false;
  }
}