import { Injectable } from '@nestjs/common';
import {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  ContainerSASPermissions,
  BlockBlobClient,
} from '@azure/storage-blob';
import { v1 as uuidv1 } from 'uuid';
import { ConfigService } from '@nestjs/config';

const DEFAULT_CONTAINER = 'test-container';
@Injectable()
export class AzureFileUploadService {
  private blobServiceClient: any;
  private azureStorageConnectionString: string;
  private defaultContainer: string;
  constructor(private configService: ConfigService) {
    this.azureStorageConnectionString = this.configService.get<string>(
      'AZURE_STORAGE_CONNECTION_STRING',
    );
    this.defaultContainer = this.configService.get<string>(
      'AZURE_STORAGE_DEFAULT_COTAINER',
    );
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      this.azureStorageConnectionString,
    );
  }

  async uploadBlobFile(file: any, containerName: string): Promise<any> {
    // Create a unique name for the blob
    const blobName = `${file.originalname
      .split('.')
      .shift()}-${uuidv1()}.${file.originalname.split('.').pop()}`;
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    console.log('\nUploading to Azure storage as blob:\n\t', blobName);

    // Upload data to the blob
    const uploadBlobResponse = await blockBlobClient.upload(
      file.buffer,
      file.size,
    );
    console.log(
      'Blob was uploaded successfully. requestId: ',
      uploadBlobResponse.requestId,
    );
    return blobName;
  }

  async getBlobObject(containerName: string, blobName: string): Promise<any> {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const blobBuffer = await blockBlobClient.downloadToBuffer();
    return {
      contentBaseEncoded: blobBuffer.toString('utf8'),
      fileName: blobName,
      containerName,
    };
  }

  async getDownloadUrl(blob: { containerName: string; blobName: string }): Promise<any> {
    const {containerName, blobName} = blob;
    const blobServiceClient = new BlobServiceClient(
      this.blobServiceClient.url,
      this.blobServiceClient.credential,
    );
    const blobSAS = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: ContainerSASPermissions.parse('r'),
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 5 * 60 * 1000),
      },
      this.blobServiceClient.credential,
    ).toString();
    const sasUrl = `${blobServiceClient.url}${containerName}/${blobName}?${blobSAS}`;
    return sasUrl;
  }

  async deleteBlobObject(containerName: string, blobName: string) {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return await blockBlobClient.deleteIfExists();
  }

  async createContainer(containerName: string): Promise<any> {
    // Create a unique name for the container
    containerName = containerName + uuidv1();
    // Get a reference to a container
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);

    // Create the container
    const createContainerResponse = await containerClient.create();
    console.log(
      'Container was created successfully. requestId: ',
      createContainerResponse.requestId,
    );

    return containerName;
  }

  async getContainers() {
    const containers = [];
    let i = 1;
    for await (const container of this.blobServiceClient.listContainers()) {
      console.log(`Container ${i++}: ${container.name}`);
      containers.push(container.name);
    }
    return { containers };
  }

  async getContainersContent(containerName: string) {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    const content = [];
    for await (const item of containerClient.listBlobsByHierarchy('/')) {
      if (item.kind === 'prefix') {
        console.log(`\tBlobPrefix: ${item.name}`);
      } else {
        console.log(
          `\tBlobItem: name - ${item.name}, last modified - ${item.properties.lastModified}`,
        );
      }
      content.push(item.name);
    }
    return { content };
  }

  async deleteContainer(containerName: string) {
    return await this.blobServiceClient.deleteContainer(containerName);
  }

  async uploadToBlobBase64(baseInputDto: any) {
    const { contentBase, fileName, containerName } = baseInputDto;
    // Create a unique name for the blob
    const blobName = `${fileName.split('.').shift()}-${uuidv1()}.base64`;
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    console.log('\nUploading to Azure storage as blob:\n\t', blobName);

    // Upload data to the blob
    const uploadBlobResponse = await blockBlobClient.upload(
      contentBase,
      contentBase.length,
    );
    console.log(
      'Blob was uploaded successfully. requestId: ',
      uploadBlobResponse.requestId,
    );
    return blobName;
  }

  async accessResource(request: {url: string}): Promise<any> {
    try {
      const blockBlobClient = new BlockBlobClient(request.url);
      await blockBlobClient.downloadToFile(__dirname + '/../nkar.jpeg');
  } catch (err) {
    console.log(err)
  }
    return __dirname;
  }
}
