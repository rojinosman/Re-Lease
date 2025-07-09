"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SignInForm } from "./signin-form"
import { SignUpForm } from "./signup-form"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: "signin" | "signup"
}

export function AuthModal({ isOpen, onClose, defaultMode = "signin" }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode)

  const handleSuccess = () => {
    onClose()
  }

  const switchToSignUp = () => setMode("signup")
  const switchToSignIn = () => setMode("signin")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {mode === "signin" ? "Welcome Back" : "Join SubLease"}
          </DialogTitle>
        </DialogHeader>
        
        {mode === "signin" ? (
          <SignInForm 
            onSuccess={handleSuccess}
            onSwitchToSignUp={switchToSignUp}
          />
        ) : (
          <SignUpForm 
            onSuccess={handleSuccess}
            onSwitchToSignIn={switchToSignIn}
          />
        )}
      </DialogContent>
    </Dialog>
  )
} 