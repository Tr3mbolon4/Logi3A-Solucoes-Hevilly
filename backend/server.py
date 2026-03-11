from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Logi3A Soluções API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ MODELS ============

class Material(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: str
    codigo: str
    setor: str
    quantidade: int
    tipo_operacao: str
    descricao: Optional[str] = ""
    localizacao: Optional[str] = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MaterialCreate(BaseModel):
    nome: str
    codigo: str
    setor: str
    quantidade: int
    tipo_operacao: str
    descricao: Optional[str] = ""
    localizacao: Optional[str] = ""

class MaterialUpdate(BaseModel):
    nome: Optional[str] = None
    codigo: Optional[str] = None
    setor: Optional[str] = None
    quantidade: Optional[int] = None
    tipo_operacao: Optional[str] = None
    descricao: Optional[str] = None
    localizacao: Optional[str] = None

class Leitura(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    codigo: str
    produto: str
    tipo_operacao: str
    tipo_leitura: str  # qrcode ou barcode
    setor: Optional[str] = ""
    quantidade: Optional[int] = 0
    aluno: Optional[str] = ""
    turma: Optional[str] = ""
    pontuacao: Optional[int] = 0
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LeituraCreate(BaseModel):
    codigo: str
    produto: str
    tipo_operacao: str
    tipo_leitura: str
    setor: Optional[str] = ""
    quantidade: Optional[int] = 0
    aluno: Optional[str] = ""
    turma: Optional[str] = ""
    pontuacao: Optional[int] = 0

class Estatisticas(BaseModel):
    total_leituras: int
    leituras_qrcode: int
    leituras_barcode: int
    total_materiais: int
    leituras_por_operacao: dict
    leituras_por_setor: dict
    leituras_hoje: int
    pontuacao_total: int

# ============ MATERIAIS ENDPOINTS ============

@api_router.get("/materiais", response_model=List[Material])
async def get_materiais():
    materiais = await db.materiais.find({}, {"_id": 0}).to_list(1000)
    for m in materiais:
        if isinstance(m.get('created_at'), str):
            m['created_at'] = datetime.fromisoformat(m['created_at'])
        if isinstance(m.get('updated_at'), str):
            m['updated_at'] = datetime.fromisoformat(m['updated_at'])
    return materiais

@api_router.get("/materiais/{material_id}", response_model=Material)
async def get_material(material_id: str):
    material = await db.materiais.find_one({"id": material_id}, {"_id": 0})
    if not material:
        raise HTTPException(status_code=404, detail="Material não encontrado")
    if isinstance(material.get('created_at'), str):
        material['created_at'] = datetime.fromisoformat(material['created_at'])
    if isinstance(material.get('updated_at'), str):
        material['updated_at'] = datetime.fromisoformat(material['updated_at'])
    return material

@api_router.get("/materiais/codigo/{codigo}", response_model=Material)
async def get_material_by_codigo(codigo: str):
    material = await db.materiais.find_one({"codigo": codigo}, {"_id": 0})
    if not material:
        raise HTTPException(status_code=404, detail="Material não encontrado")
    if isinstance(material.get('created_at'), str):
        material['created_at'] = datetime.fromisoformat(material['created_at'])
    if isinstance(material.get('updated_at'), str):
        material['updated_at'] = datetime.fromisoformat(material['updated_at'])
    return material

@api_router.post("/materiais", response_model=Material, status_code=201)
async def create_material(input: MaterialCreate):
    material_dict = input.model_dump()
    material_obj = Material(**material_dict)
    doc = material_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.materiais.insert_one(doc)
    return material_obj

@api_router.put("/materiais/{material_id}", response_model=Material)
async def update_material(material_id: str, input: MaterialUpdate):
    existing = await db.materiais.find_one({"id": material_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Material não encontrado")
    
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.materiais.update_one({"id": material_id}, {"$set": update_data})
    updated = await db.materiais.find_one({"id": material_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    return updated

@api_router.delete("/materiais/{material_id}")
async def delete_material(material_id: str):
    result = await db.materiais.delete_one({"id": material_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Material não encontrado")
    return {"message": "Material deletado com sucesso"}

# ============ LEITURAS ENDPOINTS ============

@api_router.get("/leituras", response_model=List[Leitura])
async def get_leituras(
    tipo_leitura: Optional[str] = None,
    tipo_operacao: Optional[str] = None,
    aluno: Optional[str] = None,
    turma: Optional[str] = None
):
    query = {}
    if tipo_leitura:
        query["tipo_leitura"] = tipo_leitura
    if tipo_operacao:
        query["tipo_operacao"] = tipo_operacao
    if aluno:
        query["aluno"] = {"$regex": aluno, "$options": "i"}
    if turma:
        query["turma"] = {"$regex": turma, "$options": "i"}
    
    leituras = await db.leituras.find(query, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    for l in leituras:
        if isinstance(l.get('timestamp'), str):
            l['timestamp'] = datetime.fromisoformat(l['timestamp'])
    return leituras

@api_router.post("/leituras", response_model=Leitura, status_code=201)
async def create_leitura(input: LeituraCreate):
    leitura_dict = input.model_dump()
    leitura_obj = Leitura(**leitura_dict)
    doc = leitura_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.leituras.insert_one(doc)
    return leitura_obj

@api_router.delete("/leituras")
async def delete_all_leituras():
    await db.leituras.delete_many({})
    return {"message": "Histórico limpo com sucesso"}

@api_router.delete("/leituras/{leitura_id}")
async def delete_leitura(leitura_id: str):
    result = await db.leituras.delete_one({"id": leitura_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Leitura não encontrada")
    return {"message": "Leitura deletada com sucesso"}

# ============ ESTATISTICAS ENDPOINT ============

@api_router.get("/estatisticas", response_model=Estatisticas)
async def get_estatisticas():
    total_leituras = await db.leituras.count_documents({})
    leituras_qrcode = await db.leituras.count_documents({"tipo_leitura": "qrcode"})
    leituras_barcode = await db.leituras.count_documents({"tipo_leitura": "barcode"})
    total_materiais = await db.materiais.count_documents({})
    
    # Leituras por operação
    pipeline_op = [
        {"$group": {"_id": "$tipo_operacao", "count": {"$sum": 1}}}
    ]
    operacoes = await db.leituras.aggregate(pipeline_op).to_list(100)
    leituras_por_operacao = {op["_id"]: op["count"] for op in operacoes if op["_id"]}
    
    # Leituras por setor
    pipeline_setor = [
        {"$group": {"_id": "$setor", "count": {"$sum": 1}}}
    ]
    setores = await db.leituras.aggregate(pipeline_setor).to_list(100)
    leituras_por_setor = {s["_id"]: s["count"] for s in setores if s["_id"]}
    
    # Leituras hoje
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    leituras_hoje = await db.leituras.count_documents({
        "timestamp": {"$gte": today_start.isoformat()}
    })
    
    # Pontuação total
    pipeline_pontos = [
        {"$group": {"_id": None, "total": {"$sum": "$pontuacao"}}}
    ]
    pontos = await db.leituras.aggregate(pipeline_pontos).to_list(1)
    pontuacao_total = pontos[0]["total"] if pontos else 0
    
    return Estatisticas(
        total_leituras=total_leituras,
        leituras_qrcode=leituras_qrcode,
        leituras_barcode=leituras_barcode,
        total_materiais=total_materiais,
        leituras_por_operacao=leituras_por_operacao,
        leituras_por_setor=leituras_por_setor,
        leituras_hoje=leituras_hoje,
        pontuacao_total=pontuacao_total
    )

# ============ SEED DATA ============

@api_router.post("/seed")
async def seed_data():
    # Check if data already exists
    count = await db.materiais.count_documents({})
    if count > 0:
        return {"message": "Dados já existem", "materiais": count}
    
    # Sample materials for demonstration
    materiais_exemplo = [
        {
            "id": str(uuid.uuid4()),
            "nome": "Parafuso M8",
            "codigo": "789456123",
            "setor": "Expedição",
            "quantidade": 500,
            "tipo_operacao": "Expedição",
            "descricao": "Parafuso de aço galvanizado M8x30mm",
            "localizacao": "Prateleira A3",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "nome": "Caixa de Papelão",
            "codigo": "456789123",
            "setor": "Estoque A",
            "quantidade": 200,
            "tipo_operacao": "Recebimento",
            "descricao": "Caixa de papelão 40x30x20cm",
            "localizacao": "Estoque A - Corredor 2",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "nome": "Porca Sextavada",
            "codigo": "321654987",
            "setor": "Estoque B",
            "quantidade": 1000,
            "tipo_operacao": "Estoque",
            "descricao": "Porca sextavada M8 zincada",
            "localizacao": "Prateleira B1",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "nome": "Fita Adesiva",
            "codigo": "654321789",
            "setor": "Expedição",
            "quantidade": 50,
            "tipo_operacao": "Expedição",
            "descricao": "Fita adesiva transparente 48mm",
            "localizacao": "Área de Embalagem",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "nome": "Etiqueta Adesiva",
            "codigo": "987321654",
            "setor": "Identificação",
            "quantidade": 5000,
            "tipo_operacao": "Identificação",
            "descricao": "Etiqueta adesiva branca 100x50mm",
            "localizacao": "Almoxarifado",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.materiais.insert_many(materiais_exemplo)
    return {"message": "Dados de exemplo criados com sucesso", "materiais": len(materiais_exemplo)}

# ============ ROOT ENDPOINT ============

@api_router.get("/")
async def root():
    return {"message": "API Logi3A Soluções", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
