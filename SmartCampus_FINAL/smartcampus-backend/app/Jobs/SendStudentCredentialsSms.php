<?php

namespace App\Jobs;

use App\Models\Estudante;
use App\Services\SmsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendStudentCredentialsSms implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    protected int $alunoId;
    protected string $username;
    protected string $senha;
    protected string $codigoTurma;

    public function __construct(int $alunoId, string $username, string $senha, string $codigoTurma)
    {
        $this->alunoId = $alunoId;
        $this->username = $username;
        $this->senha = $senha;
        $this->codigoTurma = $codigoTurma;
    }

    public function handle(SmsService $sms): void
    {
        $aluno = Estudante::find($this->alunoId);

        if (!$aluno || empty($aluno->telefone)) {
            return;
        }

        $mensagem = "Olá, {$aluno->nome_completo}. "
            . "As suas credenciais já estão disponíveis. "
            . "Utilizador: {$this->username}. "
            . "Senha: {$this->senha}. "
            . "Turma: {$this->codigoTurma}. "
            . "No primeiro acesso, altere a sua senha.";

        $sms->send($aluno->telefone, $mensagem);
    }
}