import { Module } from '@nestjs/common';
import { WSGateway } from './web-socket-gateway.service';

@Module({
  providers: [WSGateway],
})
export class WSModule {}
