"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LayoutDashboard, ShoppingCart, Users, BarChart3, LogOut, Settings, UserSquare2, AlertTriangle, FileText, Download } from "lucide-react"
import * as XLSX from "xlsx"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { OverviewTab } from "@/components/admin/tabs/overview-tab"
import { SalesTab } from "@/components/admin/tabs/sales-tab"
import { WorkersTab } from "@/components/admin/tabs/workers-tab"
import { ReportsTab } from "@/components/admin/tabs/reports-tab"
import { SuspiciousTab } from "@/components/admin/tabs/suspicious-tab"
import { AuditTab } from "@/components/admin/tabs/audit-tab"
import { ClientsTab } from "@/components/admin/tabs/clients-tab"
import type { Worker } from "@/lib/db"

interface AdminDashboardProps {
  admin: Worker
}

export function AdminDashboard({ admin }: AdminDashboardProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [dateRange, setDateRange] = useState({
    start: new Date().toLocaleDateString('en-CA'),
    end: new Date().toLocaleDateString('en-CA')
  })
  const [exportOpen, setExportOpen] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  const setQuickDate = (type: 'today' | 'yesterday' | 'week' | 'month') => {
    const end = new Date()
    const start = new Date()

    switch (type) {
      case 'yesterday':
        start.setDate(start.getDate() - 1)
        end.setDate(end.getDate() - 1)
        break
      case 'week':
        start.setDate(start.getDate() - 7)
        break
      case 'month':
        start.setMonth(start.getMonth() - 1)
        break
    }

    setDateRange({
      start: start.toLocaleDateString('en-CA'),
      end: end.toLocaleDateString('en-CA')
    })
  }

  const handleExcelExport = async () => {
    try {
      if (!dateRange.start || !dateRange.end) {
        toast.error("Please select a date range")
        return
      }

      // Use type=summary to get dailyWorkerEarnings
      const res = await fetch(`/api/admin/reports?type=summary&startDate=${dateRange.start}&endDate=${dateRange.end}`)
      const data = await res.json()

      if (!data.dailyWorkerEarnings || data.dailyWorkerEarnings.length === 0) {
        toast.error("No data available for this period")
        return
      }

      const worksheet = XLSX.utils.json_to_sheet(data.dailyWorkerEarnings.map((w: any) => ({
        Worker: w.name,
        "Total Sales": w.total_sales,
        "Total Revenue": w.total_revenue
      })))
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Performance")
      XLSX.writeFile(workbook, `performance_${dateRange.start}_to_${dateRange.end}.xlsx`)
      setExportOpen(false)
      toast.success("Report exported successfully")
    } catch (error) {
      console.error("Export failed:", error)
      toast.error("Failed to export data")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">ADMIN CONTROL</h1>
            <p className="text-sm text-muted-foreground">Logged in as {admin.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={exportOpen} onOpenChange={setExportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Export Daily Report</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground border-border">
                <DialogHeader>
                  <DialogTitle>Export Daily Report</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <Button variant="outline" size="sm" onClick={() => setQuickDate('today')}>Today</Button>
                    <Button variant="outline" size="sm" onClick={() => setQuickDate('yesterday')}>Yesterday</Button>
                    <Button variant="outline" size="sm" onClick={() => setQuickDate('week')}>Last 7 Days</Button>
                    <Button variant="outline" size="sm" onClick={() => setQuickDate('month')}>Last 30 Days</Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">From</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">To</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="w-full" onClick={() => setExportOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleExcelExport} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-2">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="sales" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="workers" className="gap-2">
              <Users className="h-4 w-4" />
              Workers
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2">
              <UserSquare2 className="h-4 w-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="suspicious" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Suspicious
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <FileText className="h-4 w-4" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="sales">
            <SalesTab />
          </TabsContent>

          <TabsContent value="workers">
            <WorkersTab />
          </TabsContent>

          <TabsContent value="clients">
            <ClientsTab />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>

          <TabsContent value="suspicious">
            <SuspiciousTab />
          </TabsContent>

          <TabsContent value="audit">
            <AuditTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
