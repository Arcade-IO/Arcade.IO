import { Component } from '@angular/core';

@Component({
  selector: 'app-chat',
  imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  msg : Message[] = [];

  makeMessage(newMsg:string){
    this.msg.push(new Message(newMsg))
  }
}

class Message {
  message : string;
  userName : string = "";

  constructor(message : string) {
    this.message = message;
  }
}