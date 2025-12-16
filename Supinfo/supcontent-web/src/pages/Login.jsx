import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [serverError, setServerError] = React.useState('');

    const onSubmit = async (data) => {
        setServerError('');
        const res = await login(data.email, data.password);
        if (res.success) {
            navigate('/');
        } else {
            setServerError(res.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Connexion à SupContent</h2>

                {serverError && (
                    <div className="p-3 text-sm text-red-500 bg-red-100 rounded">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <Input
                            type="email"
                            {...register('email', { required: 'Email requis' })}
                            className="mt-1"
                        />
                        {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mot de passe</label>
                        <Input
                            type="password"
                            {...register('password', { required: 'Mot de passe requis' })}
                            className="mt-1"
                        />
                        {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
                    </div>

                    <Button type="submit" className="w-full">Se connecter</Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground dark:bg-gray-800">Ou continuer avec</span>
                    </div>
                </div>

                <Button variant="outline" className="w-full" type="button">
                    Google
                </Button>

                <div className="text-center text-sm">
                    Pas encore de compte ? <Link to="/register" className="text-blue-500 hover:underline">S'inscrire</Link>
                </div>
            </div>
        </div>
    );
}
