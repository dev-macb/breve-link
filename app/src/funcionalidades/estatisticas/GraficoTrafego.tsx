import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { numero, serieDiaria } from '../../utils/formatar';

export function GraficoTrafego({
    serie,
    totalPeriodo
}: {
    serie: ReturnType<typeof serieDiaria>;
    totalPeriodo: number;
}) {
    return (
        <section className="chart-panel">
            <header>
                <h2>01 / tráfego</h2>
                <span className="muted-label">30 DIAS · UTC</span>
            </header>
            <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={serie} margin={{ top: 18, right: 12, left: -25, bottom: 2 }}>
                        <defs>
                            <linearGradient id="acessos-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--chart)" stopOpacity={0.28} />
                                <stop offset="100%" stopColor="var(--chart)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            stroke="var(--border)"
                            strokeDasharray="4 5"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="rotulo"
                            minTickGap={30}
                            tick={{ fill: 'var(--muted)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            dy={12}
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={{ fill: 'var(--muted)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'var(--surface-raised)',
                                border: '1px solid var(--border)',
                                borderRadius: 0,
                                color: 'var(--text)',
                                fontSize: 12
                            }}
                            formatter={(valor) => [numero(Number(valor)), 'Acessos']}
                        />
                        <Area
                            type="stepAfter"
                            dataKey="acessos"
                            stroke="var(--chart)"
                            strokeWidth={2.5}
                            fill="url(#acessos-gradient)"
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            {totalPeriodo === 0 && <p className="chart-empty">Sem eventos no período.</p>}
        </section>
    );
}
