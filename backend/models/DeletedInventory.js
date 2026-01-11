import { inventorySchema } from './Inventory.js';
import { backupConnection } from '../config/db.js';

// Create a model using the backup database connection
const DeletedInventory = backupConnection.model('DeletedInventory', inventorySchema);

export default DeletedInventory;
