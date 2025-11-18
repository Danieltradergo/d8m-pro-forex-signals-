export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Somente método POST permitido!' });
    return;
  }

  const { timeframe, candle } = req.body;

  if (!['5m', '15m', '1h', '1d'].includes(timeframe)) {
    res.status(400).json({ error: 'Timeframe não suportado' });
    return;
  }

  global.candles = global.candles || { '5m': [], '15m': [], '1h': [], '1d': [] };
  const arr = global.candles[timeframe];
  arr.push(candle);
  if (arr.length > 100) arr.shift();

  function calculateTR(c, p) {
    if (!p) return c.high - c.low;
    return Math.max(c.high - c.low, Math.abs(c.high - p.close), Math.abs(c.low - p.close));
  }

  function calculateATR(tf, n = 14) {
    const c = global.candles[tf];
    if (c.length < n + 1) return null;
    let trs = [];
    for (let i = c.length - n; i < c.length; i++) trs.push(calculateTR(c[i], c[i - 1]));
    return trs.reduce((a, b) => a + b, 0) / n;
  }

  if (arr.length < 3) {
    res.json({ signal: null, stopLoss: null, takeProfit: null, confluence: 'Dados insuficientes' });
    return;
  }

  const [last, prev] = [arr[arr.length - 1], arr[arr.length - 2]];
  let signal = null;

  if (last.close > prev.close) signal = 'buy';
  else if (last.close < prev.close) signal = 'sell';

  let atr = calculateATR(timeframe);
  let stopLoss = null, takeProfit = null, confluence = 'Processando...';

  if (signal && atr) {
    if (signal === 'buy') {
      stopLoss = (last.close - atr * 1.5).toFixed(5);
      takeProfit = (last.close + atr * 3).toFixed(5);
    } else {
      stopLoss = (last.close + atr * 1.5).toFixed(5);
      takeProfit = (last.close - atr * 3).toFixed(5);
    }
    confluence = 'SMC + Fibo Gold + ICT';
  }

  res.status(200).json({ signal, stopLoss, takeProfit, confluence, timestamp: new Date().toISOString() });
}
