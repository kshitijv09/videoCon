const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const socketIOFile = require("socket.io-file");

const uploader = new socketIOFile(server, {
  uploadDir: "uploads", // Directory to save the uploaded files
  accepts: ["image/*", "application/pdf"], // Specify the allowed file types
  maxFileSize: 10 * 1024 * 1024, // Max file size (in bytes)
  chunkSize: 10240, // Chunk size (in bytes)
  transmissionDelay: 0, // Delay between chunks (in milliseconds)
  overwrite: true, // Overwrite files with the same name
  rename(filename, fileInfo) {
    const fileExt = fileInfo.name.split(".").pop();
    return `${filename}.${fileExt}`; // Rename the file with original extension
  },
});

module.exports = uploader;
