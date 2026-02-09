import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { KeycloakModule } from './modules/keycloak/keycloak.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.ENV === 'prod' ? '.prod.env' : '.test.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRESQL_HOST,
      port: parseInt(process.env.POSTGRESQL_PORT || '5432'),
      username: process.env.POSTGRESQL_USER,
      password: process.env.POSTGRESQL_PASS,
      database: process.env.POSTGRESQL_DB,
      entities: [],
      synchronize: true,
      //autoLoadEntities: true
    }),

    KeycloakModule,
  ],
  providers: [],
  controllers: [AppController],
})
export class AppModule {}
