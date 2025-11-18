import React, { useEffect, useState } from 'react';

const timeframes = ['5m', '15m', '1h', '1d'];

export default function ForexSignals() {
  const [signals, setSignals] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSignal(tf) {
      try {
        const candle = {
          open: 1.1000 + Math.random() * 0.01,
          high: 1.1050 + Math.random() * 0.01,
          low: 1.0990 + Math.random() * 0.01,
          close: 1.1000 + Math.random() * 0.02,
          timestamp: Date.now()
        };

        const response = await fetch('/api/candles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timeframe: tf, candle })
        });

        if (!response.ok) throw new Error('Erro na requisição');
        return await response.json();
      } catch (error) {
        console.error(`Erro ao buscar sinal ${tf}:`, error);
        return { signal: 'Erro', stopLoss: '-', takeProfit: '-', confluence: 'Falha na conexão' };
      }
    }

    async function updateSignals() {
      setLoading(true);
      let newSignals = {};
      for (let tf of timeframes) {
        const sig = await fetchSignal(tf);
        newSignals[tf] = sig;
      }
      setSignals(newSignals);
      setLoading(false);
    }

    updateSignals();
    const interval = setInterval(updateSignals, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#1a73e8', textAlign: 'center' }}>D8M PRO - Forex Scalping Signals</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>Sinais em tempo real com análise SMC, ICT e Fibonacci Gold Zones</p>

      {loading && <p style={{ textAlign: 'center', color: '#ff9800' }}>Carregando sinais...</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ backgroundColor: '#1a73e8', color: 'white' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>Timeframe</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Sinal</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Entrada</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Stop Loss</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Take Profit</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Confluência</th>
          </tr>
        </thead>
        <tbody>
          {timeframes.map((tf, idx) => (
            <tr key={tf} style={{ backgroundColor: idx % 2 === 0 ? '#f9f9f9' : '#fff', borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '12px' }}><strong>{tf}</strong></td>
              <td style={{ padding: '12px', color: signals[tf]?.signal === 'buy' ? '#4caf50' : signals[tf]?.signal === 'sell' ? '#f44336' : '#666' }}>
                <strong>{signals[tf]?.signal ?? 'Aguardando...'}</strong>
              </td>
              <td style={{ padding: '12px' }}>{signals[tf]?.close ?? '-'}</td>
              <td style={{ padding: '12px', color: '#f44336' }}>{signals[tf]?.stopLoss ?? '-'}</td>
              <td style={{ padding: '12px', color: '#4caf50' }}>{signals[tf]?.takeProfit ?? '-'}</td>
              <td style={{ padding: '12px', fontSize: '12px', color: '#ff9800' }}>{signals[tf]?.confluence ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer style={{ marginTop: '30px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
        <p>D8M PRO © 2025 | Sinais atualizados a cada 15 segundos | Use por sua conta e risco</p>
      </footer>
    </div>
  );
}
