"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Home, Plus, Upload, History, LogOut, Menu, X } from "lucide-react"
import { useUser, useClerk } from "@clerk/nextjs"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Nova Prova", href: "/exams/new", icon: Plus },
  { name: "Importar Prova", href: "/exams/import", icon: Upload },
  { name: "Minhas Provas", href: "/my-exams", icon: History },
]

export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useUser()
  const { signOut } = useClerk()

  const handleLogout = () => {
    signOut(() => {
      window.location.href = "/login"
    })
  }

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
  }

  return (
      <>
        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
            <div
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setIsMobileMenuOpen(false)}
            />
        )}

        {/* Sidebar */}
        <div
            className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
            )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">Piltover's Academy</span>
              </div>
            </div>

            {/* User Info */}
            {user && (
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.imageUrl || "/placeholder.svg"} alt={user.fullName || "User"} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getUserInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.fullName || "Usuário"}</p>
                      <p className="text-xs text-gray-500 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                    </div>
                  </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                            isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                )
              })}
            </nav>

            {/* Logout button */}
            <div className="p-4 border-t border-gray-200">
              <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </>
  )
}
