import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'entities/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Files } from 'entities/files.entity';
import { FilesAccess } from 'entities/filesaccess.entity';
import { WsGateway } from './ws/ws.gateway';
import { CacheModule } from '@nestjs/cache-manager';
import { Keyv } from 'keyv';
import KeyvRedis from '@keyv/redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
     TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'admin',
      database: 'test',
      entities: [Users, Files, FilesAccess],
      synchronize: true,
    }),

    // JWT ni applicationga qoshish
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY'),
        signOptions: { expiresIn: '1d' },
      }),
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl =
          configService.get<string>('REDIS_URL') ||
          'redis://localhost:6379';

        return {
          ttl: 60_000,
          stores: [
            new Keyv({
              store: new KeyvRedis(redisUrl),
            }),
          ],
        };
      },
    }),
    

  ],
  controllers: [AppController],
  providers: [AppService, WsGateway],
})
export class AppModule {}
