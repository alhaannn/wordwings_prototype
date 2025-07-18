
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useAppContext } from '@/context/AppContext';
import { Feather } from 'lucide-react';

export default function AuthPage() {
    const { login, signup } = useAppContext();

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');

    const handleLogin = () => {
        if (loginEmail && loginPassword) {
            login(loginEmail, loginPassword);
        }
    };

    const handleSignup = () => {
        if (signupName && signupEmail && signupPassword) {
            signup(signupName, signupEmail, signupPassword);
        }
    };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Tabs defaultValue="login" className="w-full max-w-[400px]">
        <div className="flex justify-center mb-6 items-center gap-2">
            <Feather className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-headline text-primary-dark">
                WordWings
            </h1>
        </div>
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
            <Card>
            <CardHeader>
                <CardTitle>Welcome Back!</CardTitle>
                <CardDescription>
                Enter your credentials to access your learning dashboard.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" placeholder="m@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleLogin}>Login</Button>
            </CardFooter>
            </Card>
        </TabsContent>
        <TabsContent value="signup">
            <Card>
            <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>
                Join our community and start your vocabulary journey today.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="signup-name">Name</Label>
                    <Input id="signup-name" placeholder="Your Name" value={signupName} onChange={(e) => setSignupName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="m@example.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleSignup}>Sign Up</Button>
            </CardFooter>
            </Card>
        </TabsContent>
        </Tabs>
    </div>
  )
}
