interface SanitizedFile {
    originalFilename: string;
    mimetype: string;
    size: number;
    buffer?: Buffer;
  }





  export { SanitizedFile }