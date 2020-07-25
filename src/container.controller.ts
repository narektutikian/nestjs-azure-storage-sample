import { Controller, Post, Param, Get, Delete } from '@nestjs/common';
import { AzureFileUploadService } from './azure-file-upload.service';

@Controller('containers')
export class ContainerController {
  constructor(private readonly containerService: AzureFileUploadService) {}

  @Post('/:name')
  async createContainer(@Param('name') name: string) {
    return await this.containerService.createContainer(name);
  }

  @Get()
  async getContainers() {
    return await this.containerService.getContainers();
  }

  @Get('/:name')
  async getContainersContent(@Param('name') name: string) {
    return await this.containerService.getContainersContent(name);
  }

  @Delete('/:name')
  async deleteContainer(@Param('name') name: string) {
    return await this.containerService.deleteContainer(name);
  }
}
