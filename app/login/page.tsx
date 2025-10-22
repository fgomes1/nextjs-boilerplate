"use client";

import React, { useState } from 'react';
import Link from 'next/link';
// Importação do seu cliente Supabase SDK
import { supabase } from '@/lib/supabase'; 

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // --- LÓGICA DE LOGIN REAL DO SUPABASE ---
        try {
            // Chama o método de login do Supabase, passando o email e a senha
            const { error: signInError } = await supabase.auth.signInWithPassword({ 
                email, 
                password 
            }); 
            
            // Verifica se o Supabase retornou algum erro
            if (signInError) {
                // Erros comuns: "Invalid login credentials" ou e-mail não confirmado
                throw signInError; 
            }
            
            // Sucesso: Redireciona para a página protegida (o Gerador de Planos)
            window.location.href = '/gerador'; 
            
        } catch (err) {
            console.error('Supabase Login Error:', err);
            // Mensagem amigável para o usuário
            setError('Falha na autenticação. Verifique suas credenciais e confirme seu e-mail.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl border border-gray-200">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-blue-700">Escribo | Login</h1>
                    <p className="mt-2 text-sm text-gray-500">Entre para gerar seus Planos de Aula.</p>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
                        <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            disabled={loading} placeholder="seu.email@escola.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
                        <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="••••••••" disabled={loading}
                        />
                    </div>
                    {error && (<div className="text-sm text-red-600 text-center">{error}</div>)}
                    <div>
                        <button type="submit" disabled={loading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                            }`}
                        >
                            {loading ? 'Acessando...' : 'Entrar'}
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm">
                    {/* Usando Link do Next.js para navegação suave */}
                    <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                        Não tem conta? Cadastre-se
                    </Link>
                </div>
            </div>
        </main>
    );
}