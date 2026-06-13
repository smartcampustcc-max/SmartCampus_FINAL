<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Credenciais SmartCampus</title>
</head>
<body style="font-family: Arial, sans-serif; color: #0B1B2A;">

    <h2>Credenciais de acesso ao SmartCampus</h2>

    <p>Olá, {{ $dados['admin_nome'] }}.</p>

    <p>
        A escola <strong>{{ $dados['escola_nome'] }}</strong> foi cadastrada com sucesso.
    </p>

    <p><strong>Dados de acesso:</strong></p>

    <ul>
        <li><strong>Email:</strong> {{ $dados['email'] }}</li>
        <li><strong>Senha:</strong> {{ $dados['senha'] }}</li>
        <li><strong>Link:</strong> {{ $dados['link'] }}</li>
    </ul>

    <p>
        Recomendamos alterar a senha no primeiro acesso.
    </p>

    <p>
        Atenciosamente,<br>
        Equipa SmartCampus
    </p>

</body>
</html>