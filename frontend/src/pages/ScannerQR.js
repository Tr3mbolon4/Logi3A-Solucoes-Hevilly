import React from "react";
import { Scanner } from "../components/Scanner";

export default function ScannerQR() {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in" data-testid="scanner-qr-page">
      <Scanner type="qrcode" />
    </div>
  );
}
