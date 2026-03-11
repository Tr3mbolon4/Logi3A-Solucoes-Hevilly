import React, { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useApp } from "../contexts/AppContext";
import {
  parseQRContent,
  calculatePoints,
  playSuccessSound,
  playErrorSound,
  getOperationMessage,
  getOperationBadgeClass,
} from "../lib/utils";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  Package,
  MapPin,
  Hash,
  Layers,
  ArrowLeft,
  RotateCcw,
  Zap,
  SwitchCamera,
} from "lucide-react";
import { Link } from "react-router-dom";

const OPERACOES = [
  { value: "Recebimento", label: "Recebimento" },
  { value: "Expedição", label: "Expedição" },
  { value: "Estoque", label: "Estoque" },
  { value: "Logística Reversa", label: "Logística Reversa" },
  { value: "Identificação", label: "Identificação" },
];

export function Scanner({ type = "qrcode", onScanComplete }) {
  const html5QrcodeRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedOperacao, setSelectedOperacao] = useState("Identificação");
  const [cameraStatus, setCameraStatus] = useState("idle");
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const { createLeitura, findMaterialByCode, activityMode } = useApp();

  // Get available cameras on mount
  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back camera (environment facing)
          const backCamera = devices.find(
            (d) =>
              d.label.toLowerCase().includes("back") ||
              d.label.toLowerCase().includes("rear") ||
              d.label.toLowerCase().includes("traseira") ||
              d.label.toLowerCase().includes("environment")
          );
          setSelectedCamera(backCamera?.id || devices[devices.length - 1].id);
          setPermissionGranted(true);
        }
      } catch (err) {
        console.log("Error getting cameras:", err);
        // Permission not granted yet, will request when starting
      }
    };
    getCameras();
  }, []);

  const handleScanSuccess = useCallback(
    async (decodedText) => {
      // Prevent multiple rapid scans
      if (result) return;

      playSuccessSound();

      let scanResult;

      if (type === "qrcode") {
        const parsed = parseQRContent(decodedText);
        scanResult = {
          codigo: parsed.codigo || decodedText,
          produto: parsed.produto || "Produto Desconhecido",
          setor: parsed.setor || selectedOperacao,
          quantidade: parseInt(parsed.quantidade) || 1,
          tipo_operacao: selectedOperacao,
          tipo_leitura: "qrcode",
          raw: decodedText,
        };
      } else {
        const material = findMaterialByCode(decodedText);
        scanResult = {
          codigo: decodedText,
          produto: material?.nome || "Produto Não Cadastrado",
          setor: material?.setor || selectedOperacao,
          quantidade: material?.quantidade || 1,
          tipo_operacao: selectedOperacao,
          tipo_leitura: "barcode",
          localizacao: material?.localizacao || "",
        };
      }

      if (activityMode) {
        scanResult.pontuacao = calculatePoints(selectedOperacao);
      }

      setResult(scanResult);

      try {
        await createLeitura(scanResult);
      } catch (err) {
        console.error("Error saving leitura:", err);
      }

      // Stop scanner after successful read
      stopScanner();

      if (onScanComplete) {
        onScanComplete(scanResult);
      }
    },
    [result, type, selectedOperacao, findMaterialByCode, activityMode, createLeitura, onScanComplete]
  );

  const startScanner = useCallback(async () => {
    if (scanning) return;

    setResult(null);
    setError(null);
    setScanning(true);
    setCameraStatus("starting");

    try {
      // Create scanner instance if not exists
      if (!html5QrcodeRef.current) {
        html5QrcodeRef.current = new Html5Qrcode("qr-reader", {
          verbose: false,
        });
      }

      // Configuration for scanning
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      // Try to use back camera first (environment facing)
      let cameraId = selectedCamera;
      
      if (!cameraId) {
        // Request camera permission and get cameras
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Find back camera
          const backCamera = devices.find(
            (d) =>
              d.label.toLowerCase().includes("back") ||
              d.label.toLowerCase().includes("rear") ||
              d.label.toLowerCase().includes("traseira") ||
              d.label.toLowerCase().includes("environment")
          );
          cameraId = backCamera?.id || devices[devices.length - 1].id;
          setSelectedCamera(cameraId);
          setPermissionGranted(true);
        }
      }

      if (!cameraId) {
        // Fallback to facingMode if no camera ID
        await html5QrcodeRef.current.start(
          { facingMode: "environment" },
          config,
          handleScanSuccess,
          (errorMessage) => {
            // Ignore normal scanning errors
            if (!errorMessage.includes("NotFoundException")) {
              console.log("Scan error:", errorMessage);
            }
          }
        );
      } else {
        await html5QrcodeRef.current.start(
          cameraId,
          config,
          handleScanSuccess,
          (errorMessage) => {
            if (!errorMessage.includes("NotFoundException")) {
              console.log("Scan error:", errorMessage);
            }
          }
        );
      }

      setCameraStatus("active");
    } catch (err) {
      console.error("Error starting scanner:", err);
      
      let errorMsg = "Erro ao iniciar câmera.";
      if (err.message?.includes("Permission")) {
        errorMsg = "Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.";
      } else if (err.message?.includes("NotFound")) {
        errorMsg = "Nenhuma câmera encontrada no dispositivo.";
      } else if (err.message?.includes("NotReadable")) {
        errorMsg = "Câmera em uso por outro aplicativo.";
      }
      
      setError(errorMsg);
      setScanning(false);
      setCameraStatus("error");
      playErrorSound();
    }
  }, [scanning, selectedCamera, handleScanSuccess]);

  const stopScanner = useCallback(async () => {
    if (html5QrcodeRef.current) {
      try {
        const state = html5QrcodeRef.current.getState();
        if (state === 2) { // SCANNING state
          await html5QrcodeRef.current.stop();
        }
      } catch (e) {
        console.log("Error stopping scanner:", e);
      }
    }
    setScanning(false);
    setCameraStatus("idle");
  }, []);

  const resetScanner = useCallback(() => {
    setResult(null);
    setError(null);
    startScanner();
  }, [startScanner]);

  const switchCamera = useCallback(async () => {
    if (cameras.length < 2) return;
    
    const currentIndex = cameras.findIndex((c) => c.id === selectedCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];
    
    setSelectedCamera(nextCamera.id);
    
    if (scanning) {
      await stopScanner();
      setTimeout(() => {
        startScanner();
      }, 300);
    }
  }, [cameras, selectedCamera, scanning, stopScanner, startScanner]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrcodeRef.current) {
        try {
          const state = html5QrcodeRef.current.getState();
          if (state === 2) {
            html5QrcodeRef.current.stop();
          }
        } catch (e) {
          console.log("Cleanup error:", e);
        }
      }
    };
  }, []);

  const getCameraStatusBadge = () => {
    switch (cameraStatus) {
      case "starting":
        return (
          <Badge variant="outline" className="gap-1">
            <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            Iniciando câmera...
          </Badge>
        );
      case "active":
        return (
          <Badge variant="outline" className="gap-1 border-success text-success">
            <div className="w-2 h-2 rounded-full bg-success" />
            Câmera ativa
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            Erro na câmera
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <CameraOff className="w-3 h-3" />
            Câmera inativa
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="icon" data-testid="back-button">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <CardTitle className="font-heading text-xl">
                  {type === "qrcode" ? "Leitor de QR Code" : "Leitor de Código de Barras"}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Aponte a câmera traseira para o código
                </p>
              </div>
            </div>
            {getCameraStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Operation selector */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Tipo de Operação
              </label>
              <Select
                value={selectedOperacao}
                onValueChange={setSelectedOperacao}
                disabled={scanning}
              >
                <SelectTrigger data-testid="operacao-select">
                  <SelectValue placeholder="Selecione a operação" />
                </SelectTrigger>
                <SelectContent>
                  {OPERACOES.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 items-end">
              {!scanning ? (
                <Button
                  onClick={startScanner}
                  className="gap-2"
                  data-testid="start-scanner-btn"
                >
                  <Camera className="w-4 h-4" />
                  Iniciar Câmera
                </Button>
              ) : (
                <>
                  {cameras.length > 1 && (
                    <Button
                      variant="outline"
                      onClick={switchCamera}
                      className="gap-2"
                      data-testid="switch-camera-btn"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={stopScanner}
                    className="gap-2"
                    data-testid="stop-scanner-btn"
                  >
                    <CameraOff className="w-4 h-4" />
                    Parar
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Camera info */}
          {permissionGranted && cameras.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Câmera: {cameras.find((c) => c.id === selectedCamera)?.label || "Padrão"} 
              {cameras.length > 1 && ` (${cameras.length} disponíveis)`}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Scanner area */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative bg-secondary/5 min-h-[300px]">
            {/* Scanner container - always visible for html5-qrcode */}
            <div
              id="qr-reader"
              className={`w-full ${!scanning && !result ? "hidden" : ""}`}
              style={{ minHeight: scanning ? "300px" : "0" }}
            />

            {/* Placeholder when not scanning */}
            {!scanning && !result && (
              <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Camera className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">
                  Pronto para escanear
                </h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Clique em "Iniciar Câmera" para começar a leitura do{" "}
                  {type === "qrcode" ? "QR Code" : "código de barras"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  A câmera traseira será utilizada automaticamente
                </p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-destructive/5 p-4">
                <div className="text-center max-w-sm">
                  <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
                  <p className="text-destructive font-medium mb-2">Erro</p>
                  <p className="text-sm text-muted-foreground mb-4">{error}</p>
                  <Button
                    variant="outline"
                    onClick={resetScanner}
                    className="gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Tentar novamente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Result card */}
      {result && (
        <Card className="border-success animate-slide-up">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center animate-success-pulse">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <div>
                <CardTitle className="font-heading text-lg text-success">
                  Leitura Realizada!
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {getOperationMessage(result.tipo_operacao)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Package className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Produto
                  </p>
                  <p className="font-medium">{result.produto}</p>
                </div>
              </div>

              {/* Code */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Hash className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Código
                  </p>
                  <p className="font-mono font-medium">{result.codigo}</p>
                </div>
              </div>

              {/* Sector */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Setor
                  </p>
                  <p className="font-medium">{result.setor}</p>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Layers className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Quantidade
                  </p>
                  <p className="font-medium">{result.quantidade}</p>
                </div>
              </div>
            </div>

            {/* Operation badge and points */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Badge className={getOperationBadgeClass(result.tipo_operacao)}>
                {result.tipo_operacao}
              </Badge>
              <Badge variant="outline">
                {type === "qrcode" ? "QR Code" : "Código de Barras"}
              </Badge>
              {activityMode && result.pontuacao && (
                <Badge className="bg-warning text-warning-foreground gap-1">
                  <Zap className="w-3 h-3" />
                  +{result.pontuacao} pontos
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button onClick={resetScanner} className="gap-2 flex-1" data-testid="scan-again-btn">
                <RotateCcw className="w-4 h-4" />
                Nova Leitura
              </Button>
              <Link to="/historico" className="flex-1">
                <Button variant="outline" className="w-full" data-testid="view-history-btn">
                  Ver Histórico
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
