import { Test, TestingModule } from '@nestjs/testing';
import { AzureFileUploadService } from './azure-file-upload.service';

describe('AzureFileUploadService', () => {
  let service: AzureFileUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AzureFileUploadService],
    }).compile();

    service = module.get<AzureFileUploadService>(AzureFileUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
