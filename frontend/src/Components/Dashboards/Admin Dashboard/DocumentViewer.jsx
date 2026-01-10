import React from "react";
import { useSearchParams } from "react-router-dom";
import {
  FaFileImage,
  FaArrowLeft,
  FaDownload,
  FaPrint,
} from "react-icons/fa";

const DocumentViewer = () => {
  const [searchParams] = useSearchParams();
  const file = searchParams.get("file");
  const type = searchParams.get("type");
  const url = searchParams.get("url");

  if (!url) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#333",
          color: "white",
        }}
      >
        <h2>Invalid Document URL</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#333",
        color: "white",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Viewer Header */}
      <header
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: "#222",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <FaFileImage color="#3b82f6" size={20} />
          <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>
            {file || "Unknown Document"}
          </span>
        </div>

        <div style={{ display: "flex", gap: "1.5rem" }}>
          <button
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
            }}
            title="Print"
            onClick={() => window.print()}
          >
            <FaPrint />
          </button>
          <a
            href={url}
            download
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "white", textDecoration: "none" }}
            title="Download"
          >
            <FaDownload />
          </a>
        </div>
      </header>

      {/* Primary View Area */}
      <main
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          backgroundColor: "#525659",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            overflow: "auto",
          }}
        >
          <img
            src={url}
            alt="Document Preview"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              boxShadow: "0 0 20px rgba(0,0,0,0.5)",
              backgroundColor: "white",
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default DocumentViewer;
