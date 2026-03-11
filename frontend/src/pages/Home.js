import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Scan,
  QrCode,
  History,
  BarChart3,
  Package,
  GraduationCap,
  Printer,
  ArrowRight,
  Sparkles,
  Truck,
  Warehouse,
  Box,
} from "lucide-react";

export default function Home() {
  const { fetchMateriais, seedDemoData, materiais, estatisticas, fetchEstatisticas } = useApp();

  useEffect(() => {
    const init = async () => {
      const mats = await fetchMateriais();
      if (mats.length === 0) {
        await seedDemoData();
      }
      await fetchEstatisticas();
    };
    init();
  }, [fetchMateriais, seedDemoData, fetchEstatisticas]);

  const mainActions = [
    {
      title: "Ler QR Code",
      description: "Escaneie QR Codes com a câmera",
      icon: Scan,
      path: "/scanner-qr",
      color: "bg-primary",
      testId: "action-qr-code",
    },
    {
      title: "Ler Código de Barras",
      description: "Escaneie códigos de barras tradicionais",
      icon: QrCode,
      path: "/scanner-barcode",
      color: "bg-secondary",
      testId: "action-barcode",
    },
    {
      title: "Ver Histórico",
      description: "Consulte todas as leituras realizadas",
      icon: History,
      path: "/historico",
      color: "bg-accent",
      testId: "action-historico",
    },
  ];

  const secondaryActions = [
    {
      title: "Dashboard",
      description: "Estatísticas e relatórios",
      icon: BarChart3,
      path: "/dashboard",
      testId: "action-dashboard",
    },
    {
      title: "Materiais",
      description: "Gerenciar cadastro",
      icon: Package,
      path: "/materiais",
      testId: "action-materiais",
    },
    {
      title: "Gerador QR",
      description: "Criar e imprimir QR Codes",
      icon: Printer,
      path: "/gerador-qr",
      testId: "action-gerador",
    },
    {
      title: "Atividade Prática",
      description: "Modo com pontuação",
      icon: GraduationCap,
      path: "/atividade",
      testId: "action-atividade",
    },
  ];

  const logisticsOperations = [
    { name: "Recebimento", icon: Truck, description: "Entrada de mercadorias" },
    { name: "Estoque", icon: Warehouse, description: "Armazenamento de produtos" },
    { name: "Expedição", icon: Box, description: "Saída para clientes" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 to-background p-8 md:p-12">
        <div className="relative z-10">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Simulador Educacional
          </Badge>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4 tracking-tight">
            Bem-vindo ao <span className="text-primary">Logi3A Soluções</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            Aprenda como funciona a leitura de QR Code e código de barras em centros de distribuição e logística.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/scanner-qr">
              <Button size="lg" className="gap-2" data-testid="hero-start-btn">
                <Scan className="w-5 h-5" />
                Começar Agora
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/atividade">
              <Button size="lg" variant="outline" className="gap-2" data-testid="hero-activity-btn">
                <GraduationCap className="w-5 h-5" />
                Atividade Prática
              </Button>
            </Link>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
      </section>

      {/* Main Actions */}
      <section>
        <h2 className="font-heading text-2xl font-bold mb-6">Ações Principais</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mainActions.map((action) => (
            <Link key={action.path} to={action.path}>
              <Card
                className="card-hover h-full cursor-pointer border-2 hover:border-primary/50 transition-all"
                data-testid={action.testId}
              >
                <CardContent className="p-6">
                  <div
                    className={`w-14 h-14 rounded-xl ${action.color} text-white flex items-center justify-center mb-4`}
                  >
                    <action.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-2">
                    {action.title}
                  </h3>
                  <p className="text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Secondary Actions */}
      <section>
        <h2 className="font-heading text-2xl font-bold mb-6">Mais Opções</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {secondaryActions.map((action) => (
            <Link key={action.path} to={action.path}>
              <Card
                className="card-hover h-full cursor-pointer"
                data-testid={action.testId}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-3">
                    <action.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-sm mb-1">
                    {action.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Logistics Operations Info */}
      <section>
        <h2 className="font-heading text-2xl font-bold mb-6">
          Operações Logísticas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {logisticsOperations.map((op) => (
            <Card key={op.name} className="bg-muted/30">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <op.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold">{op.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {op.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Preview */}
      {estatisticas && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-bold">Resumo</h2>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                Ver Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="font-mono text-3xl font-bold text-primary">
                  {estatisticas.total_leituras}
                </p>
                <p className="text-sm text-muted-foreground">Total de Leituras</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="font-mono text-3xl font-bold text-primary">
                  {materiais.length}
                </p>
                <p className="text-sm text-muted-foreground">Materiais Cadastrados</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="font-mono text-3xl font-bold text-primary">
                  {estatisticas.leituras_qrcode}
                </p>
                <p className="text-sm text-muted-foreground">QR Codes Lidos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="font-mono text-3xl font-bold text-primary">
                  {estatisticas.leituras_barcode}
                </p>
                <p className="text-sm text-muted-foreground">Códigos de Barras</p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
