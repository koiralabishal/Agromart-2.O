import React, { useState, useRef } from "react";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import "./Styles/AddInventoryView.css";

const AddInventoryView = ({ onBack }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setImagePreview(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="add-product-container">
      <div className="pm-header">
        <h2>Add To Inventory</h2>
      </div>

      <div className="add-product-card">
        <div className="ap-form-header">
          <h3>Inventory Details</h3>
          <p>Add new stock items to your collection center inventory.</p>
        </div>

        <form className="ap-form">
          <div className="ap-form-grid">
            <div className="ap-form-group">
              <label>Item Name</label>
              <input type="text" placeholder="e.g., Red Tomatoes" required />
            </div>

            <div className="ap-form-group">
              <label>Category</label>
              <select required>
                <option value="">Select a category</option>
                <option value="Vegetable">Vegetable</option>
                <option value="Fruit">Fruit</option>
                <option value="Grains">Grains</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="ap-form-group">
              <label>Quantity In Stock (e.g., in kg)</label>
              <input type="text" placeholder="e.g., 1000" required />
            </div>

            <div className="ap-form-group">
              <label>Storage Location</label>
              <input type="text" placeholder="e.g., Cold Storage A1" required />
            </div>

            <div className="ap-form-group full-width">
              <label>Last Updated</label>
              <div className="date-input-wrapper">
                 <input type="date" required />
              </div>
            </div>

            <div className="ap-form-group full-width">
              <label>Item Image</label>
              <div 
                className={`ap-upload-area ${imagePreview ? 'has-preview' : ''}`} 
                onClick={triggerFileInput}
              >
                {imagePreview ? (
                  <div className="ap-preview-wrapper">
                    <div className="ap-preview-card">
                      <img src={imagePreview} alt="Preview" className="ap-preview-img" />
                      <button type="button" className="ap-remove-img" onClick={removeImage}>
                        <FaTimes />
                      </button>
                      <div className="ap-file-info">
                        <span className="ap-file-name">{fileName}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <FaCloudUploadAlt className="ap-upload-icon" />
                    <p>Upload Item Image</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  style={{ display: 'none' }} 
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </div>
          </div>

          <div className="ap-form-footer">
            <button type="button" className="ap-cancel-btn" onClick={onBack}>
              Cancel
            </button>
            <button type="submit" className="ap-submit-btn" onClick={(e) => {
              e.preventDefault();
              alert("Item added to inventory successfully!");
            }}>
              Add to Inventory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventoryView;
