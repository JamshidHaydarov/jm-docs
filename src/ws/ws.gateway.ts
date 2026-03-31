import { ForbiddenException, Req } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { UpdateFileDto } from 'dto/update.file.dto';
import { Server, Socket } from 'socket.io'
import { AppService } from 'src/app.service';


@WebSocketGateway({cors: {origin: 'http://localhost:4200'}})
export class WsGateway implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {

  constructor(private readonly appService: AppService){}
  
  @WebSocketServer()
  server: Server;
  afterInit(server: any) {
    console.log(server);
  }
  
  async handleConnection(client: Socket, @Req() req: any) {
    try {
      const ver = await this.appService.verifyToken(client.handshake)
      if (!ver) {
        client.emit('error', {
          message: 'Unauthorized'
        })
        client.disconnect(true)
        return
      }
      
      console.log(`Connected: ${client.id}`);
  } catch (error) {
      client.emit('error', {
        message: error.message || 'Unauthorized'
      })

      client.disconnect(true)
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Disconnect: ${client.id}`);
  }

  @SubscribeMessage('join_file')
  async joinFile(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { fileId: number },
  ) {
    const user = await this.appService.verifyToken(client.handshake)
    
    const fileId = Number(payload.fileId);
    
    const room = `file:${fileId}`;

    const hasAccess = await this.appService.userHasAccessToFile(user.sub, fileId);

    if (!hasAccess) {
      client.emit('error', {
        message: 'Access denied',
      });
      
      throw new ForbiddenException('Access denied');
    }

    await client.join(room);

    client.emit('joined_file', {
      ok: true,
      room,
      fileId,
    });

    const sockets = await this.server.in(room).fetchSockets();

    this.server.to(room).emit('room_users_count', {
      fileId,
      count: sockets.length,
    });
  }

  @SubscribeMessage('leave_file')
  async leaveFile(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { fileId: number },
  ) {
    const fileId = Number(payload.fileId);
    const room = `file:${fileId}`;

    await client.leave(room);

    client.emit('left_file', {
      ok: true,
      room,
      fileId,
    });


  }


  @SubscribeMessage('file_update')
  async fileUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { fileId: number; context: string },
  ) {
    const user = await this.appService.verifyToken(client.handshake)

    const fileId = Number(payload.fileId);
    const room = `file:${fileId}`;

    const hasAccess = await this.appService.userHasAccessToFile(user.sub, fileId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const updated = await this.appService.updateFile(user.sub, fileId, payload.context);

    this.server.to(room).emit('file_updated', {fileId, context: updated.context, updatedBy: user.sub});

    return {
      ok: true,
      fileId,
    };
  }
}
