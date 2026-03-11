import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AppContext = createContext(null);

// Local storage keys
const STORAGE_KEYS = {
  LEITURAS: "logi3a_leituras",
  MATERIAIS: "logi3a_materiais",
  ALUNO: "logi3a_aluno",
  TURMA: "logi3a_turma",
  DARK_MODE: "logi3a_dark_mode",
  ACTIVITY_SCORES: "logi3a_activity_scores",
};

export function AppProvider({ children }) {
  const [materiais, setMateriais] = useState([]);
  const [leituras, setLeituras] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alunoNome, setAlunoNome] = useState("");
  const [turmaNome, setTurmaNome] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [activityMode, setActivityMode] = useState(false);
  const [activityScores, setActivityScores] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedAluno = localStorage.getItem(STORAGE_KEYS.ALUNO);
    const savedTurma = localStorage.getItem(STORAGE_KEYS.TURMA);
    const savedDarkMode = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    const savedScores = localStorage.getItem(STORAGE_KEYS.ACTIVITY_SCORES);

    if (savedAluno) setAlunoNome(savedAluno);
    if (savedTurma) setTurmaNome(savedTurma);
    if (savedDarkMode === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    if (savedScores) {
      try {
        setActivityScores(JSON.parse(savedScores));
      } catch (e) {
        console.error("Error parsing activity scores", e);
      }
    }
  }, []);

  // Save aluno/turma to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALUNO, alunoNome);
    localStorage.setItem(STORAGE_KEYS.TURMA, turmaNome);
  }, [alunoNome, turmaNome]);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(newValue));
      if (newValue) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return newValue;
    });
  }, []);

  // Fetch materiais from API
  const fetchMateriais = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/materiais`);
      setMateriais(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching materiais:", error);
      // Try to load from localStorage as fallback
      const cached = localStorage.getItem(STORAGE_KEYS.MATERIAIS);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          setMateriais(data);
          return data;
        } catch (e) {
          console.error("Error parsing cached materiais", e);
        }
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create material
  const createMaterial = useCallback(async (data) => {
    try {
      const response = await axios.post(`${API}/materiais`, data);
      setMateriais((prev) => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error("Error creating material:", error);
      throw error;
    }
  }, []);

  // Update material
  const updateMaterial = useCallback(async (id, data) => {
    try {
      const response = await axios.put(`${API}/materiais/${id}`, data);
      setMateriais((prev) =>
        prev.map((m) => (m.id === id ? response.data : m))
      );
      return response.data;
    } catch (error) {
      console.error("Error updating material:", error);
      throw error;
    }
  }, []);

  // Delete material
  const deleteMaterial = useCallback(async (id) => {
    try {
      await axios.delete(`${API}/materiais/${id}`);
      setMateriais((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Error deleting material:", error);
      throw error;
    }
  }, []);

  // Find material by code
  const findMaterialByCode = useCallback(
    (codigo) => {
      return materiais.find((m) => m.codigo === codigo);
    },
    [materiais]
  );

  // Fetch leituras from API
  const fetchLeituras = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.tipo_leitura) params.append("tipo_leitura", filters.tipo_leitura);
      if (filters.tipo_operacao) params.append("tipo_operacao", filters.tipo_operacao);
      if (filters.aluno) params.append("aluno", filters.aluno);
      if (filters.turma) params.append("turma", filters.turma);

      const response = await axios.get(`${API}/leituras?${params.toString()}`);
      setLeituras(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching leituras:", error);
      // Try to load from localStorage as fallback
      const cached = localStorage.getItem(STORAGE_KEYS.LEITURAS);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          setLeituras(data);
          return data;
        } catch (e) {
          console.error("Error parsing cached leituras", e);
        }
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create leitura
  const createLeitura = useCallback(async (data) => {
    try {
      const leituraData = {
        ...data,
        aluno: alunoNome || data.aluno || "",
        turma: turmaNome || data.turma || "",
      };
      const response = await axios.post(`${API}/leituras`, leituraData);
      setLeituras((prev) => [response.data, ...prev]);
      
      // Save to localStorage as backup
      const allLeituras = [response.data, ...leituras];
      localStorage.setItem(STORAGE_KEYS.LEITURAS, JSON.stringify(allLeituras.slice(0, 100)));
      
      return response.data;
    } catch (error) {
      console.error("Error creating leitura:", error);
      // Save locally if API fails
      const localLeitura = {
        ...data,
        id: `local_${Date.now()}`,
        timestamp: new Date().toISOString(),
        aluno: alunoNome || data.aluno || "",
        turma: turmaNome || data.turma || "",
      };
      setLeituras((prev) => [localLeitura, ...prev]);
      const allLeituras = [localLeitura, ...leituras];
      localStorage.setItem(STORAGE_KEYS.LEITURAS, JSON.stringify(allLeituras.slice(0, 100)));
      return localLeitura;
    }
  }, [alunoNome, turmaNome, leituras]);

  // Clear all leituras
  const clearLeituras = useCallback(async () => {
    try {
      await axios.delete(`${API}/leituras`);
      setLeituras([]);
      localStorage.removeItem(STORAGE_KEYS.LEITURAS);
    } catch (error) {
      console.error("Error clearing leituras:", error);
      setLeituras([]);
      localStorage.removeItem(STORAGE_KEYS.LEITURAS);
    }
  }, []);

  // Fetch estatisticas
  const fetchEstatisticas = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/estatisticas`);
      setEstatisticas(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching estatisticas:", error);
      // Calculate from local data
      const stats = {
        total_leituras: leituras.length,
        leituras_qrcode: leituras.filter((l) => l.tipo_leitura === "qrcode").length,
        leituras_barcode: leituras.filter((l) => l.tipo_leitura === "barcode").length,
        total_materiais: materiais.length,
        leituras_por_operacao: {},
        leituras_por_setor: {},
        leituras_hoje: 0,
        pontuacao_total: leituras.reduce((acc, l) => acc + (l.pontuacao || 0), 0),
      };
      setEstatisticas(stats);
      return stats;
    }
  }, [leituras, materiais]);

  // Seed demo data
  const seedDemoData = useCallback(async () => {
    try {
      await axios.post(`${API}/seed`);
      await fetchMateriais();
    } catch (error) {
      console.error("Error seeding demo data:", error);
    }
  }, [fetchMateriais]);

  // Activity mode functions
  const startActivityMode = useCallback(() => {
    setActivityMode(true);
  }, []);

  const endActivityMode = useCallback(() => {
    setActivityMode(false);
  }, []);

  const saveActivityScore = useCallback((score) => {
    const newScore = {
      id: Date.now(),
      aluno: alunoNome,
      turma: turmaNome,
      pontuacao: score.pontuacao,
      leituras: score.leituras,
      tempo: score.tempo,
      data: new Date().toISOString(),
    };
    setActivityScores((prev) => {
      const updated = [newScore, ...prev].slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_SCORES, JSON.stringify(updated));
      return updated;
    });
  }, [alunoNome, turmaNome]);

  const value = {
    // State
    materiais,
    leituras,
    estatisticas,
    loading,
    alunoNome,
    turmaNome,
    darkMode,
    activityMode,
    activityScores,
    
    // Setters
    setAlunoNome,
    setTurmaNome,
    toggleDarkMode,
    
    // Material functions
    fetchMateriais,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    findMaterialByCode,
    
    // Leitura functions
    fetchLeituras,
    createLeitura,
    clearLeituras,
    
    // Other functions
    fetchEstatisticas,
    seedDemoData,
    startActivityMode,
    endActivityMode,
    saveActivityScore,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
