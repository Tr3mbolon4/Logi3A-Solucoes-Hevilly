import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
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
  Plus,
  Edit,
  Trash2,
  Package,
  Search,
  RefreshCw,
} from "lucide-react";

const SETORES = [
  "Expedição",
  "Estoque A",
  "Estoque B",
  "Recebimento",
  "Identificação",
  "Almoxarifado",
];

const OPERACOES = [
  "Recebimento",
  "Expedição",
  "Estoque",
  "Logística Reversa",
  "Identificação",
];

const emptyMaterial = {
  nome: "",
  codigo: "",
  setor: "",
  quantidade: 1,
  tipo_operacao: "",
  descricao: "",
  localizacao: "",
};

export default function Materiais() {
  const {
    materiais,
    fetchMateriais,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    loading,
  } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState(emptyMaterial);

  useEffect(() => {
    fetchMateriais();
  }, [fetchMateriais]);

  const filteredMateriais = materiais.filter(
    (m) =>
      m.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.setor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (material = null) => {
    if (material) {
      setEditingMaterial(material);
      setFormData(material);
    } else {
      setEditingMaterial(null);
      setFormData(emptyMaterial);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMaterial(null);
    setFormData(emptyMaterial);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.codigo || !formData.setor || !formData.tipo_operacao) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (editingMaterial) {
        await updateMaterial(editingMaterial.id, formData);
        toast.success("Material atualizado com sucesso!");
      } else {
        await createMaterial(formData);
        toast.success("Material cadastrado com sucesso!");
      }
      handleCloseDialog();
    } catch (error) {
      toast.error("Erro ao salvar material");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMaterial(id);
      toast.success("Material excluído com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir material");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="materiais-page">
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
                  Cadastro de Materiais
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {materiais.length} materiais cadastrados
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchMateriais()}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => handleOpenDialog()}
                    className="gap-2"
                    data-testid="add-material-btn"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Material
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-heading">
                      {editingMaterial ? "Editar Material" : "Novo Material"}
                    </DialogTitle>
                    <DialogDescription>
                      Preencha os dados do material para cadastro.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="nome">Nome do Material *</Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) =>
                            setFormData({ ...formData, nome: e.target.value })
                          }
                          placeholder="Ex: Parafuso M8"
                          data-testid="input-nome"
                        />
                      </div>
                      <div>
                        <Label htmlFor="codigo">Código *</Label>
                        <Input
                          id="codigo"
                          value={formData.codigo}
                          onChange={(e) =>
                            setFormData({ ...formData, codigo: e.target.value })
                          }
                          placeholder="Ex: 789456123"
                          data-testid="input-codigo"
                        />
                      </div>
                      <div>
                        <Label htmlFor="quantidade">Quantidade</Label>
                        <Input
                          id="quantidade"
                          type="number"
                          min="1"
                          value={formData.quantidade}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              quantidade: parseInt(e.target.value) || 1,
                            })
                          }
                          data-testid="input-quantidade"
                        />
                      </div>
                      <div>
                        <Label htmlFor="setor">Setor *</Label>
                        <Select
                          value={formData.setor}
                          onValueChange={(value) =>
                            setFormData({ ...formData, setor: value })
                          }
                        >
                          <SelectTrigger data-testid="select-setor">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {SETORES.map((setor) => (
                              <SelectItem key={setor} value={setor}>
                                {setor}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="tipo_operacao">Operação *</Label>
                        <Select
                          value={formData.tipo_operacao}
                          onValueChange={(value) =>
                            setFormData({ ...formData, tipo_operacao: value })
                          }
                        >
                          <SelectTrigger data-testid="select-operacao">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {OPERACOES.map((op) => (
                              <SelectItem key={op} value={op}>
                                {op}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="localizacao">Localização</Label>
                        <Input
                          id="localizacao"
                          value={formData.localizacao}
                          onChange={(e) =>
                            setFormData({ ...formData, localizacao: e.target.value })
                          }
                          placeholder="Ex: Prateleira A3"
                          data-testid="input-localizacao"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                          id="descricao"
                          value={formData.descricao}
                          onChange={(e) =>
                            setFormData({ ...formData, descricao: e.target.value })
                          }
                          placeholder="Descrição detalhada do material"
                          rows={2}
                          data-testid="input-descricao"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseDialog}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" data-testid="save-material-btn">
                        {editingMaterial ? "Salvar" : "Cadastrar"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, código ou setor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="search-materiais"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead className="text-center">Qtd</TableHead>
                  <TableHead>Operação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMateriais.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Package className="w-8 h-8" />
                        <p>Nenhum material encontrado</p>
                        <Button variant="link" onClick={() => handleOpenDialog()}>
                          Cadastrar novo material
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMateriais.map((material) => (
                    <TableRow key={material.id} className="table-row-hover">
                      <TableCell>
                        <div>
                          <p className="font-medium">{material.nome}</p>
                          {material.localizacao && (
                            <p className="text-xs text-muted-foreground">
                              {material.localizacao}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {material.codigo}
                      </TableCell>
                      <TableCell>{material.setor}</TableCell>
                      <TableCell className="text-center font-mono">
                        {material.quantidade}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{material.tipo_operacao}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(material)}
                            data-testid={`edit-${material.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                data-testid={`delete-${material.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir material?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir "{material.nome}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(material.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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
