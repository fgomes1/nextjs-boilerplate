"use client";

import React, { useState } from 'react';
import Link from 'next/link';
// IMPORTANTE: Adicione a importação do seu cliente Supabase SDK aqui!
// Assumindo que você o salvou em '@/lib/supabase'
import { supabase } from '@/lib/supabase'; 

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setIsSuccess(false);

        // 1. Validação local (Senhas devem ser iguais)
        if (password !== confirmPassword) {
            setMessage('As senhas não coincidem!');
            setLoading(false);
            return;
        }

        try {
            // 2. CHAMADA REAL AO SUPABASE AUTH (Criação de Conta)
            const { error } = await supabase.auth.signUp({ 
                email, 
                password 
            });
            
            // 3. Tratamento de Erro do Supabase
            if (error) {
                // Erros comuns: senha muito fraca, e-mail já registrado, etc.
                throw error; 
            }
            
            // 4. Sucesso: O usuário foi criado, mas geralmente precisa confirmar o e-mail
            setMessage('Registro bem-sucedido! Verifique sua caixa de entrada (e spam) para confirmar seu e-mail.');
            setIsSuccess(true);
            
            // Opcional: Limpar formulário
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            
        } catch (err) {
            console.error('Supabase Sign Up Error:', err);
            // Mensagem de erro amigável baseada no erro do Supabase
            setMessage(err.message || 'Falha no registro. O e-mail pode já estar em uso ou a senha é muito curta.');
            setIsSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl border border-gray-200">
                
                {/* Cabeçalho */}
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-blue-700">
                        Escribo | Cadastro
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Crie sua conta para gerar Planos de Aula.
                    </p>
                </div>

                {/* Formulário de Cadastro */}
                <form className="space-y-6" onSubmit={handleRegister}>
                    
                    {/* Campo E-mail */}
                    <div>
                        <label 
                            htmlFor="email" 
                            className="block text-sm font-medium text-gray-700"
                        >
                            E-mail
                        </label>
                        <input
                            id="email" name="email" type="email" required value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="seu.email@escola.com" disabled={loading}
                        />
                    </div>

                    {/* Campo Senha */}
                    <div>
                        <label 
                            htmlFor="password" 
                            className="block text-sm font-medium text-gray-700"
                        >
                            Senha (mín. 6 caracteres)
                        </label>
                        <input
                            id="password" name="password" type="password" required value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="••••••••" disabled={loading} minLength={6}
                        />
                    </div>

                    {/* Confirmação de Senha */}
                    <div>
                        <label 
                            htmlFor="confirmPassword" 
                            className="block text-sm font-medium text-gray-700"
                        >
                            Confirme a Senha
                        </label>
                        <input
                            id="confirmPassword" name="confirmPassword" type="password" required value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="••••••••" disabled={loading}
                        />
                    </div>
                    
                    {/* Mensagens de Status */}
                    {message && (
                        <div className={`text-sm text-center p-2 rounded ${
                            isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {message}
                        </div>
                    )}

                    {/* Botão de Cadastro */}
                    <div>
                        <button
                            type="submit" disabled={loading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            }`}
                        >
                            {loading ? 'Cadastrando...' : 'Cadastrar'}
                        </button>
                    </div>
                </form>

                {/* Link para Login */}
                <div className="text-center text-sm">
                    <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Já tem conta? Faça Login
                    </Link>
                </div>
            </div>
        </main>
    );
}