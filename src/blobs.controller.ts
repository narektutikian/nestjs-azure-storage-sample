import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  Body,
  Get,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AzureFileUploadService } from './azure-file-upload.service';

@Controller('blobs')
export class BlobsController {
  constructor(private readonly blobService: AzureFileUploadService) {}

  @Post('/upload/:containerName')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('containerName') containerName: string,
    @UploadedFile() file: object,
  ) {
    console.log(file);
    return await this.blobService.uploadBlobFile(file, containerName);
  }

  @Post('/upload-base')
  async uploadBase(@Body() body: any) {
    return this.blobService.uploadToBlobBase64(body);
  }

  @Get('/:containerName/:blobName')
  async getFileFromBlob(
    @Param('containerName') containerName: string,
    @Param('blobName') fileName: string,
  ) {
    return await this.blobService.getBlobObject(containerName, fileName);
  }

  @Delete('/:containerName/:blobName')
  async deleteBlob(
    @Param('containerName') containerName: string,
    @Param('blobName') fileName: string,
  ) {
    return await this.blobService.deleteBlobObject(containerName, fileName);
  }

  @Post('/download-url')
  async getDownloadUrl(
    @Body() body: { containerName: string; blobName: string },
  ): Promise<any> {
    return await this.blobService.getDownloadUrl(body);
  }
}
