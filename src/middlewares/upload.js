import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter(_, file, cb) {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF allowed"));
    }
    cb(null, true);
  },
});
