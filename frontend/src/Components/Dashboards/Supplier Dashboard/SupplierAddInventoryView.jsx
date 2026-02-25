import React, { useState, useRef } from "react";
import {
  FaCloudUploadAlt,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import RecommendedPricePopup from "./RecommendedPricePopup";
import api from "../../../api/axiosConfig";
import "./Styles/SupplierAddInventoryView.css";

const SupplierAddInventoryView = ({ onBack, onItemAdded }) => {
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    quantity: "",
    unit: "",
    price: "",
    productDescription: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successPopup, setSuccessPopup] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [addedItemName, setAddedItemName] = useState("");
  const [showRecommendedPricePopup, setShowRecommendedPricePopup] =
    useState(false);

  const fileInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));

  // Lock body scroll when success popup or duplicate warning is open
  React.useEffect(() => {
    if (successPopup || duplicateWarning) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [successPopup, duplicateWarning]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFocus = (e) => {
    const { name } = e.target;
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      if (errors.productImage) {
        setErrors((prev) => ({ ...prev, productImage: "" }));
      }
    }
  };

  const triggerFileInput = () => {
    if (errors.productImage) {
      setErrors((prev) => ({ ...prev, productImage: "" }));
    }
    fileInputRef.current.click();
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.productName.trim())
      newErrors.productName = "Item name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.quantity) {
      newErrors.quantity = "Quantity is required";
    } else if (parseFloat(formData.quantity) < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    }
    if (!formData.unit) newErrors.unit = "Unit is required";
    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (parseFloat(formData.price) < 0) {
      newErrors.price = "Price cannot be negative";
    }

    if (!formData.productDescription.trim()) {
      newErrors.productDescription = "Description is required";
    } else {
      const wordCount = formData.productDescription.trim().split(/\s+/).length;
      if (wordCount < 15) {
        newErrors.productDescription = `Description must be at least 15 words. Current: ${wordCount}`;
      }
    }

    if (!imageFile) newErrors.productImage = "Item image is required";

    return newErrors;
  };

  const handleSubmit = async (e, confirmDuplicate = false) => {
    if (e) e.preventDefault();
    setErrors({});

    // Don't close warning immediately, wait for success or error
    if (!confirmDuplicate) setDuplicateWarning(null);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("productName", formData.productName);
      data.append("category", formData.category);
      data.append("quantity", formData.quantity);
      data.append("unit", formData.unit);
      data.append("price", formData.price);
      data.append("productDescription", formData.productDescription);
      data.append("userID", user._id || user.id);
      data.append("productImage", imageFile);

      if (confirmDuplicate) {
        data.append("confirmDuplicate", "true");
      }

      const response = await api.post("/inventory", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201 || response.status === 200) {
        setAddedItemName(formData.productName);
        setDuplicateWarning(null); // Close warning if open
        setSuccessPopup(true);
        if (onItemAdded) onItemAdded();
      } else {
        setErrors({ submit: "Failed to add to inventory" });
      }
    } catch (err) {
      setDuplicateWarning(null); // Close warning on error to show form error
      if (err.response?.status === 409 && err.response?.data?.isDuplicate) {
        setDuplicateWarning(err.response.data.existingProduct);
      } else {
        setErrors({
          submit:
            err.response?.data?.message || "Network error. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to handle price confirm from popup
  const handlePriceSelect = (price) => {
    setFormData((prev) => ({ ...prev, price: price.toString() }));
    setShowRecommendedPricePopup(false);
  };

  return (
    <div className="add-product-container">
      <div className="pm-header">
        <h2>Add Item to Inventory</h2>
      </div>

      <div className="add-product-card">
        <div className="ap-form-header">
          <h3>Inventory Item Details</h3>
          <p>
            Enter the details for the stock item you are adding to your supplier
            inventory.
          </p>
        </div>

        {errors.submit && (
          <div className="ap-error-message">{errors.submit}</div>
        )}

        <form className="ap-form" onSubmit={handleSubmit} noValidate>
          <div className="ap-form-grid">
            <div className="ap-form-group">
              <label>Item Name</label>
              <input
                type="text"
                name="productName"
                placeholder="e.g., Red Potatoes"
                value={formData.productName}
                onChange={handleChange}
                onFocus={handleFocus}
                className={errors.productName ? "invalid" : ""}
                required
              />
              {errors.productName && (
                <span className="ap-field-error">{errors.productName}</span>
              )}
            </div>

            <div className="ap-form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                onFocus={handleFocus}
                className={errors.category ? "invalid" : ""}
                required
              >
                <option value="">Select a category</option>
                <option value="Vegetable">Vegetable</option>
                <option value="Fruit">Fruit</option>
                <option value="Grains">Grains</option>
                <option value="Dairy">Dairy</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && (
                <span className="ap-field-error">{errors.category}</span>
              )}
            </div>

            <div className="ap-form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                placeholder="e.g., 500"
                value={formData.quantity}
                onChange={handleChange}
                onFocus={handleFocus}
                className={errors.quantity ? "invalid" : ""}
                required
              />
              {errors.quantity && (
                <span className="ap-field-error">{errors.quantity}</span>
              )}
            </div>

            <div className="ap-form-group">
              <label>Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                onFocus={handleFocus}
                className={errors.unit ? "invalid" : ""}
                required
              >
                <option value="">Select unit</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="tonne">Metric Ton (Tonne)</option>
                <option value="quintal">Quintal</option>
                <option value="liter">Liter (L)</option>
                <option value="ml">Milliliter (ml)</option>
                <option value="piece">Piece</option>
                <option value="dozen">Dozen</option>
                <option value="bundle">Bundle</option>
                <option value="box">Box</option>
                <option value="bag">Bag</option>
                <option value="crate">Crate</option>
                <option value="sack">Sack</option>
              </select>
              {errors.unit && (
                <span className="ap-field-error">{errors.unit}</span>
              )}
            </div>

            <div className="ap-form-group">
              <label>Expected Price (per unit)</label>
              <div className="price-input-wrapper">
                <input
                  type="number"
                  name="price"
                  placeholder="e.g., 45.00"
                  value={formData.price}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  className={errors.price ? "invalid" : ""}
                  required
                />
                <button
                  type="button"
                  className="get-recommended-btn"
                  onClick={() => setShowRecommendedPricePopup(true)}
                >
                  Get Recommended Price
                </button>
              </div>
              {errors.price && (
                <span className="ap-field-error">{errors.price}</span>
              )}
            </div>

            <div className="ap-form-group full-width">
              <label>Item Description (min 15 words)</label>
              <textarea
                name="productDescription"
                placeholder="Describe the item (e.g., quality grade, origin, storage condition...)"
                value={formData.productDescription}
                onChange={handleChange}
                onFocus={handleFocus}
                className={errors.productDescription ? "invalid" : ""}
                required
                rows="4"
              ></textarea>
              <div className="ap-description-footer">
                {errors.productDescription && (
                  <span className="ap-field-error">
                    {errors.productDescription}
                  </span>
                )}
                <small className="ap-word-count">
                  Word count:{" "}
                  {formData.productDescription.trim() === ""
                    ? 0
                    : formData.productDescription.trim().split(/\s+/)
                        .length}{" "}
                  / 15
                </small>
              </div>
            </div>

            <div className="ap-form-group full-width">
              <label>Item Image</label>
              <div
                className={`ap-upload-area ${imagePreview ? "has-preview" : ""} ${errors.productImage ? "invalid" : ""}`}
                onClick={triggerFileInput}
              >
                {imagePreview ? (
                  <div className="ap-preview-wrapper">
                    <div className="ap-preview-card">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="ap-preview-img"
                      />
                      <button
                        type="button"
                        className="ap-remove-img"
                        onClick={removeImage}
                      >
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
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              {errors.productImage && (
                <span className="ap-field-error">{errors.productImage}</span>
              )}
            </div>
          </div>

          <div className="ap-form-footer">
            <button
              type="button"
              className="ap-cancel-btn"
              onClick={onBack}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="ap-submit-btn" disabled={loading}>
              {loading ? "Adding..." : "Add to Inventory"}
            </button>
          </div>
        </form>
      </div>

      {/* Duplicate Warning Popup (Improved UX) */}
      {duplicateWarning && (
        <div className="ap-success-overlay">
          <div className="ap-success-popup warning">
            <div className="warning-icon-container">
              <FaTimes
                className="warning-icon-close"
                onClick={() => setDuplicateWarning(null)}
              />
            </div>
            <div className="warning-icon-large">
              <FaExclamationTriangle
                style={{ fontSize: "4rem", color: "#f39c12" }}
              />
            </div>
            <h3 style={{ color: "#f39c12", marginTop: "1rem" }}>
              Similar Item Already Added
            </h3>
            <p style={{ marginBottom: "1.5rem" }}>
              You have already added a similar item:{" "}
              <strong style={{ fontSize: "1.1rem", color: "#333" }}>
                "{duplicateWarning.name}"
              </strong>
            </p>
            <p style={{ color: "#666", fontSize: "0.95rem" }}>
              Would you like to add <strong>"{formData.productName}"</strong>{" "}
              anyway?
            </p>
            <div className="modal-actions-row">
              <button
                className="ap-success-btn cancel-btn"
                onClick={() => setDuplicateWarning(null)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="ap-success-btn yes-btn"
                onClick={() => handleSubmit(null, true)}
                disabled={loading}
              >
                {loading ? "Adding..." : "Yes, Add Anyway"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {successPopup && (
        <div className="ap-success-overlay">
          <div className="ap-success-popup">
            <FaCheckCircle className="ap-success-icon" />
            <h3>Success!</h3>
            <p>
              Your item <strong>{addedItemName}</strong> has been added to
              inventory successfully.
            </p>
            <button className="ap-success-btn" onClick={onBack}>
              Okay
            </button>
          </div>
        </div>
      )}

      {showRecommendedPricePopup && (
        <RecommendedPricePopup
          isOpen={showRecommendedPricePopup}
          onClose={() => setShowRecommendedPricePopup(false)}
          onConfirm={handlePriceSelect}
          productName={formData.productName}
        />
      )}
    </div>
  );
};

export default SupplierAddInventoryView;
