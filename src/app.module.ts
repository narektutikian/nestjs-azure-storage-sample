import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AzureFileUploadService } from './azure-file-upload.service';
import { ConfigModule } from '@nestjs/config';
import { ContainerController } from './container.controller';
import { BlobsController } from './blobs.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController, ContainerController, BlobsController],
  providers: [AppService, AzureFileUploadService],
})
export class AppModule {}
