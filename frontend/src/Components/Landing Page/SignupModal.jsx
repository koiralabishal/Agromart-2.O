import React from "react";
import {
  FaArrowLeft,
  FaSeedling,
  FaTruckMoving,
  FaWarehouse,
  FaShoppingCart,
} from "react-icons/fa";
import FarmerForm from "./forms/FarmerForm";
import CollectorForm from "./forms/CollectorForm";
import SupplierForm from "./forms/SupplierForm";
import BuyerForm from "./forms/BuyerForm";

const SignupModal = ({
  showSignupPopup,
  toggleSignupPopup,
  signupStep,
  setSignupStep,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  getPaymentPlaceholder,
  filePreviews,
  setFilePreviews,
  handleFileChange,
  removeFile,
}) => {
  if (!showSignupPopup) return null;

  const handleBack = () => {
    if (signupStep === "role") {
      toggleSignupPopup();
    } else {
      setSignupStep("role");
      setSelectedPaymentMethod("");
      // Clean up preview URLs
      Object.values(filePreviews).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
      setFilePreviews({ farmer: null, collector: null, supplier: null });
    }
  };

  return (
    <div className="signup-overlay">
      <div
        className={`signup-card ${signupStep !== "role" ? "wide-card" : ""}`}
      >
        <button className="back-arrow-btn" onClick={handleBack}>
          <FaArrowLeft />
        </button>

        {signupStep === "role" ? (
          <>
            <h2>Choose Your Role</h2>
            <p className="signup-subtitle">
              Select the role that best describes your involvement in the
              AgroMart marketplace.
            </p>

            <div className="role-grid">
              <div className="role-card" onClick={() => setSignupStep("farmer")}>
                <div className="role-icon">
                  <FaSeedling />
                </div>
                <h3>Farmer</h3>
              </div>

              <div
                className="role-card"
                onClick={() => setSignupStep("collector")}
              >
                <div className="role-icon">
                  <FaTruckMoving />
                </div>
                <h3>Collector</h3>
              </div>

              <div
                className="role-card"
                onClick={() => setSignupStep("supplier")}
              >
                <div className="role-icon">
                  <FaWarehouse />
                </div>
                <h3>Supplier</h3>
              </div>

              <div className="role-card" onClick={() => setSignupStep("buyer")}>
                <div className="role-icon">
                  <FaShoppingCart />
                </div>
                <h3>Buyer</h3>
              </div>
            </div>
          </>
        ) : signupStep === "farmer" ? (
          <FarmerForm
            selectedPaymentMethod={selectedPaymentMethod}
            setSelectedPaymentMethod={setSelectedPaymentMethod}
            getPaymentPlaceholder={getPaymentPlaceholder}
            filePreviews={filePreviews}
            handleFileChange={handleFileChange}
            removeFile={removeFile}
          />
        ) : signupStep === "collector" ? (
          <CollectorForm
            selectedPaymentMethod={selectedPaymentMethod}
            setSelectedPaymentMethod={setSelectedPaymentMethod}
            getPaymentPlaceholder={getPaymentPlaceholder}
            filePreviews={filePreviews}
            handleFileChange={handleFileChange}
            removeFile={removeFile}
          />
        ) : signupStep === "supplier" ? (
          <SupplierForm
            selectedPaymentMethod={selectedPaymentMethod}
            setSelectedPaymentMethod={setSelectedPaymentMethod}
            getPaymentPlaceholder={getPaymentPlaceholder}
            filePreviews={filePreviews}
            handleFileChange={handleFileChange}
            removeFile={removeFile}
          />
        ) : (
          <BuyerForm
            selectedPaymentMethod={selectedPaymentMethod}
            setSelectedPaymentMethod={setSelectedPaymentMethod}
            getPaymentPlaceholder={getPaymentPlaceholder}
          />
        )}
      </div>
    </div>
  );
};

export default SignupModal;
