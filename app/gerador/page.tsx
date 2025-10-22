"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// URL DA EDGE FUNCTION FINAL (Assumindo que esta é a URL correta de deploy)
const EDGE_FUNCTION_URL = 'https://mqfxtvgupcvxkggwzjla.supabase.co/functions/v1/gerar-plano';

export default function Gerador() {
    // CORREÇÕES DE TIPAGEM NOS ESTADOS:
    const [topico, setTopico] = useState<string>('');
    const [userId, setUserId] = useState<string | null>(null); 
    // O userToken é importante para adicionar ao header de segurança, se necessário
    const [userToken, setUserToken] = useState<string | null>(null); 
    
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    // Usamos 'any' para o JSON complexo, que não tem tipagem definida no projeto
    const [planoGerado, setPlanoGerado] = useState<any>(null); 

    // Efeito: Verifica autenticação e obtém userId
    useEffect(() => {
        const fetchUser = async () => {
            // Obtém o usuário e a sessão (para o token, se necessário)
            const { data: { user } } = await supabase.auth.getUser();
            const { data: sessionData } = await supabase.auth.getSession();
            
            // Verifica se o usuário e a sessão existem
            if (!user || !sessionData.session) {
                // Se não estiver logado, redireciona
                window.location.href = '/login'; 
                return;
            }
            // Tipagem correta: aceita a string do ID e do token
            setUserId(user.id); 
            setUserToken(sessionData.session.access_token);
        };
        fetchUser();
    }, []); 

    // Função de envio (CORRIGIDA: Tipagem explícita do parâmetro 'e')
    const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setPlanoGerado(null);

        if (!userId) {
             setError("Usuário não autenticado. Por favor, faça login novamente.");
             setLoading(false);
             return;
        }

        // Dados enviados para a Edge Function de Geração
        // Para este teste, vamos enviar todos os campos necessários para o código FINAL do Backend
        const inputs = {
            topico,
            nivel: 'Ensino Fundamental I - 3º Ano', // Valor fixo para o teste
            duracao: 50, // Valor fixo para o teste
            userId 
        };
        
        try {
            // Chamada para a Edge Function FINAL
            const response = await fetch(EDGE_FUNCTION_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    // CORREÇÃO CRÍTICA: Enviar o JWT para o Supabase Gateway verificar a autenticação
                    'Authorization': `Bearer ${userToken}`, 
                },
                body: JSON.stringify(inputs)
            });

            const iaResponse = await response.json();

            // Tratamento de erros vindo do Backend
            if (!response.ok || iaResponse.error) {
                // A Edge Function completa deve retornar 'iaResponse.error' ou 'iaResponse.details'
                throw new Error(iaResponse.error || iaResponse.details || 'Erro desconhecido no servidor de IA. Verifique logs do Supabase.');
            }

            // Define o JSON retornado (que, no código completo, é o plano salvo)
            // No código final, iaResponse.conteudo_completo será o JSON do plano.
            setPlanoGerado(iaResponse.conteudo_completo || iaResponse); 

        } catch (err) {
            console.error("Erro na geração:", err);
            // Tratamento de erro seguro para 'unknown' type
            const errorMessage = (err instanceof Error) ? err.message : 'Falha na comunicação. Verifique o console.';
            setError(errorMessage);
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
                    <h1 className="text-3xl font-bold text-blue-700">Gerador de Planos de Aula</h1>
                    <button 
                        onClick={handleLogout}
                        className="text-sm text-red-600 hover:text-red-800"
                    >
                        Sair
                    </button>
                </div>
                
                {/* Formulário de Inputs (Simplificado e Funcional) */}
                <form className="space-y-4 p-4 border rounded-lg bg-gray-50" onSubmit={handleGenerate}>
                    <h2 className="text-xl font-semibold text-gray-800">Defina o Tópico:</h2>
                    
                    {/* Input Tópico (Obrigatório) */}
                    <div>
                        <label htmlFor="topico" className="block text-sm font-medium text-gray-700">Tópico da Aula:</label>
                        <input type="text" id="topico" value={topico} 
                            // Tipagem para o evento de input
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopico(e.target.value)} required 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                            disabled={loading} placeholder="Ex: O Sistema Solar, Fábulas, etc."
                        />
                        <p className="text-xs text-gray-500 mt-1">Nível e Duração fixos para teste: Fundamental I (50 min)</p>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading || !userId}
                        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                            (loading || !userId) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        {loading ? 'Gerando Plano de Aula...' : 'Gerar Plano com IA'}
                    </button>
                    
                    {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
                </form>

                {/* Seção de Exibição do Plano Gerado */}
                {planoGerado && (
                    <div className="mt-8 p-6 border-2 border-green-300 rounded-lg bg-green-50">
                        <h2 className="text-2xl font-bold text-green-700 mb-4">Plano de Aula Gerado</h2>
                        
                        <h3 className="text-lg font-semibold text-gray-800 mt-4 border-l-4 border-blue-500 pl-2">Título</h3>
                        <p className="mt-1 text-gray-600 font-bold">{planoGerado.titulo_plano || 'N/A'}</p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 border-l-4 border-blue-500 pl-2">1. Introdução Lúdica</h3>
                        <p className="mt-1 text-gray-600">{planoGerado.introducao_ludica || 'N/A'}</p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 border-l-4 border-blue-500 pl-2">2. Objetivo de Aprendizagem da BNCC</h3>
                        <p className="mt-1 text-gray-600">{planoGerado.objetivo_bncc || 'N/A'}</p>
                        
                        <p className="mt-4 text-gray-500 text-sm">
                        </p>

                    </div>
                )}
            </div>
        </main>
    );
}
