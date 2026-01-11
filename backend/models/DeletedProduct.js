import { productSchema } from "./Product.js";
import { backupConnection } from "../config/db.js";

// Create a model using the backup database connection
const DeletedProduct = backupConnection.model("DeletedProduct", productSchema);

export default DeletedProduct;
