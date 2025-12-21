"use client"

import React, { useEffect, useState } from "react"
import { Download, X, Share } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PWAInstall() {
    const [showPrompt, setShowPrompt] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [isIOS, setIsIOS] = useState(false)

    useEffect(() => {
        // Check if app is already installed
        if (window.matchMedia("(display-mode: standalone)").matches) {
            return
        }

        // Detect iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        setIsIOS(isIOSDevice)

        // Handle Android/Chrome prompt
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowPrompt(true)
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

        // Show prompt for iOS after a short delay (once per session)
        if (isIOSDevice && !sessionStorage.getItem("ios-pwa-prompt-shown")) {
            setTimeout(() => setShowPrompt(true), 5000)
        }

        // Register Service Worker
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").catch((err) => console.error("SW registration failed:", err))
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === "accepted") {
            setDeferredPrompt(null)
            setShowPrompt(false)
        }
    }

    const closePrompt = () => {
        setShowPrompt(false)
        if (isIOS) {
            sessionStorage.setItem("ios-pwa-prompt-shown", "true")
        }
    }

    if (!showPrompt) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5">
            <div className="bg-card border border-border rounded-xl shadow-lg p-4 flex flex-col gap-3 max-w-md mx-auto">
                <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                        <div className="bg-red-500 rounded-lg p-2 h-10 w-10 flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-xl">P</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Install Sales Portal</h3>
                            <p className="text-sm text-muted-foreground">
                                Download the app for a better experience and quick access.
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={closePrompt} className="h-8 w-8 -mt-1 -mr-1">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {isIOS ? (
                    <div className="bg-muted/50 rounded-lg p-3 text-sm flex flex-col gap-2 border border-border/50">
                        <p className="font-medium flex items-center gap-1.5">
                            To install on iOS <span className="text-xs font-normal opacity-70">(iPhone/iPad)</span>:
                        </p>
                        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                            <li className="flex gap-2">
                                <span>1.</span>
                                <span>
                                    Tap the <Share className="h-4 w-4 inline mb-1 mx-1 text-blue-500" /> button in the bottom menu.
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span>2.</span>
                                <span>Scroll down and select "Add to Home Screen".</span>
                            </li>
                        </ol>
                    </div>
                ) : (
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={handleInstallClick}>
                        <Download className="h-4 w-4 mr-2" />
                        Install App
                    </Button>
                )}
            </div>
        </div>
    )
}
