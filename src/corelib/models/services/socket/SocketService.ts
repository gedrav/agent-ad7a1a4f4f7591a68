import { io, Socket } from 'socket.io-client';
import { APIUrls } from '@core/models/services/ApiUrlService';
import { SocketEventsToServer } from '@core/models/services/socket/socketEvent';
export class SocketService {
  public socket: Socket;

  public initSocket(beToken: string): void {
    this.socket = io(APIUrls.socketUrl, {
      auth: {
        token: beToken,
      },
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 5,
      transports: ['websocket'],
      // path: '/socket',
    });
  }

  public disconnect(): void {
    this.socket?.disconnect();
  }

  public emit(event: SocketEventsToServer, data: any): void {
    this.socket.emit(event, data);
  }
}
