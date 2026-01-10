import React, { useState, useRef } from "react";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import "./Styles/AddProductView.css";

const AddProductView = ({ onBack }) => {
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
        <h2>Add New Product</h2>
      </div>

      <div className="add-product-card">
        <div className="ap-form-header">
          <h3>Product Details</h3>
          <p>Enter the details for your new agricultural product.</p>
        </div>

        <form className="ap-form">
          <div className="ap-form-grid">
            {/* ... form fields ... */}
            <div className="ap-form-group">
              <label>Product Name</label>
              <input type="text" placeholder="e.g., Organic Tomatoes" required />
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
              <label>Quantity (e.g., in kg, pieces)</label>
              <input type="text" placeholder="e.g., 500" required />
            </div>

            <div className="ap-form-group">
              <label>Expected Price (per unit)</label>
              <input type="text" placeholder="e.g., 2.50" required />
            </div>

            <div className="ap-form-group full-width">
              <label>Availability Date</label>
              <div className="date-input-wrapper">
                 <input type="date" required />
              </div>
            </div>

            <div className="ap-form-group full-width">
              <label>Product Image</label>
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
                    <p>Upload Product Image</p>
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
              onBack();
            }}>
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductView;
