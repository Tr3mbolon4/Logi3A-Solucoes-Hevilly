import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import {
  formatDateTime,
  getOperationBadgeClass,
  exportToCSV,
} from "../lib/utils";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  ArrowLeft,
  Search,
  Download,
  Trash2,
  FileText,
  Filter,
  QrCode,
  Scan,
  Calendar,
  RefreshCw,
} from "lucide-react";

export default function Historico() {
  const { leituras, fetchLeituras, clearLeituras, loading } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("all");
  const [filterOperacao, setFilterOperacao] = useState("all");

  useEffect(() => {
    fetchLeituras();
  }, [fetchLeituras]);

  const filteredLeituras = useMemo(() => {
    return leituras.filter((leitura) => {
      const matchesSearch =
        searchTerm === "" ||
        leitura.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leitura.produto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leitura.aluno?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTipo =
        filterTipo === "all" || leitura.tipo_leitura === filterTipo;

      const matchesOperacao =
        filterOperacao === "all" || leitura.tipo_operacao === filterOperacao;

      return matchesSearch && matchesTipo && matchesOperacao;
    });
  }, [leituras, searchTerm, filterTipo, filterOperacao]);

  const handleExportCSV = () => {
    const dataToExport = filteredLeituras.map((l) => ({
      Código: l.codigo,
      Produto: l.produto,
      "Tipo de Leitura": l.tipo_leitura === "qrcode" ? "QR Code" : "Código de Barras",
      Operação: l.tipo_operacao,
      Setor: l.setor,
      Quantidade: l.quantidade,
      Aluno: l.aluno,
      Turma: l.turma,
      Pontuação: l.pontuacao || 0,
      "Data/Hora": formatDateTime(l.timestamp),
    }));
    exportToCSV(dataToExport, "historico_leituras");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(0, 82, 204);
    doc.text("Logi3A Soluções", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Histórico de Leituras", 14, 28);
    doc.text(`Gerado em: ${formatDateTime(new Date())}`, 14, 34);

    // Table
    const tableData = filteredLeituras.map((l) => [
      l.codigo,
      l.produto,
      l.tipo_leitura === "qrcode" ? "QR" : "Barras",
      l.tipo_operacao,
      l.setor || "-",
      formatDateTime(l.timestamp),
    ]);

    doc.autoTable({
      startY: 42,
      head: [["Código", "Produto", "Tipo", "Operação", "Setor", "Data/Hora"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [0, 82, 204] },
      styles: { fontSize: 8 },
    });

    doc.save(`historico_leituras_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const uniqueOperacoes = useMemo(() => {
    const ops = new Set(leituras.map((l) => l.tipo_operacao).filter(Boolean));
    return Array.from(ops);
  }, [leituras]);

  return (
    <div className="space-y-6 animate-fade-in" data-testid="historico-page">
      {/* Header */}
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
                  Histórico de Leituras
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredLeituras.length} de {leituras.length} registros
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchLeituras()}
                disabled={loading}
                data-testid="refresh-btn"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, produto ou aluno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>

            {/* Filter by type */}
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-full md:w-[180px]" data-testid="filter-tipo">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tipo de leitura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="qrcode">QR Code</SelectItem>
                <SelectItem value="barcode">Código de Barras</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter by operation */}
            <Select value={filterOperacao} onValueChange={setFilterOperacao}>
              <SelectTrigger className="w-full md:w-[180px]" data-testid="filter-operacao">
                <SelectValue placeholder="Operação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas operações</SelectItem>
                {uniqueOperacoes.map((op) => (
                  <SelectItem key={op} value={op}>
                    {op}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={handleExportCSV}
          disabled={filteredLeituras.length === 0}
          className="gap-2"
          data-testid="export-csv-btn"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
        <Button
          variant="outline"
          onClick={handleExportPDF}
          disabled={filteredLeituras.length === 0}
          className="gap-2"
          data-testid="export-pdf-btn"
        >
          <FileText className="w-4 h-4" />
          Exportar PDF
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={leituras.length === 0}
              className="gap-2"
              data-testid="clear-history-btn"
            >
              <Trash2 className="w-4 h-4" />
              Limpar Histórico
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Limpar todo o histórico?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Todos os {leituras.length} registros de leitura serão permanentemente removidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={clearLeituras}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Sim, limpar tudo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Tipo</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Operação</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead className="hidden md:table-cell">Aluno</TableHead>
                  <TableHead className="text-right">Data/Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeituras.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Calendar className="w-8 h-8" />
                        <p>Nenhuma leitura encontrada</p>
                        {searchTerm || filterTipo !== "all" || filterOperacao !== "all" ? (
                          <Button
                            variant="link"
                            onClick={() => {
                              setSearchTerm("");
                              setFilterTipo("all");
                              setFilterOperacao("all");
                            }}
                          >
                            Limpar filtros
                          </Button>
                        ) : (
                          <Link to="/scanner-qr">
                            <Button variant="link">Fazer primeira leitura</Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeituras.map((leitura) => (
                    <TableRow key={leitura.id} className="table-row-hover">
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {leitura.tipo_leitura === "qrcode" ? (
                            <>
                              <Scan className="w-3 h-3" />
                              QR
                            </>
                          ) : (
                            <>
                              <QrCode className="w-3 h-3" />
                              Barras
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {leitura.codigo}
                      </TableCell>
                      <TableCell className="font-medium">
                        {leitura.produto}
                      </TableCell>
                      <TableCell>
                        <Badge className={getOperationBadgeClass(leitura.tipo_operacao)}>
                          {leitura.tipo_operacao}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {leitura.setor || "-"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {leitura.aluno || "-"}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDateTime(leitura.timestamp)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
