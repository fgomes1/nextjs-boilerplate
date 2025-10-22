"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// URL DA EDGE FUNCTION DE TESTE MINIMALISTA
const EDGE_FUNCTION_TEST_URL = 'https://mqfxtvgupcvxkggwzjla.supabase.co/functions/v1/gerar-plano';

export default function Gerador() {
    const [topico, setTopico] = useState('');
    
    // CORREÇÃO: Definindo explicitamente o tipo como string OU null
    const [userId, setUserId] = useState<string | null>(null); 
    const [userToken, setUserToken] = useState<string | null>(null); 
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [planoGerado, setPlanoGerado] = useState(null); 

    // Efeito: Verifica autenticação e obtém userId E userToken
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: sessionData } = await supabase.auth.getSession(); 

            if (!user || !sessionData.session) {
                // Se não estiver logado, redireciona
                window.location.href = '/login'; 
                return;
            }
            // AQUI O user.id é uma string UUID, e o TypeScript agora aceita a atribuição
            setUserId(user.id); 
            setUserToken(sessionData.session.access_token);
        };
        fetchUser();
    }, []); 

    // Função de envio
    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setPlanoGerado(null);

        if (!userId || !userToken) {
             setError("Sessão expirada. Por favor, faça login novamente.");
             setLoading(false);
             return;
        }

        const inputs = {
            topico,
            userId // Mantemos userId para a Edge Function completa
        };
        
        try {
            // Chamada para a Edge Function de TESTE
            const response = await fetch(EDGE_FUNCTION_TEST_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    // Enviando o Token JWT para autorização (resolveu o 401)
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify(inputs)
            });

            const iaResponse = await response.json();

            if (!response.ok || iaResponse.error) {
                throw new Error(iaResponse.error || iaResponse.details || 'Erro desconhecido no servidor de IA.');
            }

            // Define o JSON simples gerado pela IA para exibição
            setPlanoGerado(iaResponse); 

        } catch (err) {
            console.error("Erro na geração:", err);
            setError(err.message || 'Falha na comunicação. Verifique o console.');
        } finally {
            setLoading(false);
        }
    };

    // --- FUNÇÃO DE LOGOUT ---
    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };


    // --- RENDERIZAÇÃO ---
    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-xl">
                
                {/* Cabeçalho */}
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h1 className="text-3xl font-bold text-blue-700">Gerador de Planos de Aula (Teste)</h1>
                    <button 
                        onClick={handleLogout}
                        className="text-sm text-red-600 hover:text-red-800"
                    >
                        Sair
                    </button>
                </div>
                
                {/* Formulário de Inputs (SIMPLIFICADO) */}
                <form className="space-y-4 p-4 border rounded-lg bg-gray-50" onSubmit={handleGenerate}>
                    <h2 className="text-xl font-semibold text-gray-800">Defina o Tópico para Teste:</h2>
                    
                    {/* Input Tópico (Obrigatório) */}
                    <div>
                        <label htmlFor="topico" className="block text-sm font-medium text-gray-700">Tópico da Aula:</label>
                        <input type="text" id="topico" value={topico} onChange={(e) => setTopico(e.target.value)} required 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                            disabled={loading} placeholder="Ex: O Sistema Solar, Fábulas, etc."
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading || !userId}
                        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                            (loading || !userId) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        {loading ? 'Gerando Teste...' : 'Gerar Teste com IA'}
                    </button>
                    
                    {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
                </form>

                {/* Seção de Exibição do Plano Gerado (Lendo JSON simples) */}
                {planoGerado && (
                    <div className="mt-8 p-6 border-2 border-green-300 rounded-lg bg-green-50">
                        <h2 className="text-2xl font-bold text-green-700 mb-4">Resultado da IA (JSON Simples)</h2>
                        
                        <h3 className="text-lg font-semibold text-gray-800 mt-4 border-l-4 border-blue-500 pl-2">Introdução Lúdica</h3>
                        <p className="mt-1 text-gray-600">{planoGerado.introducao_ludica}</p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 border-l-4 border-blue-500 pl-2">Objetivo de Aprendizagem da BNCC</h3>
                        <p className="mt-1 text-gray-600">{planoGerado.objetivo_bncc}</p>
                        
                        <p className="mt-4 text-gray-500 text-sm">Próxima Etapa: Integrar o código completo para gerar Rubrica e Passo a Passo.</p>

                    </div>
                )}
            </div>
        </main>
    );
}
