"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, TrendingUp, Users, Package, DollarSign, Calendar, Download } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import * as XLSX from "xlsx"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function ReportsTab() {
    const [startDate, setStartDate] = useState(() => {
        const now = new Date()
        return now.toISOString().split('T')[0]
    })
    const [endDate, setEndDate] = useState(() => {
        const now = new Date()
        return now.toISOString().split('T')[0]
    })

    const buildUrl = (type: string) => {
        const params = new URLSearchParams()
        params.set("type", type)
        if (startDate) params.set("startDate", startDate)
        if (endDate) params.set("endDate", endDate)
        return `/api/admin/reports?${params.toString()}`
    }

    const { data: summaryData, isLoading: loadingSummary } = useSWR(buildUrl("summary"), fetcher)
    const { data: dailyData, isLoading: loadingDaily } = useSWR(buildUrl("daily"), fetcher)

    if (loadingSummary || loadingDaily) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const { summary, topProducts, workerPerformance, dailyWorkerEarnings } = summaryData || {}

    // Format daily data for chart
    const formattedDailyData = dailyData?.map((item: any) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        total_revenue: Number(item.total_revenue),
        total_sales: Number(item.total_sales)
    })).reverse() || []

    // Format top products for chart
    const formattedTopProducts = topProducts?.map((item: any) => ({
        name: item.product_name,
        value: Number(item.total_revenue),
        quantity: Number(item.total_quantity)
    })) || []

    // Format worker performance for chart
    const formattedWorkerPerformance = workerPerformance?.map((item: any) => ({
        name: item.name,
        revenue: Number(item.total_revenue),
        sales: Number(item.total_sales)
    })) || []

    const handleWorkerExport = () => {
        if (!dailyWorkerEarnings) return

        const worksheet = XLSX.utils.json_to_sheet(dailyWorkerEarnings.map((w: any) => ({
            Worker: w.name,
            "Total Sales": w.total_sales,
            "Total Revenue": w.total_revenue
        })))
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Worker Performance")
        XLSX.writeFile(workbook, `worker_performance_${startDate || 'all'}.xlsx`)
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-4 items-end">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => { setStartDate(""); setEndDate("") }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(Number(summary?.total_revenue || 0))}</div>
                        <p className="text-xs text-muted-foreground">
                            {summary?.total_sales} total sales
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Number(summary?.total_quantity || 0).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Units sold
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary?.active_workers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Making sales
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unique Products</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary?.unique_products || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Sold in this period
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="trends" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="trends">Sales Trends</TabsTrigger>
                    <TabsTrigger value="products">Top Products</TabsTrigger>
                    <TabsTrigger value="workers">Worker Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="trends" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Revenue Trend</CardTitle>
                            <CardDescription>Daily sales revenue over time</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={formattedDailyData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value) => formatCurrency(Number(value))}
                                        />
                                        <Legend />
                                        <Bar dataKey="total_revenue" name="Revenue" fill="#0088FE" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="products" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Products by Revenue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={formattedTopProducts}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" width={100} />
                                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                            <Legend />
                                            <Bar dataKey="value" name="Revenue" fill="#00C49F" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Products by Quantity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={formattedTopProducts}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={120}
                                                fill="#8884d8"
                                                dataKey="quantity"
                                            >
                                                {formattedTopProducts.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="workers" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Worker Performance</CardTitle>
                                <CardDescription>Revenue generated by each worker (All Time / Selected Range)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={formattedWorkerPerformance}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                            <Legend />
                                            <Bar dataKey="revenue" name="Revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Individual Earnings</CardTitle>
                                    <CardDescription>Earnings breakdown for the selected period</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleWorkerExport}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Worker</TableHead>
                                            <TableHead className="text-right">Sales</TableHead>
                                            <TableHead className="text-right">Revenue</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dailyWorkerEarnings?.map((worker: any) => (
                                            <TableRow key={worker.name}>
                                                <TableCell className="font-medium">{worker.name}</TableCell>
                                                <TableCell className="text-right">{worker.total_sales}</TableCell>
                                                <TableCell className="text-right font-bold text-primary">
                                                    {formatCurrency(Number(worker.total_revenue))}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {(!dailyWorkerEarnings || dailyWorkerEarnings.length === 0) && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                                    No data available for this period
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
