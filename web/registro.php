<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro - Caja de Ahorro</title>
    <style>
        :root {
            --primary: #2563eb;
            --primary-dark: #1e40af;
            --bg: #f8fafc;
            --card: #ffffff;
            --text: #1e293b;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: var(--bg);
            color: var(--text);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }

        .card {
            background: var(--card);
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }

        h1 {
            margin-top: 0;
            color: var(--primary);
        }

        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }

        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            font-size: 0.9rem;
        }

        input {
            width: 100%;
            padding: 12px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-size: 1rem;
            box-sizing: border-box;
        }

        button {
            width: 100%;
            padding: 14px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }

        button:hover {
            background: var(--primary-dark);
        }

        .message {
            margin-top: 20px;
            padding: 10px;
            border-radius: 8px;
            font-size: 0.9rem;
            display: none;
        }

        .success {
            background: #dcfce7;
            color: #166534;
        }

        .error {
            background: #fee2e2;
            color: #991b1b;
        }

        .footer {
            margin-top: 30px;
            font-size: 0.75rem;
            color: #64748b;
        }
    </style>
</head>

<body>
    <div class="card">
        <h1>Únete a la Caja</h1>
        <p style="margin-bottom: 30px; color: #64748b;">Completa tus datos para solicitar acceso.</p>

        <form id="registroForm">
            <div class="form-group">
                <label>Nombre Completo</label>
                <input type="text" id="nombre" required placeholder="Ej. Juan Pérez">
            </div>

            <div class="form-group">
                <label>Teléfono (WhatsApp)</label>
                <input type="tel" id="telefono" required placeholder="10 dígitos">
            </div>

            <div class="form-group">
                <label>Email (Opcional)</label>
                <input type="email" id="email" placeholder="correo@ejemplo.com">
            </div>

            <button type="submit" id="btnSubmit">Enviar Solicitud</button>
        </form>

        <div id="mensaje" class="message"></div>

        <div class="footer">
            Sistema de Caja de Ahorro v5.23<br>
            Created by MASC MEDIA 2026
        </div>
    </div>

    <script>
        document.getElementById('registroForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnSubmit');
            const msg = document.getElementById('mensaje');

            btn.disabled = true;
            btn.textContent = 'Enviando...';
            msg.style.display = 'none';

            const data = {
                nombre: document.getElementById('nombre').value,
                telefono: document.getElementById('telefono').value,
                email: document.getElementById('email').value
            };

            try {
                const res = await fetch('./api/auth/register_public.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();

                msg.style.display = 'block';
                msg.textContent = result.message;

                if (result.success) {
                    msg.className = 'message success';
                    document.getElementById('registroForm').reset();
                } else {
                    msg.className = 'message error';
                }
            } catch (err) {
                msg.style.display = 'block';
                msg.textContent = 'Error de conexión. Intenta de nuevo.';
                msg.className = 'message error';
            } finally {
                btn.disabled = false;
                btn.textContent = 'Enviar Solicitud';
            }
        });
    </script>
</body>

</html>