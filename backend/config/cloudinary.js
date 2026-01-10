import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "documents",
    resource_type: "auto",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     return {
//       folder: "documents",
//       resource_type: "auto",
//       public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
//     };
//   },
// });

// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     const allowed = [
//       "image/jpeg",
//       "image/png",
//       "image/jpg",
//       "application/pdf",
//     ];

//     if (!allowed.includes(file.mimetype)) {
//       return cb(new Error("Only images and PDFs are allowed"));
//     }
//     cb(null, true);
//   },
// });


const upload = multer({ storage: storage });

export { cloudinary, upload };
