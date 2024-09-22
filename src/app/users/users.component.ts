import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: any[] = []; // Stocke la liste des utilisateurs
  selectedUser: string = ''; // Stocke l'ID de l'utilisateur sélectionné
  selectedUserName: string = ''; // Stocke le nom de l'utilisateur sélectionné
  createdTasks: any[] = []; // Stocke les tâches créées
  assignedTasks: any[] = []; // Stocke les tâches assignées

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // Méthode pour charger la liste des utilisateurs via l'API
  loadUsers(): void {
    this.http.get('https://api.example.com/users').subscribe((data: any) => {
      this.users = data;
    });
  }

  // Méthode appelée lorsqu'un utilisateur est sélectionné
  onUserSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedUser = selectElement.value;

    // Récupérer le nom de l'utilisateur sélectionné
    const user = this.users.find(u => u.id === this.selectedUser);
    this.selectedUserName = user ? user.name : '';
  }

  // Méthode pour rechercher les tâches créées et assignées
  searchTasks(): void {
    if (!this.selectedUser) {
      return;
    }

    // Récupérer les tâches créées par l'utilisateur sélectionné
    this.http.get(`https://monkfish-app-9x56s.ondigitalocean.app/v1/tasks/createdby/${this.selectedUser}`, {
      headers: { 'x-access-token': 'votre-token-ici' }
    }).subscribe((tasks: any) => {
      this.createdTasks = tasks;
    });

    // Récupérer les tâches assignées à l'utilisateur sélectionné
    this.http.get(`https://monkfish-app-9x56s.ondigitalocean.app/v1/tasks/assignedto/${this.selectedUser}`, {
      headers: { 'x-access-token': 'votre-token-ici' }
    }).subscribe((tasks: any) => {
      this.assignedTasks = tasks;
    });
  }
}
