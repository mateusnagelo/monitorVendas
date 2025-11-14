const mysql = require('mysql2/promise');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let dbConfig;
  try {
    if (!event.body) {
      throw new Error('Request body is empty');
    }
    console.log('Received event.body:', event.body);
    const { host, port, user, password, database } = JSON.parse(event.body);
    dbConfig = { host, port: port || 3306, user, password, database };
    console.log('Parsed dbConfig:', dbConfig);
  } catch (parseError) {
    console.error('Error parsing request body:', parseError);
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: `Bad Request: ${parseError.message}` }),
    };
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    // A conexão é testada implicitamente pela criação bem-sucedida
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Conexão bem-sucedida!' }),
    };
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: `Falha na conexão: ${err.message}`,
        configUsed: dbConfig,
      }),
    };
  } finally {
    if (connection) {
      connection.end();
    }
  }
};