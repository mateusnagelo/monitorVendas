const mysql = require('mysql2/promise');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { dbConfig } = JSON.parse(event.body);

  if (!dbConfig) {
    return { statusCode: 400, body: JSON.stringify({ error: 'A configuração do banco de dados é obrigatória.' }) };
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const vendasQuery = `
      SELECT
        (SELECT SUM(total) FROM venda WHERE DATE(data) = CURDATE()) as total_dia,
        (SELECT COUNT(*) FROM venda WHERE DATE(data) = CURDATE()) as count_dia,
        (SELECT SUM(total) FROM venda WHERE data >= DATE_FORMAT(CURDATE(), '%Y-%m-01')) as total_mes,
        (SELECT COUNT(*) FROM venda WHERE data >= DATE_FORMAT(CURDATE(), '%Y-%m-01')) as count_mes
    `;

    const pagamentosQuery = `
      SELECT
        formapagamento AS forma_pagamento,
        SUM(valorreal) AS total
      FROM recpag
      WHERE DATE(datapagamento) = CURDATE()
      GROUP BY formapagamento
    `;

    const [vendasResult] = await connection.execute(vendasQuery);
    const [pagamentosResult] = await connection.execute(pagamentosQuery);

    const vendas = vendasResult[0];
    const vendasPorPagamento = {};
    pagamentosResult.forEach(p => {
      vendasPorPagamento[p.forma_pagamento] = parseFloat(p.total) || 0;
    });

    const metrics = {
      'Valor Vendas': {
        Dia: parseFloat(vendas.total_dia) || 0,
        Mês: parseFloat(vendas.total_mes) || 0,
      },
      'Ticket Médio': {
        Dia: vendas.count_dia > 0 ? (parseFloat(vendas.total_dia) / vendas.count_dia) : 0,
        Mês: vendas.count_mes > 0 ? (parseFloat(vendas.total_mes) / vendas.count_mes) : 0,
      },
      'Quant. Atendimentos': {
        Dia: parseInt(vendas.count_dia, 10) || 0,
        Mês: parseInt(vendas.count_mes, 10) || 0,
      },
      'Vendas por Pagamento': vendasPorPagamento,
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(metrics),
    };
  } catch (err) {
    console.error('Error fetching dashboard metrics:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};