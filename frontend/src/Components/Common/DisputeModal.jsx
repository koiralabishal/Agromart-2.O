import React, { useState, useEffect } from "react";
import { FaTimes, FaExclamationTriangle, FaCloudUploadAlt, FaImages } from "react-icons/fa";
import "./Styles/DisputeModal.css";

const DisputeModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Raise a Dispute",
  orderID,
  withdrawalID,
  transactionUUID,
  sellerID,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    reason: "",
    description: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Reset form when opening
      setFormData({ reason: "", description: "" });
      setSelectedFiles([]);
      setPreviews([]);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 5) {
      alert("You can only upload up to 5 images.");
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const reasons = [
    "Product Not Received",
    "Damaged Product",
    "Wrong Item",
    "Payment Issue",
    "Withdrawal Failure",
    "Incorrect Amount",
    "Other"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.reason || !formData.description) return;
    
    onConfirm({
      ...formData,
      orderID,
      withdrawalID,
      transactionUUID,
      sellerID,
      evidenceDocuments: selectedFiles
    });
  };

  if (!isOpen) return null;

  return (
    <div className="dispute-modal-overlay" onClick={onClose}>
      <div className="dispute-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="dispute-modal-header">
          <div className="dm-header-left">
            <div className="dm-warning-icon">
              <FaExclamationTriangle />
            </div>
            <div className="dm-title-group">
              <h3>{title}</h3>
              <p>
                {orderID && `Order #${orderID}`}
                {withdrawalID && `Withdrawal Ref: ${withdrawalID}`}
                {!orderID && !withdrawalID && transactionUUID && `Transaction: ${transactionUUID.substring(0,8)}...`}
              </p>
            </div>
          </div>
          <button className="dm-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dispute-modal-body">
          <div className="dm-form-section">
            <label>Select Reason</label>
            <div className="dm-select-wrapper">
              <select 
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required
              >
                <option value="" disabled>Choose a reason...</option>
                {reasons.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="dm-form-section">
            <label>Detailed Description</label>
            <textarea 
              placeholder="Please provide details about your issue. Be as specific as possible to help us reach a resolution faster."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          <div className="dm-form-section">
            <label>Evidence (Photos)</label>
            <div 
              className="dm-upload-zone" 
              onClick={() => document.getElementById('dispute-file-input').click()}
            >
              <FaCloudUploadAlt className="upload-icon" />
              <p>Click to upload photos <span>(Optional)</span></p>
              <input 
                id="dispute-file-input"
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            {previews.length > 0 && (
              <div className="dm-preview-grid">
                {previews.map((url, index) => (
                  <div key={index} className="dm-preview-item">
                    <img src={url} alt={`Preview ${index}`} />
                    <button 
                      type="button" 
                      className="dm-remove-preview" 
                      onClick={() => removeImage(index)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="dm-evidence-hint">
              <FaImages /> 
              Supported: JPG, PNG. Max 5 images.
            </div>
          </div>

          <div className="dispute-modal-footer">
            <button type="button" className="dm-btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="dm-btn-primary" disabled={isLoading || !formData.reason || !formData.description}>
              {isLoading ? "Submitting..." : "Submit Dispute"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisputeModal;
