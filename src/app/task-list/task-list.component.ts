import { Component } from '@angular/core';
import { Task } from '../models/task.model';
import { TaskService } from '../services/task.service';
import { Router } from '@angular/router';
import { TaskAPI } from '../models/task-api.model';
import { TaskApiService } from '../services/task-api.service';
import { WebSocketService } from '../services/websocket.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent {
  tasks: Task[] = [];
  isMobile: boolean;
  showCreatedBy: boolean;
  showAssignedTo: boolean;

  createdTasks: TaskAPI[] = [];
  assignedTasks: TaskAPI[] = [];
  private token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJlbmFuQGdtYWlsLmNvbSIsImlkIjoiNjZjM2VmZmU3ZTA0MWU4Y2MzNGEyZWU4IiwiZXhwIjoxNzI3MDM2NDA5fQ.NAiFM6MfLNHUxJQZQmtX60k8o_CBYf4kCCcRRxwC0NU";
  lastUidAssigned = "";

  constructor(
    private taskApiService: TaskApiService,
    private router: Router,
    private webSocketService: WebSocketService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.isMobile = Capacitor.isNativePlatform();
    this.showCreatedBy = true;
    this.showAssignedTo = false;

    // Fetch initial tasks
    this.fetchTasks();

    // WebSocket for real-time updates
    this.webSocketService.getMessage().subscribe(
      (message: any) => {
        if (message.event === "taskCreated") {
          this.fetchTasks();
          
          if (message.assignedToUid === this.authService.getId()) {
            this.snackBar.open("Nouvelle tâche assignée à vous !", "OK", {
              duration: 5000,
            });
            this.lastUidAssigned = message.taskUid;
          }
        }
      }
    );
  }

  // Fetch tasks created and assigned to the user
  fetchTasks() {
    this.taskApiService.getTasksCreatedBy(this.token).subscribe(
      (res) => {
        this.createdTasks = res.allTasks;
      }
    );

    this.taskApiService.getTasksAssignedTo(this.token).subscribe(
      (res) => {
        this.assignedTasks = res.allTasks;
        console.log(this.assignedTasks);
      }
    );
  }

  // Change task status (completed/incomplete)
  changeStatus(task: TaskAPI) {
    this.taskApiService.updateTaskStatus(this.token, task.taskUid, !task.done).subscribe(
      () => {
        this.fetchTasks();
      }
    );
  }

  // Delete a task
  deleteTask(task: TaskAPI) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${task.description}" ?`)) {
      this.taskApiService.deleteTask(this.token, task.taskUid).subscribe(
        () => {
          this.fetchTasks();
        }
      );
    }
  }

  // Go to the task detail page
  goToDetail(task: Task) {
    this.router.navigate(['/task', task.id]);
  }

  // Highlight a task (for new tasks)
  shouldHighlight(taskUid: string) {
    if (taskUid === this.lastUidAssigned) {
      this.lastUidAssigned = "";
      return true;
    }
    return false;
  }

  // Méthode pour afficher les tâches créées par l'utilisateur
  shouldShowCreatedBy() {
    this.showCreatedBy = true;
    this.showAssignedTo = false;
  }

  // Méthode pour afficher les tâches assignées à l'utilisateur
  shouldShowAssignedTo() {
    this.showCreatedBy = false;
    this.showAssignedTo = true;
  }

  // Edit a task
  editTask(task: TaskAPI) {
    console.log("Editing task:", task);
    this.router.navigate(['/edit-task', task.taskUid]);
  }
}
