// oci-storage.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  ObjectStorageClient,
  requests,
  responses,
  UploadManager,
} from 'oci-objectstorage';
import {
  ConfigFileReader,
  Region,
  SimpleAuthenticationDetailsProvider,
} from 'oci-common';
import { v4 as uuidv4 } from 'uuid';
import { ERROR_DELETE, ERROR_UPLOAD } from 'src/constants/error.contant';
import { UploadRequest } from 'oci-objectstorage/lib/upload-manager/upload-request';
import {
  Content,
  RequestDetails,
} from 'oci-objectstorage/lib/upload-manager/types';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import { EnvVariables } from 'src/utils/env';

type CommonOciRequestArgs = {
  namespaceName: string;
  bucketName: string;
};

@Injectable()
export class OciStorageService {
  private objectStorageClient: ObjectStorageClient;
  private uploadManager: UploadManager;
  private commonArgs: CommonOciRequestArgs;
  private readonly namespace: string;
  private readonly bucketName: string;

  constructor() {
    // Logging the initialization of the service
    console.log('Initializing OCI Object Storage Service...');
    // Setting up OCI authentication using credentials from environment variables
    const provider = new SimpleAuthenticationDetailsProvider(
      EnvVariables.oci.tenancyId,
      EnvVariables.oci.userId,
      EnvVariables.oci.fingerprint,
      EnvVariables.oci.privateKey,
      null,
      Region.fromRegionId(EnvVariables.oci.region),
    );

    // Initializing the Object Storage client with the authentication provider
    this.objectStorageClient = new ObjectStorageClient({
      authenticationDetailsProvider: provider,
    });
    this.uploadManager = new UploadManager(this.objectStorageClient, {
      enforceMD5: true,
    });

    this.commonArgs = {
      namespaceName: EnvVariables.oci.namespace,
      bucketName: EnvVariables.oci.bucketName,
    };

    console.log('DEBUG: OCI Namespace ->', EnvVariables.oci.namespace);
    console.log('DEBUG: OCI Bucket Name ->', EnvVariables.oci.bucketName);
    console.log('DEBUG: OCI Region ->', EnvVariables.oci.region);
    console.log('DEBUG: Storage Platform ->', EnvVariables.storagePlatform);
    console.log('DEBUG: OCI Tenancy ID ->', EnvVariables.oci.tenancyId);
    console.log('DEBUG: OCI User ID ->', EnvVariables.oci.userId);
    console.log('DEBUG: OCI Fingerprint ->', EnvVariables.oci.fingerprint);
    console.log('DEBUG: OCI Private Key ->', EnvVariables.oci.privateKey);
    console.log('OCI Storage Service ready');
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return this.uploadFile(file, 'images');
  }

  async deleteImage(objectName: string): Promise<void> {
    return this.deleteFile(objectName, 'images');
  }

  async uploadGeneratedImage(file: Express.Multer.File): Promise<string> {
    try {
      await this.upload('generated-images', file);
      return `https://${this.namespace}.objectstorage.${process.env.OCI_REGION}.oraclecloud.com/n/${this.namespace}/b/${this.bucketName}/o/${file.filename}.png`;
    } catch (error) {
      console.error(ERROR_UPLOAD, error);
      throw new HttpException(ERROR_UPLOAD, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async upload(fileName: string, file: Express.Multer.File) {
    console.log('Uploading to OCI');
    console.log(
      `Uploading object to bucket "${this.commonArgs.bucketName}" with name "${fileName}"...`,
    );
    try {
      await this.uploadManager.upload({
        singleUpload: true,
        content: {
          blob: new Blob([file.buffer], { type: file.mimetype }),
        },
        // content: {
        //   filePath: join(directoryPath, filename)
        // },
        requestDetails: {
          namespaceName: EnvVariables.oci.namespace,
          bucketName: EnvVariables.oci.bucketName,
          objectName: fileName,
        },
      });
      console.log(fileName);
      return `https://objectstorage.${EnvVariables.oci.region}.oraclecloud.com/n/${EnvVariables.oci.namespace}/b/${EnvVariables.oci.bucketName}/o/${fileName}`;
    } catch (ex) {
      console.error(`Failed due to ${ex}`);
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const filePath = `${folder}/${uuidv4()}-${file?.originalname?.trim()}`;

    const directoryPath = path.dirname(filePath);

    // Ensure the directory exists before writing the file
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    fs.writeFileSync(filePath, file.buffer);

    // Define `Content` as required by OCI SDK
    const content: Content = {
      stream: fs.createReadStream(filePath) as Readable, // ✅ Ensuring correct BinaryBody type
    };

    // Define `RequestDetails` for OCI UploadManager
    const uploadRequest: UploadRequest = {
      requestDetails: {
        namespaceName: this.namespace, // ✅ Ensure this exists
        bucketName: this.bucketName,
        objectName: filePath,
        contentType: file.mimetype,
      },
      content: {
        stream: fs.createReadStream(filePath),
      },
      singleUpload: true,
    };

    try {
      const uploadResponse = await this.uploadManager.upload(uploadRequest);
      fs.unlinkSync(filePath); // ✅ Clean up temp file

      console.log('Upload response:', uploadResponse);

      return `https://${this.namespace}.objectstorage.${process.env.OCI_REGION}.oraclecloud.com/n/${this.namespace}/b/${this.bucketName}/o/${filePath}`;
    } catch (error) {
      console.error(ERROR_UPLOAD, error);
      throw new HttpException(ERROR_UPLOAD, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async deleteFile(objectName: string, folder: string): Promise<void> {
    const fileKey = `${folder}/${objectName}`;

    try {
      await this.objectStorageClient.deleteObject({
        namespaceName: this.namespace,
        bucketName: this.bucketName,
        objectName: fileKey,
      });
    } catch (error) {
      console.error('Error deleting file from OCI:', error);
      throw new HttpException(ERROR_DELETE, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async fetch(objectName: string) {
    console.log(
      `Fetching object "${objectName}" from bucket "${this.commonArgs.bucketName}"...`,
    );
    try {
      const getRequest: requests.GetObjectRequest = {
        ...this.commonArgs,
        objectName,
      };

      const response: responses.GetObjectResponse =
        await this.objectStorageClient.getObject(getRequest);
      console.log(
        `Object "${objectName}" fetched successfully from bucket "${this.commonArgs.bucketName}".`,
      );
      return response.value;
    } catch (error) {
      console.error(
        `Error fetching object "${objectName}" from bucket "${this.commonArgs.bucketName}":`,
        error,
      );
      throw error;
    }
  }

  async delete(objectName: string) {
    console.log(
      `Deleting object "${objectName}" from bucket "${this.commonArgs.bucketName}"...`,
    );
    try {
      const deleteRequest: requests.DeleteObjectRequest = {
        ...this.commonArgs,
        objectName,
      };

      const response: responses.DeleteObjectResponse =
        await this.objectStorageClient.deleteObject(deleteRequest);
      console.log(
        `Object "${objectName}" deleted successfully from bucket "${this.commonArgs.bucketName}".`,
      );
      return response;
    } catch (error) {
      console.error(
        `Error deleting object "${objectName}" from bucket "${this.commonArgs.bucketName}":`,
        error,
      );
      throw error;
    }
  }
}
