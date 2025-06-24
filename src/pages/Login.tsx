
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication - in real app, this would validate against backend
    if (username && password) {
      // Store user data in localStorage (in real app, use proper auth)
      localStorage.setItem('user', JSON.stringify({
        username: username,
        role: username === 'admin' ? 'admin' : 'user' // Mock role assignment
      }));
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-12 bg-red-500 rounded-sm flex items-center justify-center">
                <div className="w-3 h-8 bg-white rounded-full"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-500">Premier</h1>
                <h2 className="text-2xl font-bold text-red-500">Explosives</h2>
                <h3 className="text-2xl font-bold text-red-500">Limited</h3>
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Please login to your account</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12"
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            SIGN IN
          </Button>
          
          <div className="text-center">
            <a href="#" className="text-gray-600 hover:text-gray-800">
              Forgot password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
