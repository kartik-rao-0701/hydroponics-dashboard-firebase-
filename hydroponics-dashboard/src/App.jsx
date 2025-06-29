import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Thermometer, Droplets, FlaskConical, Leaf, Zap, Fan, AlertTriangle } from 'lucide-react'
import './App.css'

// Mock data for demonstration - replace with Firebase real-time data
const mockData = [
  { time: '00:00', node1_temp: 22.5, node1_humidity: 65, node1_ph: 6.2, node2_temp: 23.1, node2_humidity: 68, node2_ph: 6.4 },
  { time: '01:00', node1_temp: 22.8, node1_humidity: 66, node1_ph: 6.3, node2_temp: 23.3, node2_humidity: 67, node2_ph: 6.5 },
  { time: '02:00', node1_temp: 23.2, node1_humidity: 64, node1_ph: 6.1, node2_temp: 23.6, node2_humidity: 69, node2_ph: 6.3 },
  { time: '03:00', node1_temp: 23.5, node1_humidity: 67, node1_ph: 6.4, node2_temp: 23.8, node2_humidity: 70, node2_ph: 6.6 },
  { time: '04:00', node1_temp: 23.1, node1_humidity: 65, node1_ph: 6.2, node2_temp: 23.4, node2_humidity: 68, node2_ph: 6.4 },
]

const nodeData = [
  { id: 'node_1', name: 'Lettuce Zone', temperature: 23.5, humidity: 67, ph: 6.4, status: 'online', lastUpdate: '2 min ago' },
  { id: 'node_2', name: 'Tomato Zone', temperature: 24.2, humidity: 72, ph: 6.8, status: 'online', lastUpdate: '1 min ago' },
  { id: 'node_3', name: 'Herb Garden', temperature: 22.8, humidity: 64, ph: 6.1, status: 'online', lastUpdate: '3 min ago' },
  { id: 'node_4', name: 'Seedling Area', temperature: 25.1, humidity: 75, ph: 6.5, status: 'warning', lastUpdate: '5 min ago' },
  { id: 'node_5', name: 'Nutrient Reservoir', temperature: 21.5, humidity: 58, ph: 6.3, status: 'online', lastUpdate: '1 min ago' },
]

function App() {
  const [selectedNode, setSelectedNode] = useState('node_1')
  const [realTimeData, setRealTimeData] = useState(mockData)

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prevData => {
        const newDataPoint = {
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          node1_temp: (22 + Math.random() * 4).toFixed(1),
          node1_humidity: (60 + Math.random() * 20).toFixed(0),
          node1_ph: (6.0 + Math.random() * 1).toFixed(1),
          node2_temp: (23 + Math.random() * 3).toFixed(1),
          node2_humidity: (65 + Math.random() * 15).toFixed(0),
          node2_ph: (6.2 + Math.random() * 0.8).toFixed(1),
        }
        return [...prevData.slice(-23), newDataPoint]
      })
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'offline': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'online': return <Badge className="bg-green-100 text-green-800">Online</Badge>
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'offline': return <Badge className="bg-red-100 text-red-800">Offline</Badge>
      default: return <Badge>Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Leaf className="text-green-600" />
            Hydroponics Lab Dashboard
          </h1>
          <p className="text-gray-600">Real-time monitoring and control system</p>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {nodeData.map((node) => (
            <Card key={node.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedNode(node.id)}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{node.name}</CardTitle>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(node.status)}`}></div>
                </div>
                <CardDescription className="text-xs">{node.lastUpdate}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-red-500" />
                    <span className="text-sm">{node.temperature}°C</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">{node.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">pH {node.ph}</span>
                  </div>
                </div>
                <div className="mt-2">
                  {getStatusBadge(node.status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Temperature Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-red-500" />
                    Temperature Trends
                  </CardTitle>
                  <CardDescription>Real-time temperature monitoring across all nodes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={realTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="node1_temp" stroke="#ef4444" strokeWidth={2} name="Node 1" />
                      <Line type="monotone" dataKey="node2_temp" stroke="#f97316" strokeWidth={2} name="Node 2" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Humidity Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    Humidity Levels
                  </CardTitle>
                  <CardDescription>Humidity monitoring and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={realTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="node1_humidity" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Node 1" />
                      <Area type="monotone" dataKey="node2_humidity" stackId="2" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} name="Node 2" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* pH Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-purple-500" />
                    pH Balance Monitoring
                  </CardTitle>
                  <CardDescription>Critical pH levels across all growing zones</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={realTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[5.5, 7.5]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="node1_ph" stroke="#8b5cf6" strokeWidth={2} name="Node 1 pH" />
                      <Line type="monotone" dataKey="node2_ph" stroke="#a855f7" strokeWidth={2} name="Node 2 pH" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>Detailed analysis and insights from your hydroponic system</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Advanced analytics features will be implemented here, including:</p>
                <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
                  <li>Growth rate analysis</li>
                  <li>Nutrient consumption patterns</li>
                  <li>Environmental correlation analysis</li>
                  <li>Predictive maintenance alerts</li>
                  <li>Yield optimization recommendations</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    LED Controls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Control lighting systems for each zone</p>
                  <div className="space-y-2">
                    {nodeData.slice(0, 3).map((node) => (
                      <div key={node.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{node.name}</span>
                        <Badge className="bg-green-100 text-green-800">ON</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fan className="w-5 h-5 text-blue-500" />
                    Ventilation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Exhaust fan and air circulation control</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Exhaust Fan 1</span>
                      <Badge className="bg-green-100 text-green-800">AUTO</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Circulation Fan</span>
                      <Badge className="bg-green-100 text-green-800">ON</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-green-500" />
                    Nutrient Pumps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Nutrient delivery system control</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Pump A (NPK)</span>
                      <Badge className="bg-yellow-100 text-yellow-800">SCHEDULED</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Pump B (Micro)</span>
                      <Badge className="bg-yellow-100 text-yellow-800">SCHEDULED</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  System Alerts
                </CardTitle>
                <CardDescription>Recent alerts and system notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">High Temperature Warning</p>
                      <p className="text-sm text-yellow-700">Node 4 (Seedling Area) temperature exceeded 25°C threshold</p>
                      <p className="text-xs text-yellow-600 mt-1">5 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Droplets className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Nutrient Pump Scheduled</p>
                      <p className="text-sm text-blue-700">Automatic nutrient dosing completed for all zones</p>
                      <p className="text-xs text-blue-600 mt-1">15 minutes ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Leaf className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">System Status Normal</p>
                      <p className="text-sm text-green-700">All nodes reporting within normal parameters</p>
                      <p className="text-xs text-green-600 mt-1">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App

