import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function Register() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [serverErrors, setServerErrors] = React.useState([]);

    const onSubmit = async (data) => {
        setServerErrors([]);
        const res = await registerUser(data.username, data.email, data.password);
        if (res.success) {
            navigate('/');
        } else {
            setServerErrors(res.errors);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Inscription à SupContent</h2>

                {serverErrors.length > 0 && (
                    <div className="p-3 text-sm text-red-500 bg-red-100 rounded">
                        {serverErrors.map((err, idx) => <div key={idx}>{err.msg}</div>)}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom d'utilisateur</label>
                        <Input
                            type="text"
                            {...register('username', { required: 'Nom d\'utilisateur requis' })}
                            className="mt-1"
                        />
                        {errors.username && <span className="text-xs text-red-500">{errors.username.message}</span>}
                    </div>

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
                            {...register('password', { required: 'Mot de passe requis', minLength: { value: 6, message: 'Minimum 6 caractères' } })}
                            className="mt-1"
                        />
                        {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
                    </div>

                    <Button type="submit" className="w-full">S'inscrire</Button>
                </form>

                <div className="text-center text-sm">
                    Déjà un compte ? <Link to="/login" className="text-blue-500 hover:underline">Se connecter</Link>
                </div>
            </div>
        </div>
    );
}
