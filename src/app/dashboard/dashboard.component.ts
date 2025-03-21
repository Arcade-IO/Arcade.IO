import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule,RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  isLoggedIn = false;
  isAdmin = false;
  games = [
    { id: '1', title: 'Spil 1', imageUrl: 'https://via.placeholder.com/200' },
    { id: '2', title: 'Spil 2', imageUrl: 'https://via.placeholder.com/200' },
    { id: '3', title: 'Spil 3', imageUrl: 'https://via.placeholder.com/200' }
  ];
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
}
