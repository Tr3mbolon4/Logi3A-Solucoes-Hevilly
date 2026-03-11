import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
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
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Moon,
  Sun,
  Trash2,
  Database,
  RefreshCw,
  Settings,
} from "lucide-react";

export default function Configuracoes() {
  const {
    alunoNome,
    setAlunoNome,
    turmaNome,
    setTurmaNome,
    darkMode,
    toggleDarkMode,
    clearLeituras,
    seedDemoData,
    fetchMateriais,
  } = useApp();

  const handleClearLocalStorage = () => {
    localStorage.clear();
    toast.success("Dados locais limpos! Recarregue a página.");
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleResetDemo = async () => {
    try {
      await seedDemoData();
      await fetchMateriais();
      toast.success("Dados de demonstração restaurados!");
    } catch (error) {
      toast.error("Erro ao restaurar dados");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto" data-testid="configuracoes-page">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" data-testid="back-button">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <CardTitle className="font-heading text-xl flex items-center gap-2">
                <Settings className="w-6 h-6 text-primary" />
                Configurações
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Personalize o sistema
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Informações do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="config-aluno">Nome do Aluno</Label>
            <Input
              id="config-aluno"
              value={alunoNome}
              onChange={(e) => setAlunoNome(e.target.value)}
              placeholder="Digite seu nome"
              data-testid="config-aluno-input"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Este nome será salvo nas leituras realizadas
            </p>
          </div>
          <div>
            <Label htmlFor="config-turma">Turma</Label>
            <Input
              id="config-turma"
              value={turmaNome}
              onChange={(e) => setTurmaNome(e.target.value)}
              placeholder="Ex: 3º Ano A"
              data-testid="config-turma-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {darkMode ? (
              <Moon className="w-5 h-5 text-primary" />
            ) : (
              <Sun className="w-5 h-5 text-primary" />
            )}
            Aparência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Modo Escuro</p>
              <p className="text-sm text-muted-foreground">
                Alternar entre tema claro e escuro
              </p>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={toggleDarkMode}
              data-testid="dark-mode-switch"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Gerenciamento de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Restaurar Dados de Demonstração</p>
              <p className="text-sm text-muted-foreground">
                Recarrega os materiais de exemplo
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleResetDemo}
              className="gap-2"
              data-testid="reset-demo-btn"
            >
              <RefreshCw className="w-4 h-4" />
              Restaurar
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Limpar Histórico de Leituras</p>
              <p className="text-sm text-muted-foreground">
                Remove todas as leituras registradas
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2" data-testid="clear-leituras-btn">
                  <Trash2 className="w-4 h-4" />
                  Limpar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Limpar histórico?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação removerá todas as leituras registradas. Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearLeituras}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Limpar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">Limpar Todos os Dados Locais</p>
              <p className="text-sm text-muted-foreground">
                Remove todos os dados salvos no navegador
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2" data-testid="clear-all-btn">
                  <Trash2 className="w-4 h-4" />
                  Limpar Tudo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Limpar todos os dados?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação removerá todas as configurações, histórico e dados salvos localmente. A página será recarregada.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearLocalStorage}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Limpar Tudo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="font-heading text-lg font-bold text-primary mb-1">
            Logi3A Soluções
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Escola Estadual Professora Elídia Tedesco de Oliveira
          </p>
          <p className="text-xs text-muted-foreground">
            Simulador Educacional de Logística v1.0
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
