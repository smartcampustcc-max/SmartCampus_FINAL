<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 24px; color: #0B1B2A;">
    <h2>Olá, {{ $dados['nome'] }}</h2>
    <p>Tem um novo aviso da plataforma SmartCampus:</p>
    <div style="padding: 16px; background: #f5f9fc; border-left: 4px solid #0A4174; border-radius: 8px; margin: 16px 0;">
        {{ $dados['mensagem'] }}
    </div>
    <p style="color: rgba(11,27,42,.6); font-size: 13px;">
        SmartCampus — Plataforma de Gestão Académica
    </p>
</body>
</html>