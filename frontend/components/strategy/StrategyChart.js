"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TYRE_COLORS } from '../../lib/constants';

export default function StrategyChart({ sessionKey, data }) {
    // If no data, show a placeholder or mock state
    if (!sessionKey || !data) {
        return (
            <div className="strategy-chart-container glass-card h-64 flex items-center justify-center">
                <p className="text-muted text-sm">Select a race to view tyre degradation data</p>
            </div>
        );
    }

    // Check if we have the required data
    if (!data.laps || data.laps.length === 0) {
        return (
            <div className="strategy-chart-container glass-card h-64 flex items-center justify-center">
                <p className="text-muted text-sm">No lap data available for this race</p>
            </div>
        );
    }

    // Transform data for chart
    const chartData = (data.laps || []).reduce((acc, lap) => {
        const lapNum = lap.lap_number;
        const driver = lap.driver_number;

        let entry = acc.find(e => e.lap === lapNum);
        if (!entry) {
            entry = { lap: lapNum };
            acc.push(entry);
        }

        if (lap.lap_duration) {
            entry[`driver_${driver}`] = lap.lap_duration;
        }

        return acc;
    }, []).sort((a, b) => a.lap - b.lap);

    // Find drivers that actually have lap data
    const driversWithData = new Set();
    (data.laps || []).forEach(lap => {
        if (lap.lap_duration) {
            driversWithData.add(lap.driver_number);
        }
    });

    // Identify top drivers to plot with distinct colors (only those with data)
    const driverColors = [
        '#1F77B4', // Blue
        '#FF7F0E', // Orange
        '#A9A9A9', // Gray
        '#c44dff', // Purple
        '#00ff88', // Green
    ];
    
    const topDrivers = (data.positions || [])
        .filter(p => driversWithData.has(p.driver_number))
        .slice(0, 3)
        .map((p, index) => ({
            id: `driver_${p.driver_number}`,
            name: p.acronym || `Driver ${p.driver_number}`,
            color: driverColors[index] || '#ffffff'
        }));

    return (
        <div className="strategy-chart-container glass-card p-4">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted">Tyre Degradation (Lap Times)</h3>
            <div style={{ width: '100%', height: '256px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis
                            dataKey="lap"
                            stroke="#ffffff50"
                            tick={{ fill: '#ffffff50', fontSize: 10 }}
                            label={{ value: 'Lap', position: 'insideBottomRight', offset: -5, fill: '#ffffff50', fontSize: 10 }}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            stroke="#ffffff50"
                            tick={{ fill: '#ffffff50', fontSize: 10 }}
                            width={40}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#ffffff20', color: '#fff' }}
                            itemStyle={{ fontSize: 12 }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />

                        {topDrivers.map((driver, i) => (
                            <Line
                                key={driver.id}
                                type="monotone"
                                dataKey={driver.id}
                                name={driver.name}
                                stroke={driver.color}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
