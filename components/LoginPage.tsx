
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SpinnerIcon, XIcon } from './Icons';
import { User } from '../types';

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.37,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

const LoginPage: React.FC = () => {
    const { signIn, availableAccounts } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [showAccountSelector, setShowAccountSelector] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleClick = () => {
        setShowAccountSelector(true);
    };

    const handleAccountSelect = async (email: string) => {
        setShowAccountSelector(false);
        setIsLoading(true);
        setError(null);
        try {
            await signIn(email);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setIsLoading(false);
            setShowAccountSelector(true); // Re-open on error
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gradient-start/20 to-gradient-end/20 p-4">
            
            {/* Account Selector Modal (Simulating Google OAuth Popup) */}
            {showAccountSelector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-[400px] overflow-hidden transform transition-all scale-100">
                        <div className="p-2 flex justify-end">
                            <button onClick={() => setShowAccountSelector(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                <XIcon className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="px-8 pb-8 text-center">
                            <div className="flex justify-center mb-4">
                                <GoogleIcon />
                            </div>
                            <h2 className="text-xl font-medium text-slate-800 mb-2">Choose an account</h2>
                            <p className="text-sm text-slate-500 mb-6">to continue to Istanbul International School</p>
                            
                            <div className="space-y-1">
                                {availableAccounts.map((account) => (
                                    <button
                                        key={account.id}
                                        onClick={() => handleAccountSelect(account.email)}
                                        className="w-full flex items-center p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left group first:rounded-t-lg last:border-0"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mr-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                            {account.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-700">{account.name}</div>
                                            <div className="text-xs text-slate-500">{account.email}</div>
                                            <div className="text-[10px] text-primary uppercase font-bold mt-0.5">{account.role}</div>
                                        </div>
                                    </button>
                                ))}
                                
                                <button
                                     onClick={() => alert("Please use one of the demo accounts listed above.")}
                                     className="w-full flex items-center p-3 hover:bg-slate-50 transition-colors text-left border-t border-slate-200 mt-2"
                                >
                                     <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-4">
                                        <UserIcon className="w-5 h-5 text-slate-500" />
                                     </div>
                                     <div className="font-medium text-slate-700 text-sm">Use another account</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Login Card */}
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl text-center relative z-0">
                <img src="/assets/logo.svg" alt="Istanbul International School" className="w-24 h-24 mx-auto" />
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Istanbul Int. School</h1>
                    <p className="mt-2 text-text-secondary">Library & News Portal</p>
                </div>
                
                {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}

                <button
                    onClick={handleGoogleClick}
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-slate-300 text-lg font-medium rounded-lg shadow-sm text-text-secondary bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all"
                >
                    {isLoading ? (
                        <>
                            <SpinnerIcon className="w-5 h-5 mr-3" />
                            Signing In...
                        </>
                    ) : (
                        <>
                            <GoogleIcon />
                            Sign in with Google
                        </>
                    )}
                </button>

                <p className="text-xs text-slate-500">
                    Use your official @istanbulint.com email address to access school resources.
                </p>
            </div>
        </div>
    );
};

const UserIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

export default LoginPage;
