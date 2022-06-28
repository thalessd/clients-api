import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/app.config';
import { Neo4jModule, Neo4jConfig } from 'nest-neo4j/dist';
import { ClientsModule } from './modules/clients/clients.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
    }),
    Neo4jModule.forRootAsync({
      useFactory: (configService: ConfigService) =>
        <Neo4jConfig>{
          scheme: configService.get<string>('neo4j.scheme'),
          host: configService.get<string>('neo4j.host'),
          port: configService.get<number>('neo4j.port'),
          username: configService.get<string>('neo4j.username'),
          password: configService.get<string>('neo4j.password'),
          database: configService.get<string>('neo4j.database'),
        },
      inject: [ConfigService],
    }),
    ClientsModule,
  ],
})
export class AppModule {}
