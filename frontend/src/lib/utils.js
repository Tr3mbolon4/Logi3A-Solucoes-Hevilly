import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format date to Brazilian format
export function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Format datetime to Brazilian format
export function formatDateTime(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Get operation badge color
export function getOperationBadgeClass(operacao) {
  const operacaoLower = operacao?.toLowerCase() || "";
  if (operacaoLower.includes("recebimento")) return "badge-recebimento";
  if (operacaoLower.includes("expedição") || operacaoLower.includes("expedicao")) return "badge-expedicao";
  if (operacaoLower.includes("estoque")) return "badge-estoque";
  if (operacaoLower.includes("reversa")) return "badge-reversa";
  if (operacaoLower.includes("identificação") || operacaoLower.includes("identificacao")) return "badge-identificacao";
  return "bg-gray-100 text-gray-800";
}

// Generate QR Code content from material
export function generateQRContent(material) {
  return `Produto: ${material.nome}\nCódigo: ${material.codigo}\nSetor: ${material.setor}\nQuantidade: ${material.quantidade}`;
}

// Parse QR Code content
export function parseQRContent(content) {
  const lines = content.split("\n");
  const result = {};
  
  lines.forEach((line) => {
    const [key, ...valueParts] = line.split(":");
    if (key && valueParts.length > 0) {
      const cleanKey = key.trim().toLowerCase()
        .replace("produto", "produto")
        .replace("código", "codigo")
        .replace("codigo", "codigo")
        .replace("setor", "setor")
        .replace("quantidade", "quantidade");
      result[cleanKey] = valueParts.join(":").trim();
    }
  });
  
  return result;
}

// Calculate points based on operation
export function calculatePoints(operacao) {
  const operacaoLower = operacao?.toLowerCase() || "";
  if (operacaoLower.includes("recebimento")) return 10;
  if (operacaoLower.includes("expedição") || operacaoLower.includes("expedicao")) return 15;
  if (operacaoLower.includes("estoque")) return 10;
  if (operacaoLower.includes("reversa")) return 20;
  if (operacaoLower.includes("identificação") || operacaoLower.includes("identificacao")) return 5;
  return 5;
}

// Play success sound
export function playSuccessSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);
    
    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator();
      oscillator2.connect(gainNode);
      oscillator2.frequency.value = 1000;
      oscillator2.type = "sine";
      oscillator2.start();
      oscillator2.stop(audioContext.currentTime + 0.15);
    }, 100);
  } catch (e) {
    console.log("Audio not supported");
  }
}

// Play error sound
export function playErrorSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 300;
    oscillator.type = "sine";
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.log("Audio not supported");
  }
}

// Export to CSV
export function exportToCSV(data, filename) {
  const headers = Object.keys(data[0] || {});
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value || "").replace(/"/g, '""');
        return stringValue.includes(",") ? `"${stringValue}"` : stringValue;
      }).join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${formatDate(new Date())}.csv`;
  link.click();
}

// Get operation message
export function getOperationMessage(operacao) {
  const operacaoLower = operacao?.toLowerCase() || "";
  
  const messages = {
    recebimento: [
      "Recebimento registrado com sucesso!",
      "Material recebido e conferido.",
      "Produto armazenado no estoque."
    ],
    expedição: [
      "Produto separado para envio!",
      "Expedição registrada.",
      "Destino: Cliente"
    ],
    expedicao: [
      "Produto separado para envio!",
      "Expedição registrada.",
      "Destino: Cliente"
    ],
    estoque: [
      "Produto identificado no estoque.",
      "Localização confirmada.",
      "Inventário atualizado."
    ],
    reversa: [
      "Produto retornado ao estoque.",
      "Logística reversa registrada.",
      "Motivo: devolução"
    ],
    identificação: [
      "Material identificado!",
      "Código reconhecido.",
      "Dados carregados."
    ],
    identificacao: [
      "Material identificado!",
      "Código reconhecido.",
      "Dados carregados."
    ]
  };

  for (const [key, msgs] of Object.entries(messages)) {
    if (operacaoLower.includes(key)) {
      return msgs[Math.floor(Math.random() * msgs.length)];
    }
  }
  
  return "Operação registrada com sucesso!";
}
