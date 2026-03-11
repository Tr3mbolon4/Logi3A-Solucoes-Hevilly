import React from "react";
import { Scanner } from "../components/Scanner";

export default function ScannerBarcode() {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in" data-testid="scanner-barcode-page">
      <Scanner type="barcode" />
    </div>
  );
}
