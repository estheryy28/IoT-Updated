import { useState } from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminDashboard } from "@/components/AdminDashboard";
import { DriverDashboard } from "@/components/DriverDashboard";
import { login as apiLogin, clearToken } from "@/services/api";

interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (selectedRole: "admin" | "driver") => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      if (data.role !== selectedRole) {
        setError(`This account is not a ${selectedRole} account.`);
        clearToken();
        setLoading(false);
        return;
      }
      setUser(data);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setEmail("");
    setPassword("");
    setError("");
    clearToken();
  };

  if (isLoggedIn && user) {
    return user.role === "admin"
      ? <AdminDashboard onLogout={handleLogout} />
      : <DriverDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden relative">
      <div className="w-full absolute inset-0 h-screen">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
          speed={1}
        />
      </div>

      <Card className="z-20 w-full max-w-md bg-black/50 border-white/20 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-white mb-2">Truck Safety IoT</CardTitle>
          <CardDescription className="text-gray-400">
            Smart Automotive Monitoring & Predictive Maintenance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/40 rounded-lg px-3 py-2 text-red-300 text-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@fleet.com"
              className="bg-zinc-900 border-zinc-800 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="bg-zinc-900 border-zinc-800 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button
              variant="outline"
              className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
              onClick={() => handleLogin("admin")}
              disabled={loading}
            >
              {loading ? "Logging in…" : "Admin Login"}
            </Button>
            <Button
              variant="outline"
              className="border-emerald-500 text-emerald-500 hover:bg-emerald-500/10"
              onClick={() => handleLogin("driver")}
              disabled={loading}
            >
              {loading ? "Logging in…" : "Driver Login"}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
