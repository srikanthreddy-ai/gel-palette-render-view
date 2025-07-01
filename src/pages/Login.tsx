import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { Rocket } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Store token and username in session storage
        sessionStorage.setItem("authToken", data.token);
        sessionStorage.setItem("userName", username);
        
        // Store user privileges if available
        if (data.privileges) {
          sessionStorage.setItem("userPrivileges", JSON.stringify(data.privileges));
        }
        
        // Update auth context with user data including privileges
        login({
          username: username,
          role: data.role || 'user',
          privileges: data.privileges || []
        });

        // Navigate to dashboard
        navigate('/dashboard');
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${username}!`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: data.message || "Invalid username or password",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "Unable to connect to the server. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-3">
              <Rocket className="w-8 h-8 text-red-500" />
              <h1 className="text-2xl font-bold text-red-500">Premier Explosives Limited</h1>
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
              disabled={isLoading}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
              required
              disabled={isLoading}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "SIGN IN"}
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
