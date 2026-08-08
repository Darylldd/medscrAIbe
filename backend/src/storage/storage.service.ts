import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('STORAGE_BUCKET')!;

    this.client = new S3Client({
      endpoint: this.configService.get<string>('STORAGE_ENDPOINT'),
      region: this.configService.get<string>('STORAGE_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('STORAGE_ACCESS_KEY')!,
        secretAccessKey: this.configService.get<string>('STORAGE_SECRET_KEY')!,
      },
      forcePathStyle: true,
    });
  }

  async uploadBuffer(key: string, buffer: Buffer, contentType: string): Promise<void> {
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      },
    });

    await upload.done();
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }
}