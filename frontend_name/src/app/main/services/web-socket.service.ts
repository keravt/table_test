import { Injectable, OnDestroy } from '@angular/core';
import { io } from 'socket.io-client';
import { Subject } from 'rxjs';

import { mainURL } from 'src/environments/environment';

@Injectable({
  providedIn: "root"
})
export class WebsocketService implements OnDestroy {
  private socket = io(mainURL);

  private message$ = new Subject<string>();
  public message = this.message$.asObservable();

  constructor() {
    this.socket.on('message', (message) => this.message$.next(message));
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
  }
}
