import { useState, useEffect } from 'react';
import { database } from './firebase';
import { ref, onValue, set } from 'firebase/database';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import './App.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Add 10 plant racks and meta, plus special nodes
const nodeMeta = [
  ...Array.from({length: 10}, (_, i) => ({
    id: `node_${i+1}`,
    name: `Plant Rack ${i+1}`
  })),
  { id: "node_11", name: "Main Reservoir", type: "reservoir" },
  { id: "node_12", name: "A/B Nutrition Tank", type: "nutrition" }
];

function App() {
  const [section, setSection] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [nodeFilter, setNodeFilter] = useState('all');
  const [selectedNode, setSelectedNode] = useState('all');
  const [chartRange, setChartRange] = useState('7d');
  const [cursorTrails, setCursorTrails] = useState([]);

  // Cursor trail effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const trail = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
      };
      
      setCursorTrails(prev => [...prev.slice(-8), trail]);
      
      setTimeout(() => {
        setCursorTrails(prev => prev.filter(t => t.id !== trail.id));
      }, 500);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Download as Google Sheet (CSV)
  function handleDownloadCSV() {
    const headers = ['Node Name','Node ID','Type','Temp','Humidity','pH','Fill Level','A Solution','B Solution','Last Updated'];
    const rows = nodeMeta.map(node => {
      if (node.type === 'nutrition') {
        return [
          node.name,
          node.id,
          'A/B Nutrition Tank',
          '', '', '', '',
          `${60 + Math.floor(Math.random()*30)}%`,
          `${60 + Math.floor(Math.random()*30)}%`,
          `${Math.floor(Math.random()*10)+1} min ago`
        ];
      } else if (node.type === 'reservoir') {
        return [
          node.name,
          node.id,
          'Main Reservoir',
          '', '', '', `${80 + Math.floor(Math.random()*20)}%`, '', '',
          `${Math.floor(Math.random()*10)+1} min ago`
        ];
      } else {
        return [
          node.name,
          node.id,
          'Plant Rack',
          `${(22 + Math.random() * 4).toFixed(1)}°C`,
          `${(60 + Math.random() * 15).toFixed(0)}%`,
          (6.2 + Math.random() * 0.6).toFixed(2),
          '', '', '',
          `${Math.floor(Math.random()*10)+1} min ago`
        ];
      }
    });
    const csv = [headers, ...rows].map(r => r.map(x => `"${x}"`).join(",")).join("\n");
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hydroponics_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  function Section() {
    if (section === 'dashboard') return <Dashboard />;
    if (section === 'analytics') return <Analytics />;
    if (section === 'controls') return <Controls />;
    if (section === 'alerts') return <Alerts />;
    return null;
  }

  function NavBar() {
    return (
      <nav className="glass-morphism shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <i className="fas fa-leaf text-green-500 text-2xl mr-2"></i>
                <span className="text-xl font-bold text-white">Smart Agri</span>
              </div>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              <NavButton icon="fa-tachometer-alt" label="Dashboard" active={section==='dashboard'} onClick={()=>setSection('dashboard')} />
              <NavButton icon="fa-chart-pie" label="Analytics" active={section==='analytics'} onClick={()=>setSection('analytics')} />
              <NavButton icon="fa-sliders-h" label="Controls" active={section==='controls'} onClick={()=>setSection('controls')} />
              <NavButton icon="fa-bell" label="Alerts" active={section==='alerts'} onClick={()=>setSection('alerts')}>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
              </NavButton>
            </div>
            <div className="-mr-2 flex items-center md:hidden">
              <button onClick={()=>setMobileMenuOpen(!mobileMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white focus:outline-none">
                <i className="fas fa-bars"></i>
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 shadow-lg rounded-b-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavButtonMobile icon="fa-tachometer-alt" label="Dashboard" active={section==='dashboard'} onClick={()=>{setSection('dashboard');setMobileMenuOpen(false);}} />
              <NavButtonMobile icon="fa-chart-pie" label="Analytics" active={section==='analytics'} onClick={()=>{setSection('analytics');setMobileMenuOpen(false);}} />
              <NavButtonMobile icon="fa-sliders-h" label="Controls" active={section==='controls'} onClick={()=>{setSection('controls');setMobileMenuOpen(false);}} />
              <NavButtonMobile icon="fa-bell" label="Alerts" active={section==='alerts'} onClick={()=>{setSection('alerts');setMobileMenuOpen(false);}} badge="3" />
            </div>
          </div>
        )}
      </nav>
    );
  }

  function NavButton({icon, label, active, onClick, children}) {
    return (
      <button 
        onClick={onClick}
        className={`relative px-3 py-2 rounded-md text-sm font-medium transition ${active ? 'bg-blue-900 text-blue-300' : 'text-gray-200 hover:bg-gray-700'}`}
      >
        <i className={`fas ${icon} mr-1`}></i> {label}
        {children}
      </button>
    );
  }

  function NavButtonMobile({icon, label, active, onClick, badge}) {
    return (
      <button onClick={onClick} className={`relative nav-btn block px-3 py-2 rounded-md text-base font-medium w-full text-left ${active ? 'bg-blue-900 text-blue-300' : 'text-gray-200 hover:bg-gray-700'}`}>
        <i className={`fas ${icon} mr-2`}></i> {label}
        {badge && <span className="absolute right-3 top-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{badge}</span>}
      </button>
    );
  }

  // Dashboard Section
  function Dashboard() {
    let filteredNodes = nodeMeta;
    if (nodeFilter === 'online') filteredNodes = filteredNodes.filter((n, idx) => idx !== 2);
    if (nodeFilter === 'warning') filteredNodes = filteredNodes.filter((n, idx) => idx === 2);
    filteredNodes = [...filteredNodes].sort((a, b) => {
      const rackA = a.name.match(/Plant Rack (\d+)/);
      const rackB = b.name.match(/Plant Rack (\d+)/);
      if (rackA && rackB) {
        return parseInt(rackA[1]) - parseInt(rackB[1]);
      }
      if (a.type && !b.type) return 1;
      if (!a.type && b.type) return -1;
      return a.name.localeCompare(b.name);
    });
    if (selectedNode !== 'all') filteredNodes = filteredNodes.filter(n => n.id === selectedNode);

    return (
      <section className="fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 sm:mb-0">Smart Agri Monitoring Dashboard</h1>
            <p className="text-gray-300">Real-time data from your hydroponic systems</p>
          </div>
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded shadow flex items-center gap-2"
            title="Download all data as CSV (open in Google Sheets)"
          >
            <i className="fas fa-file-arrow-down"></i>
            Download as Google Sheet
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatusCard title="Online Nodes" value="10/11" icon="fa-check-circle" iconBg="bg-green-900/50" iconColor="text-green-300" status="warning" statusText="1 node with warning" />
          <StatusCard title="Avg. Temperature" value="23.4°C" icon="fa-thermometer-half" iconBg="bg-blue-900/50" iconColor="text-blue-300" status="online" statusText="Within optimal range" />
          <StatusCard title="Avg. Humidity" value="68%" icon="fa-tint" iconBg="bg-indigo-900/50" iconColor="text-indigo-300" status="online" statusText="Within optimal range" />
          <StatusCard title="Avg. pH Level" value="6.5" icon="fa-flask" iconBg="bg-purple-900/50" iconColor="text-purple-300" status="warning" statusText="1 node needs adjustment" />
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
            <h2 className="text-xl font-semibold text-white">System Nodes</h2>
            <div className="flex flex-wrap gap-2 items-center">
              <select className="px-2 py-1 text-sm bg-gray-700 rounded-md text-gray-200" value={nodeFilter} onChange={e=>setNodeFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="online">Online</option>
                <option value="warning">Warning</option>
              </select>
              <select className="px-2 py-1 text-sm bg-gray-700 rounded-md text-gray-200" value={selectedNode} onChange={e=>setSelectedNode(e.target.value)}>
                <option value="all">All Nodes</option>
                {nodeMeta.slice(0,10).map(node => (
                  <option key={node.id} value={node.id}>{node.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredNodes.filter(n => !n.type).map((node, idx) => (
              <NodeCard
                key={node.id}
                name={node.name}
                nodeId={node.id}
                status={node.id === 'node_3' ? "warning" : "online"}
                temp={`${(22 + Math.random() * 4).toFixed(1)}°C`}
                humidity={`${(60 + Math.random() * 15).toFixed(0)}%`}
                ph={(6.2 + Math.random() * 0.6).toFixed(2)}
                updated={`${Math.floor(Math.random()*10)+1} min ago`}
                level={undefined}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 mt-4">
            {filteredNodes.filter(n => n.type === "reservoir").map((node, idx) => (
              <NodeCard
                key={node.id}
                name={node.name}
                nodeId={node.id}
                status={"online"}
                updated={`${Math.floor(Math.random()*10)+1} min ago`}
                level={`${80 + Math.floor(Math.random()*20)}%`}
              />
            ))}
            {filteredNodes.filter(n => n.type === "nutrition").map((node, idx) => (
              <NutritionCard
                key={node.id}
                name={node.name}
                nodeId={node.id}
                fillA={`${60 + Math.floor(Math.random()*30)}%`}
                fillB={`${60 + Math.floor(Math.random()*30)}%`}
                updated={`${Math.floor(Math.random()*10)+1} min ago`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard title="Temperature Trends" icon="fa-thermometer-half" iconColor="text-red-500" chartType="temperature" />
          <ChartCard title="Humidity Levels" icon="fa-tint" iconColor="text-blue-500" chartType="humidity" />
          <div className="lg:col-span-2">
            <ChartCard title="pH Balance Monitoring" icon="fa-flask" iconColor="text-purple-500" chartType="ph" full />
          </div>
        </div>
      </section>
    );
  }

  function StatusCard({title, value, icon, iconBg, iconColor, status, statusText}) {
    return (
      <div className="glass-morphism rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-300 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
          </div>
          <div className={`p-3 rounded-full ${iconBg} ${iconColor}`}>
            <i className={`fas ${icon} text-xl`}></i>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm text-gray-400">
            <span className={`status-indicator status-${status}`}></span>
            <span>{statusText}</span>
          </div>
        </div>
      </div>
    );
  }

  function NodeCard({name, nodeId, status, temp, humidity, ph, updated, level}) {
    const isReservoir = nodeId === "node_11";
    return (
      <div className="node-card bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-700 transition-all duration-300">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-white">{name}</h3>
            <p className="text-sm text-gray-400">Node ID: {nodeId}</p>
          </div>
          <span className={`status-indicator status-${status}`}></span>
        </div>
        {isReservoir ? (
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-1">Fill Level</p>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div className="bg-blue-500 h-3 rounded-full" style={{width: level}}></div>
            </div>
            <p className="text-sm text-blue-300 mt-1 font-semibold">{level}</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-xs text-gray-400">Temp</p>
              <p className="font-semibold text-white">{temp}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Humidity</p>
              <p className="font-semibold text-white">{humidity}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">pH</p>
              <p className="font-semibold text-white">{ph}</p>
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs text-gray-400">Last updated: {updated}</span>
          <button className="text-xs text-blue-400 hover:text-blue-300">
            <i className="fas fa-ellipsis-h"></i>
          </button>
        </div>
      </div>
    );
  }

  function NutritionCard({name, nodeId, fillA, fillB, updated}) {
    return (
      <div className="node-card bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-700 transition-all duration-300">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-white">{name}</h3>
            <p className="text-sm text-gray-400">Node ID: {nodeId}</p>
          </div>
          <span className="status-indicator status-online"></span>
        </div>
        <div className="mt-4">
          <p className="text-xs text-gray-400 mb-1">A Solution</p>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-1">
            <div className="bg-green-500 h-3 rounded-full" style={{width: fillA}}></div>
          </div>
          <p className="text-xs text-green-300 mb-2">{fillA}</p>
          <p className="text-xs text-gray-400 mb-1">B Solution</p>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-1">
            <div className="bg-yellow-400 h-3 rounded-full" style={{width: fillB}}></div>
          </div>
          <p className="text-xs text-yellow-200">{fillB}</p>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs text-gray-400">Last updated: {updated}</span>
        </div>
      </div>
    );
  }

  function ChartCard({title, icon, iconColor, chartType, full}) {
    const generateChartData = () => {
      const palette = [
        '#ef4444','#3b82f6','#10b981','#f59e42','#a855f7',
        '#f43f5e','#22d3ee','#fbbf24','#6366f1','#84cc16'
      ];

      let labels, points;
      if (chartRange === '24h') { 
        labels = Array.from({length: 24}, (_, i) => `${i+1}h`); 
        points = 24; 
      } else if (chartRange === '30d') { 
        labels = Array.from({length: 30}, (_, i) => `Day ${i+1}`); 
        points = 30; 
      } else { 
        labels = Array.from({length: 7}, (_, i) => `Day ${i+1}`); 
        points = 7; 
      }

      let filteredNodes = nodeMeta.slice(0, 10);
      if (nodeFilter === 'online') filteredNodes = filteredNodes.filter((_, idx) => idx !== 2);
      if (nodeFilter === 'warning') filteredNodes = filteredNodes.filter((_, idx) => idx === 2);
      if (selectedNode !== 'all') filteredNodes = filteredNodes.filter(n => n.id === selectedNode);

      const datasets = filteredNodes.map((node, idx) => {
        let data;
        if (chartType === 'temperature') {
          data = Array.from({length: points}, () => (22 + Math.random() * 4).toFixed(1));
        } else if (chartType === 'humidity') {
          data = Array.from({length: points}, () => (60 + Math.random() * 15).toFixed(1));
        } else if (chartType === 'ph') {
          data = Array.from({length: points}, () => (6.2 + Math.random() * 0.6).toFixed(2));
        }

        return {
          label: node.name,
          data: data,
          borderColor: palette[idx % palette.length],
          backgroundColor: palette[idx % palette.length] + '22',
          fill: false,
          tension: 0.4
        };
      });

      return { labels, datasets };
    };

    const chartData = generateChartData();

    const options = {
      plugins: { 
        legend: { 
          display: true, 
          labels: { color: "#f3f4f6" } 
        } 
      },
      scales: {
        x: { ticks: { color: "#f3f4f6" } },
        y: { ticks: { color: "#f3f4f6" } }
      },
      maintainAspectRatio: false,
      animation: false
    };

    return (
      <div className={`glass-morphism rounded-lg p-6 shadow-sm ${full ? "lg:col-span-2" : ""}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            <i className={`fas ${icon} ${iconColor} mr-2`}></i> {title}
          </h3>
          <div className="flex space-x-2">
            <button className={`px-2 py-1 text-xs rounded-md ${chartRange==='24h' ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`} onClick={()=>setChartRange('24h')}>
              24h
            </button>
            <button className={`px-2 py-1 text-xs rounded-md ${chartRange==='7d' ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`} onClick={()=>setChartRange('7d')}>
              7d
            </button>
            <button className={`px-2 py-1 text-xs rounded-md ${chartRange==='30d' ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`} onClick={()=>setChartRange('30d')}>
              30d
            </button>
          </div>
        </div>
        <div className={full ? "ph-chart-container" : "chart-container"}>
          <Line data={chartData} options={options} />
        </div>
      </div>
    );
  }

  // Analytics Section
  function Analytics() {
    const performanceData = {
      labels: nodeMeta.map(n => n.name),
      datasets: [{
        label: 'Performance',
        data: nodeMeta.map(() => (90 + Math.random() * 10).toFixed(1)),
        backgroundColor: [
          '#ef4444','#3b82f6','#10b981','#f59e42','#a855f7',
          '#f43f5e','#22d3ee','#fbbf24','#6366f1','#84cc16',
          '#ef4444','#3b82f6'
        ]
      }]
    };

    const performanceOptions = {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#f3f4f6" } },
        y: { ticks: { color: "#f3f4f6" } }
      },
      maintainAspectRatio: false,
      animation: false
    };

    return (
      <section className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">System Analytics</h1>
          <p className="text-gray-300">Detailed insights and performance metrics</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <AnalyticsCard title="System Health" items={[
            {label:"Uptime", value:"98.7%", color:"green", width:"98.7%"},
            {label:"Data Accuracy", value:"99.2%", color:"blue", width:"99.2%"},
            {label:"Alert Response", value:"95.4%", color:"yellow", width:"95.4%"}
          ]}/>
          <AnalyticsCard title="Resource Usage" items={[
            {label:"Water Consumption", value:"42L/day", color:"indigo", width:"70%"},
            {label:"Nutrient Usage", value:"1.2L/day", color:"purple", width:"40%"},
            {label:"Energy Consumption", value:"8.4kWh/day", color:"red", width:"60%"}
          ]}/>
          <AnalyticsCard title="Growth Metrics" items={[
            {label:"Avg. Growth Rate", value:"2.1cm/day", color:"green", width:"85%"},
            {label:"Leaf Count", value:"+18%", color:"teal", width:"75%"},
            {label:"Yield Estimate", value:"+22%", color:"lime", width:"90%"}
          ]}/>
        </div>
        <div className="glass-morphism rounded-lg p-6 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Comparison</h3>
          <div className="chart-container">
            <Bar data={performanceData} options={performanceOptions} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-morphism rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-4">Optimal Conditions</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Parameter</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Optimal Range</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Current Avg.</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200">Temperature</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">20-25°C</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">23.4°C</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200">Humidity</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">60-75%</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">68%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200">pH Level</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">5.8-6.8</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">6.5</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200">EC Level</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">1.2-2.4 mS/cm</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">1.8 mS/cm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="glass-morphism rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-4">System Recommendations</h3>
            <div className="space-y-4">
              <Recommendation icon="fa-tint" iconBg="bg-blue-900" iconColor="text-blue-300" title="Water Level Adjustment" desc="Consider increasing water level in reservoir by 10% to maintain optimal flow rates." />
              <Recommendation icon="fa-thermometer-half" iconBg="bg-yellow-900" iconColor="text-yellow-300" title="Temperature Control" desc="Node 3 is running 1.8°C above optimal. Consider adjusting fan speed or reducing LED intensity." />
              <Recommendation icon="fa-flask" iconBg="bg-purple-900" iconColor="text-purple-300" title="Nutrient Balance" desc="pH in Node 3 is below optimal. Add 50ml of pH Up solution to reservoir." />
            </div>
          </div>
        </div>
      </section>
    );
  }

  function AnalyticsCard({title, items}) {
    return (
      <div className="glass-morphism rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-300">{item.label}</span>
                <span className="text-sm font-medium text-gray-300">{item.value}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className={`bg-${item.color}-500 h-2.5 rounded-full`} style={{width: item.width}}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function Recommendation({icon, iconBg, iconColor, title, desc}) {
    return (
      <div className="flex items-start">
        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}>
          <i className={`fas ${icon}`}></i>
        </div>
        <div className="ml-4">
          <h4 className="text-sm font-medium text-white">{title}</h4>
          <p className="text-sm text-gray-300 mt-1">{desc}</p>
        </div>
      </div>
    );
  }

  // Controls Section
  function Controls() {
    const [lighting, setLighting] = useState([
      {label:"Main Grow Lights", desc:"Full spectrum LED", checked:true},
      {label:"Supplemental Blue", desc:"460nm wavelength", checked:false},
      {label:"Supplemental Red", desc:"660nm wavelength", checked:true}
    ]);
    const [environment, setEnvironment] = useState([
      {label:"Exhaust Fans", desc:"Air circulation", checked:true},
      {label:"Humidifier", desc:"Maintains 65% RH", checked:false},
      {label:"Dehumidifier", desc:"Reduces excess moisture", checked:false}
    ]);
    const [watering, setWatering] = useState([
      {label:"Main Pump", desc:"Circulation system", checked:true},
      {label:"Drip System", desc:"Precision watering", checked:false},
      {label:"Auto Top-Up", desc:"Reservoir level control", checked:true}
    ]);
    const [lightStart, setLightStart] = useState("06:00");
    const [lightEnd, setLightEnd] = useState("22:00");
    const [wateringInterval, setWateringInterval] = useState("2 hours");
    const [nutrientDosing, setNutrientDosing] = useState("Auto");
    const [nodeControls, setNodeControls] = useState(
      nodeMeta.map(node => ({
        id: node.id,
        leds: node.id === "node_11" ? null : Math.random() > 0.5,
        fan: Math.random() > 0.5,
        pump: Math.random() > 0.5
      }))
    );

    return (
      <section className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">System Controls</h1>
          <p className="text-gray-300">Manage your hydroponic system settings</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ControlCard icon="fa-lightbulb" iconColor="text-yellow-300" title="Lighting Controls" controls={lighting} onToggle={i=>setLighting(l=>l.map((c,idx)=>idx===i?{...c,checked:!c.checked}:c))}/>
          <ControlCard icon="fa-fan" iconColor="text-blue-300" title="Environmental Controls" controls={environment} onToggle={i=>setEnvironment(e=>e.map((c,idx)=>idx===i?{...c,checked:!c.checked}:c))}/>
          <ControlCard icon="fa-tint" iconColor="text-green-300" title="Watering System" controls={watering} onToggle={i=>setWatering(w=>w.map((c,idx)=>idx===i?{...c,checked:!c.checked}:c))}/>
          <div className="glass-morphism rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-4">
              <i className="fas fa-sliders-h text-purple-300 mr-2"></i> System Settings
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-white">Light Schedule</h4>
                  <span className="text-sm text-gray-300">{lightStart} - {lightEnd}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="time" className="bg-gray-600 border border-gray-500 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2" value={lightStart} onChange={e=>setLightStart(e.target.value)}/>
                  <span className="text-gray-300">to</span>
                  <input type="time" className="bg-gray-600 border border-gray-500 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2" value={lightEnd} onChange={e=>setLightEnd(e.target.value)}/>
                </div>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-white">Watering Interval</h4>
                  <span className="text-sm text-gray-300">{wateringInterval}</span>
                </div>
                <select className="bg-gray-600 border border-gray-500 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2" value={wateringInterval} onChange={e=>setWateringInterval(e.target.value)}>
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                  <option>2 hours</option>
                  <option>4 hours</option>
                  <option>6 hours</option>
                </select>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-white">Nutrient Dosing</h4>
                  <span className="text-sm text-gray-300">{nutrientDosing}</span>
                </div>
                <select className="bg-gray-600 border border-gray-500 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2" value={nutrientDosing} onChange={e=>setNutrientDosing(e.target.value)}>
                  <option>Manual</option>
                  <option>Auto</option>
                  <option>Scheduled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="glass-morphism rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-4">
            <i className="fas fa-microchip text-orange-300 mr-2"></i> Node-Specific Controls
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Node</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">LEDs</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Pump</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {nodeMeta.map((node, idx) => (
                  <tr key={node.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200">{node.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {node.id === "node_11"
                        ? <span className="text-gray-400">N/A</span>
                        : <input type="checkbox" checked={nodeControls[idx].leds} onChange={()=>setNodeControls(arr=>arr.map((c,i)=>i===idx?{...c,leds:!c.leds}:c))} />}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input type="checkbox" checked={nodeControls[idx].fan} onChange={()=>setNodeControls(arr=>arr.map((c,i)=>i===idx?{...c,fan:!c.fan}:c))} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input type="checkbox" checked={nodeControls[idx].pump} onChange={()=>setNodeControls(arr=>arr.map((c,i)=>i===idx?{...c,pump:!c.pump}:c))} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      <button className="text-blue-400 hover:text-blue-300 mr-2">
                        <i className="fas fa-cog"></i>
                      </button>
                      <button className="text-green-400 hover:text-green-300">
                        <i className="fas fa-chart-line"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }

  function ControlCard({icon, iconColor, title, controls, onToggle}) {
    return (
      <div className="glass-morphism rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-white mb-4">
          <i className={`fas ${icon} ${iconColor} mr-2`}></i> {title}
        </h3>
        <div className="space-y-4">
          {controls.map((c, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-white">{c.label}</h4>
                <p className="text-sm text-gray-300">{c.desc}</p>
              </div>
              <input type="checkbox" checked={c.checked} onChange={()=>onToggle(i)} className="w-6 h-6 accent-blue-600" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Alerts Section
  function Alerts() {
    const [filter, setFilter] = useState('all');
    const [activeAlerts, setActiveAlerts] = useState([
      {id:1, type:'critical', icon:'fa-exclamation-circle', color:'red', title:'Critical: High Temperature', desc:'Node 3 temperature reached 25.8°C (threshold: 25°C)', time:'2 hours ago'},
      {id:2, type:'warning', icon:'fa-exclamation-triangle', color:'yellow', title:'Warning: Low pH Level', desc:'Node 3 pH level dropped to 5.9 (optimal: 5.8-6.8)', time:'4 hours ago'},
      {id:3, type:'info', icon:'fa-info-circle', color:'blue', title:'Info: Nutrient Low', desc:'Nutrient A reservoir at 15% capacity', time:'6 hours ago'}
    ]);
    const [resolvedAlerts, setResolvedAlerts] = useState([
      {id:4, type:'resolved', icon:'fa-check', color:'green', title:'Resolved: Water Level', desc:'Reservoir refilled to optimal level', time:'Yesterday'}
    ]);
    const filteredAlerts = filter==='all' ? activeAlerts : activeAlerts.filter(a=>a.type===filter);
    
    function dismissAlert(id) {
      const alert = activeAlerts.find(a=>a.id===id);
      setActiveAlerts(alerts=>alerts.filter(a=>a.id!==id));
      if (alert) setResolvedAlerts(res=>[{...alert, type:'resolved', icon:'fa-check', color:'green', title:'Resolved: '+alert.title.replace(/^(Critical: |Warning: |Info: )/,'')}, ...res]);
    }

    return (
      <section className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">System Alerts</h1>
          <p className="text-gray-300">Notifications and system warnings</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          <button className={`px-3 py-1 rounded-full text-sm font-medium ${filter==='all'?'bg-blue-900 text-blue-300':'bg-gray-700 text-gray-200 hover:bg-gray-600'}`} onClick={()=>setFilter('all')}>All</button>
          <button className={`px-3 py-1 rounded-full text-sm font-medium ${filter==='critical'?'bg-red-900 text-red-300':'bg-gray-700 text-gray-200 hover:bg-gray-600'}`} onClick={()=>setFilter('critical')}>Critical</button>
          <button className={`px-3 py-1 rounded-full text-sm font-medium ${filter==='warning'?'bg-yellow-900 text-yellow-300':'bg-gray-700 text-gray-200 hover:bg-gray-600'}`} onClick={()=>setFilter('warning')}>Warning</button>
          <button className={`px-3 py-1 rounded-full text-sm font-medium ${filter==='info'?'bg-blue-900 text-blue-300':'bg-gray-700 text-gray-200 hover:bg-gray-600'}`} onClick={()=>setFilter('info')}>Info</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-morphism rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <i className="fas fa-exclamation-triangle text-yellow-300 mr-2"></i> Active Alerts
              <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">{activeAlerts.length}</span>
            </h3>
            <div className="space-y-4">
              {filteredAlerts.length === 0 && <div className="text-gray-400">No alerts of this type.</div>}
              {filteredAlerts.map(alert => (
                <AlertCard key={alert.id} {...alert} onDismiss={()=>dismissAlert(alert.id)} />
              ))}
            </div>
          </div>
          <div className="glass-morphism rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <i className="fas fa-check-circle text-green-300 mr-2"></i> Resolved Alerts
              <span className="ml-2 bg-green-600 text-white text-xs rounded-full px-2 py-0.5">{resolvedAlerts.length}</span>
            </h3>
            <div className="space-y-4">
              {resolvedAlerts.length === 0 && <div className="text-gray-400">No resolved alerts.</div>}
              {resolvedAlerts.map(alert => (
                <AlertCard key={alert.id} {...alert} resolved />
              ))}
            </div>
          </div>
          <div className="glass-morphism rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <i className="fas fa-bell text-blue-300 mr-2"></i> Alert Summary
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-200"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span> Critical: <span className="ml-1 text-gray-300">{activeAlerts.filter(a=>a.type==='critical').length}</span></li>
              <li className="flex items-center text-gray-200"><span className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span> Warning: <span className="ml-1 text-gray-300">{activeAlerts.filter(a=>a.type==='warning').length}</span></li>
              <li className="flex items-center text-gray-200"><span className="w-3 h-3 rounded-full bg-blue-400 mr-2"></span> Info: <span className="ml-1 text-gray-300">{activeAlerts.filter(a=>a.type==='info').length}</span></li>
              <li className="flex items-center text-gray-200"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span> Resolved: <span className="ml-1 text-gray-300">{resolvedAlerts.length}</span></li>
            </ul>
          </div>
        </div>
      </section>
    );
  }

  function AlertCard({type, icon, color, title, desc, time, resolved, onDismiss}) {
    const bg = {
      critical: "bg-red-900/30 border-l-4 border-red-500",
      warning: "bg-yellow-900/30 border-l-4 border-yellow-500",
      info: "bg-blue-900/30 border-l-4 border-blue-500",
      resolved: "bg-green-900/30 border-l-4 border-green-500"
    }[type] || "bg-gray-800";
    
    return (
      <div className={`p-3 ${bg} rounded-lg flex items-start justify-between`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <i className={`fas ${icon} text-${color}-300 mt-1 text-lg`}></i>
          </div>
          <div className="ml-3">
            <h4 className={`text-sm font-medium text-${color}-200`}>{title}</h4>
            <p className={`text-sm text-${color}-300 mt-1`}>{desc}</p>
            <p className={`text-xs text-${color}-400 mt-2`}>{time}</p>
          </div>
        </div>
        {!resolved && (
          <button className="ml-4 px-2 py-1 text-xs bg-gray-700 text-gray-200 rounded hover:bg-gray-600" onClick={onDismiss} title="Resolve/Dismiss">
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Cursor Trails */}
      {cursorTrails.map((trail, index) => (
        <div
          key={trail.id}
          className="cursor-trail"
          style={{
            left: trail.x - 3,
            top: trail.y - 3,
            opacity: 1 - (index / cursorTrails.length) * 0.8,
            transform: `scale(${1 - (index / cursorTrails.length) * 0.5})`,
          }}
        />
      ))}
      
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Section />
      </main>
    </div>
  );
}

export default App;

