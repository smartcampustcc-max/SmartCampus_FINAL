<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Credenciais do Professor</title>
</head>
<body style="font-family: Arial, sans-serif; color: #0B1B2A;">
    <h2>Credenciais de acesso ao SmartCampus</h2>

    <p>Olá, {{ $dados['nome'] }}.</p>

    <p>
        Foi criada uma conta de professor para a escola
        <strong>{{ $dados['escola_nome'] }}</strong>.
    </p>

    <p><strong>Dados de acesso:</strong></p>

    <ul>
        <li><strong>Email:</strong> {{ $dados['email'] }}</li>
        <li><strong>Username:</strong> {{ $dados['username'] }}</li>
        <li><strong>Senha temporária:</strong> {{ $dados['senha'] }}</li>
        <li><strong>Link:</strong> {{ $dados['link'] }}</li>
    </ul>

    <p>Recomendamos alterar a senha no primeiro acesso.</p>

    <p>Atenciosamente,<br>Equipa SmartCampus</p>
</body>
</html>