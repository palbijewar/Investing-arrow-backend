import * as AWS from 'aws-sdk';
import multerS3 from 'multer-s3';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const bucketName = process.env.AWS_BUCKET_NAME as string;

export const multerOptions: MulterOptions = {
  storage: multerS3({
    s3: s3, 
    bucket: bucketName,
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = `payment_uploads/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
};
