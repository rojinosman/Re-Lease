"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { AlertCircle, Loader2 } from "lucide-react"

interface SignInFormProps {
  onSuccess?: () => void
  onSwitchToSignUp?: () => void
}

export function SignInForm({ onSuccess, onSwitchToSignUp }: SignInFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [verificationError, setVerificationError] = useState("")
  const [verificationLoading, setVerificationLoading] = useState(false)
  const [verificationSuccess, setVerificationSuccess] = useState(false)
  const [emailForVerification, setEmailForVerification] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }
    try {
      setIsLoading(true)
      setError("")
      const result = await fetch("/auth/token", {
        method: "POST",
        body: new URLSearchParams({ username: username.trim(), password }),
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      })
      if (result.ok) {
        const data = await result.json()
        // Save token and trigger onSuccess
        localStorage.setItem("auth_token", data.access_token)
        onSuccess?.()
      } else {
        const data = await result.json()
        if (result.status === 403 && data.detail && data.detail.toLowerCase().includes("not verified")) {
          // Prompt for verification code
          setShowVerification(true)
          setEmailForVerification(username.includes("@") ? username : "") // fallback if username is email
        } else {
          setError(data.detail || "Invalid username or password")
        }
      }
    } catch {
      setError('Invalid username or password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerificationError("")
    setVerificationLoading(true)
    try {
      const res = await fetch("/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailForVerification || username, code: verificationCode })
      })
      if (res.ok) {
        setVerificationSuccess(true)
        setTimeout(async () => {
          setShowVerification(false)
          setVerificationSuccess(false)
          // Retry login automatically
          setIsLoading(true)
          setError("")
          const retry = await fetch("/auth/token", {
            method: "POST",
            body: new URLSearchParams({ username: username.trim(), password }),
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
          })
          if (retry.ok) {
            const data = await retry.json()
            localStorage.setItem("auth_token", data.access_token)
            onSuccess?.()
          } else {
            setError("Login failed after verification. Please try again.")
          }
          setIsLoading(false)
        }, 1000)
      } else {
        const data = await res.json()
        setVerificationError(data.detail || "Invalid verification code")
      }
    } catch {
      setVerificationError("Failed to verify code. Please try again.")
    } finally {
      setVerificationLoading(false)
    }
  }

  if (showVerification) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            Your account is not verified. Please enter the 6-digit code sent to your email to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            {verificationError && (
              <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="w-4 h-4" />
                <span>{verificationError}</span>
              </div>
            )}
            {verificationSuccess && (
              <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
                <span>Verification successful! Logging you in...</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="Enter the code"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
                disabled={verificationLoading}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={verificationLoading}
            >
              {verificationLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
        <CardDescription className="text-center">
          Welcome back! Sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 