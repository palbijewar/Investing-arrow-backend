import { Injectable } from '@nestjs/common';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import sharp from 'sharp';
import { Readable } from 'stream';
import { UploadResult } from './dto/payment-options.dto'; 
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION')! || 'ca-central-1',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    });
  }

  async uploadFiles(
    files: Express.Multer.File[],
    bucket: string,
    prefix: string,
  ): Promise<UploadResult[]> {
    const uploadResults: UploadResult[] = [];
    console.log(this.configService.get<string>('AWS_REGION')!);
    for (const file of files) {
      const key = `${prefix}/${Date.now()}_${file.originalname}`;
      let thumb: Buffer, thumbKey: string, thumbnail: any;

      if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        thumb = await sharp(file.buffer).resize(200, 200).toBuffer();
        thumbKey = `${prefix}/${Date.now()}_thumbnail_${file.originalname}`;
        thumbnail = await this.uploadFile(
          thumb,
          bucket,
          thumbKey,
          file.mimetype,
          'inline',
        );
      }

      const file_upload: any = await this.uploadFile(
        file.buffer,
        bucket,
        key,
        file.mimetype,
        'inline',
      );

      const uploadResult: UploadResult = {
        file_name: file.originalname,
        file_path: file_upload.Location,
        file_type: file.mimetype,
        file_key: file_upload.Key,
        thumbnail_key: thumbnail?.Key,
        thumbnail_path: thumbnail ? thumbnail.Location : null,
      };

      uploadResults.push(uploadResult);
    }

    return uploadResults;
  }

  async uploadFile(
    fileBuffer: Buffer,
    bucket: string,
    key: string,
    mimeType: string,
    disposition: string,
  ) {
    console.log({  bucket,
      key,
      mimeType,
      disposition});
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
        ContentDisposition: disposition,
      },
    });
    console.log({upload});
    
    return await upload.done();
  }

  async getPdfBuffer(bucket: string, fileKey: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: fileKey,
    });

    const data = await this.s3Client.send(command);
    const body = data.Body as Readable;

    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      body.on('data', (chunk) => {
        chunks.push(chunk);
      });

      body.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      body.on('error', (error) => {
        reject(error);
      });
    });
  }

  async getObject(bucket: string, key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const response = await this.s3Client.send(command);

    const stream = response.Body as Readable;

    if (!(response.Body instanceof Readable)) {
      throw new Error('Response body is not a readable stream');
    }

    return new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      stream
        .on('data', (chunk) => {
          chunks.push(chunk);
        })
        .on('error', (error) => {
          console.error(`>> Error while getting file from S3:\n${error}`);
          reject(error);
        })
        .on('end', () => {
          const data = Buffer.concat(chunks).toString('utf-8');
          resolve(data);
        });
    });
  }
}