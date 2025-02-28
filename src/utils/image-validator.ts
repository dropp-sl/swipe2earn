import {
  HttpException,
  HttpStatus,
  ParseFilePipeBuilder,
} from '@nestjs/common';

export const ImageValidator = new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: 'jpeg',
  })
  .addFileTypeValidator({
    fileType: 'png',
  })
  .addFileTypeValidator({
    fileType: 'jpg',
  })
  .addMaxSizeValidator({
    maxSize: 10000,
  })
  .build({
    exceptionFactory(error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    },
  });

export const getFileUrl = (file) =>
  `${process.env.ORACLE_BUCKET_BASE_URL}/${file.originalname || file.filename}`;

export const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[arr.length - 1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};
